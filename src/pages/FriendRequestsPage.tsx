import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import { handleAvatarError } from '@/lib/utils';
import { Search, UserPlus, UserCheck, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data types
type FriendRequest = {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatar: string;
  mutualFriends: number;
  timestamp: string;
};

export default function FriendRequestsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'requests' | 'friends'>(
    location.state?.activeTab || 'requests'
  );

  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<FriendRequest[]>([]);

  const handleAccept = (request: FriendRequest) => {
    setRequests(requests.filter(r => r.id !== request.id));
    setFriends([request, ...friends]);
    toast({
      title: 'Friend Request Accepted',
      description: `You are now friends with ${request.name}`,
    });
  };

  const handleDecline = (requestId: string) => {
    setRequests(requests.filter(r => r.id !== requestId));
    toast({
      title: 'Request Removed',
      description: 'Friend request declined',
    });
  };

  const handleRemoveFriend = (friendId: string) => {
    setFriends(friends.filter(f => f.id !== friendId));
    toast({
      title: 'Friend Removed',
      description: 'User removed from your friends list',
    });
  };

  // Filter based on search query
  const filteredRequests = requests.filter(req => 
    req.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <InstagramLayout>
      <div className="w-full max-w-2xl mx-auto py-4 px-4 sm:py-6 lg:py-8">
        {/* Header */}
        <h1 className="text-h1 font-bold text-foreground mb-6">Friends</h1>

        {/* Tabs */}
        <div className="flex border-b border-border mb-4">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 text-body-sm font-semibold transition-colors ${
              activeTab === 'requests'
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-tertiary-foreground hover:text-foreground'
            }`}
          >
            Requests {requests.length > 0 && <span className="ml-1 text-primary">({requests.length})</span>}
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 text-body-sm font-semibold transition-colors ${
              activeTab === 'friends'
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-tertiary-foreground hover:text-foreground'
            }`}
          >
            Your Friends
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary-foreground" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-tertiary rounded-lg text-body text-foreground placeholder:text-tertiary-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Content */}
        {activeTab === 'requests' ? (
          filteredRequests.length === 0 ? (
            <div className="bg-background border border-border rounded-lg p-12 text-center">
              <UserPlus className="w-16 h-16 mx-auto mb-4 text-tertiary-foreground" strokeWidth={1.5} />
              <h3 className="text-h3 font-semibold text-foreground mb-2">
                {searchQuery ? 'No results found' : 'No Friend Requests'}
              </h3>
              <p className="text-body text-tertiary-foreground">
                {searchQuery
                  ? 'Try searching for a different name'
                  : "You don't have any pending friend requests"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="bg-background border border-border rounded-lg p-4 flex items-center gap-4">
                  <button
                    onClick={() => navigate(`/profile/${request.userId}`)}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={request.avatar}
                      alt={request.name}
                      className="w-14 h-14 rounded-full object-cover"
                      onError={handleAvatarError}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => navigate(`/profile/${request.userId}`)}
                      className="text-body font-semibold text-foreground truncate hover:text-tertiary-foreground transition-colors text-left w-full"
                    >
                      {request.name}
                    </button>
                    <p className="text-caption text-tertiary-foreground">
                      @{request.username} • {request.mutualFriends} mutual friends
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(request)}
                      className="px-4 py-1.5 bg-gradient-primary text-primary-foreground rounded-lg text-body-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleDecline(request.id)}
                      className="px-4 py-1.5 bg-tertiary text-foreground rounded-lg text-body-sm font-medium hover:bg-secondary transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          filteredFriends.length === 0 ? (
            <div className="bg-background border border-border rounded-lg p-12 text-center">
              <UserCheck className="w-16 h-16 mx-auto mb-4 text-tertiary-foreground" strokeWidth={1.5} />
              <h3 className="text-h3 font-semibold text-foreground mb-2">
                {searchQuery ? 'No results found' : 'No Friends Yet'}
              </h3>
              <p className="text-body text-tertiary-foreground">
                {searchQuery
                  ? 'Try searching for a different name'
                  : 'Start connecting with other creators'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFriends.map((friend) => (
                <div key={friend.id} className="bg-background border border-border rounded-lg p-4 flex items-center gap-4">
                  <button
                    onClick={() => navigate(`/profile/${friend.userId}`)}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-14 h-14 rounded-full object-cover"
                      onError={handleAvatarError}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => navigate(`/profile/${friend.userId}`)}
                      className="text-body font-semibold text-foreground truncate hover:text-tertiary-foreground transition-colors text-left w-full"
                    >
                      {friend.name}
                    </button>
                    <p className="text-caption text-tertiary-foreground">
                      @{friend.username}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="p-2 text-tertiary-foreground hover:text-error transition-colors"
                    title="Remove Friend"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </InstagramLayout>
  );
}
