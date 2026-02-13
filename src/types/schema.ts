export type UserProfile = {
  id: string;
  userId: string;
  username: string;
  bio: string;
  website: string;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserProfileDraft = {
  userId: string;
  username: string;
  bio: string;
  website: string;
  profilePictureUrl?: string;
};

export type Post = {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  likes: number;
  comments: number;
  reposts: number;
  saves: number;
  isArchived?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PostDraft = {
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  likes?: number;
  comments?: number;
  reposts?: number;
  saves?: number;
  isArchived?: boolean;
};

export type Notification = {
  id: string;
  type: 'like' | 'comment' | 'reply' | 'mention' | 'friend_request' | 'friend_accept';
  fromUserId: string;
  toUserId: string;
  postId?: string;
  commentId?: string;
  previewText?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type NotificationDraft = {
  type: 'like' | 'comment' | 'reply' | 'mention' | 'friend_request' | 'friend_accept';
  fromUserId: string;
  toUserId: string;
  postId?: string;
  commentId?: string;
  previewText?: string;
  read?: boolean;
};

export type Conversation = {
  id: string;
  participantIds: string[];
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number; // For the current user (simplified)
  createdAt: Date;
  updatedAt: Date;
};

export type ConversationDraft = {
  participantIds: string[];
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount?: number;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type?: 'text' | 'audio' | 'image' | 'video';
  mediaUrl?: string;
  duration?: number;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MessageDraft = {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type?: 'text' | 'audio' | 'image' | 'video';
  mediaUrl?: string;
  duration?: number;
  read?: boolean;
};
