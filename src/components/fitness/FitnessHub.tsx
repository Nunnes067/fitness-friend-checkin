
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WorkoutPlanner } from './WorkoutPlanner';
import { NutritionTracker } from './NutritionTracker';
import { BodyMeasurements } from './BodyMeasurements';
import { Dumbbell, Apple, Ruler, TrendingUp, Target, Users, Video, Calendar, Award, Zap, Heart, Activity } from 'lucide-react';

interface FitnessHubProps {
  userId: string;
}

export function FitnessHub({ userId }: FitnessHubProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data for dashboard
  const fitnessStats = {
    weeklyWorkouts: 4,
    weeklyGoal: 5,
    totalWorkouts: 127,
    avgWorkoutDuration: 78,
    caloriesBurned: 2840,
    currentStreak: 12,
    totalCalories: 2450,
    calorieGoal: 2500,
    proteinConsumed: 145,
    proteinGoal: 150,
    waterIntake: 2.8,
    waterGoal: 3.5,
    currentWeight: 75.2,
    targetWeight: 70,
    bodyFat: 15.8,
    muscleMass: 58.4
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fitness Hub</h1>
          <p className="text-muted-foreground">Seu centro completo de fitness e bem-estar</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Zap className="h-3 w-3" />
            Streak: {fitnessStats.currentStreak} dias
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Heart className="h-3 w-3" />
            Nível: Intermediário
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="workouts" className="gap-2">
            <Dumbbell className="h-4 w-4" />
            Treinos
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="gap-2">
            <Apple className="h-4 w-4" />
            Nutrição
          </TabsTrigger>
          <TabsTrigger value="measurements" className="gap-2">
            <Ruler className="h-4 w-4" />
            Medidas
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Users className="h-4 w-4" />
            Social
          </TabsTrigger>
        </TabsList>

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

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comunidade Fitness</CardTitle>
              <CardDescription>Conecte-se com outros usuários e compartilhe sua jornada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Funcionalidade Social</h3>
                <p className="text-muted-foreground mb-4">
                  Conecte-se com outros usuários, compartilhe treinos e motive-se mutuamente
                </p>
                <Button>Em Breve</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
