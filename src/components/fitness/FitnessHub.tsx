import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkoutPlanner } from './WorkoutPlanner';
import { NutritionTracker } from './NutritionTracker';
import { BodyMeasurements } from './BodyMeasurements';
import { 
  Dumbbell, Apple, Ruler, Activity, Target, 
  Flame, Trophy, Play, Clock, ChevronRight,
  Zap, Droplets, TrendingUp
} from 'lucide-react';
import { getTodayNutrition, getTodayWaterIntake, getUserNutritionGoals, getUserBodyMeasurements, getUserFitnessLevel } from '@/lib/supabase/fitness';
import { useIsMobile } from '@/hooks/use-mobile';

interface FitnessHubProps {
  userId: string;
}

type TabType = 'home' | 'workouts' | 'nutrition' | 'measurements';

export function FitnessHub({ userId }: FitnessHubProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  
  const [stats, setStats] = useState({
    weeklyWorkouts: 4,
    weeklyGoal: 5,
    currentStreak: 12,
    totalCalories: 0,
    calorieGoal: 2500,
    proteinConsumed: 0,
    proteinGoal: 150,
    waterIntake: 0,
    waterGoal: 3,
    currentWeight: 0,
    bodyFat: 0,
    level: 1
  });

  useEffect(() => {
    loadFitnessData();
  }, []);

  const loadFitnessData = async () => {
    try {
      const [nutrition, water, goals, measurements, level] = await Promise.all([
        getTodayNutrition(),
        getTodayWaterIntake(),
        getUserNutritionGoals(),
        getUserBodyMeasurements(),
        getUserFitnessLevel()
      ]);

      const totalNutrition = nutrition.reduce((acc, entry) => ({
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein
      }), { calories: 0, protein: 0 });

      const latestMeasurement = measurements[0];

      setStats({
        weeklyWorkouts: 4,
        weeklyGoal: 5,
        currentStreak: 12,
        totalCalories: totalNutrition.calories,
        calorieGoal: goals.calories,
        proteinConsumed: totalNutrition.protein,
        proteinGoal: goals.protein,
        waterIntake: water / 1000,
        waterGoal: goals.water_ml / 1000,
        currentWeight: latestMeasurement?.weight || 0,
        bodyFat: latestMeasurement?.body_fat || 0,
        level: level.level
      });
    } catch (error) {
      console.error('Error loading fitness data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'home' as TabType, label: 'Início', icon: Activity },
    { id: 'workouts' as TabType, label: 'Treinos', icon: Dumbbell },
    { id: 'nutrition' as TabType, label: 'Nutrição', icon: Apple },
    { id: 'measurements' as TabType, label: 'Medidas', icon: Ruler },
  ];

  const upcomingWorkouts = [
    { day: 'Hoje', name: 'Push Day', type: 'Peito e Tríceps', duration: 60 },
    { day: 'Amanhã', name: 'Pull Day', type: 'Costas e Bíceps', duration: 55 },
    { day: 'Quinta', name: 'Leg Day', type: 'Pernas', duration: 70 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Dumbbell className="h-10 w-10 text-primary mx-auto" />
          </motion.div>
          <p className="text-muted-foreground mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Fitness Hub</h1>
          <p className="text-muted-foreground text-sm">Seu centro de treinos</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <Flame className="h-3.5 w-3.5 text-warning" />
            {stats.currentStreak} dias
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <Target className="h-3.5 w-3.5 text-primary" />
            Nv {stats.level}
          </Badge>
        </div>
      </div>

      {/* Desktop Tabs */}
      {!isMobile && (
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 gap-2 ${activeTab === tab.id ? 'shadow-[0_0_15px_hsl(var(--primary)/0.3)]' : ''}`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Today's Workout CTA */}
            <Card className="glass-card border-primary/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative p-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
                  <div className="relative">
                    <Badge className="mb-3 bg-primary/20 text-primary border-0">
                      <Zap className="h-3 w-3 mr-1" />
                      Treino de Hoje
                    </Badge>
                    <h3 className="text-xl font-bold mb-1">Push Day</h3>
                    <p className="text-muted-foreground text-sm mb-4">Peito, Ombros e Tríceps</p>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>60 min</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Flame className="h-4 w-4 text-warning" />
                        <span>450 kcal</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Target className="h-4 w-4 text-accent" />
                        <span>8 exercícios</span>
                      </div>
                    </div>
                    
                    <Button className="w-full h-12 text-lg gap-2 pulse-glow" onClick={() => setActiveTab('workouts')}>
                      <Play className="h-5 w-5" />
                      Iniciar Treino
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    <span className="text-xs text-muted-foreground">Semana</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.weeklyWorkouts}/{stats.weeklyGoal}</p>
                  <Progress value={(stats.weeklyWorkouts / stats.weeklyGoal) * 100} className="h-1.5 mt-2" />
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Flame className="h-5 w-5 text-warning" />
                    <span className="text-xs text-muted-foreground">Calorias</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalCalories}</p>
                  <Progress value={(stats.totalCalories / stats.calorieGoal) * 100} className="h-1.5 mt-2" />
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Água</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.waterIntake.toFixed(1)}L</p>
                  <Progress value={(stats.waterIntake / stats.waterGoal) * 100} className="h-1.5 mt-2" />
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    <span className="text-xs text-muted-foreground">Peso</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.currentWeight || '--'}<span className="text-sm font-normal">kg</span></p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.bodyFat}% gordura</p>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Workouts */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-primary" />
                    Próximos Treinos
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('workouts')}>
                    Ver todos <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {upcomingWorkouts.map((workout, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => setActiveTab('workouts')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Dumbbell className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{workout.name}</p>
                          <p className="text-xs text-muted-foreground">{workout.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{workout.day}</p>
                        <p className="text-xs text-muted-foreground">{workout.duration} min</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements Preview */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-warning" />
                  Conquistas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {[
                    { icon: '🏆', name: 'Primeira Semana', unlocked: true },
                    { icon: '🔥', name: '10 Dias Streak', unlocked: true },
                    { icon: '💪', name: '50 Treinos', unlocked: false },
                    { icon: '⭐', name: 'Meta Atingida', unlocked: false },
                  ].map((achievement, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 p-3 rounded-xl text-center min-w-[100px] ${
                        achievement.unlocked 
                          ? 'bg-warning/10 border border-warning/30' 
                          : 'bg-secondary/30 opacity-60'
                      }`}
                    >
                      <div className="text-2xl mb-1">{achievement.icon}</div>
                      <p className="text-xs font-medium truncate">{achievement.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'workouts' && (
          <motion.div
            key="workouts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <WorkoutPlanner userId={userId} />
          </motion.div>
        )}

        {activeTab === 'nutrition' && (
          <motion.div
            key="nutrition"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <NutritionTracker userId={userId} />
          </motion.div>
        )}

        {activeTab === 'measurements' && (
          <motion.div
            key="measurements"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <BodyMeasurements userId={userId} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50">
          <div className="flex items-center justify-around h-16 px-2 pb-safe">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center flex-1 h-full ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  whileTap={{ scale: 0.9 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="fitnessNavBg"
                      className="absolute inset-x-2 inset-y-1.5 bg-primary/10 rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <tab.icon className={`relative z-10 h-5 w-5 ${isActive ? 'drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]' : ''}`} />
                  <span className="relative z-10 text-[10px] mt-1 font-medium">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
