import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import PostDetailModal from '@/components/PostDetailModal';
import { Search, X, User, Hash, TrendingUp } from 'lucide-react';
import { handleAvatarError, handleImageError, getRandomMockImage } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Post } from '@/types/social';

export default function SearchPage() {
  const navigate = useNavigate();
  const { createNotification } = useNotifications();
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'top' | 'accounts' | 'tags'>('top');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Auto-switch to tags tab if query starts with #
  useEffect(() => {
    if (query.startsWith('#')) {
      setActiveTab('tags');
    } else if (query.length > 0 && activeTab === 'tags' && !query.startsWith('#')) {
      setActiveTab('accounts');
    }
  }, [query]);

  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  // Fetch profiles for search
  useEffect(() => {
    // In a real app, we would fetch based on query
    // For now, just empty or fetch some if query exists
  }, [query]);

  const handleLike = (postId: string) => {
    setTrendingPosts(currentPosts => currentPosts.map(post => {
      if (post.id === postId) {
        const isLiking = !post.isLiked;
        if (isLiking && user) {
          createNotification({
            type: 'like',
            fromUserId: user.id,
            toUserId: post.authorId,
            postId: post.id,
            previewText: 'liked your post'
          });
        }
        return { ...post, isLiked: isLiking, likes: isLiking ? post.likes + 1 : post.likes - 1 };
      }
      return post;
    }));
  };

  const filteredAccounts = accounts;
  const filteredTags: any[] = [];

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleHashtagClick = (tagName: string) => {
    navigate(`/hashtag/${tagName}`);
  };

  return (
    <InstagramLayout>
      <div className="w-full max-w-2xl mx-auto h-screen flex flex-col bg-background">
        {/* Search Header */}
        <div className="p-4 border-b border-border">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-5 h-5 text-tertiary-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-10 pr-10 py-2 bg-tertiary rounded-lg text-body text-foreground placeholder:text-tertiary-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-3 text-tertiary-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('top')}
            className={`flex-1 py-3 text-body-sm font-semibold transition-colors ${
              activeTab === 'top' ? 'text-foreground border-b-2 border-foreground' : 'text-tertiary-foreground'
            }`}
          >
            Top
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex-1 py-3 text-body-sm font-semibold transition-colors ${
              activeTab === 'accounts' ? 'text-foreground border-b-2 border-foreground' : 'text-tertiary-foreground'
            }`}
          >
            People
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex-1 py-3 text-body-sm font-semibold transition-colors ${
              activeTab === 'tags' ? 'text-foreground border-b-2 border-foreground' : 'text-tertiary-foreground'
            }`}
          >
            Hashtags
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'accounts' && (
            <div className="divide-y divide-border">
              {filteredAccounts.map(account => (
                <div 
                  key={account.id}
                  onClick={() => navigate(`/profile/${account.id}`)}
                  className="flex items-center gap-3 p-4 hover:bg-tertiary transition-colors cursor-pointer"
                >
                  <img 
                    src={account.avatar} 
                    alt={account.username} 
                    className="w-12 h-12 rounded-full object-cover border border-border"
                    onError={handleAvatarError}
                  />
                  <div className="flex-1">
                    <p className="text-body font-semibold text-foreground">{account.username}</p>
                    <p className="text-caption text-tertiary-foreground">{account.name} • {account.followers} followers</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="divide-y divide-border">
              {filteredTags.map(tag => (
                <div 
                  key={tag.id}
                  onClick={() => handleHashtagClick(tag.name)}
                  className="flex items-center gap-4 p-4 hover:bg-tertiary transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-tertiary border border-border flex items-center justify-center">
                    <Hash className="w-6 h-6 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-body font-semibold text-foreground">#{tag.name}</p>
                    <p className="text-caption text-tertiary-foreground">{tag.posts} posts</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'top' && (
            <div className="p-1">
              {/* Trending Section */}
              {!query && (
                <div className="mb-4 px-3 pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="text-body font-semibold text-foreground">Trending Now</h3>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-1">
                {trendingPosts.map(post => (
                  <div 
                    key={post.id} 
                    onClick={() => handlePostClick(post)}
                    className="aspect-square relative group cursor-pointer bg-tertiary overflow-hidden"
                  >
                    <AvatarImage 
                      src={post.mediaUrl} 
                      alt="Trending" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          allPosts={trendingPosts}
          onClose={() => setSelectedPost(null)}
          onLike={handleLike}
          onRepost={() => {}}
          onSave={() => {}}
        />
      )}
    </InstagramLayout>
  );
}
