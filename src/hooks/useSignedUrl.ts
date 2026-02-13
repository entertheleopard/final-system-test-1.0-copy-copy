import { useState, useEffect } from 'react';

/**
 * Hook to generate signed URLs for media assets.
 * Simulates Supabase storage signing in mock mode.
 */
export function useSignedUrl(url: string | undefined | null) {
  const [signedUrl, setSignedUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!url) {
      setSignedUrl(undefined);
      setIsLoading(false);
      return;
    }

    // If it's already a full URL (http/https/blob/data), use it directly
    // This covers external images (Unsplash) and local previews (blob:)
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
      setSignedUrl(url);
      setIsLoading(false);
      return;
    }

    // If it's a raw storage path, we would sign it here.
    // For now, we simulate the async nature of signing.
    let isMounted = true;
    setIsLoading(true);

    const signUrl = async () => {
      // Simulate network delay for signing
      // In a real app: const { data } = await supabase.storage.from('bucket').createSignedUrl(url, 3600);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (isMounted) {
        // In mock mode, we assume the path is usable or we would prepend a base URL
        // For this demo, we just pass it through after the delay
        setSignedUrl(url);
        setIsLoading(false);
      }
    };

    signUrl();

    return () => {
      isMounted = false;
    };
  }, [url]);

  return { signedUrl, isLoading };
}
