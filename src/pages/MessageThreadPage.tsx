import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import { handleAvatarError } from '@/lib/utils';
import { ArrowLeft, Send, Mic, Trash2, Play, Pause, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@animaapp/playground-react-sdk';
import { useMockQuery } from '@/hooks/useMockQuery';
import { useMockMutation } from '@/hooks/useMockMutation';
import { isMockMode, MOCK_USERS } from '@/utils/mockMode';
import AudioMessageBubble from '@/components/chat/AudioMessageBubble';
import FullscreenMediaModal from '@/components/FullscreenMediaModal';
import type { Message, Conversation, Post } from '@/types/schema';
import { cn } from '@/lib/utils';
import { useSignedUrl } from '@/hooks/useSignedUrl';
import { AvatarImage } from '@/components/ui/AvatarImage';
import { supabase } from '../../supabase';

type RecordingState = 'idle' | 'recording' | 'preview';

// Helper component for message media
const MessageMedia = ({ message, setFullscreenMedia }: { message: Message, setFullscreenMedia: any }) => {
  const { signedUrl } = useSignedUrl(message.mediaUrl);
  
  if (!signedUrl) return <div className="w-40 h-40 bg-tertiary animate-pulse rounded-xl" />;

  if (message.type === 'video') {
    return (
      <div className="relative">
        <video 
          src={signedUrl} 
          className="max-w-full h-auto rounded-xl object-cover max-h-[300px] cursor-pointer"
          onClick={() => setFullscreenMedia({ url: message.mediaUrl!, type: 'video' })}
          controls={false}
          muted
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/40 rounded-full p-2">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>
      </div>
    );
  }
  
  return null;
};

export default function MessageThreadPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [messageText, setMessageText] = useState('');
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- MEDIA STATE ---
  const [selectedMedia, setSelectedMedia] = useState<{ file: File; previewUrl: string; type: 'image' | 'video' } | null>(null);
  const [fullscreenMedia, setFullscreenMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- RECORDING STATE ---
  const [recState, setRecState] = useState<RecordingState>('idle');
  const [audioPreview, setAudioPreview] = useState<{ url: string; duration: number; blob: Blob } | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // --- REFS FOR STABILITY ---
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isPressingRef = useRef(false);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  // Track mount state to prevent updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const { user, isPending: isAuthPending } = useAuth();

  const isNewConversation = conversationId === 'new';
  const targetUserId = isNewConversation ? new URLSearchParams(location.search).get('userId') : null;

  // Polling for real-time simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const queryParams = { 
    where: { conversationId: conversationId || '' },
    ...(isMockMode() ? { _t: refreshKey } : {}) 
  };

  const realMsgQuery = isMockMode() ? null : useQuery('Message', queryParams);
  const mockMsgQuery = isMockMode() ? useMockQuery('Message', queryParams) : null;
  const { data: messagesData } = (isMockMode() ? mockMsgQuery : realMsgQuery)!;
  
  const dbMessages = (messagesData || []) as Message[];
  const messages = [...dbMessages, ...pendingMessages];

  const realMsgMutation = isMockMode() ? null : useMutation('Message');
  const mockMsgMutation = isMockMode() ? useMockMutation('Message') : null;
  const { create: createMessage } = (isMockMode() ? mockMsgMutation : realMsgMutation)!;

  const realConvMutation = isMockMode() ? null : useMutation('Conversation');
  const mockConvMutation = isMockMode() ? useMockMutation('Conversation') : null;
  const { create: createConversation, update: updateConversation } = (isMockMode() ? mockConvMutation : realConvMutation)!;

  const [otherUserId, setOtherUserId] = useState<string | null>(targetUserId);

  const realConvDetailQuery = isMockMode() ? null : useQuery('Conversation', { where: { id: conversationId } });
  const mockConvDetailQuery = isMockMode() ? useMockQuery('Conversation', {}) : null;
  const { data: convData } = (isMockMode() ? mockConvDetailQuery : realConvDetailQuery)!;

  useEffect(() => {
    if (isNewConversation) {
      setOtherUserId(targetUserId);
    } else if (convData) {
      const convs = Array.isArray(convData) ? convData : [convData];
      const conv = convs.find((c: any) => c.id === conversationId);
      if (conv) {
        const other = conv.participantIds.find((id: string) => id !== user?.id);
        if (other) setOtherUserId(other);
      }
    }
  }, [convData, conversationId, isNewConversation, targetUserId, user?.id]);

  const realProfileQuery = isMockMode() ? null : useQuery('UserProfile', { where: { userId: otherUserId || '' } });
  const mockProfileQuery = isMockMode() ? useMockQuery('UserProfile', { userId: otherUserId || '' }) : null;
  const { data: profiles } = (isMockMode() ? mockProfileQuery : realProfileQuery)!;
  
  const userProfile = profiles?.[0];
  
  const participant = otherUserId ? {
    name: userProfile?.username || 'User',
    username: userProfile?.username || 'user',
    profilePictureUrl: userProfile?.profilePictureUrl || null,
    id: otherUserId
  } : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- CLEANUP ON UNMOUNT ---
  useEffect(() => {
    return () => {
      stopAndCleanup();
      if (audioPreview?.url) {
        URL.revokeObjectURL(audioPreview.url);
      }
      if (selectedMedia?.previewUrl) {
        URL.revokeObjectURL(selectedMedia.previewUrl);
      }
    };
  }, []);

  const stopAndCleanup = useCallback(() => {
    // Stop tracks immediately
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    // Stop recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    
    // Clear timers
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    // Remove global listeners just in case
    window.removeEventListener('touchend', handleGlobalStop);
    window.removeEventListener('touchcancel', handleGlobalStop);
    window.removeEventListener('mouseup', handleGlobalStop);
  }, []);

  // Internal stop function that doesn't require an event
  const stopRecordingInternal = useCallback(() => {
    isPressingRef.current = false;

    // Stop recording if active - this will trigger onstop
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    // Clear duration timer
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, []);

  // Global stop handler for window events
  const handleGlobalStop = useCallback(() => {
    window.removeEventListener('touchend', handleGlobalStop);
    window.removeEventListener('touchcancel', handleGlobalStop);
    window.removeEventListener('mouseup', handleGlobalStop);
    
    stopRecordingInternal();
  }, [stopRecordingInternal]);

  // Safety effect for recording interruption (Android fallback)
  useEffect(() => {
    const handleInterruption = () => {
      if (recState === 'recording') {
        handleGlobalStop();
      }
    };

    // Listen for events that should stop recording
    window.addEventListener('blur', handleInterruption);
    document.addEventListener('visibilitychange', handleInterruption);
    // Capture scroll events to catch any scrolling in the app
    window.addEventListener('scroll', handleInterruption, { capture: true });

    return () => {
      window.removeEventListener('blur', handleInterruption);
      document.removeEventListener('visibilitychange', handleInterruption);
      window.removeEventListener('scroll', handleInterruption, { capture: true });
    };
  }, [recState, handleGlobalStop]);

  // --- RECORDING LOGIC ---

  const startRecordingProcess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // CRITICAL: Check if user is still holding after permission/setup
      if (!isPressingRef.current || !isMountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // Check if mounted before updating state
        if (!isMountedRef.current) {
          // Just cleanup streams if unmounted
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
          }
          return;
        }

        // Only process if we have data and duration is meaningful (> 0.5s)
        const duration = Math.max(0, (Date.now() - recordingStartTimeRef.current) / 1000);
        
        if (audioChunksRef.current.length > 0 && duration > 0.5) {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          
          setAudioPreview({ url, blob, duration: Math.round(duration) });
          setRecState('preview');
        } else {
          // Discard if too short
          setRecState('idle');
        }
        
        // Ensure stream is stopped
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
      };

      recorder.start();
      setRecState('recording');
      recordingStartTimeRef.current = Date.now();
      
      // Start UI timer
      setRecordingTime(0);
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      durationTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - recordingStartTimeRef.current;
        
        // Hard safety timeout: 60 seconds
        if (elapsed >= 60000) {
          handleGlobalStop();
          return;
        }
        
        setRecordingTime(Math.floor(elapsed / 1000));
      }, 500);

    } catch (err) {
      console.error('Microphone access denied or error:', err);
      if (isMountedRef.current) {
        setRecState('idle');
      }
      isPressingRef.current = false;
    }
  };

  const handleRecordStart = (e: React.TouchEvent | React.MouseEvent) => {
    // Prevent default to avoid ghost clicks
    if (e.type === 'touchstart') {
      e.preventDefault();
    }
    e.stopPropagation();
    
    if (recState !== 'idle') return;

    isPressingRef.current = true;
    startRecordingProcess();

    // Attach global listeners for stop
    window.addEventListener('touchend', handleGlobalStop);
    window.addEventListener('touchcancel', handleGlobalStop);
    window.addEventListener('mouseup', handleGlobalStop);
  };

  // --- PREVIEW ACTIONS ---

  const handleDeleteRecording = () => {
    if (audioPreview) {
      URL.revokeObjectURL(audioPreview.url);
    }
    setAudioPreview(null);
    setRecState('idle');
    setIsPlayingPreview(false);
  };

  const handleSendRecording = async () => {
    if (!audioPreview) return;
    await handleSendAudio(audioPreview.url, audioPreview.duration);
    setAudioPreview(null);
    setRecState('idle');
    setIsPlayingPreview(false);
  };

  const togglePreviewPlay = () => {
    if (!previewAudioRef.current) return;
    
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
    } else {
      previewAudioRef.current.play();
    }
    setIsPlayingPreview(!isPlayingPreview);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- MESSAGING LOGIC ---

  // --- MEDIA LOGIC ---

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (selectedMedia?.previewUrl) {
      URL.revokeObjectURL(selectedMedia.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setSelectedMedia({ file, previewUrl, type });
    
    // Reset file input so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancelMedia = () => {
    if (selectedMedia?.previewUrl) {
      URL.revokeObjectURL(selectedMedia.previewUrl);
    }
    setSelectedMedia(null);
  };

  const handleSendMedia = async () => {
    if (!user || !selectedMedia) return;

    const tempId = `temp-media-${Date.now()}`;
    const mediaUrl = selectedMedia.previewUrl;
    const mediaType = selectedMedia.type;
    const contentText = mediaType === 'video' ? 'Video' : 'Image';
    
    const optimisticMessage: Message = {
      id: tempId,
      conversationId: conversationId || 'temp',
      senderId: user.id,
      content: contentText,
      type: mediaType,
      mediaUrl: mediaUrl,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPendingMessages(prev => [...prev, optimisticMessage]);
    setSelectedMedia(null);
    scrollToBottom();

    try {
      let activeConversationId = conversationId;

      if (isNewConversation && targetUserId) {
        const newConv = await createConversation({
          participantIds: [user.id, targetUserId],
          lastMessage: `Sent a ${mediaType}`,
          lastMessageAt: new Date(),
          unreadCount: 1
        });
        activeConversationId = newConv.id;
        navigate(`/messages/${newConv.id}`, { replace: true });
      } else if (activeConversationId) {
        await updateConversation(activeConversationId, {
          lastMessage: `Sent a ${mediaType}`,
          lastMessageAt: new Date(),
          unreadCount: 1
        });
      }

      if (activeConversationId) {
        // In a real app, upload file here and get URL
        // For mock, we'll convert file to base64 to persist it
        const base64Url = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedMedia.file);
        });

        await createMessage({
          conversationId: activeConversationId,
          senderId: user.id,
          content: contentText,
          type: mediaType,
          mediaUrl: base64Url,
          read: false
        });
      }

      setPendingMessages(prev => prev.filter(m => m.id !== tempId));
    } catch (error) {
      console.log(error);
      console.error('Failed to send media message:', error);
      setPendingMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const handleSendAudio = async (audioUrl: string, duration: number) => {
    if (!user) return;

    const tempId = `temp-audio-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversationId: conversationId || 'temp',
      senderId: user.id,
      content: 'Voice Message',
      type: 'audio',
      mediaUrl: audioUrl,
      duration: duration,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPendingMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      let activeConversationId = conversationId;

      if (isNewConversation && targetUserId) {
        const newConv = await createConversation({
          participantIds: [user.id, targetUserId],
          lastMessage: 'Voice Message',
          lastMessageAt: new Date(),
          unreadCount: 1
        });
        activeConversationId = newConv.id;
        navigate(`/messages/${newConv.id}`, { replace: true });
      } else if (activeConversationId) {
        await updateConversation(activeConversationId, {
          lastMessage: 'Voice Message',
          lastMessageAt: new Date(),
          unreadCount: 1
        });
      }

      if (activeConversationId) {
        await createMessage({
          conversationId: activeConversationId,
          senderId: user.id,
          content: 'Voice Message',
          type: 'audio',
          mediaUrl: audioUrl,
          duration: duration,
          read: false
        });
      }

      setPendingMessages(prev => prev.filter(m => m.id !== tempId));
    } catch (error) {
      console.log(error);
      console.error('Failed to send audio message:', error);
      setPendingMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If media is selected, send it
    if (selectedMedia) {
      await handleSendMedia();
      // If there was also text, continue to send text
      if (!messageText.trim()) return;
    }

    if (!messageText.trim()) return;

    // Get authenticated user directly from Supabase
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      console.error('User not authenticated');
      return;
    }

    const text = messageText;
    setMessageText('');

    const tempId = `temp-${Date.now()}`;
    // Use authUser.id for optimistic update as well
    const optimisticMessage: Message = {
      id: tempId,
      conversationId: conversationId || 'temp',
      senderId: authUser.id,
      receiverId: otherUserId || '',
      content: text,
      type: 'text',
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPendingMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      let activeConversationId = conversationId;

      if (isNewConversation && targetUserId) {
        const newConv = await createConversation({
          participantIds: [authUser.id, targetUserId],
          lastMessage: text,
          lastMessageAt: new Date(),
          unreadCount: 1
        });
        activeConversationId = newConv.id;
        navigate(`/messages/${newConv.id}`, { replace: true });
      } else if (activeConversationId) {
        await updateConversation(activeConversationId, {
          lastMessage: text,
          lastMessageAt: new Date(),
          unreadCount: 1
        });
      }

      if (activeConversationId && otherUserId) {
        // Insert message using Supabase directly
        const { error } = await supabase.from('Message').insert({
          conversationId: activeConversationId,
          senderId: authUser.id,
          receiverId: otherUserId,
          content: text,
          type: 'text',
          read: false
        });

        if (error) {
          console.log(error);
        }
      }

      setPendingMessages(prev => prev.filter(m => m.id !== tempId));
      scrollToBottom();
    } catch (error) {
      console.log(error);
      console.error('Failed to send message:', error);
      setMessageText(text);
      setPendingMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  if (isAuthPending) {
    return (
      <InstagramLayout hideBottomNav>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </InstagramLayout>
    );
  }

  if (!user) return null;

  return (
    <InstagramLayout hideBottomNav>
      <div className="flex flex-col h-[100dvh] bg-background relative">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center gap-4 px-4 h-[60px] border-b border-border bg-background/80 backdrop-blur-md">
          <button
            onClick={() => navigate(-1)}
            className="text-foreground hover:text-tertiary-foreground transition-colors p-1 -ml-1"
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
          </button>
          
          <div 
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => participant && navigate(`/profile/${participant.id}`)}
          >
            <div className="relative">
              <img
                src={participant?.profilePictureUrl || "https://c.animaapp.com/mlkxz4s0AuRnuX/img/ai_5.png"}
                alt={participant?.name || "User"}
                className="w-8 h-8 rounded-full object-cover border border-border"
                onError={handleAvatarError}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-body-sm font-semibold text-foreground leading-none">
                {participant ? participant.username : (isNewConversation ? "New Message" : "Chat")}
              </span>
              {participant && participant.name !== participant.username && (
                <span className="text-[10px] text-tertiary-foreground mt-0.5">
                  {participant.name}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 pt-[76px] space-y-4 bg-background">
          {messages.map((message) => {
            const isMe = message.senderId === user?.id;
            return (
              <div
                key={message.id}
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[75%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMe && (
                    <img
                      src={participant?.profilePictureUrl || "https://c.animaapp.com/mlkxz4s0AuRnuX/img/ai_5.png"}
                      alt="Sender"
                      className="w-6 h-6 rounded-full object-cover self-end mb-1"
                      onError={handleAvatarError}
                    />
                  )}
                  
                  <div
                    className={`rounded-2xl text-body-sm break-words overflow-hidden ${
                      isMe
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-tertiary text-foreground rounded-bl-sm'
                    }`}
                  >
                    {message.type === 'audio' && message.mediaUrl ? (
                      <AudioMessageBubble 
                        src={message.mediaUrl} 
                        duration={message.duration} 
                        isMe={isMe} 
                      />
                    ) : message.type === 'image' && message.mediaUrl ? (
                      <div className="p-1">
                        <AvatarImage 
                          src={message.mediaUrl} 
                          alt="Sent image" 
                          className="max-w-full h-auto rounded-xl object-cover max-h-[300px] cursor-pointer"
                          onClick={() => setFullscreenMedia({ url: message.mediaUrl!, type: 'image' })}
                        />
                      </div>
                    ) : message.type === 'video' && message.mediaUrl ? (
                      <div className="p-1">
                        <AvatarImage 
                          src={message.mediaUrl} // Using AvatarImage as a wrapper for signed URL logic is hacky but works for now, ideally extract a MediaWrapper
                          alt="Video thumbnail"
                          className="hidden" // We need the signed URL, not the image render
                        />
                        {/* Better approach: Extract MessageMedia component */}
                        <MessageMedia message={message} setFullscreenMedia={setFullscreenMedia} />
                      </div>
                    ) : (
                      <div className="px-4 py-2">
                        {message.content}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-background safe-bottom z-20 relative">
          {/* Media Preview Area */}
          {selectedMedia && (
            <div className="mb-2 relative inline-block">
              <div className="relative rounded-lg overflow-hidden border border-border bg-tertiary">
                {selectedMedia.type === 'video' ? (
                  <video 
                    src={selectedMedia.previewUrl} 
                    className="h-24 w-auto object-contain"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img 
                    src={selectedMedia.previewUrl} 
                    alt="Preview" 
                    className="h-24 w-auto object-contain"
                  />
                )}
                <button 
                  onClick={handleCancelMedia}
                  className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 bg-tertiary rounded-full px-4 py-2 border border-transparent focus-within:border-primary/30 transition-colors relative overflow-hidden min-h-[48px]">
            
            {/* PREVIEW MODE (Replaces everything else) */}
            {recState === 'preview' && audioPreview ? (
              <div className="flex-1 flex items-center gap-3 animate-in fade-in duration-200 w-full">
                <button 
                  onClick={handleDeleteRecording} 
                  className="p-2 text-tertiary-foreground hover:text-error transition-colors"
                  title="Discard recording"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                
                {/* Preview Player */}
                <div className="flex-1 flex items-center gap-3 bg-background/50 rounded-full px-3 py-1.5">
                  <button onClick={togglePreviewPlay} className="text-foreground">
                    {isPlayingPreview ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                  
                  {/* Fake Waveform */}
                  <div className="flex-1 h-8 flex items-center gap-0.5 opacity-50">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-foreground rounded-full animate-pulse"
                        style={{ 
                          height: `${Math.max(20, Math.random() * 100)}%`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: isPlayingPreview ? '0.5s' : '0s'
                        }} 
                      />
                    ))}
                  </div>
                  
                  <span className="text-xs font-mono text-foreground">{formatDuration(audioPreview.duration)}</span>
                  <audio 
                    ref={previewAudioRef} 
                    src={audioPreview.url} 
                    onEnded={() => setIsPlayingPreview(false)}
                    className="hidden" 
                  />
                </div>

                <button 
                  onClick={handleSendRecording} 
                  className="p-2 text-primary hover:text-primary-hover transition-colors"
                  title="Send audio"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            ) : (
              /* IDLE & RECORDING MODES (Shared container to keep Mic stable) */
              <>
                {/* Recording Indicator Overlay */}
                <div className={cn(
                  "absolute inset-0 flex items-center gap-3 px-4 bg-tertiary z-10 transition-opacity duration-200 pointer-events-none",
                  recState === 'recording' ? "opacity-100" : "opacity-0"
                )}>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-body-sm font-medium text-red-500">Recording...</span>
                  <span className="text-body-sm font-mono text-foreground ml-auto">{formatDuration(recordingTime)}</span>
                </div>

                {/* LEFT: Gallery Button */}
                <div className="flex items-center z-20">
                  {recState === 'idle' && !messageText.trim() && !selectedMedia && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-tertiary-foreground hover:text-foreground transition-colors p-2 active:scale-95 -ml-2"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*,video/*" 
                    onChange={handleMediaSelect}
                  />
                </div>

                {/* CENTER: Text Input */}
                <form 
                  onSubmit={handleSendMessage} 
                  className={cn(
                    "flex-1 flex items-center gap-2 w-full transition-opacity duration-200",
                    recState === 'recording' ? "opacity-0" : "opacity-100"
                  )}
                >
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 bg-transparent border-none outline-none text-body-sm text-foreground placeholder:text-tertiary-foreground min-w-0"
                    disabled={recState !== 'idle'}
                  />
                </form>

                {/* RIGHT: Controls (Send / Mic) */}
                <div className="flex items-center gap-2 z-20">
                  {/* Send Button */}
                  {(messageText.trim().length > 0 || selectedMedia) && recState === 'idle' && (
                    <button 
                      onClick={handleSendMessage}
                      className="text-primary font-semibold text-body-sm hover:text-primary-hover transition-colors p-1"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  )}

                  {/* Mic Button */}
                  {(!messageText.trim() && !selectedMedia || recState === 'recording') && (
                    <button
                      type="button"
                      className={cn(
                        "text-tertiary-foreground hover:text-foreground transition-all p-2 active:scale-95 select-none -mr-2",
                        recState === 'recording' && "text-red-500 scale-110 hover:text-red-600"
                      )}
                      style={{ touchAction: 'none' }}
                      onTouchStart={handleRecordStart}
                      onMouseDown={handleRecordStart}
                      onContextMenu={(e) => e.preventDefault()}
                      title="Hold to record"
                    >
                      <Mic className={cn("w-5 h-5", recState === 'recording' && "fill-current")} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Media Modal */}
      {fullscreenMedia && (
        <FullscreenMediaModal
          post={{
            id: 'temp-fullscreen',
            mediaUrl: fullscreenMedia.url,
            mediaType: fullscreenMedia.type,
            authorId: '',
            authorName: '',
            authorAvatar: '',
            content: '',
            likes: 0,
            comments: 0,
            reposts: 0,
            saves: 0,
            isLiked: false,
            isSaved: false,
            createdAt: new Date()
          } as Post}
          onClose={() => setFullscreenMedia(null)}
        />
      )}
    </InstagramLayout>
  );
}
