import { useState } from 'react';
import { mockDelay } from '@/utils/mockMode';

type UseMutationResult<TData, TDraft> = {
  create: (data: TDraft) => Promise<TData>;
  update: (id: string, data: Partial<TDraft>) => Promise<TData>;
  remove: (id: string) => Promise<TData>;
  isPending: boolean;
  error: Error | null;
};

export function useMockMutation<TData, TDraft>(
  entityName: string
): UseMutationResult<TData, TDraft> {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: TDraft): Promise<TData> => {
    setIsPending(true);
    setError(null);
    try {
      await mockDelay();
      const newItem = { id: Math.random().toString(36), ...data } as TData;
      
      // Persist UserProfile in mock mode
      if (entityName === 'UserProfile') {
        localStorage.setItem('mock_user_profile', JSON.stringify(newItem));
      }

      // Persist Post in mock mode
      if (entityName === 'Post') {
        const storedPosts = localStorage.getItem('mock_posts_v2');
        const posts = storedPosts ? JSON.parse(storedPosts) : [];
        const postWithDate = { 
          ...newItem, 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString() 
        };
        localStorage.setItem('mock_posts_v2', JSON.stringify([postWithDate, ...posts]));
        
        // Dispatch event to notify queries to refetch
        window.dispatchEvent(new CustomEvent(`anima:mock:update:${entityName}`));
        
        return postWithDate;
      }

      // Persist Notification in mock mode
      if (entityName === 'Notification') {
        const storedNotifications = localStorage.getItem('mock_notifications');
        const notifications = storedNotifications ? JSON.parse(storedNotifications) : [];
        const notificationWithDate = { 
          ...newItem, 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          read: false
        };
        localStorage.setItem('mock_notifications', JSON.stringify([notificationWithDate, ...notifications]));
        
        window.dispatchEvent(new CustomEvent(`anima:mock:update:${entityName}`));
        return notificationWithDate;
      }

      // Persist Conversation in mock mode
      if (entityName === 'Conversation') {
        const storedConversations = localStorage.getItem('mock_conversations');
        const conversations = storedConversations ? JSON.parse(storedConversations) : [];
        
        // Check if update or create
        const existingIndex = conversations.findIndex((c: any) => c.id === newItem.id);
        
        let conversationToSave;
        if (existingIndex >= 0) {
           // This logic is actually handled in 'update' method usually, but for 'create' we assume new
           // However, useMockMutation 'create' generates ID. 
           // If we are here, it's a new conversation.
           conversationToSave = {
             ...newItem,
             createdAt: new Date().toISOString(),
             updatedAt: new Date().toISOString()
           };
           conversations.unshift(conversationToSave);
        } else {
           conversationToSave = {
             ...newItem,
             createdAt: new Date().toISOString(),
             updatedAt: new Date().toISOString()
           };
           conversations.unshift(conversationToSave);
        }

        localStorage.setItem('mock_conversations', JSON.stringify(conversations));
        window.dispatchEvent(new CustomEvent(`anima:mock:update:${entityName}`));
        return conversationToSave;
      }

      // Persist Message in mock mode
      if (entityName === 'Message') {
        const storedMessages = localStorage.getItem('mock_messages');
        const messages = storedMessages ? JSON.parse(storedMessages) : [];
        const messageWithDate = { 
          ...newItem, 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('mock_messages', JSON.stringify([...messages, messageWithDate]));
        
        window.dispatchEvent(new CustomEvent(`anima:mock:update:${entityName}`));
        return messageWithDate;
      }
      
      // Dispatch event for other entities as well
      window.dispatchEvent(new CustomEvent(`anima:mock:update:${entityName}`));

      return newItem;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  const update = async (id: string, data: Partial<TDraft>): Promise<TData> => {
    setIsPending(true);
    setError(null);
    try {
      await mockDelay();
      
      // Persist UserProfile updates in mock mode
      if (entityName === 'UserProfile') {
        const stored = localStorage.getItem('mock_user_profile');
        const current = stored ? JSON.parse(stored) : {};
        const updated = { ...current, ...data, id };
        localStorage.setItem('mock_user_profile', JSON.stringify(updated));
        return updated as TData;
      }

      // Persist Conversation updates in mock mode
      if (entityName === 'Conversation') {
        const storedConversations = localStorage.getItem('mock_conversations');
        if (storedConversations) {
          const conversations = JSON.parse(storedConversations);
          const index = conversations.findIndex((c: any) => c.id === id);
          if (index !== -1) {
            const updated = { ...conversations[index], ...data, updatedAt: new Date().toISOString() };
            conversations[index] = updated;
            localStorage.setItem('mock_conversations', JSON.stringify(conversations));
            window.dispatchEvent(new CustomEvent(`anima:mock:update:${entityName}`));
            return updated as TData;
          }
        }
      }

      return { id, ...data } as TData;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  const remove = async (id: string): Promise<TData> => {
    setIsPending(true);
    setError(null);
    try {
      await mockDelay();
      return { id } as TData;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { create, update, remove, isPending, error };
}
