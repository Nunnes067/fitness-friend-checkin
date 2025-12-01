
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WorkoutPlanner } from './WorkoutPlanner';
import { NutritionTracker } from './NutritionTracker';
import { BodyMeasurements } from './BodyMeasurements';
import { Dumbbell, Apple, Ruler, TrendingUp, Target, Users, Activity, Award, Calendar } from 'lucide-react';
import { getTodayNutrition, getTodayWaterIntake, getUserNutritionGoals, getUserBodyMeasurements, getUserFitnessLevel } from '@/lib/supabase/fitness';
import { useIsMobile } from '@/hooks/use-mobile';

interface FitnessHubProps {
  userId: string;
}

export function FitnessHub({ userId }: FitnessHubProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const [fitnessStats, setFitnessStats] = useState({
    weeklyWorkouts: 0,
    weeklyGoal: 5,
    totalWorkouts: 0,
    currentStreak: 0,
    totalCalories: 0,
    calorieGoal: 2500,
    caloriesBurned: 0,
    proteinConsumed: 0,
    proteinGoal: 150,
    waterIntake: 0,
    waterGoal: 3000,
    currentWeight: 0,
    targetWeight: 0,
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

      setFitnessStats({
        weeklyWorkouts: 4,
        weeklyGoal: 5,
        totalWorkouts: 127,
        currentStreak: 12,
        totalCalories: totalNutrition.calories,
        calorieGoal: goals.calories,
        caloriesBurned: 2840,
        proteinConsumed: totalNutrition.protein,
        proteinGoal: goals.protein,
        waterIntake: water / 1000,
        waterGoal: goals.water_ml / 1000,
        currentWeight: latestMeasurement?.weight || 0,
        targetWeight: 70,
        bodyFat: latestMeasurement?.body_fat || 0,
        level: level.level
      });
    } catch (error) {
      console.error('Error loading fitness data:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const quickActions = [
    {
      title: 'Iniciar Treino',
      description: 'Comece uma sessão de treino',
      icon: Dumbbell,
      color: 'bg-blue-500',
      action: () => setActiveTab('workouts')
    },
    {
      title: 'Registrar Refeição',
      description: 'Adicione alimentos consumidos',
      icon: Apple,
      color: 'bg-green-500',
      action: () => setActiveTab('nutrition')
    },
    {
      title: 'Atualizar Medidas',
      description: 'Registre suas medidas corporais',
      icon: Ruler,
      color: 'bg-purple-500',
      action: () => setActiveTab('measurements')
    },
    {
      title: 'Ver Progresso',
      description: 'Analise sua evolução',
      icon: TrendingUp,
      color: 'bg-orange-500',
      action: () => setActiveTab('measurements')
    }
  ];

  const achievements = [
    { id: 1, title: 'Primeira Semana', description: '7 dias consecutivos', icon: '🏆', unlocked: true },
    { id: 2, title: 'Maratonista', description: '100 treinos completos', icon: '🏃', unlocked: true },
    { id: 3, title: 'Disciplinado', description: '30 dias de streak', icon: '🔥', unlocked: false },
    { id: 4, title: 'Transformação', description: 'Meta de peso atingida', icon: '⚡', unlocked: false }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Fitness Hub</h1>
          <p className="text-sm md:text-base text-muted-foreground">Seu centro completo de fitness</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1 text-xs">
            <Activity className="h-3 w-3" />
            {fitnessStats.currentStreak} dias
          </Badge>
          <Badge variant="outline" className="gap-1 text-xs">
            <Target className="h-3 w-3" />
            Nível {fitnessStats.level}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {!isMobile && (
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="dashboard" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="workouts" className="gap-2">
              <Dumbbell className="h-4 w-4" />
              <span className="hidden sm:inline">Treinos</span>
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="gap-2">
              <Apple className="h-4 w-4" />
              <span className="hidden sm:inline">Nutrição</span>
            </TabsTrigger>
            <TabsTrigger value="measurements" className="gap-2">
              <Ruler className="h-4 w-4" />
              <span className="hidden sm:inline">Medidas</span>
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="dashboard" className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={action.action}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${action.color}`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Treinos Semana</p>
                    <p className="text-2xl font-bold">{fitnessStats.weeklyWorkouts}/{fitnessStats.weeklyGoal}</p>
                  </div>
                  <div className="h-4 w-4 bg-blue-500 rounded-full" />
                </div>
                <Progress value={(fitnessStats.weeklyWorkouts / fitnessStats.weeklyGoal) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Calorias Queimadas</p>
                    <p className="text-2xl font-bold">{fitnessStats.caloriesBurned}</p>
                  </div>
                  <div className="h-4 w-4 bg-red-500 rounded-full" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Esta semana</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Peso Atual</p>
                    <p className="text-2xl font-bold">{fitnessStats.currentWeight} kg</p>
                  </div>
                  <div className="h-4 w-4 bg-green-500 rounded-full" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Meta: {fitnessStats.targetWeight} kg</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Streak Atual</p>
                    <p className="text-2xl font-bold">{fitnessStats.currentStreak} dias</p>
                  </div>
                  <div className="h-4 w-4 bg-orange-500 rounded-full" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Recorde pessoal</p>
              </CardContent>
            </Card>
          </div>

          {/* Nutrition Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Nutrição de Hoje</CardTitle>
              <CardDescription>Acompanhe suas metas diárias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Calorias</span>
                    <span className="text-sm text-muted-foreground">
                      {fitnessStats.totalCalories}/{fitnessStats.calorieGoal}
                    </span>
                  </div>
                  <Progress value={(fitnessStats.totalCalories / fitnessStats.calorieGoal) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Proteína</span>
                    <span className="text-sm text-muted-foreground">
                      {fitnessStats.proteinConsumed}/{fitnessStats.proteinGoal}g
                    </span>
                  </div>
                  <Progress value={(fitnessStats.proteinConsumed / fitnessStats.proteinGoal) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Água</span>
                    <span className="text-sm text-muted-foreground">
                      {fitnessStats.waterIntake}/{fitnessStats.waterGoal}L
                    </span>
                  </div>
                  <Progress value={(fitnessStats.waterIntake / fitnessStats.waterGoal) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">% Gordura</span>
                    <span className="text-sm text-muted-foreground">{fitnessStats.bodyFat}%</span>
                  </div>
                  <Progress value={fitnessStats.bodyFat} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Conquistas
              </CardTitle>
              <CardDescription>Suas conquistas e marcos alcançados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-4 rounded-lg border-2 ${
                      achievement.unlocked 
                        ? 'border-yellow-400 bg-yellow-50' 
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{achievement.icon}</div>
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.unlocked && (
                        <Badge className="mt-2">Desbloqueado</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Workouts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Treinos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { day: 'Hoje', workout: 'Push Day - Peito e Tríceps', time: '18:00', duration: '60 min' },
                  { day: 'Amanhã', workout: 'Pull Day - Costas e Bíceps', time: '18:00', duration: '60 min' },
                  { day: 'Quinta', workout: 'Leg Day - Pernas Completo', time: '18:00', duration: '75 min' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">{item.workout}</p>
                      <p className="text-sm text-muted-foreground">{item.day} às {item.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{item.duration}</p>
                      <Button size="sm" variant="outline">Ver Detalhes</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workouts">
          <WorkoutPlanner userId={userId} />
        </TabsContent>

        <TabsContent value="nutrition">
          <NutritionTracker userId={userId} />
        </TabsContent>

        <TabsContent value="measurements">
          <BodyMeasurements userId={userId} />
        </TabsContent>

      </Tabs>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
          <div className="flex justify-around items-center h-16 px-2">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('dashboard')}
              className="flex-col h-full gap-1 flex-1"
            >
              <Activity className="h-5 w-5" />
              <span className="text-xs">Início</span>
            </Button>
            <Button
              variant={activeTab === 'workouts' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('workouts')}
              className="flex-col h-full gap-1 flex-1"
            >
              <Dumbbell className="h-5 w-5" />
              <span className="text-xs">Treinos</span>
            </Button>
            <Button
              variant={activeTab === 'nutrition' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('nutrition')}
              className="flex-col h-full gap-1 flex-1"
            >
              <Apple className="h-5 w-5" />
              <span className="text-xs">Nutrição</span>
            </Button>
            <Button
              variant={activeTab === 'measurements' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('measurements')}
              className="flex-col h-full gap-1 flex-1"
            >
              <Ruler className="h-5 w-5" />
              <span className="text-xs">Medidas</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
