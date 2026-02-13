import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import { Button } from '@/components/ui/button';
import { ProfileActionButton } from '@/components/profile/ProfileActionButton';
import EditProfileModal from '@/components/profile/EditProfileModal';
import PostDetailModal from '@/components/PostDetailModal';
import { Settings, Grid3X3, Bookmark, UserSquare2, Menu } from 'lucide-react';
import FriendButton from '@/components/FriendButton';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@animaapp/playground-react-sdk';
import { useMockQuery } from '@/hooks/useMockQuery';
import { useMockMutation } from '@/hooks/useMockMutation';
import { useNotifications } from '@/contexts/NotificationsContext';
import { isMockMode } from '@/utils/mockMode';
import { getFallbackAvatar, resolveMedia, handleImageError } from '@/lib/utils';
import { AvatarImage } from '@/components/ui/AvatarImage';
import { useToast } from '@/hooks/use-toast';
import type { Post, Conversation } from '@/types/schema';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams();
  const { createNotification } = useNotifications();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged'>('posts');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);

  // Auth
  const { user, isPending: isAuthPending } = useAuth();

  // Debug logging for route params
  useEffect(() => {
    console.log('ProfilePage: Route param userId:', paramUserId);
    console.log('ProfilePage: Current auth user id:', user?.id);
  }, [paramUserId, user?.id]);

  // 1. Resolve Target User ID & Ownership
  // Explicit priority: Route Param > Current Session
  const targetUserId = paramUserId ?? user?.id;
  
  // isOwnProfile logic:
  // If route param exists -> check if it matches current user
  // If route param missing -> assume it's the "my profile" route
  const isOwnProfile = paramUserId ? paramUserId === user?.id : true;

  // 2. Hooks (Must run unconditionally, but we pass safe values if targetUserId is missing)
  // We use a dummy ID 'NO_FETCH' if targetUserId is missing to prevent meaningful fetching
  const queryUserId = targetUserId || 'NO_FETCH';

  // Fetch UserProfile Entity
  const realQuery = isMockMode() ? null : useQuery('UserProfile', { where: { userId: queryUserId } });
  const mockQuery = isMockMode() ? useMockQuery('UserProfile', { userId: queryUserId, _t: refreshKey }) : null;
  const { data: userProfiles, isPending: isLoadingProfile } = (isMockMode() ? mockQuery : realQuery)!;
  
  const userProfile = userProfiles && userProfiles.length > 0 ? userProfiles[0] : null;

  // Fetch Posts
  const realPostQuery = isMockMode() ? null : useQuery('Post', { where: { authorId: queryUserId }, orderBy: { createdAt: 'desc' } });
  const mockPostQuery = isMockMode() ? useMockQuery('Post', { authorId: queryUserId }) : null;
  const { data: fetchedPosts, isPending: isLoadingPosts } = (isMockMode() ? mockPostQuery : realPostQuery)!;

  // Fetch Friends Count
  const realFriendsQuery = isMockMode() ? null : useQuery('FriendRequest', {
    where: {
      OR: [
        { fromUserId: queryUserId, status: 'accepted' },
        { toUserId: queryUserId, status: 'accepted' }
      ]
    }
  });
  const mockFriendsQuery = isMockMode() ? useMockQuery('FriendRequest', { relatedUserId: queryUserId }) : null;
  const { data: friendsData } = (isMockMode() ? mockFriendsQuery : realFriendsQuery)!;
  const friendCount = friendsData?.length || 0;

  // Fetch Conversations (for Message button logic)
  // We fetch conversations where the current user is a participant to check for existing chats
  const realConvQuery = isMockMode() ? null : useQuery('Conversation', { where: { participantIds: user?.id || '' } });
  const mockConvQuery = isMockMode() ? useMockQuery('Conversation', { where: { participantIds: user?.id || '' } }) : null;
  const { data: conversationsData } = (isMockMode() ? mockConvQuery : realConvQuery)!;
  const conversations = (conversationsData || []) as Conversation[];

  // Conversation Mutation
  const realConvMutation = isMockMode() ? null : useMutation('Conversation');
  const mockConvMutation = isMockMode() ? useMockMutation('Conversation') : null;
  const { create: createConversation, isPending: isCreatingConv } = (isMockMode() ? mockConvMutation : realConvMutation)!;

  // Sync fetched posts to local state
  useEffect(() => {
    if (fetchedPosts) {
      const mappedPosts = fetchedPosts.map((p: any) => ({
        ...p,
        isLiked: false, // Default for now
        isSaved: false,
      }));
      setLocalPosts(mappedPosts);
    }
  }, [fetchedPosts]);

  // 3. HARD GUARDS & DEFENSIVE RENDERING

  // Guard: Auth Loading
  if (isAuthPending) {
    return (
      <InstagramLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </InstagramLayout>
    );
  }

  // Guard A: No User ID resolved (Not logged in AND no param)
  if (!targetUserId) {
    return (
      <InstagramLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
          <h2 className="text-h2 font-semibold text-foreground mb-2">Invalid profile</h2>
          <p className="text-body text-tertiary-foreground mb-6">
            User ID is missing.
          </p>
          <Button onClick={() => navigate('/ladder')}>Go Home</Button>
        </div>
      </InstagramLayout>
    );
  }

  // Guard B: Loading State
  if (isLoadingProfile) {
    return (
      <InstagramLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </InstagramLayout>
    );
  }

  // Guard C: Profile Not Found (ID exists but no data)
  // We check if we have a DB profile OR if it's the current user (fallback to auth data)
  const hasProfileData = !!userProfile || (isOwnProfile && !!user);

  if (!hasProfileData) {
    return (
      <InstagramLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
          <h2 className="text-h2 font-semibold text-foreground mb-2">User not found</h2>
          <p className="text-body text-tertiary-foreground mb-6">
            The user you are looking for does not exist or may have been removed.
          </p>
          <Button onClick={() => navigate('/ladder')}>Go Home</Button>
        </div>
      </InstagramLayout>
    );
  }

  // Derived Data with Safe Access
  const username = userProfile?.username || (isOwnProfile ? user?.name : undefined) || 'User';
  const bio = userProfile?.bio || (isOwnProfile ? (user as any)?.bio : undefined) || '';
  const profilePictureUrl = userProfile?.profilePictureUrl || (isOwnProfile ? user?.profilePictureUrl : undefined) || getFallbackAvatar();
  const website = userProfile?.website || (isOwnProfile ? (user as any)?.website : undefined) || '';

  // Stats
  const stats = {
    posts: localPosts?.length || 0,
  };

  // Handlers
  const handleLike = (postId: string) => {
    setLocalPosts(currentPosts => {
      const post = currentPosts.find(p => p.id === postId);
      
      if (post && !post.isLiked && user) {
        createNotification({
          type: 'like',
          fromUserId: user.id,
          toUserId: post.authorId,
          postId: post.id,
          previewText: 'liked your post'
        });
      }

      return currentPosts.map(post =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      );
    });
  };
  const handleRepost = (postId: string) => {};
  const handleSave = (postId: string) => {};

  const handleMessageClick = async () => {
    if (!user || !targetUserId) return;

    // Check if a conversation already exists between these two users
    const existingConv = conversations.find(c => 
      c.participantIds.includes(user.id) && c.participantIds.includes(targetUserId)
    );

    if (existingConv) {
      // Found existing conversation, navigate to it
      navigate(`/messages/${existingConv.id}`);
    } else {
      // No conversation found, create a new one
      try {
        const newConv = await createConversation({
          participantIds: [user.id, targetUserId],
          lastMessage: '',
          lastMessageAt: new Date(),
          unreadCount: 0
        });
        navigate(`/messages/${newConv.id}`);
      } catch (error) {
        console.error('Failed to create conversation:', error);
        toast({
          title: 'Error',
          description: 'Could not start conversation. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <InstagramLayout>
      <div className="w-full max-w-4xl mx-auto pb-20 lg:pb-8">
        {/* Header (Mobile) */}
        <div className="flex items-center justify-between p-4 border-b border-border lg:hidden sticky top-0 bg-background z-10">
          <h1 className="text-h3 font-bold text-foreground">{username}</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/settings')}>
              <Settings className="w-6 h-6 text-foreground" />
            </button>
            <button>
              <Menu className="w-6 h-6 text-foreground" />
            </button>
          </div>
        </div>

        {/* Profile Header Section */}
        <div className="px-4 py-6 lg:py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
            
            {/* Avatar */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="w-24 h-24 md:w-36 md:h-36 aspect-square rounded-full bg-tertiary border-2 border-border overflow-hidden relative">
                <AvatarImage
                  key={profilePictureUrl}
                  src={profilePictureUrl}
                  alt={username}
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Info & Stats */}
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h2 className="text-xl font-semibold text-foreground">{username}</h2>
                
                {isOwnProfile ? (
                  <div className="flex gap-2">
                    <ProfileActionButton 
                      variant="secondary" 
                      className="h-8 px-4 text-sm font-medium bg-tertiary hover:bg-secondary text-foreground"
                      onClick={() => setIsEditProfileOpen(true)}
                    >
                      Edit Profile
                    </ProfileActionButton>
                    <ProfileActionButton 
                      variant="secondary" 
                      className="h-8 px-4 text-sm font-medium bg-tertiary hover:bg-secondary text-foreground"
                    >
                      Share Profile
                    </ProfileActionButton>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:flex" onClick={() => navigate('/settings')}>
                      <Settings className="w-5 h-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <FriendButton userId={targetUserId || ''} className="h-8" />
                    <Button 
                      variant="secondary" 
                      className="h-8 px-4"
                      onClick={handleMessageClick}
                      disabled={isCreatingConv}
                    >
                      {isCreatingConv ? 'Loading...' : 'Message'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-around md:justify-start md:gap-10 border-y border-border md:border-none py-3 md:py-0 mb-4">
                <div className="text-center md:text-left">
                  <span className="font-bold text-foreground block md:inline mr-1">{stats.posts}</span>
                  <span className="text-tertiary-foreground">posts</span>
                </div>
                <button 
                  onClick={() => isOwnProfile && navigate('/settings/friend-requests', { state: { activeTab: 'friends' } })}
                  disabled={!isOwnProfile}
                  className={`text-center md:text-left ${isOwnProfile ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                >
                  <span className="font-bold text-foreground block md:inline mr-1">{friendCount}</span>
                  <span className="text-tertiary-foreground">friends</span>
                </button>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                {userProfile?.username && <p className="font-semibold text-foreground">{userProfile.username}</p>}
                {bio && <p className="text-body-sm text-foreground whitespace-pre-wrap">{bio}</p>}
                {website && (
                  <a 
                    href={website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-body-sm text-primary font-medium hover:underline block mt-1"
                  >
                    {website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-border mt-4">
          <div className="flex justify-around">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 py-3 px-4 border-t-2 transition-colors ${
                activeTab === 'posts'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-tertiary-foreground hover:text-foreground'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Posts</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 py-3 px-4 border-t-2 transition-colors ${
                activeTab === 'saved'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-tertiary-foreground hover:text-foreground'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Saved</span>
            </button>
            <button
              onClick={() => setActiveTab('tagged')}
              className={`flex items-center gap-2 py-3 px-4 border-t-2 transition-colors ${
                activeTab === 'tagged'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-tertiary-foreground hover:text-foreground'
              }`}
            >
              <UserSquare2 className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Tagged</span>
            </button>
          </div>
        </div>

        {/* Grid Content */}
        <div className="grid grid-cols-3 gap-1">
          {localPosts && localPosts.length > 0 ? (
            localPosts.map((post: Post) => {
              const media = resolveMedia(post);
              return (
                <div 
                  key={post.id} 
                  className="aspect-square bg-tertiary cursor-pointer relative group overflow-hidden"
                  onClick={() => setSelectedPost(post)}
                >
                  {media?.type === 'video' ? (
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={media?.url}
                      alt={post.content}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                     <span className="font-bold">{post.likes}</span>
                     <span className="font-bold">{post.comments}</span>
                  </div>
                </div>
              );
            })
          ) : (
            /* Placeholder for empty state */
            <div className="col-span-3 py-12 text-center">
              <div className="w-16 h-16 border-2 border-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid3X3 className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-h3 font-bold text-foreground">No Posts Yet</h3>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <EditProfileModal 
          onClose={() => setIsEditProfileOpen(false)} 
          initialProfile={userProfile}
          onSave={() => setRefreshKey(prev => prev + 1)}
        />
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          allPosts={localPosts || []}
          onClose={() => setSelectedPost(null)}
          onLike={handleLike}
          onRepost={handleRepost}
          onSave={handleSave}
          showInsights={isOwnProfile}
        />
      )}
    </InstagramLayout>
  );
}
