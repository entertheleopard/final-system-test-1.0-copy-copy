import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@animaapp/playground-react-sdk';
import { useMockQuery } from '@/hooks/useMockQuery';
import { useMockMutation } from '@/hooks/useMockMutation';
import { isMockMode } from '@/utils/mockMode';
import type { Notification, NotificationDraft } from '@/types/schema';

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  createNotification: (data: NotificationDraft) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Query Notifications
  const realQuery = isMockMode() ? null : useQuery('Notification', { 
    where: { toUserId: user?.id || '' },
    orderBy: { createdAt: 'desc' } 
  });
  const mockQuery = isMockMode() ? useMockQuery('Notification', { 
    where: { toUserId: user?.id || '' } 
  }) : null;
  
  const { data: notificationsData, isPending } = (isMockMode() ? mockQuery : realQuery)!;
  const notifications = (notificationsData || []) as Notification[];

  // Mutations
  const realMutation = isMockMode() ? null : useMutation('Notification');
  const mockMutation = isMockMode() ? useMockMutation('Notification') : null;
  const { create, update } = (isMockMode() ? mockMutation : realMutation)!;

  const unreadCount = notifications.filter(n => !n.read).length;

  const createNotification = useCallback(async (data: NotificationDraft) => {
    if (!user) return;
    // Don't notify yourself
    if (data.toUserId === user.id) return;

    try {
      await create({
        ...data,
        read: false
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }, [create, user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await update(notificationId, { read: true });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [update]);

  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    try {
      await Promise.all(unreadNotifications.map(n => update(n.id, { read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [notifications, update]);

  return (
    <NotificationsContext.Provider value={{ 
      notifications, 
      unreadCount, 
      isLoading: isPending,
      createNotification,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
