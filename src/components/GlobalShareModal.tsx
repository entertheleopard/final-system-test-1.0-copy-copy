import { useShareState, useShareActions } from '@/contexts/ShareContext';
import ShareModal from './ShareModal';

export default function GlobalShareModal() {
  const shareState = useShareState();
  const { closeShare } = useShareActions();

  if (!shareState.isOpen || !shareState.post) return null;

  return <ShareModal post={shareState.post} onClose={closeShare} />;
}
