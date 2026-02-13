import { useState, useRef, useCallback, useEffect } from 'react';

export type CameraMode = 'photo' | 'video';
export type FlashMode = 'off' | 'on';
export type FacingMode = 'user' | 'environment';

interface CameraCapabilities {
  zoom: { min: number; max: number; step: number } | null;
  torch: boolean;
  focus: boolean;
  exposure: { min: number; max: number; step: number } | null;
}

interface UseCameraProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onCapture?: (file: File, type: 'image' | 'video') => void;
}

export function useCamera({ videoRef, onCapture }: UseCameraProps) {
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // State
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [zoom, setZoom] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [capabilities, setCapabilities] = useState<CameraCapabilities>({
    zoom: null,
    torch: false,
    focus: false,
    exposure: null
  });

  // Helper to apply constraints
  const applyConstraint = useCallback(async (constraint: any) => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track || track.readyState !== 'live') return;
    
    try {
      await track.applyConstraints({ advanced: [constraint] });
    } catch (e) {
      console.warn('Failed to apply constraint:', constraint, e);
    }
  }, []);

  // Initialize Camera
  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Stop ONLY the video track to keep audio alive if possible, 
      // but for robust switching on mobile, stopping all tracks is safer to release hardware.
      // We will stop all tracks to ensure clean state for the new constraints.
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        audio: true,
        video: {
          facingMode: facingMode,
          width: { ideal: 4096 },
          height: { ideal: 2160 },
          frameRate: { ideal: 60, max: 60 },
          // @ts-ignore - standard constraint
          focusMode: 'continuous',
          exposureMode: 'continuous',
          whiteBalanceMode: 'continuous',
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Crucial for Android Chrome: Ensure play is called
        try {
          await videoRef.current.play();
        } catch (e) {
          console.warn('Autoplay prevented or interrupted:', e);
        }
      }

      // Analyze Capabilities
      const track = stream.getVideoTracks()[0];
      const caps = track.getCapabilities ? track.getCapabilities() : {} as any;
      const settings = track.getSettings();

      setCapabilities({
        zoom: 'zoom' in caps ? { min: caps.zoom.min, max: caps.zoom.max, step: caps.zoom.step } : null,
        torch: !!caps.torch,
        focus: ['focusMode', 'focusDistance'].some(k => k in caps),
        exposure: 'exposureCompensation' in caps ? { min: caps.exposureCompensation.min, max: caps.exposureCompensation.max, step: caps.exposureCompensation.step } : null
      });

      // Reset state
      setZoom(settings.zoom || 1);
      // We don't reset flashMode here to allow persistence if desired, 
      // but hardware torch usually resets on stream stop.
      // We'll sync the state to 'off' if it was a hardware torch.
      if (facingMode === 'environment') {
        setFlashMode('off');
      }
      
      setIsActive(true);
      setIsLoading(false);

    } catch (err: any) {
      console.error('Camera initialization failed:', err);
      setError(err.name === 'NotAllowedError' ? 'permission_denied' : 'error');
      setIsLoading(false);
    }
  }, [facingMode, videoRef]);

  // Toggle Camera (Front/Back)
  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Toggle Flash
  const toggleFlash = useCallback(async () => {
    const newMode = flashMode === 'off' ? 'on' : 'off';
    setFlashMode(newMode);

    // Hardware Torch Logic
    if (capabilities.torch && facingMode === 'environment') {
      await applyConstraint({ torch: newMode === 'on' });
    }
    // Screen flash is handled by the UI component consuming this hook
  }, [flashMode, capabilities.torch, facingMode, applyConstraint]);

  // Zoom Control
  const setZoomLevel = useCallback((value: number) => {
    if (!capabilities.zoom) return;
    const newZoom = Math.min(Math.max(value, capabilities.zoom.min), capabilities.zoom.max);
    setZoom(newZoom);
    applyConstraint({ zoom: newZoom });
  }, [capabilities.zoom, applyConstraint]);

  // Capture Photo
  const takePhoto = useCallback(async () => {
    if (!videoRef.current || !streamRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Mirror if front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    return new Promise<void>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob && onCapture) {
          const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file, 'image');
        }
        resolve();
      }, 'image/jpeg', 0.95);
    });
  }, [facingMode, videoRef, onCapture]);

  // Video Recording
  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm';
    
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType,
      videoBitsPerSecond: 2500000 // 2.5 Mbps for good quality
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const ext = mimeType === 'video/mp4' ? 'mp4' : 'webm';
      const file = new File([blob], `video_${Date.now()}.${ext}`, { type: mimeType });
      if (onCapture) onCapture(file, 'video');
      setIsRecording(false);
      setRecordingTime(0);
    };

    recorder.start(1000); // Slice every second
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  }, [onCapture]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Timer for recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, stopRecording]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Initial start
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  return {
    videoRef,
    stream: streamRef.current,
    isActive,
    isLoading,
    error,
    facingMode,
    flashMode,
    zoom,
    capabilities,
    isRecording,
    recordingTime,
    toggleCamera,
    toggleFlash,
    setZoomLevel,
    takePhoto,
    startRecording,
    stopRecording,
    retry: startCamera
  };
}
