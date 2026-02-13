import { useNavigate } from 'react-router-dom';
import LiveStreamBroadcaster from '@/components/live/LiveStreamBroadcaster';

export default function LiveBroadcastPage() {
  const navigate = useNavigate();
  
  // Simple, direct render of the broadcaster
  // onClose navigates back to the Live Lobby
  return (
    <LiveStreamBroadcaster onClose={() => navigate('/live')} />
  );
}
