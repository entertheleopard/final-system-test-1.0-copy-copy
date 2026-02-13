import { UserPlus, UserCheck, Clock, UserMinus } from 'lucide-react';
import { useFriendStatus } from '@/hooks/useFriendStatus';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface FriendButtonProps {
  userId: string;
  variant?: 'default' | 'compact';
  className?: string;
}

export default function FriendButton({ userId, variant = 'default', className = '' }: FriendButtonProps) {
  const { status, isPending, sendFriendRequest, acceptFriendRequest, cancelFriendRequest, removeFriend } = useFriendStatus(userId);
  const { toast } = useToast();
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  if (isPending) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-4 py-1.5 bg-tertiary text-tertiary-foreground rounded-lg text-body-sm font-medium opacity-50 ${className}`}
      >
        Loading...
      </button>
    );
  }

  if (status === 'friends') {
    if (showRemoveConfirm) {
      return (
        <div className="flex gap-2">
          <button
            onClick={async () => {
              await removeFriend();
              setShowRemoveConfirm(false);
            }}
            className="px-3 py-1.5 bg-error text-error-foreground rounded-lg text-body-sm font-medium hover:opacity-90 transition-opacity"
          >
            Remove
          </button>
          <button
            onClick={() => setShowRemoveConfirm(false)}
            className="px-3 py-1.5 bg-tertiary text-foreground rounded-lg text-body-sm font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => setShowRemoveConfirm(true)}
        className={`flex items-center gap-2 px-4 py-1.5 bg-tertiary text-foreground rounded-lg text-body-sm font-medium hover:bg-gray-300 transition-colors ${className}`}
      >
        <UserCheck className="w-4 h-4" />
        {variant === 'default' ? 'Friends' : ''}
      </button>
    );
  }

  if (status === 'pending_sent') {
    return (
      <button
        onClick={cancelFriendRequest}
        className={`flex items-center gap-2 px-4 py-1.5 bg-tertiary text-foreground rounded-lg text-body-sm font-medium hover:bg-gray-300 transition-colors ${className}`}
      >
        <Clock className="w-4 h-4" />
        {variant === 'default' ? 'Request Sent' : ''}
      </button>
    );
  }

  if (status === 'pending_received') {
    return (
      <div className="flex gap-2">
        <button
          onClick={acceptFriendRequest}
          className={`flex items-center gap-2 px-4 py-1.5 bg-gradient-primary text-primary-foreground rounded-lg text-body-sm font-medium hover:opacity-90 transition-opacity ${className}`}
        >
          Accept
        </button>
        <button
          onClick={cancelFriendRequest}
          className={`px-4 py-1.5 bg-tertiary text-foreground rounded-lg text-body-sm font-medium hover:bg-gray-300 transition-colors ${className}`}
        >
          Decline
        </button>
      </div>
    );
  }

  const handleSendFriendRequest = async () => {
    try {
      await sendFriendRequest();
      toast({
        title: 'Friend request sent',
        description: 'Your friend request has been sent successfully.',
      });
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  return (
    <button
      onClick={handleSendFriendRequest}
      className={`flex items-center gap-2 px-4 py-1.5 bg-gradient-primary text-primary-foreground rounded-lg text-body-sm font-medium hover:opacity-90 transition-opacity ${className}`}
    >
      <UserPlus className="w-4 h-4" />
      {variant === 'default' ? 'Add Friend' : ''}
    </button>
  );
}
