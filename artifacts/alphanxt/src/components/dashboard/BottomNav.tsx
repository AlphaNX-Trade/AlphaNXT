import { Home, BarChart2, TrendingUp, PieChart, BookOpen, User } from 'lucide-react';
import { useLocation } from 'wouter';

const tabs = [
  { id: 'home',      icon: Home,      label: 'Home',      path: '/dashboard' },
  { id: 'markets',   icon: BarChart2,  label: 'Markets',   path: '/markets'   },
  { id: 'trade',     icon: TrendingUp, label: 'Trade',     path: '/trade',    isAction: true },
  { id: 'portfolio', icon: PieChart,   label: 'Portfolio', path: '/portfolio' },
  { id: 'learn',     icon: BookOpen,   label: 'Learn',     path: '/learn'     },
  { id: 'profile',   icon: User,       label: 'Profile',   path: '/profile'   },
];

function getActiveTab(location: string): string {
  if (location.startsWith('/markets')) return 'markets';
  if (location.startsWith('/portfolio')) return 'portfolio';
  if (location.startsWith('/learn')) return 'learn';
  if (location.startsWith('/profile')) return 'profile';
  if (location.startsWith('/trade')) return 'trade';
  return 'home';
}

export function BottomNav() {
  const [location, setLocation] = useLocation();
  const activeTab = getActiveTab(location);

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-card/95 backdrop-blur border-t border-border h-16 flex items-center justify-between px-3 z-50">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (tab.isAction) {
          return (
            <button
              key={tab.id}
              onClick={() => setLocation(tab.path)}
              className="flex items-center justify-center -mt-5"
              data-testid={`tab-${tab.id}`}
            >
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(0,210,210,0.3)] border-4 border-background hover:scale-105 transition-transform">
                <tab.icon className="w-5 h-5 text-background" />
              </div>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => setLocation(tab.path)}
            className="flex flex-col items-center justify-center w-12 gap-1.5"
            data-testid={`tab-${tab.id}`}
          >
            <tab.icon
              className={`w-[22px] h-[22px] ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
            />
            <div
              className={`w-1 h-1 rounded-full ${isActive ? 'bg-primary' : 'bg-transparent'}`}
            />
          </button>
        );
      })}
    </div>
  );
}
