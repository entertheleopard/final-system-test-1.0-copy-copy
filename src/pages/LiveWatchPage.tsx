import { useNavigate, useParams } from 'react-router-dom';
import LiveStreamViewer from '@/components/live/LiveStreamViewer';

export default function LiveWatchPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Simple, direct render of the viewer
  // onClose navigates back to the Live Lobby
  return (
    <LiveStreamViewer 
      streamId={id || ''} 
      onClose={() => navigate('/live')} 
    />
  );
}
