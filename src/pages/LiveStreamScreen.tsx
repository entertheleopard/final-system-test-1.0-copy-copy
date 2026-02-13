import { useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import LiveStreamBroadcaster from '@/components/live/LiveStreamBroadcaster';

/**
 * LiveStreamScreen
 * 
 * Handles the routing and safety for the Live Stream feature.
 * Enforces the rule: "If ANY interruption occurs... Immediately exit Live mode... Redirect to Create Post"
 */
export default function LiveStreamScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  // STRICT SAFETY CHECK:
  // If we didn't come from Create Post (e.g. refresh, direct URL entry),
  // immediately redirect back to the Create Post flow.
  // This satisfies: "Live state must NEVER persist across reloads or resets."
  const isValidEntry = location.state?.fromCreatePost === true;

  if (!isValidEntry) {
    return <Navigate to="/upload" replace />;
  }

  const handleClose = () => {
    // Always return to Create Post flow on exit
    navigate('/upload', { replace: true });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white">
      <LiveStreamBroadcaster onClose={handleClose} />
    </div>
  );
}
