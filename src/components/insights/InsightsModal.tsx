import { X, Eye, Clock, Heart, MessageCircle, Share2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InsightsModalProps {
  onClose: () => void;
  postImage: string;
}

export default function InsightsModal({ onClose, postImage }: InsightsModalProps) {
  // Mock metrics
  const metrics = {
    reach: 12453,
    impressions: 15234,
    engagement: 892,
    likes: 756,
    comments: 45,
    shares: 82,
    saves: 123,
    watchTime: '45h 12m',
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-background rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-h3 font-semibold text-foreground">Post Insights</h3>
          <button onClick={onClose} className="p-1 hover:bg-tertiary rounded-full transition-colors">
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Overview */}
          <div className="flex gap-4">
            <img 
              src={postImage} 
              alt="Post thumbnail" 
              className="w-20 h-20 rounded-lg object-cover bg-tertiary"
            />
            <div className="flex-1">
              <p className="text-body-sm text-tertiary-foreground mb-1">Total Reach</p>
              <p className="text-h2 font-bold text-foreground">{metrics.reach.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-success text-caption font-medium mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+12% vs last post</span>
              </div>
            </div>
          </div>

          {/* Engagement Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-tertiary/50 p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2 text-tertiary-foreground">
                <Heart className="w-4 h-4" />
                <span className="text-caption font-medium">Likes</span>
              </div>
              <p className="text-h3 font-bold text-foreground">{metrics.likes}</p>
            </div>
            <div className="bg-tertiary/50 p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2 text-tertiary-foreground">
                <MessageCircle className="w-4 h-4" />
                <span className="text-caption font-medium">Comments</span>
              </div>
              <p className="text-h3 font-bold text-foreground">{metrics.comments}</p>
            </div>
            <div className="bg-tertiary/50 p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2 text-tertiary-foreground">
                <Share2 className="w-4 h-4" />
                <span className="text-caption font-medium">Shares</span>
              </div>
              <p className="text-h3 font-bold text-foreground">{metrics.shares}</p>
            </div>
            <div className="bg-tertiary/50 p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2 text-tertiary-foreground">
                <Eye className="w-4 h-4" />
                <span className="text-caption font-medium">Impressions</span>
              </div>
              <p className="text-h3 font-bold text-foreground">{metrics.impressions.toLocaleString()}</p>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="space-y-4">
            <h4 className="text-body font-semibold text-foreground">Performance</h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-body-sm mb-1">
                  <span className="text-tertiary-foreground">Non-followers reach</span>
                  <span className="text-foreground font-medium">68%</span>
                </div>
                <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[68%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-body-sm mb-1">
                  <span className="text-tertiary-foreground">Watch Time</span>
                  <span className="text-foreground font-medium">{metrics.watchTime}</span>
                </div>
                <div className="flex items-center gap-2 text-caption text-tertiary-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Average watch time: 12s</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <Button onClick={onClose} className="w-full bg-tertiary text-foreground hover:bg-secondary">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
