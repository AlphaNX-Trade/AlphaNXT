import { useLocation } from 'wouter';
import { TrendingUp, BarChart2, PieChart, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export function QuickActions() {
  const [, setLocation] = useLocation();

  const actions = [
    { icon: TrendingUp, label: 'Paper Trade', active: true, path: '/trade' },
    { icon: BarChart2, label: 'Markets', active: false, path: '/markets' },
    { icon: PieChart, label: 'Portfolio', active: false, path: '/portfolio' },
    { icon: BookOpen, label: 'Learn', active: false, path: '/learn' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs text-muted-foreground uppercase font-mono tracking-wider px-1">Quick Actions</h3>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => (
          <motion.button
            key={action.label}
            whileTap={{ scale: 0.97 }}
            onClick={() => setLocation(action.path)}
            className="flex flex-col items-center justify-center gap-2 py-3 bg-card border border-border rounded-xl transition-colors hover:bg-secondary/50"
            data-testid={`action-${action.label.toLowerCase().replace(' ', '-')}`}
          >
            <action.icon className={`w-5 h-5 ${action.active ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-[10px] font-medium text-foreground whitespace-nowrap">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
