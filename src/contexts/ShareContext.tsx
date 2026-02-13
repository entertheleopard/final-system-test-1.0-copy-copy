import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useRef } from 'react';
import type { Post } from '@/types/social';

type ShareState = {
  isOpen: boolean;
  post: Post | null;
};

type ShareActions = {
  openShare: (post: Post) => void;
  closeShare: () => void;
};

const ShareStateContext = createContext<ShareState | undefined>(undefined);
const ShareActionsContext = createContext<ShareActions | undefined>(undefined);

export function ShareProvider({ children }: { children: ReactNode }) {
  const [shareState, setShareState] = useState<ShareState>({
    isOpen: false,
    post: null,
  });

  // Refs to store original styles and scroll position
  const scrollPosRef = useRef(0);
  const originalStylesRef = useRef<{
    bodyPosition: string;
    bodyTop: string;
    bodyWidth: string;
    bodyHeight: string;
    bodyOverflow: string;
    bodyOverscroll: string;
    bodyTouchAction: string;
    htmlOverflow: string;
    htmlHeight: string;
    htmlScrollBehavior: string;
    htmlTouchAction: string;
  } | null>(null);

  const lockScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const bodyStyle = document.body.style;
    const htmlStyle = document.documentElement.style;

    // Prevent double locking
    if (bodyStyle.position === 'fixed') return;

    scrollPosRef.current = scrollY;
    originalStylesRef.current = {
      bodyPosition: bodyStyle.position,
      bodyTop: bodyStyle.top,
      bodyWidth: bodyStyle.width,
      bodyHeight: bodyStyle.height,
      bodyOverflow: bodyStyle.overflow,
      bodyOverscroll: bodyStyle.overscrollBehavior,
      bodyTouchAction: bodyStyle.touchAction,
      htmlOverflow: htmlStyle.overflow,
      htmlHeight: htmlStyle.height,
      htmlScrollBehavior: htmlStyle.scrollBehavior,
      htmlTouchAction: htmlStyle.touchAction,
    };

    // Apply Hard Lock immediately
    htmlStyle.scrollBehavior = 'auto';
    htmlStyle.overflow = 'hidden';
    htmlStyle.height = '100%';
    htmlStyle.touchAction = 'none';

    bodyStyle.position = 'fixed';
    bodyStyle.top = `-${scrollY}px`;
    bodyStyle.width = '100%';
    bodyStyle.height = '100%';
    bodyStyle.overflow = 'hidden';
    bodyStyle.overscrollBehavior = 'none';
    bodyStyle.touchAction = 'none';
  }, []);

  const unlockScroll = useCallback(() => {
    if (!originalStylesRef.current) return;

    const bodyStyle = document.body.style;
    const htmlStyle = document.documentElement.style;
    const originalStyles = originalStylesRef.current;
    const scrollY = scrollPosRef.current;

    // Restore styles
    bodyStyle.position = originalStyles.bodyPosition;
    bodyStyle.top = originalStyles.bodyTop;
    bodyStyle.width = originalStyles.bodyWidth;
    bodyStyle.height = originalStyles.bodyHeight;
    bodyStyle.overflow = originalStyles.bodyOverflow;
    bodyStyle.overscrollBehavior = originalStyles.bodyOverscroll;
    bodyStyle.touchAction = originalStyles.bodyTouchAction;

    htmlStyle.overflow = originalStyles.htmlOverflow;
    htmlStyle.height = originalStyles.htmlHeight;
    htmlStyle.touchAction = originalStyles.htmlTouchAction;

    // Restore scroll position immediately without animation
    window.scrollTo(0, scrollY);

    // Restore smooth scrolling on the next frame
    requestAnimationFrame(() => {
      htmlStyle.scrollBehavior = originalStyles.htmlScrollBehavior;
    });

    originalStylesRef.current = null;
  }, []);

  const openShare = useCallback((post: Post) => {
    lockScroll();
    setShareState({ isOpen: true, post });
  }, [lockScroll]);

  const closeShare = useCallback(() => {
    setShareState({ isOpen: false, post: null });
    unlockScroll();
  }, [unlockScroll]);

  const actions = useMemo(() => ({ openShare, closeShare }), [openShare, closeShare]);

  return (
    <ShareActionsContext.Provider value={actions}>
      <ShareStateContext.Provider value={shareState}>
        {children}
      </ShareStateContext.Provider>
    </ShareActionsContext.Provider>
  );
}

export function useShare() {
  const state = useContext(ShareStateContext);
  const actions = useContext(ShareActionsContext);
  
  if (state === undefined || actions === undefined) {
    throw new Error('useShare must be used within a ShareProvider');
  }
  
  return { ...actions, shareState: state };
}

export function useShareActions() {
  const context = useContext(ShareActionsContext);
  if (context === undefined) {
    throw new Error('useShareActions must be used within a ShareProvider');
  }
  return context;
}

export function useShareState() {
  const context = useContext(ShareStateContext);
  if (context === undefined) {
    throw new Error('useShareState must be used within a ShareProvider');
  }
  return context;
}
