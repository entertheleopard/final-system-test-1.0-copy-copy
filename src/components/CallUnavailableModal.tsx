import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CallUnavailableModalProps {
  onClose: () => void;
}

export default function CallUnavailableModal({ onClose }: CallUnavailableModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h3 font-semibold text-foreground">Feature Unavailable</h3>
          <button
            onClick={onClose}
            className="text-tertiary-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-body text-tertiary-foreground mb-6">
          This functionality is not yet available. Please check back later!
        </p>
        <Button
          onClick={onClose}
          className="w-full bg-gradient-primary text-primary-foreground"
        >
          Got it
        </Button>
      </div>
    </div>
  );
}
