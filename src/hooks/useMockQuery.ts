import { useState, useEffect } from 'react';
import { mockDelay, MOCK_USERS, MOCK_USER } from '@/utils/mockMode';
import { getRandomMockImage } from '@/lib/utils';

type UseQueryResult<TData> = {
  data: TData | undefined;
  isPending: boolean;
  error: Error | null;
};

export function useMockQuery<TData>(
  entityName: string,
  params?: any
): UseQueryResult<TData> {
  const [data, setData] = useState<TData | undefined>(undefined);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only delay on initial fetch or if explicitly requested, 
        // to make updates feel snappier
        if (isPending) await mockDelay();
        
        // Mock data for UserProfile to support Edit Profile flow
        if (entityName === 'UserProfile') {
           // Handle specific user query
           if (params?.userId) {
             const targetId = typeof params.userId === 'string' ? params.userId : params.userId.eq;
             
             // If it's the logged-in user, check local storage for updates
             if (targetId === MOCK_USER.id) {
               const storedProfile = localStorage.getItem('mock_user_profile');
               if (storedProfile) {
                 setData([JSON.parse(storedProfile)] as unknown as TData);
                 setError(null);
                 setIsPending(false);
                 return;
               }
             }

             // Find in static mock users
             const foundUser = MOCK_USERS.find(u => u.id === targetId);
             if (foundUser) {
               setData([{
                 id: `profile-${foundUser.id}`,
                 userId: foundUser.id,
                 username: foundUser.username,
                 bio: foundUser.bio,
                 website: foundUser.website,
                 profilePictureUrl: foundUser.profilePictureUrl,
                 createdAt: new Date(),
                 updatedAt: new Date()
               }] as unknown as TData);
               setError(null);
               setIsPending(false);
               return;
             }
           }

           // Default behavior (fallback to logged in user if no params or not found)
           const storedProfile = localStorage.getItem('mock_user_profile');
           if (storedProfile) {
             setData([JSON.parse(storedProfile)] as unknown as TData);
           } else {
             // Default mock profile
             setData([{
               id: 'mock-profile-1',
               userId: MOCK_USER.id,
               username: MOCK_USER.username,
               bio: MOCK_USER.bio,
               website: MOCK_USER.website,
               profilePictureUrl: MOCK_USER.profilePictureUrl,
               createdAt: new Date(),
               updatedAt: new Date()
             }] as unknown as TData);
           }
        } else if (entityName === 'Post') {
          // Fetch Posts from localStorage
          // Using v2 key to force refresh with new seed data
          const storedPosts = localStorage.getItem('mock_posts_v2');
          let parsedPosts = [];
          
          if (storedPosts) {
            // Parse dates back to Date objects
            parsedPosts = JSON.parse(storedPosts).map((p: any) => ({
              ...p,
              createdAt: new Date(p.createdAt),
              updatedAt: new Date(p.updatedAt)
            }));
          } else {
            // Seed default posts if none exist
            parsedPosts = [
              {
                id: 'seed-post-1',
                authorId: MOCK_USERS[1].id,
                authorName: MOCK_USERS[1].username,
                authorAvatar: MOCK_USERS[1].profilePictureUrl,
                content: 'Just finished this new piece! What do you think? 🎨',
                mediaUrl: getRandomMockImage(0),
                mediaType: 'image',
                likes: 42,
                comments: 5,
                reposts: 2,
                saves: 8,
                isArchived: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                updatedAt: new Date(),
                reactions: { '❤️': 30, '🔥': 12 },
                commentsArray: []
              },
              {
                id: 'seed-post-2',
                authorId: MOCK_USERS[2].id,
                authorName: MOCK_USERS[2].username,
                authorAvatar: MOCK_USERS[2].profilePictureUrl,
                content: 'Minimalism is key. #design #art',
                mediaUrl: getRandomMockImage(1),
                mediaType: 'image',
                likes: 128,
                comments: 12,
                reposts: 15,
                saves: 45,
                isArchived: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
                updatedAt: new Date(),
                reactions: { '❤️': 100, '👍': 28 },
                commentsArray: []
              },
              {
                id: 'seed-post-3',
                authorId: MOCK_USERS[1].id,
                authorName: MOCK_USERS[1].username,
                authorAvatar: MOCK_USERS[1].profilePictureUrl,
                content: 'Working on something big...',
                mediaUrl: getRandomMockImage(2),
                mediaType: 'image',
                likes: 89,
                comments: 8,
                reposts: 4,
                saves: 12,
                isArchived: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                updatedAt: new Date(),
                reactions: { '😮': 10, '❤️': 79 },
                commentsArray: []
              },
              {
                id: 'seed-post-4',
                authorId: MOCK_USERS[2].id,
                authorName: MOCK_USERS[2].username,
                authorAvatar: MOCK_USERS[2].profilePictureUrl,
                content: 'Late night inspiration 🌙',
                mediaUrl: getRandomMockImage(3),
                mediaType: 'image',
                likes: 256,
                comments: 24,
                reposts: 8,
                saves: 67,
                isArchived: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26), // 1 day 2 hours ago
                updatedAt: new Date(),
                reactions: { '❤️': 200, '🔥': 56 },
                commentsArray: []
              },
              {
                id: 'seed-post-5',
                authorId: MOCK_USERS[1].id,
                authorName: MOCK_USERS[1].username,
                authorAvatar: MOCK_USERS[1].profilePictureUrl,
                content: 'Color theory practice. Which palette do you prefer?',
                mediaUrl: getRandomMockImage(4),
                mediaType: 'image',
                likes: 15,
                comments: 3,
                reposts: 0,
                saves: 2,
                isArchived: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
                updatedAt: new Date(),
                reactions: { '👍': 15 },
                commentsArray: []
              },
              {
                id: 'seed-post-6',
                authorId: MOCK_USERS[2].id,
                authorName: MOCK_USERS[2].username,
                authorAvatar: MOCK_USERS[2].profilePictureUrl,
                content: 'Studio vibes today 🎧',
                mediaUrl: getRandomMockImage(5),
                mediaType: 'image',
                likes: 342,
                comments: 45,
                reposts: 12,
                saves: 89,
                isArchived: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50), // 2 days 2 hours ago
                updatedAt: new Date(),
                reactions: { '❤️': 300, '🔥': 42 },
                commentsArray: []
              }
            ];
            // Save seeded posts so they persist for this session
            localStorage.setItem('mock_posts_v2', JSON.stringify(parsedPosts));
          }
          
          // Filter by authorId if provided in params (mocking the 'where' clause)
          if (params?.where?.authorId) {
             const authorId = typeof params.where.authorId === 'string' ? params.where.authorId : params.where.authorId.eq;
             if (authorId) {
               parsedPosts = parsedPosts.filter((p: any) => p.authorId === authorId);
             }
          }
          // Support direct param for backward compatibility/simplicity in mock calls
          if (params?.authorId) {
             parsedPosts = parsedPosts.filter((p: any) => p.authorId === params.authorId);
          }
          
          // Apply basic sorting if requested
          if (params?.orderBy?.createdAt === 'desc') {
            parsedPosts.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
          }
          
          setData(parsedPosts as unknown as TData);
        } else if (entityName === 'Notification') {
          // Fetch Notifications from localStorage
          const storedNotifications = localStorage.getItem('mock_notifications');
          let parsedNotifications = [];
          
          if (storedNotifications) {
            parsedNotifications = JSON.parse(storedNotifications).map((n: any) => ({
              ...n,
              createdAt: new Date(n.createdAt),
              updatedAt: new Date(n.updatedAt)
            }));
          } else {
            // Seed default notifications
            parsedNotifications = [
              {
                id: 'seed-notif-1',
                type: 'like',
                fromUserId: MOCK_USERS[1].id,
                toUserId: MOCK_USER.id,
                read: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
                updatedAt: new Date()
              },
              {
                id: 'seed-notif-2',
                type: 'comment',
                fromUserId: MOCK_USERS[2].id,
                toUserId: MOCK_USER.id,
                previewText: 'Great work!',
                read: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
                updatedAt: new Date()
              },
              {
                id: 'seed-notif-3',
                type: 'friend_request',
                fromUserId: MOCK_USERS[1].id,
                toUserId: MOCK_USER.id,
                read: true,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                updatedAt: new Date()
              }
            ];
            localStorage.setItem('mock_notifications', JSON.stringify(parsedNotifications));
          }

          // Filter by userId if provided in params (mocking the 'where' clause)
          if (params?.where?.toUserId) {
             const targetId = typeof params.where.toUserId === 'string' ? params.where.toUserId : params.where.toUserId.eq;
             if (targetId) {
               parsedNotifications = parsedNotifications.filter((n: any) => n.toUserId === targetId);
             }
          }
          
          // Sort by createdAt desc
          parsedNotifications.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
          
          setData(parsedNotifications as unknown as TData);
        } else if (entityName === 'Conversation') {
          const storedConversations = localStorage.getItem('mock_conversations');
          let parsedConversations = [];
          if (storedConversations) {
            parsedConversations = JSON.parse(storedConversations).map((c: any) => ({
              ...c,
              createdAt: new Date(c.createdAt),
              updatedAt: new Date(c.updatedAt),
              lastMessageAt: c.lastMessageAt ? new Date(c.lastMessageAt) : null
            }));
          }

          // Filter by participantIds (contains current user)
          // Mocking the 'contains' filter for array
          if (params?.where?.participantIds) {
             // Assuming params.where.participantIds is the user ID string to look for
             const userId = params.where.participantIds; 
             parsedConversations = parsedConversations.filter((c: any) => c.participantIds.includes(userId));
          }

          // Sort by lastMessageAt desc
          parsedConversations.sort((a: any, b: any) => {
            const timeA = a.lastMessageAt ? a.lastMessageAt.getTime() : a.createdAt.getTime();
            const timeB = b.lastMessageAt ? b.lastMessageAt.getTime() : b.createdAt.getTime();
            return timeB - timeA;
          });

          setData(parsedConversations as unknown as TData);

        } else if (entityName === 'Message') {
          const storedMessages = localStorage.getItem('mock_messages');
          let parsedMessages = [];
          if (storedMessages) {
            parsedMessages = JSON.parse(storedMessages).map((m: any) => ({
              ...m,
              createdAt: new Date(m.createdAt),
              updatedAt: new Date(m.updatedAt)
            }));
          }

          // Filter by conversationId
          if (params?.where?.conversationId) {
            const convId = typeof params.where.conversationId === 'string' ? params.where.conversationId : params.where.conversationId.eq;
            parsedMessages = parsedMessages.filter((m: any) => m.conversationId === convId);
          }

          // Sort by createdAt asc
          parsedMessages.sort((a: any, b: any) => a.createdAt.getTime() - b.createdAt.getTime());

          setData(parsedMessages as unknown as TData);

        } else {
          // Return empty array for other queries
          setData((typeof params === 'string' ? null : []) as TData);
        }
        
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsPending(false);
      }
    };

    fetchData();

    // Listen for updates to this entity
    const handleUpdate = () => {
      fetchData();
    };

    window.addEventListener(`anima:mock:update:${entityName}`, handleUpdate);
    
    return () => {
      window.removeEventListener(`anima:mock:update:${entityName}`, handleUpdate);
    };
  }, [entityName, JSON.stringify(params)]);

  return { data, isPending, error };
}
