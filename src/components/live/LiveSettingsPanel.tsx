import { useState } from 'react';
import { X, MessageSquare, Gift, Eye, Shield, Camera, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface LiveSettingsPanelProps {
  onClose: () => void;
}

export interface LiveSettings {
  allowComments: boolean;
  allowGifts: boolean;
  showViewerCount: boolean;
  mirrorCamera: boolean;
  filterKeywords: boolean;
}

interface LiveSettingsPanelProps {
  settings: LiveSettings;
  onSettingsChange: (settings: LiveSettings) => void;
  onClose: () => void;
}

export default function LiveSettingsPanel({ settings, onSettingsChange, onClose }: LiveSettingsPanelProps) {
  const toggleSetting = (key: keyof LiveSettings) => {
    onSettingsChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in slide-in-from-bottom duration-300">
      {/* Click backdrop to close */}
      <div className="flex-1" onClick={onClose} />
      
      {/* Panel Content */}
      <div className="bg-background rounded-t-2xl p-4 pb-8 border-t border-border shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-h3 font-semibold text-foreground">Live Settings</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-tertiary rounded-full transition-colors text-foreground"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Interaction Settings */}
          <section className="space-y-4">
            <h4 className="text-body-sm font-semibold text-tertiary-foreground uppercase tracking-wider">Interactions</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-body font-medium text-foreground">Allow Comments</p>
                  <p className="text-caption text-tertiary-foreground">Viewers can post comments</p>
                </div>
              </div>
              <Switch 
                checked={settings.allowComments} 
                onCheckedChange={() => toggleSetting('allowComments')} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-body font-medium text-foreground">Allow Gifts</p>
                  <p className="text-caption text-tertiary-foreground">Viewers can send gifts</p>
                </div>
              </div>
              <Switch 
                checked={settings.allowGifts} 
                onCheckedChange={() => toggleSetting('allowGifts')} 
              />
            </div>
          </section>

          {/* Display Settings */}
          <section className="space-y-4">
            <h4 className="text-body-sm font-semibold text-tertiary-foreground uppercase tracking-wider">Display</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-body font-medium text-foreground">Viewer Count</p>
                  <p className="text-caption text-tertiary-foreground">Show number of viewers</p>
                </div>
              </div>
              <Switch 
                checked={settings.showViewerCount} 
                onCheckedChange={() => toggleSetting('showViewerCount')} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-body font-medium text-foreground">Mirror Front Camera</p>
                  <p className="text-caption text-tertiary-foreground">Flip video horizontally</p>
                </div>
              </div>
              <Switch 
                checked={settings.mirrorCamera} 
                onCheckedChange={() => toggleSetting('mirrorCamera')} 
              />
            </div>
          </section>

          {/* Moderation */}
          <section className="space-y-4">
            <h4 className="text-body-sm font-semibold text-tertiary-foreground uppercase tracking-wider">Moderation</h4>
            
            <button className="w-full flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-body font-medium text-foreground group-hover:text-primary transition-colors">Blocked Users</p>
                  <p className="text-caption text-tertiary-foreground">Manage blocked accounts</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-tertiary-foreground" />
            </button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-body font-medium text-foreground">Filter Keywords</p>
                  <p className="text-caption text-tertiary-foreground">Hide offensive comments</p>
                </div>
              </div>
              <Switch 
                checked={settings.filterKeywords} 
                onCheckedChange={() => toggleSetting('filterKeywords')} 
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
