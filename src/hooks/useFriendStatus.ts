import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@animaapp/playground-react-sdk';
import { useMockQuery } from '@/hooks/useMockQuery';
import { useMockMutation } from '@/hooks/useMockMutation';
import { isMockMode } from '@/utils/mockMode';

export type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends';

export function useFriendStatus(targetUserId: string) {
  const { user } = useAuth();
  const [status, setStatus] = useState<FriendStatus>('none');

  // Query friend requests involving current user and target user
  const realQuery = isMockMode() ? null : useQuery('FriendRequest', {
    where: {
      OR: [
        { fromUserId: user?.id || '', toUserId: targetUserId },
        { fromUserId: targetUserId, toUserId: user?.id || '' }
      ]
    }
  });
  const mockQuery = isMockMode() ? useMockQuery('FriendRequest', {}) : null;
  const { data: friendRequests, isPending } = (isMockMode() ? mockQuery : realQuery)!;

  const realMutation = isMockMode() ? null : useMutation('FriendRequest');
  const mockMutation = isMockMode() ? useMockMutation('FriendRequest') : null;
  const { create, update, remove } = (isMockMode() ? mockMutation : realMutation)!;

  useEffect(() => {
    if (!friendRequests || !user) {
      setStatus('none');
      return;
    }

    // Find relevant friend request
    const sentRequest = friendRequests.find(
      req => req.fromUserId === user.id && req.toUserId === targetUserId
    );
    const receivedRequest = friendRequests.find(
      req => req.fromUserId === targetUserId && req.toUserId === user.id
    );

    if (sentRequest?.status === 'accepted' || receivedRequest?.status === 'accepted') {
      setStatus('friends');
    } else if (sentRequest?.status === 'pending') {
      setStatus('pending_sent');
    } else if (receivedRequest?.status === 'pending') {
      setStatus('pending_received');
    } else {
      setStatus('none');
    }
  }, [friendRequests, user, targetUserId]);

  const sendFriendRequest = async () => {
    if (!user) return;

    try {
      await create({
        fromUserId: user.id,
        toUserId: targetUserId,
        status: 'pending'
      });
      setStatus('pending_sent');
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  const acceptFriendRequest = async () => {
    if (!user || !friendRequests) return;

    const receivedRequest = friendRequests.find(
      req => req.fromUserId === targetUserId && req.toUserId === user.id && req.status === 'pending'
    );

    if (receivedRequest) {
      try {
        await update(receivedRequest.id, { status: 'accepted' });
        setStatus('friends');
      } catch (error) {
        console.error('Failed to accept friend request:', error);
      }
    }
  };

  const cancelFriendRequest = async () => {
    if (!user || !friendRequests) return;

    const sentRequest = friendRequests.find(
      req => req.fromUserId === user.id && req.toUserId === targetUserId && req.status === 'pending'
    );

    const receivedRequest = friendRequests.find(
      req => req.fromUserId === targetUserId && req.toUserId === user.id && req.status === 'pending'
    );

    const requestToCancel = sentRequest || receivedRequest;

    if (requestToCancel) {
      try {
        await remove(requestToCancel.id);
        setStatus('none');
      } catch (error) {
        console.error('Failed to cancel friend request:', error);
      }
    }
  };

  const removeFriend = async () => {
    if (!user || !friendRequests) return;

    const friendship = friendRequests.find(
      req => 
        ((req.fromUserId === user.id && req.toUserId === targetUserId) ||
         (req.fromUserId === targetUserId && req.toUserId === user.id)) &&
        req.status === 'accepted'
    );

    if (friendship) {
      try {
        await remove(friendship.id);
        setStatus('none');
      } catch (error) {
        console.error('Failed to remove friend:', error);
      }
    }
  };

  return {
    status,
    isPending,
    sendFriendRequest,
    acceptFriendRequest,
    cancelFriendRequest,
    removeFriend
  };
}
