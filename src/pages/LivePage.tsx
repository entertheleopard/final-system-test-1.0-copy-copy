import { useNavigate } from 'react-router-dom';
import { useLive } from '@/contexts/LiveContext';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { handleAvatarError, handleImageError } from '@/lib/utils';
import { Radio, Users, Eye, Clock, Play } from 'lucide-react';

export default function LivePage() {
  const navigate = useNavigate();
  const { startLive } = useLive();
  const liveStreams: any[] = [];
  const upcomingStreams: any[] = [];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-8">
        <header className="mb-8">
          <h1 className="text-h1 font-medium text-foreground mb-2">Live Streams</h1>
          <p className="text-body text-tertiary-foreground">
            Watch and learn from creators in real-time
          </p>
        </header>

        {/* Live Now */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Radio className="w-6 h-6 text-error animate-pulse" strokeWidth={1.5} />
            <h2 className="text-h2 font-medium text-foreground">Live Now</h2>
          </div>

          {liveStreams.length === 0 ? (
            <div className="text-center py-12 bg-tertiary/30 rounded-lg border border-border">
              <p className="text-body text-tertiary-foreground">No live streams at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveStreams.map((stream) => (
                <Card 
                  key={stream.id} 
                  onClick={() => navigate(`/live/watch/${stream.id}`)}
                  className="border border-border shadow-md hover:shadow-lg transition-all duration-normal overflow-hidden group cursor-pointer"
                >
                  {/* ... existing card content ... */}
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming */}
        <section>
          <h2 className="text-h2 font-medium text-foreground mb-6">Upcoming Streams</h2>

          {upcomingStreams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-body text-tertiary-foreground">No upcoming streams scheduled.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingStreams.map((stream) => (
                <Card key={stream.id} className="border border-border shadow-md hover:shadow-lg transition-all duration-normal">
                  {/* ... existing card content ... */}
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Start Your Own Stream */}
        <Card className="border border-border shadow-md mt-12 bg-gradient-secondary">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-h3 font-medium text-foreground mb-2">
                  Ready to go live?
                </h3>
                <p className="text-body text-tertiary-foreground">
                  Share your creative process with the community and connect with fellow artists in real-time.
                </p>
              </div>
              <Button 
                onClick={startLive}
                className="h-12 px-8 bg-gradient-primary text-primary-foreground shadow-button-primary hover:bg-primary-hover whitespace-nowrap"
              >
                <Radio className="w-5 h-5 mr-2" strokeWidth={1.5} />
                Start Streaming
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
