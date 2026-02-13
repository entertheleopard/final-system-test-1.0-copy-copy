import { useState } from 'react';
import InstagramLayout from '@/components/InstagramLayout';
import { Lock, Eye, Shield, MessageCircle, Users, Ban, VolumeX, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function PrivacySecurityPage() {
  // UI State for toggles
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [storyVisibility, setStoryVisibility] = useState('friends'); // 'friends' | 'public'
  const [postVisibility, setPostVisibility] = useState('public'); // 'friends' | 'public'
  const [allowMessages, setAllowMessages] = useState('everyone'); // 'everyone' | 'friends' | 'none'
  const [allowComments, setAllowComments] = useState('everyone'); // 'everyone' | 'friends' | 'none'

  return (
    <InstagramLayout>
      <div className="w-full max-w-2xl mx-auto py-4 px-4 sm:py-6 lg:py-8">
        <h1 className="text-h1 font-bold text-foreground mb-8">Privacy and Security</h1>

        <div className="space-y-6">
          {/* Account Privacy */}
          <section className="bg-background border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-tertiary/30">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-primary" strokeWidth={2} />
                <h2 className="text-body font-semibold text-foreground">Account Privacy</h2>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="pr-4">
                  <p className="text-body text-foreground font-medium">Private Account</p>
                  <p className="text-body-sm text-tertiary-foreground mt-1">
                    When your account is private, only people you approve can see your photos and videos. Your existing followers won't be affected.
                  </p>
                </div>
                <Switch
                  checked={isPrivateAccount}
                  onCheckedChange={setIsPrivateAccount}
                />
              </div>
            </div>
          </section>

          {/* Interactions */}
          <section className="bg-background border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-tertiary/30">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" strokeWidth={2} />
                <h2 className="text-body font-semibold text-foreground">Interactions</h2>
              </div>
            </div>
            <div className="divide-y divide-border">
              {/* Story Visibility */}
              <div className="p-4 flex items-center justify-between hover:bg-tertiary/50 transition-colors cursor-pointer" onClick={() => setStoryVisibility(prev => prev === 'public' ? 'friends' : 'public')}>
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-tertiary-foreground" />
                  <div>
                    <p className="text-body text-foreground">Story Visibility</p>
                    <p className="text-caption text-tertiary-foreground">Control who can see your stories</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-tertiary-foreground">
                  <span className="text-body-sm capitalize">{storyVisibility}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Post Visibility */}
              <div className="p-4 flex items-center justify-between hover:bg-tertiary/50 transition-colors cursor-pointer" onClick={() => setPostVisibility(prev => prev === 'public' ? 'friends' : 'public')}>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-tertiary-foreground" />
                  <div>
                    <p className="text-body text-foreground">Post Visibility Defaults</p>
                    <p className="text-caption text-tertiary-foreground">Set default audience for new posts</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-tertiary-foreground">
                  <span className="text-body-sm capitalize">{postVisibility}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 flex items-center justify-between hover:bg-tertiary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-tertiary-foreground" />
                  <div>
                    <p className="text-body text-foreground">Messages</p>
                    <p className="text-caption text-tertiary-foreground">Who can send you message requests</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-tertiary-foreground">
                  <span className="text-body-sm capitalize">{allowMessages}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Comments */}
              <div className="p-4 flex items-center justify-between hover:bg-tertiary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-tertiary-foreground" />
                  <div>
                    <p className="text-body text-foreground">Comments</p>
                    <p className="text-caption text-tertiary-foreground">Who can comment on your posts</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-tertiary-foreground">
                  <span className="text-body-sm capitalize">{allowComments}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </section>

          {/* Connections */}
          <section className="bg-background border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-tertiary/30">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" strokeWidth={2} />
                <h2 className="text-body font-semibold text-foreground">Connections</h2>
              </div>
            </div>
            <div className="divide-y divide-border">
              <div className="p-4 flex items-center justify-between hover:bg-tertiary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Ban className="w-5 h-5 text-tertiary-foreground" />
                  <p className="text-body text-foreground">Blocked Accounts</p>
                </div>
                <ChevronRight className="w-4 h-4 text-tertiary-foreground" />
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-tertiary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <VolumeX className="w-5 h-5 text-tertiary-foreground" />
                  <p className="text-body text-foreground">Muted Accounts</p>
                </div>
                <ChevronRight className="w-4 h-4 text-tertiary-foreground" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </InstagramLayout>
  );
}
