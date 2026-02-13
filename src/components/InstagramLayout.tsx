import { ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStories } from '@/contexts/StoriesContext';
import { Layers, Compass, Zap, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstagramLayoutProps {
  children: ReactNode;
  hideBottomNav?: boolean;
}

export default function InstagramLayout({ children, hideBottomNav = false }: InstagramLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { viewerState } = useStories();
  const { user } = useAuth();

  const navItems = [
    { path: '/ladder', icon: Layers, label: 'Ladder' },
    { path: '/journey', icon: Compass, label: 'Journey' },
    { path: '/upload', icon: 'create', label: 'Create' },
    { path: '/shots', icon: Zap, label: 'Shots' },
    { path: '/notifications', icon: Bell, label: 'Activity' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main App Content - Disabled when Story is Active */}
      <div 
        className={`contents ${viewerState.isOpen ? 'pointer-events-none' : ''}`}
        aria-hidden={viewerState.isOpen}
      >
        {/* Desktop Sidebar - Hidden on Mobile */}
        <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-border flex-col z-40">
          <div className="p-6">
            <h1 className="font-brand text-3xl text-primary">Invoque</h1>
          </div>
          
          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => {
              if (item.icon === 'create') {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-4 p-3 rounded-lg transition-colors text-foreground hover:bg-tertiary"
                  >
                    <div className="w-6 h-6 border-2 border-foreground rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold leading-none mb-0.5">+</span>
                    </div>
                    <span className="text-body">{item.label}</span>
                  </Link>
                );
              }
              
              const Icon = item.icon as React.ElementType;
              
              let isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

              // Special handling for Profile tab active state
              if (item.path === '/profile') {
                if (location.pathname === '/profile') {
                  isActive = true;
                } else if (location.pathname.startsWith('/profile/')) {
                  // Only active if it's the current user's profile
                  // We check params.userId (from route) or parse pathname as fallback
                  const pathUserId = params.userId || location.pathname.split('/')[2];
                  isActive = pathUserId === user?.id;
                } else {
                  isActive = false;
                }
              }

              const targetPath = item.path === '/profile' && user 
                ? `/profile/${user.id}` 
                : item.path;

              return (
                <Link
                  key={item.path}
                  to={targetPath}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-tertiary'
                  }`}
                >
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-body">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content - Always has bottom padding for nav on mobile, left margin on desktop */}
        <main 
          className={cn(
            "flex-1 w-full lg:pb-0 lg:pl-64",
            // Mobile padding: 4rem (16) + safe area
            !hideBottomNav && "pb-[calc(4rem+env(safe-area-inset-bottom))]"
          )}
        >
          {children}
        </main>

        {/* Mobile Bottom Navigation - ALWAYS VISIBLE on Mobile */}
        {!hideBottomNav && (
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-safe-bottom">
            <div className="h-16 flex items-center justify-around px-2">
              {navItems.map((item) => {
                if (item.icon === 'create') {
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors active:scale-95"
                      aria-label={item.label}
                    >
                      <div className="w-6 h-6 border-2 border-foreground rounded-lg flex items-center justify-center">
                        <span className="text-xl font-bold leading-none mb-0.5 text-foreground">+</span>
                      </div>
                    </Link>
                  );
                }

                const Icon = item.icon as React.ElementType;
                
                let isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                // Special handling for Profile tab active state
                if (item.path === '/profile') {
                  if (location.pathname === '/profile') {
                    isActive = true;
                  } else if (location.pathname.startsWith('/profile/')) {
                    // Only active if it's the current user's profile
                    const pathUserId = params.userId || location.pathname.split('/')[2];
                    isActive = pathUserId === user?.id;
                  } else {
                    isActive = false;
                  }
                }

                const targetPath = item.path === '/profile' && user 
                  ? `/profile/${user.id}` 
                  : item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={targetPath}
                    className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors active:scale-95"
                    aria-label={item.label}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        isActive ? 'text-primary' : 'text-foreground'
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {/* Hide labels on mobile for cleaner look with 6 items, or keep if space permits. 
                        Instagram hides labels. Let's hide labels for a cleaner look. */}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
