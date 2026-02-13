import { Link, useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Lock,
  Heart,
  HelpCircle,
  FileText,
  Shield,
  Users,
  Music,
  ChevronRight,
  Moon,
  Sun,
  BarChart2,
  LogOut,
  Archive,
} from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login', { replace: true });
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', path: '/settings/edit-profile' },
        { icon: BarChart2, label: 'Insights', path: '/settings/insights' },
        { icon: Lock, label: 'Privacy and Security', path: '/settings/privacy-security' },
        { icon: Music, label: 'Profile Music', path: '/settings/music' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Users, label: 'Friend Requests', path: '/settings/friend-requests' },
        { icon: Heart, label: 'Saved Posts', path: '/settings/saved-posts' },
        { icon: Archive, label: 'Archived Posts', path: '/settings/archived-posts' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', path: '/settings/help' },
        { icon: FileText, label: 'Terms of Service', path: '/legal/terms' },
        { icon: Shield, label: 'Privacy Policy', path: '/legal/privacy' },
        { icon: FileText, label: 'Community Guidelines', path: '/legal/guidelines' },
      ],
    },
  ];

  return (
    <InstagramLayout>
      <div className="w-full max-w-2xl mx-auto py-4 px-4 sm:py-6 lg:py-8">
        <h1 className="text-h1 font-bold text-foreground mb-8">Settings</h1>

        <div className="space-y-8 pb-8">
          {/* Theme Toggle */}
          <div>
            <h2 className="text-body font-semibold text-tertiary-foreground mb-3 uppercase tracking-wide">
              Appearance
            </h2>
            <div className="bg-background border border-border rounded-lg">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-tertiary-foreground" strokeWidth={2} />
                  ) : (
                    <Sun className="w-5 h-5 text-tertiary-foreground" strokeWidth={2} />
                  )}
                  <div>
                    <span className="text-body text-foreground block">Theme</span>
                    <span className="text-body-sm text-tertiary-foreground">
                      {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'light'
                        ? 'bg-gradient-primary text-primary-foreground'
                        : 'bg-tertiary text-tertiary-foreground hover:bg-secondary'
                    }`}
                    aria-label="Light mode"
                  >
                    <Sun className="w-5 h-5" strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-gradient-primary text-primary-foreground'
                        : 'bg-tertiary text-tertiary-foreground hover:bg-secondary'
                    }`}
                    aria-label="Dark mode"
                  >
                    <Moon className="w-5 h-5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {settingsSections.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-body font-semibold text-tertiary-foreground mb-3 uppercase tracking-wide">
                {section.title}
              </h2>
              <div className="bg-background border border-border rounded-lg divide-y divide-border">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={itemIdx}
                      to={item.path}
                      className="flex items-center justify-between p-4 hover:bg-tertiary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-tertiary-foreground" strokeWidth={2} />
                        <span className="text-body text-foreground">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-tertiary-foreground" strokeWidth={2} />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Logout Button */}
          <div className="pt-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-4 text-error hover:bg-error/10 rounded-lg transition-colors font-semibold"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
            <p className="text-center text-caption text-tertiary-foreground mt-4">
              Invoque v1.0.0
            </p>
          </div>
        </div>
      </div>
    </InstagramLayout>
  );
}
