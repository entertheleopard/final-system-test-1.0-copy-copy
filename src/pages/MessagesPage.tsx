import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import { handleAvatarError } from '@/lib/utils';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '../../supabase';

// Define a local type for the conversation summary we'll display
type ConversationSummary = {
  id: string; // conversation_id
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
};

export default function MessagesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth
  const { user, isPending: isAuthPending } = useAuth();

  useEffect(() => {
    if (isAuthPending) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all messages where the current user is sender or receiver
        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!sender_id(username, avatar_url),
            receiver:profiles!receiver_id(username, avatar_url)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (msgError) throw msgError;

        if (!messages) {
          setConversations([]);
          return;
        }

        // Group by conversation_id to find the latest message for each chat
        const conversationMap = new Map<string, ConversationSummary>();

        for (const msg of messages) {
          // Use conversation_id if available, otherwise fallback to logic (though schema implies it exists)
          // If conversation_id is missing, we might need to generate a key based on participants
          const convId = msg.conversation_id;
          
          if (!convId) continue; // Skip if no conversation ID (shouldn't happen with proper schema)

          if (!conversationMap.has(convId)) {
            // Determine the "other" user
            const isSender = msg.sender_id === user.id;
            const otherId = isSender ? msg.receiver_id : msg.sender_id;
            
            // Get profile info from the joined data
            // Note: Supabase returns arrays or objects depending on relationship. 
            // Assuming single object for foreign key.
            const otherProfile = isSender ? msg.receiver : msg.sender;
            
            const otherName = otherProfile?.username || 'Unknown User';
            const otherAvatar = otherProfile?.avatar_url || '';

            conversationMap.set(convId, {
              id: convId,
              otherUserId: otherId,
              otherUserName: otherName,
              otherUserAvatar: otherAvatar,
              lastMessage: msg.content || (msg.media_url ? 'Sent an attachment' : ''),
              lastMessageAt: new Date(msg.created_at),
              unreadCount: 0, // TODO: Calculate real unread count if needed
            });
          }
        }

        setConversations(Array.from(conversationMap.values()));
      } catch (err: any) {
        console.error('Error fetching conversations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user, isAuthPending]);

  const filteredConversations = conversations.filter(conv =>
    conv.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}w`;
  };

  if (isAuthPending) {
    return (
      <InstagramLayout hideBottomNav>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </InstagramLayout>
    );
  }

  if (!user) return null;

  return (
    <InstagramLayout hideBottomNav>
      <div className="w-full max-w-2xl mx-auto h-[100dvh] flex flex-col bg-background">
        {/* Header */}
        <div className="relative flex items-center justify-center px-4 py-3 border-b border-border">
          <button 
            onClick={() => navigate(-1)}
            className="absolute left-4 text-foreground hover:text-tertiary-foreground transition-colors"
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
          </button>
          <h1 className="text-body font-bold text-foreground">Messages</h1>
        </div>

        {/* Search */}
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary-foreground" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-tertiary rounded-lg text-body-sm text-foreground placeholder:text-tertiary-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-tertiary-foreground" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-tertiary-foreground">
              <p>No messages yet.</p>
              <p className="text-sm mt-2">Start a conversation from a profile.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => navigate(`/messages/${conv.id}`)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-tertiary/30 active:bg-tertiary/50 transition-colors cursor-pointer"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={conv.otherUserAvatar || "https://c.animaapp.com/mlkxz4s0AuRnuX/img/ai_5.png"}
                    alt={conv.otherUserName}
                    className="w-14 h-14 rounded-full object-cover border border-border"
                    onError={handleAvatarError}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p className={`text-body-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>
                      {conv.otherUserName}
                    </p>
                    <span className="text-caption text-tertiary-foreground flex-shrink-0 ml-2">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className={`text-body-sm truncate max-w-[90%] ${conv.unreadCount > 0 ? 'font-semibold text-foreground' : 'text-tertiary-foreground'}`}>
                      {conv.lastMessage || 'Started a conversation'}
                    </p>
                  </div>
                </div>

                {/* Unread Badge */}
                {conv.unreadCount > 0 && (
                  <div className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </InstagramLayout>
  );
}
