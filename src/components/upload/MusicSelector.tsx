import { useState } from 'react';
import { Search, Play, X, Music, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MusicTrack } from '@/types/upload';

interface MusicSelectorProps {
  onSelect: (track: MusicTrack) => void;
  onClose: () => void;
}

const MOCK_TRACKS: MusicTrack[] = [];

export default function MusicSelector({ onSelect, onClose }: MusicSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedTrack, setUploadedTrack] = useState<MusicTrack | null>(null);

  const filteredTracks = MOCK_TRACKS.filter(
    track =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const track: MusicTrack = {
      id: 'uploaded',
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Uploaded',
      duration: 0,
    };

    setUploadedTrack(track);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center">
      <div className="bg-background w-full lg:max-w-2xl lg:rounded-t-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-h3 font-semibold text-foreground">Add Music</h2>
          <button onClick={onClose} className="text-foreground hover:text-tertiary-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Notice */}
        <div className="p-4 bg-tertiary border-b border-border flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-body-sm text-foreground font-medium mb-1">
              Music Library Preview
            </p>
            <p className="text-caption text-tertiary-foreground">
              This is a demo music selector. In production, this would connect to streaming services like Spotify or Apple Music.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary-foreground" />
            <input
              type="text"
              placeholder="Search for music"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-tertiary rounded-lg text-body text-foreground placeholder:text-tertiary-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Upload Option */}
        <div className="p-4 border-b border-border">
          <label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-tertiary transition-colors cursor-pointer">
            <Music className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-body font-medium text-foreground">Upload Audio File</p>
              <p className="text-caption text-tertiary-foreground">MP3 or WAV</p>
            </div>
            <input
              type="file"
              accept="audio/mpeg,audio/wav"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Track List */}
        <div className="flex-1 overflow-y-auto">
          {uploadedTrack && (
            <button
              onClick={() => onSelect(uploadedTrack)}
              className="w-full flex items-center gap-3 p-4 hover:bg-tertiary transition-colors border-b border-border"
            >
              <div className="w-12 h-12 bg-gradient-primary rounded flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-body font-medium text-foreground">{uploadedTrack.title}</p>
                <p className="text-caption text-tertiary-foreground">{uploadedTrack.artist}</p>
              </div>
              <Play className="w-5 h-5 text-primary" />
            </button>
          )}

          {filteredTracks.map((track) => (
            <button
              key={track.id}
              onClick={() => onSelect(track)}
              className="w-full flex items-center gap-3 p-4 hover:bg-tertiary transition-colors border-b border-border"
            >
              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 text-left">
                <p className="text-body font-medium text-foreground">{track.title}</p>
                <p className="text-caption text-tertiary-foreground">{track.artist}</p>
              </div>
              <Play className="w-5 h-5 text-primary" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
