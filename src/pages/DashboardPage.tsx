import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Compass, User, Upload, MessageSquare, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user, isPending } = useAuth();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const quickLinks = [
    { path: '/feed', icon: Compass, label: 'Explore Feed', color: 'text-primary' },
    { path: '/journey', icon: Compass, label: 'Your Journey', color: 'text-accent' },
    { path: user ? `/profile/${user.id}` : '/auth/login', icon: User, label: 'View Profile', color: 'text-info' },
    { path: '/upload', icon: Upload, label: 'Upload Art', color: 'text-success' },
    { path: '/comments', icon: MessageSquare, label: 'Comments', color: 'text-warning' },
    { path: '/live', icon: Radio, label: 'Live Streams', color: 'text-error' },
  ];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-8">
        <Card className="p-8 bg-tertiary border border-border shadow-md mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <CheckCircle2 className="w-12 h-12 text-success" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h2 className="text-h2 font-medium text-foreground mb-2">
                Welcome to your dashboard{user?.name ? `, ${user.name}` : ''}
              </h2>
              <p className="text-body text-tertiary-foreground">
                Your email has been verified and your account is now active. You can start using all features of the application.
              </p>
              {user?.email && (
                <p className="text-body-sm text-tertiary-foreground mt-2">
                  Logged in as: {user.email}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <section className="mb-8">
          <h3 className="text-h3 font-medium text-foreground mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="group"
                >
                  <Card className="p-6 bg-background border border-border shadow-md hover:shadow-lg transition-all duration-normal hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-tertiary flex items-center justify-center ${link.color} group-hover:scale-110 transition-transform duration-normal`}>
                        <Icon className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                      <span className="text-body font-medium text-foreground">
                        {link.label}
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Feature Highlights */}
        <section>
          <h3 className="text-h3 font-medium text-foreground mb-4">Platform Features</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 bg-background border border-border shadow-md hover:shadow-lg transition-all duration-normal hover:-translate-y-0.5">
              <img
                src="https://c.animaapp.com/mlkxz4s0AuRnuX/img/ai_4.png"
                alt="verification success accent"
                className="w-full h-48 object-cover rounded-md mb-4"
                loading="lazy"
              />
              <h3 className="text-h3 font-medium text-foreground mb-2">
                Verification Success
              </h3>
              <p className="text-body-sm text-tertiary-foreground">
                Your account verification was completed successfully.
              </p>
            </Card>
            
            <Card className="p-6 bg-background border border-border shadow-md hover:shadow-lg transition-all duration-normal hover:-translate-y-0.5">
              <img
                src="https://c.animaapp.com/mlkxz4s0AuRnuX/img/ai_5.png"
                alt="verification error accent"
                className="w-full h-48 object-cover rounded-md mb-4"
                loading="lazy"
              />
              <h3 className="text-h3 font-medium text-foreground mb-2">
                Error Handling
              </h3>
              <p className="text-body-sm text-tertiary-foreground">
                Our system handles errors gracefully to ensure smooth experience.
              </p>
            </Card>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
