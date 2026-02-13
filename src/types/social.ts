export type Post = {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: number;
  comments: number;
  reposts: number;
  saves: number;
  isLiked: boolean;
  isSaved: boolean;
  isArchived?: boolean;
  createdAt: Date;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: Date;
};

export type Friend = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: 'pending' | 'accepted' | 'none';
  mutualFriends: number;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
};

export type Conversation = {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
};

export type Story = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: Date;
  expiresAt: Date;
  isViewed: boolean;
};

export type ProfileMusic = {
  id: string;
  userId: string;
  title: string;
  artist: string;
  fileUrl?: string;
  externalService?: 'spotify' | 'apple' | 'soundcloud';
  externalUrl?: string;
  autoplay: boolean;
};
