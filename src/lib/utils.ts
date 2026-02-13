import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getFallbackAvatar = () => {
  // Brand purple background with white user icon
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='100%25' height='100%25'%3E%3Crect width='24' height='24' fill='%239333ea'/%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E`;
};

export const getFallbackImage = () => {
  // Dark gray background with purple image icon
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239333ea' stroke-width='1' stroke-linecap='round' stroke-linejoin='round' style='background-color:%231a1a1a'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E`;
};

export const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = getFallbackAvatar();
  e.currentTarget.onerror = null;
};

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = getFallbackImage();
  e.currentTarget.onerror = null;
};

export function resolveMedia(post: any): { url: string; type: 'image' | 'video' } | null {
  if (!post) return null;

  // Check for video fields first
  if (post.videoUrl) return { url: post.videoUrl, type: 'video' };
  if (post.video) return { url: post.video, type: 'video' };
  
  // Check for image fields
  if (post.imageUrl) return { url: post.imageUrl, type: 'image' };
  if (post.image) return { url: post.image, type: 'image' };
  
  // Check for generic media field
  if (post.mediaUrl) return { url: post.mediaUrl, type: post.mediaType || 'image' };
  if (post.media) return { url: post.media, type: post.mediaType || 'image' };
  if (post.url) return { url: post.url, type: post.type || 'image' };

  // Check for assets array
  if (post.assets && Array.isArray(post.assets) && post.assets.length > 0) {
    const asset = post.assets[0];
    // Handle if asset is string or object
    if (typeof asset === 'string') {
      return { url: asset, type: 'image' };
    }
    return { 
      url: asset.url || asset.src || asset.uri, 
      type: asset.type || 'image' 
    };
  }

  return null;
}

export const MOCK_IMAGES: string[] = [];

export const getRandomMockImage = (index?: number) => {
  return "https://c.animaapp.com/mlkxz4s0AuRnuX/img/ai_5.png";
};
