import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { StoriesProvider, useStories } from '@/contexts/StoriesContext';
import { Toaster } from '@/components/ui/toaster';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LadderPage from './pages/LadderPage';
import JourneyPage from './pages/JourneyPage';
import ShotsPage from './pages/ShotsPage';
import UploadPage from './pages/UploadPage';
import StoryCreatePage from './pages/StoryCreatePage';
import MessagesPage from './pages/MessagesPage';
import MessageThreadPage from './pages/MessageThreadPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import EditProfilePage from './pages/EditProfilePage';
import AccountInsightsPage from './pages/AccountInsightsPage';
import ProfileMusicPage from './pages/ProfileMusicPage';
import HelpCenterPage from './pages/HelpCenterPage';
import PrivacySecurityPage from './pages/PrivacySecurityPage';
import FriendRequestsPage from './pages/FriendRequestsPage';
import SavedPostsPage from './pages/SavedPostsPage';
import ArchivedPostsPage from './pages/ArchivedPostsPage';
import SearchPage from './pages/SearchPage';
import HashtagPage from './pages/HashtagPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import GuidelinesPage from './pages/GuidelinesPage';
import LivePage from './pages/LivePage';
import LiveBroadcastPage from './pages/LiveBroadcastPage';
import LiveWatchPage from './pages/LiveWatchPage';
import LiveStreamScreen from './pages/LiveStreamScreen';
import { LiveProvider, useLive } from '@/contexts/LiveContext';
import { ShareProvider } from '@/contexts/ShareContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import LiveStreamBroadcaster from '@/components/live/LiveStreamBroadcaster';
import StoryViewer from '@/components/StoryViewer';
import GlobalShareModal from '@/components/GlobalShareModal';

// Add type definition for window.dismissSplashScreen
declare global {
  interface Window {
    dismissSplashScreen?: () => void;
  }
}

// Component to block rendering until auth is resolved
function AuthLoadingGate({ children }: { children: React.ReactNode }) {
  const { isPending } = useAuth();

  // While auth is pending, we render nothing (or a loader).
  // The native splash screen (in index.html) covers this state.
  if (isPending) {
    return null;
  }

  return <>{children}</>;
}

function AppInitializer() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { viewerState } = useStories();

  useEffect(() => {
    // Block global navigation logic if story modal is open
    if (viewerState.isOpen) return;

    // Only proceed when auth check is complete
    if (!isPending) {
      const isAuthRoute = location.pathname.startsWith('/auth/');
      const isRoot = location.pathname === '/';
      
      // Navigation logic based on auth status
      if (!user && !isAuthRoute) {
        navigate('/auth/login', { replace: true });
      } else if (user && (isAuthRoute || isRoot)) {
        navigate('/ladder', { replace: true });
      }
      
      // Dismiss splash screen once routing is determined
      const timer = setTimeout(() => {
        if (window.dismissSplashScreen) {
          window.dismissSplashScreen();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isPending, user, navigate, location.pathname, viewerState.isOpen]);

  return null;
}

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <StoriesProvider>
        <LiveProvider>
          <ShareProvider>
            <NotificationsProvider>
              <AuthLoadingGate>
              <AppInitializer />
              <Routes>
              <Route path="/" element={<Navigate to="/ladder" replace />} />
              <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/ladder" element={<LadderPage />} />
          <Route path="/journey" element={<JourneyPage />} />
          <Route path="/shots" element={<ShotsPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/stories/create" element={<StoryCreatePage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:conversationId" element={<MessageThreadPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          
          {/* Safe Profile Route */}
          <Route 
            path="/profile" 
            element={user ? <Navigate to={`/profile/${user.id}`} replace /> : <Navigate to="/auth/login" replace />} 
          />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/edit-profile" element={<EditProfilePage />} />
          <Route path="/settings/insights" element={<AccountInsightsPage />} />
          <Route path="/settings/music" element={<ProfileMusicPage />} />
          <Route path="/settings/help" element={<HelpCenterPage />} />
          <Route path="/settings/privacy-security" element={<PrivacySecurityPage />} />
          <Route path="/settings/friend-requests" element={<FriendRequestsPage />} />
          <Route path="/settings/saved-posts" element={<SavedPostsPage />} />
          <Route path="/settings/archived-posts" element={<ArchivedPostsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/hashtag/:tag" element={<HashtagPage />} />
          <Route path="/legal/terms" element={<TermsPage />} />
          <Route path="/legal/privacy" element={<PrivacyPage />} />
          <Route path="/legal/guidelines" element={<GuidelinesPage />} />
          
          {/* Explicit Live Stream Routes */}
          {/* CRITICAL: /live now points directly to the Stream Screen for stability testing */}
          <Route path="/live" element={<LiveStreamScreen />} />
          <Route path="/live/feed" element={<LivePage />} />
          <Route path="/live/broadcast" element={<LiveBroadcastPage />} />
              <Route path="/live/watch/:id" element={<LiveWatchPage />} />
              
              <Route path="*" element={<Navigate to="/ladder" replace />} />
              </Routes>
            </AuthLoadingGate>
            <Toaster />
            <StoryViewer />
            <GlobalShareModal />
            </NotificationsProvider>
          </ShareProvider>
        </LiveProvider>
      </StoriesProvider>
    </Router>
  );
}

export default App;
