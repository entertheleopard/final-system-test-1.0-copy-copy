import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import { ArrowLeft, Users, TrendingUp, Activity, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccountInsightsPage() {
  const navigate = useNavigate();

  // Mock aggregate data
  const stats = {
    accountsReached: '45.2K',
    accountsEngaged: '12.8K',
    totalFollowers: '1,234',
    contentInteractions: '5.6K',
  };

  return (
    <InstagramLayout>
      <div className="w-full max-w-2xl mx-auto py-4 px-4 sm:py-6 lg:py-8">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/settings')}
            className="text-foreground hover:text-tertiary-foreground transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-h1 font-bold text-foreground">Professional Dashboard</h1>
        </div>

        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-tertiary-foreground mb-2">
                <Users className="w-4 h-4" />
                <span className="text-caption font-medium">Accounts Reached</span>
              </div>
              <p className="text-h2 font-bold text-foreground">{stats.accountsReached}</p>
              <p className="text-caption text-success font-medium mt-1">+15.4% vs last 30 days</p>
            </div>
            <div className="bg-background border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-tertiary-foreground mb-2">
                <Activity className="w-4 h-4" />
                <span className="text-caption font-medium">Accounts Engaged</span>
              </div>
              <p className="text-h2 font-bold text-foreground">{stats.accountsEngaged}</p>
              <p className="text-caption text-success font-medium mt-1">+8.2% vs last 30 days</p>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-h3 font-semibold text-foreground">Overview</h3>
              <div className="flex items-center gap-2 text-body-sm text-tertiary-foreground bg-tertiary px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4" />
                <span>Last 30 Days</span>
              </div>
            </div>
            
            {/* Mock Bar Chart */}
            <div className="h-48 flex items-end justify-between gap-2">
              {[40, 65, 35, 80, 55, 90, 45, 70, 60, 75, 50, 85].map((height, i) => (
                <div key={i} className="w-full bg-primary/20 rounded-t-sm relative group">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm transition-all duration-500"
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-caption text-tertiary-foreground">
              <span>1 Nov</span>
              <span>15 Nov</span>
              <span>30 Nov</span>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-h3 font-semibold text-foreground mb-4">Tools</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-4 bg-background border border-border rounded-xl hover:bg-tertiary transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-body font-medium text-foreground">Ad Tools</p>
                    <p className="text-caption text-tertiary-foreground">Create and manage ads</p>
                  </div>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-background border border-border rounded-xl hover:bg-tertiary transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-body font-medium text-foreground">Branded Content</p>
                    <p className="text-caption text-tertiary-foreground">Manage partnerships</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </InstagramLayout>
  );
}
