import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Music, ExternalLink } from 'lucide-react';

export default function ProfileMusicPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [autoplay, setAutoplay] = useState(true);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'external'>('file');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Music Updated',
      description: 'Your profile music has been updated.',
    });
    if (user) {
      navigate(`/profile/${user.id}`);
    }
  };

  return (
    <InstagramLayout>
      <div className="w-full max-w-2xl mx-auto py-4 px-4 sm:py-6 lg:py-8">
        <h1 className="text-h1 font-bold text-foreground mb-2">Profile Music</h1>
        <p className="text-body text-tertiary-foreground mb-8">
          Add music to your profile that plays when visitors view your page
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Method */}
          <div className="bg-background border border-border rounded-lg p-6">
            <Label className="text-body-sm font-semibold text-foreground mb-3 block">
              Upload Method
            </Label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setUploadMethod('file')}
                className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                  uploadMethod === 'file'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Upload className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-body-sm font-medium text-foreground">Upload File</p>
                <p className="text-caption text-tertiary-foreground">MP3 or WAV</p>
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('external')}
                className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                  uploadMethod === 'external'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <ExternalLink className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-body-sm font-medium text-foreground">External Link</p>
                <p className="text-caption text-tertiary-foreground">Spotify, Apple Music</p>
              </button>
            </div>
          </div>

          {/* File Upload */}
          {uploadMethod === 'file' && (
            <div className="bg-background border border-border rounded-lg p-6">
              <Label className="text-body-sm font-semibold text-foreground mb-3 block">
                Upload Audio File
              </Label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-tertiary hover:bg-secondary transition-colors">
                <Music className="w-8 h-8 text-tertiary-foreground mb-2" />
                <p className="text-body-sm text-foreground font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-caption text-tertiary-foreground">
                  MP3 or WAV (max 10MB)
                </p>
                <input type="file" className="hidden" accept=".mp3,.wav" />
              </label>
            </div>
          )}

          {/* External Link */}
          {uploadMethod === 'external' && (
            <div className="bg-background border border-border rounded-lg p-6 space-y-4">
              <div>
                <Label htmlFor="service" className="text-body-sm font-semibold text-foreground mb-2 block">
                  Music Service
                </Label>
                <select
                  id="service"
                  className="w-full h-10 px-4 border border-border rounded-md bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="spotify">Spotify</option>
                  <option value="apple">Apple Music</option>
                  <option value="soundcloud">SoundCloud</option>
                </select>
              </div>

              <div>
                <Label htmlFor="url" className="text-body-sm font-semibold text-foreground mb-2 block">
                  Track URL
                </Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://open.spotify.com/track/..."
                  className="h-10"
                />
              </div>
            </div>
          )}

          {/* Autoplay */}
          <div className="bg-background border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-body-sm font-semibold text-foreground block mb-1">
                  Autoplay
                </Label>
                <p className="text-caption text-tertiary-foreground">
                  Music will play automatically when someone visits your profile
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoplay(!autoplay)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  autoplay ? 'bg-gradient-primary' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    autoplay ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1 h-12 bg-gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Save Music
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => user ? navigate(`/profile/${user.id}`) : navigate('/settings')}
              className="h-12 px-8 border-border hover:bg-tertiary"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </InstagramLayout>
  );
}
