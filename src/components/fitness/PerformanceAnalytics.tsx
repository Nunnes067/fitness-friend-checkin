
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Zap, Target, Calendar, Award, Clock, Flame, Trophy } from 'lucide-react';

interface PerformanceData {
  date: string;
  workoutDuration: number;
  caloriesBurned: number;
  volume: number;
  intensity: number;
  muscleGroups: string[];
  restTime: number;
  maxWeight: number;
}

interface StrengthProgress {
  exercise: string;
  muscle_group: string;
  current_max: number;
  previous_max: number;
  improvement: number;
  volume_trend: number[];
}

interface BodyCompositionData {
  date: string;
  weight: number;
  body_fat: number;
  muscle_mass: number;
  water_percentage: number;
}

export function PerformanceAnalytics({ userId }: { userId: string }) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'strength' | 'cardio' | 'body_comp' | 'consistency'>('strength');

  // Mock data - in real app would come from API
  const performanceData: PerformanceData[] = [
    { date: '2024-01-01', workoutDuration: 65, caloriesBurned: 420, volume: 8500, intensity: 75, muscleGroups: ['Peito', 'Tríceps'], restTime: 90, maxWeight: 100 },
    { date: '2024-01-03', workoutDuration: 70, caloriesBurned: 450, volume: 9200, intensity: 80, muscleGroups: ['Costas', 'Bíceps'], restTime: 85, maxWeight: 110 },
    { date: '2024-01-05', workoutDuration: 75, caloriesBurned: 480, volume: 9800, intensity: 85, muscleGroups: ['Pernas'], restTime: 95, maxWeight: 120 },
    { date: '2024-01-08', workoutDuration: 68, caloriesBurned: 430, volume: 8800, intensity: 78, muscleGroups: ['Ombros', 'Abdômen'], restTime: 80, maxWeight: 95 },
    { date: '2024-01-10', workoutDuration: 72, caloriesBurned: 460, volume: 9500, intensity: 82, muscleGroups: ['Peito', 'Tríceps'], restTime: 88, maxWeight: 105 },
  ];

  const strengthProgress: StrengthProgress[] = [
    { exercise: 'Supino Reto', muscle_group: 'Peito', current_max: 105, previous_max: 100, improvement: 5, volume_trend: [8500, 8800, 9200, 9500, 9800] },
    { exercise: 'Agachamento', muscle_group: 'Pernas', current_max: 125, previous_max: 120, improvement: 4.2, volume_trend: [12000, 12500, 13000, 13200, 13500] },
    { exercise: 'Levantamento Terra', muscle_group: 'Costas', current_max: 140, previous_max: 135, improvement: 3.7, volume_trend: [10200, 10800, 11200, 11500, 12000] },
    { exercise: 'Desenvolvimento', muscle_group: 'Ombros', current_max: 70, previous_max: 65, improvement: 7.7, volume_trend: [4500, 4800, 5200, 5500, 5800] },
  ];

  const bodyCompositionData: BodyCompositionData[] = [
    { date: '2024-01-01', weight: 76.5, body_fat: 16.2, muscle_mass: 57.8, water_percentage: 62.1 },
    { date: '2024-01-15', weight: 76.0, body_fat: 15.8, muscle_mass: 58.2, water_percentage: 62.3 },
    { date: '2024-02-01', weight: 75.5, body_fat: 15.4, muscle_mass: 58.6, water_percentage: 62.5 },
    { date: '2024-02-15', weight: 75.2, body_fat: 15.0, muscle_mass: 59.0, water_percentage: 62.8 },
    { date: '2024-03-01', weight: 74.8, body_fat: 14.6, muscle_mass: 59.4, water_percentage: 63.0 },
  ];

  const muscleGroupDistribution = [
    { name: 'Peito', value: 25, color: '#3b82f6' },
    { name: 'Costas', value: 22, color: '#10b981' },
    { name: 'Pernas', value: 30, color: '#f59e0b' },
    { name: 'Ombros', value: 12, color: '#ef4444' },
    { name: 'Braços', value: 11, color: '#8b5cf6' },
  ];

  const fitnessRadarData = [
    { subject: 'Força', A: 85, fullMark: 100 },
    { subject: 'Resistência', A: 78, fullMark: 100 },
    { subject: 'Flexibilidade', A: 65, fullMark: 100 },
    { subject: 'Potência', A: 80, fullMark: 100 },
    { subject: 'Coordenação', A: 70, fullMark: 100 },
    { subject: 'Equilíbrio', A: 75, fullMark: 100 },
  ];

  const weeklyStats = {
    totalWorkouts: 4,
    totalDuration: 285, // minutes
    totalCalories: 1750,
    totalVolume: 38500,
    averageIntensity: 80,
    personalRecords: 2,
    consistency: 85 // percentage
  };

  const StatCard = ({ title, value, change, icon: Icon, color }: {
    title: string;
    value: string | number;
    change: number;
    icon: any;
    color: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className="flex items-center mt-1">
              {change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Análise de Performance</h2>
          <p className="text-muted-foreground">Insights detalhados sobre seu progresso e performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Treinos Concluídos"
          value={weeklyStats.totalWorkouts}
          change={12}
          icon={Activity}
          color="bg-blue-500"
        />
        <StatCard
          title="Tempo Total (min)"
          value={weeklyStats.totalDuration}
          change={8}
          icon={Clock}
          color="bg-green-500"
        />
        <StatCard
          title="Calorias Queimadas"
          value={weeklyStats.totalCalories}
          change={15}
          icon={Flame}
          color="bg-orange-500"
        />
        <StatCard
          title="Recordes Pessoais"
          value={weeklyStats.personalRecords}
          change={100}
          icon={Trophy}
          color="bg-purple-500"
        />
      </div>

      <Tabs value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="strength">Força</TabsTrigger>
          <TabsTrigger value="cardio">Cardio</TabsTrigger>
          <TabsTrigger value="body_comp">Composição</TabsTrigger>
          <TabsTrigger value="consistency">Consistência</TabsTrigger>
        </TabsList>

        <TabsContent value="strength" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progressão de Força</CardTitle>
                <CardDescription>Evolução dos exercícios principais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strengthProgress.map((exercise) => (
                    <div key={exercise.exercise} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{exercise.exercise}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {exercise.previous_max}kg → {exercise.current_max}kg
                          </span>
                          <Badge variant={exercise.improvement > 0 ? 'default' : 'secondary'}>
                            +{exercise.improvement}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={(exercise.current_max / (exercise.current_max + 20)) * 100} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volume de Treino</CardTitle>
                <CardDescription>Tendência de volume por semana</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Grupo Muscular</CardTitle>
              <CardDescription>Foco de treino por grupo muscular</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={muscleGroupDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {muscleGroupDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {muscleGroupDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cardio" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Intensidade dos Treinos</CardTitle>
                <CardDescription>Nível de intensidade ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="intensity" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calorias Queimadas</CardTitle>
                <CardDescription>Gasto calórico por sessão</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="caloriesBurned" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="body_comp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Composição Corporal</CardTitle>
              <CardDescription>Mudanças na composição corporal ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={bodyCompositionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Peso (kg)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="body_fat" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="% Gordura"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="muscle_mass" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Massa Muscular (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consistency" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Radar de Fitness</CardTitle>
                <CardDescription>Análise multidimensional do seu fitness</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={fitnessRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Fitness"
                      dataKey="A"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Consistência</CardTitle>
                <CardDescription>Indicadores de regularidade e dedicação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Taxa de Consistência</span>
                    <span className="font-medium">{weeklyStats.consistency}%</span>
                  </div>
                  <Progress value={weeklyStats.consistency} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Intensidade Média</span>
                    <span className="font-medium">{weeklyStats.averageIntensity}%</span>
                  </div>
                  <Progress value={weeklyStats.averageIntensity} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{weeklyStats.totalWorkouts}</div>
                    <div className="text-sm text-muted-foreground">Treinos/Semana</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{(weeklyStats.totalDuration / 60).toFixed(1)}h</div>
                    <div className="text-sm text-muted-foreground">Tempo Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
