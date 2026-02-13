import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import FriendButton from '@/components/FriendButton';
import { useNotifications } from '@/contexts/NotificationsContext';
import { handleAvatarError, handleImageError } from '@/lib/utils';
import { Heart, MessageCircle, UserPlus, Repeat2, Search, Bell } from 'lucide-react';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, isLoading, markAllAsRead } = useNotifications();

  // Mark all as read when viewing the page
  useEffect(() => {
    if (notifications.some(n => !n.read)) {
      markAllAsRead();
    }
  }, [notifications.length]); // Only trigger when list changes/loads

  // Helper to fetch user details for notifications
  // In a real app, we might include sender info in the notification payload or fetch it efficiently
  // For now, we'll just use a placeholder or fetch if we had a batch user endpoint
  // We'll mock the user display for now based on fromUserId if it's a mock ID, or just show generic
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-error" fill="currentColor" />;
      case 'comment':
      case 'reply':
      case 'mention':
        return <MessageCircle className="w-5 h-5 text-primary" />;
      case 'friend_request':
      case 'friend_accept':
        return <UserPlus className="w-5 h-5 text-success" />;
      default:
        return <Bell className="w-5 h-5 text-tertiary-foreground" />;
    }
  };

  const getActionText = (type: string, previewText?: string) => {
    switch (type) {
      case 'like': return 'liked your post';
      case 'comment': return `commented: "${previewText || ''}"`;
      case 'reply': return `replied: "${previewText || ''}"`;
      case 'mention': return `mentioned you: "${previewText || ''}"`;
      case 'friend_request': return 'sent you a friend request';
      case 'friend_accept': return 'accepted your friend request';
      default: return 'interacted with you';
    }
  };

  return (
    <InstagramLayout>
      <div className="w-full max-w-2xl mx-auto py-4 px-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-h1 font-bold text-foreground">Activity</h1>
          <button 
            onClick={() => navigate('/search')}
            className="p-2 bg-tertiary rounded-full hover:bg-secondary transition-colors"
          >
            <Search className="w-6 h-6 text-foreground" />
          </button>
        </div>

        <div className="bg-background border border-border rounded-lg divide-y divide-border">
          {isLoading ? (
            <div className="p-8 text-center text-tertiary-foreground">Loading activity...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-tertiary-foreground" />
              </div>
              <h3 className="text-h3 font-semibold text-foreground mb-2">No notifications yet</h3>
              <p className="text-body text-tertiary-foreground">
                When people interact with you, you'll see it here.
              </p>
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`p-4 flex items-center gap-3 hover:bg-tertiary transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}
              >
                <button
                  onClick={() => navigate(`/profile/${notif.fromUserId}`)}
                  className="relative hover:opacity-80 transition-opacity"
                >
                  {/* Placeholder avatar since we don't have sender details in notification object yet */}
                  <img
                    src="https://c.animaapp.com/mlkxz4s0AuRnuX/img/ai_5.png" 
                    alt="User"
                    className="w-12 h-12 rounded-full object-cover cursor-pointer border border-border"
                    onError={handleAvatarError}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                    {getIcon(notif.type)}
                  </div>
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-body-sm text-foreground truncate">
                    <span className="font-semibold">User</span>{' '}
                    {getActionText(notif.type, notif.previewText)}
                  </p>
                  <p className="text-caption text-tertiary-foreground">
                    {formatTime(new Date(notif.createdAt))}
                  </p>
                </div>

                {/* Optional: Post Thumbnail if postId exists */}
                {notif.postId && (
                  <div className="w-12 h-12 bg-tertiary rounded overflow-hidden flex-shrink-0">
                    {/* We would fetch the post image here, using placeholder for now */}
                    <div className="w-full h-full bg-secondary" />
                  </div>
                )}

                {(notif.type === 'friend_request') && (
                  <FriendButton userId={notif.fromUserId} variant="compact" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </InstagramLayout>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
