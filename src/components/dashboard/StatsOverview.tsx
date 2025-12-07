import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, 
  Droplets, 
  Zap,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StatsOverviewProps {
  userId?: string;
}

export function StatsOverview({ userId }: StatsOverviewProps) {
  const [streak, setStreak] = useState(0);
  const [calories, setCalories] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(2500);
  const [water, setWater] = useState(0);
  const [waterGoal, setWaterGoal] = useState(3000);
  const [workoutsThisWeek, setWorkoutsThisWeek] = useState(0);
  const [weeklyGoal] = useState(5);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      try {
        // Fetch user streak
        const { data: userData } = await supabase
          .from('app_users')
          .select('streak')
          .eq('id', userId)
          .single();

        if (userData) {
          setStreak(userData.streak || 0);
        }

        // Fetch today's nutrition
        const today = new Date().toISOString().split('T')[0];
        const { data: nutritionData } = await supabase
          .from('nutrition_entries')
          .select('calories')
          .eq('user_id', userId)
          .eq('entry_date', today);

        if (nutritionData) {
          const totalCalories = nutritionData.reduce((sum, entry) => sum + Number(entry.calories), 0);
          setCalories(totalCalories);
        }

        // Fetch nutrition goals
        const { data: goalsData } = await supabase
          .from('nutrition_goals')
          .select('calories, water_ml')
          .eq('user_id', userId)
          .single();

        if (goalsData) {
          setCalorieGoal(goalsData.calories || 2500);
          setWaterGoal(goalsData.water_ml || 3000);
        }

        // Fetch today's water intake
        const { data: waterData } = await supabase
          .from('water_intake')
          .select('amount_ml')
          .eq('user_id', userId)
          .eq('entry_date', today);

        if (waterData) {
          const totalWater = waterData.reduce((sum, entry) => sum + entry.amount_ml, 0);
          setWater(totalWater);
        }

        // Fetch this week's check-ins
        const now = new Date();
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);

        const { data: checkinsData, count } = await supabase
          .from('check_ins')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
          .gte('check_in_date', startOfWeek.toISOString().split('T')[0]);

        if (count !== null) {
          setWorkoutsThisWeek(count);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
  }, [userId]);

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
      progress: Math.min((calories / calorieGoal) * 100, 100)
    },
    {
      label: 'Água',
      value: (water / 1000).toFixed(1),
      unit: 'L',
      icon: Droplets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
      progress: Math.min((water / waterGoal) * 100, 100)
    },
    {
      label: 'Treinos',
      value: workoutsThisWeek,
      unit: `/${weeklyGoal}`,
      icon: Target,
      color: 'text-accent',
      bgColor: 'bg-accent/20',
      progress: Math.min((workoutsThisWeek / weeklyGoal) * 100, 100)
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