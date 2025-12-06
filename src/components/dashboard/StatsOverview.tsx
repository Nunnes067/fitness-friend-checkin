import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, 
  Droplets, 
  TrendingUp,
  Zap,
  Award,
  Target
} from 'lucide-react';

interface StatsOverviewProps {
  streak?: number;
  calories?: number;
  calorieGoal?: number;
  water?: number;
  waterGoal?: number;
  workoutsThisWeek?: number;
  weeklyGoal?: number;
}

export function StatsOverview({
  streak = 12,
  calories = 1850,
  calorieGoal = 2500,
  water = 2.1,
  waterGoal = 3,
  workoutsThisWeek = 4,
  weeklyGoal = 5
}: StatsOverviewProps) {
  const stats = [
    {
      label: 'Streak',
      value: streak,
      unit: 'dias',
      icon: Flame,
      color: 'text-warning',
      bgColor: 'bg-warning/20',
      progress: Math.min((streak / 30) * 100, 100)
    },
    {
      label: 'Calorias',
      value: calories,
      unit: 'kcal',
      icon: Zap,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
      progress: (calories / calorieGoal) * 100
    },
    {
      label: 'Água',
      value: water.toFixed(1),
      unit: 'L',
      icon: Droplets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
      progress: (water / waterGoal) * 100
    },
    {
      label: 'Treinos',
      value: workoutsThisWeek,
      unit: `/${weeklyGoal}`,
      icon: Target,
      color: 'text-accent',
      bgColor: 'bg-accent/20',
      progress: (workoutsThisWeek / weeklyGoal) * 100
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 + index * 0.05 }}
        >
          <Card className="glass-card border-border/30 overflow-hidden">
            <CardContent className="p-4 relative">
              {/* Background Glow */}
              <div className={`absolute top-0 right-0 w-20 h-20 ${stat.bgColor} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-50`} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.unit}</span>
                </div>
                
                <Progress 
                  value={stat.progress} 
                  className="h-1.5"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
