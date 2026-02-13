import { useParams, useNavigate } from 'react-router-dom';
import LiveStreamViewer from '@/components/live/LiveStreamViewer';
import LiveStreamBroadcaster from '@/components/live/LiveStreamBroadcaster';

export default function LiveStreamPage() {
  const { type, id } = useParams(); // type: 'watch' | 'broadcast'
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1);
  };

  if (type === 'broadcast') {
    return <LiveStreamBroadcaster onClose={handleClose} />;
  }

  if (type === 'watch') {
    return <LiveStreamViewer streamId={id || ''} onClose={handleClose} />;
  }

  return null;
}
