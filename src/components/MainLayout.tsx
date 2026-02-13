import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLive } from '@/contexts/LiveContext';
import { Home, Compass, User, Upload, MessageSquare, Radio, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { startLive } = useLive();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/feed', icon: Compass, label: 'Feed' },
    { path: '/journey', icon: Compass, label: 'Journey' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/upload', icon: Upload, label: 'Upload' },
    { path: '/comments', icon: MessageSquare, label: 'Comments' },
    { path: '/live', icon: Radio, label: 'Live' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-tertiary border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-h3 font-medium text-foreground">Invoque.art</h1>
          {user?.email && (
            <p className="text-caption text-tertiary-foreground mt-1 truncate">
              {user.email}
            </p>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            // Redirect "Live" sidebar item to the Live Feed (Watch mode)
            // Broadcasting is only allowed from the Upload flow
            let targetPath = item.path === '/live' ? '/live/feed' : item.path;

            // Fix Profile Navigation
            if (item.path === '/profile' && user) {
              targetPath = `/profile/${user.id}`;
            }

            return (
              <Link
                key={item.path}
                to={targetPath}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-normal ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-tertiary-foreground hover:bg-secondary hover:text-secondary-foreground'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-body-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 text-tertiary-foreground hover:text-foreground hover:bg-secondary"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-body-sm font-medium">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
