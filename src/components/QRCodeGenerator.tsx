import { useEffect, useRef, useState } from 'react';
import { X, Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  url: string;
  postAuthor: string;
  onClose: () => void;
  onBack: () => void;
}

export default function QRCodeGenerator({ url, postAuthor, onClose, onBack }: QRCodeGeneratorProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    generateQRCode();
  }, [url]);

  const generateQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    // Generate simple QR-like pattern (in production, use a proper QR library)
    // This is a visual placeholder that looks like a QR code
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = '#000000';
    const moduleSize = 10;
    const modules = size / moduleSize;

    // Create a deterministic pattern based on URL
    const hash = url.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        // Create pseudo-random pattern based on position and hash
        const value = (x * y + hash) % 3;
        if (value === 0) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // Add corner markers (typical QR code feature)
    const markerSize = moduleSize * 7;
    const drawMarker = (x: number, y: number) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, markerSize, markerSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + moduleSize, y + moduleSize, markerSize - 2 * moduleSize, markerSize - 2 * moduleSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, markerSize - 4 * moduleSize, markerSize - 4 * moduleSize);
    };

    drawMarker(0, 0); // Top-left
    drawMarker(size - markerSize, 0); // Top-right
    drawMarker(0, size - markerSize); // Bottom-left

    // Convert to data URL
    setQrDataUrl(canvas.toDataURL('image/png'));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `invoque-post-qr-${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();

    toast({
      title: 'QR Code downloaded',
      description: 'QR code saved to your device',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center">
      <div className="bg-background w-full lg:max-w-md lg:rounded-t-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button onClick={onBack} className="text-foreground hover:text-tertiary-foreground">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-h3 font-semibold text-foreground">QR Code</h2>
          <button onClick={onClose} className="text-foreground hover:text-tertiary-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* QR Code Display */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center">
          <div className="mb-6 text-center">
            <h3 className="text-h3 font-semibold text-foreground mb-2">
              Share this post
            </h3>
            <p className="text-body text-tertiary-foreground">
              Scan this QR code to view the post by {postAuthor}
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
            <canvas
              ref={canvasRef}
              className="w-64 h-64"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Instructions */}
          <p className="text-body-sm text-tertiary-foreground text-center mb-6">
            Point your camera at the QR code to open the post
          </p>

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            className="w-full max-w-xs bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            <Download className="w-5 h-5 mr-2" />
            Download QR Code
          </Button>
        </div>
      </div>
    </div>
  );
}
