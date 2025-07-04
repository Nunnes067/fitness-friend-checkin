
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Ruler, TrendingUp, Calendar, Target, Plus, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Measurement {
  id: string;
  date: Date;
  weight: number;
  height: number;
  body_fat?: number;
  muscle_mass?: number;
  measurements: {
    chest?: number;
    waist?: number;
    hips?: number;
    bicep_left?: number;
    bicep_right?: number;
    thigh_left?: number;
    thigh_right?: number;
    forearm_left?: number;
    forearm_right?: number;
    neck?: number;
    shoulders?: number;
  };
  notes?: string;
  photo_urls?: string[];
}

interface Goal {
  id: string;
  type: 'weight' | 'body_fat' | 'muscle_mass' | 'measurement';
  target_value: number;
  current_value: number;
  target_date: Date;
  measurement_type?: string;
  description: string;
}

export function BodyMeasurements({ userId }: { userId: string }) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddingMeasurement, setIsAddingMeasurement] = useState(false);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('3m');

  const [newMeasurement, setNewMeasurement] = useState<Partial<Measurement>>({
    date: new Date(),
    weight: 0,
    height: 0,
    measurements: {}
  });

  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    type: 'weight',
    target_value: 0,
    current_value: 0,
    target_date: new Date(),
    description: ''
  });

  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return 0;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Abaixo do peso', color: 'text-blue-500' };
    if (bmi < 25) return { category: 'Peso normal', color: 'text-green-500' };
    if (bmi < 30) return { category: 'Sobrepeso', color: 'text-yellow-500' };
    return { category: 'Obesidade', color: 'text-red-500' };
  };

  const getFilteredMeasurements = () => {
    const now = new Date();
    const timeframes = {
      '1m': 30,
      '3m': 90,
      '6m': 180,
      '1y': 365,
      'all': Infinity
    };

    const days = timeframes[selectedTimeframe];
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return measurements
      .filter(m => selectedTimeframe === 'all' || m.date >= cutoffDate)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const addMeasurement = () => {
    if (!newMeasurement.weight || !newMeasurement.height) {
      toast.error('Peso e altura são obrigatórios');
      return;
    }

    const measurement: Measurement = {
      id: Date.now().toString(),
      date: newMeasurement.date || new Date(),
      weight: newMeasurement.weight,
      height: newMeasurement.height,
      body_fat: newMeasurement.body_fat,
      muscle_mass: newMeasurement.muscle_mass,
      measurements: newMeasurement.measurements || {},
      notes: newMeasurement.notes
    };

    setMeasurements(prev => [...prev, measurement]);
    setNewMeasurement({
      date: new Date(),
      weight: 0,
      height: 0,
      measurements: {}
    });
    setIsAddingMeasurement(false);
    toast.success('Medição adicionada com sucesso!');
  };

  const addGoal = () => {
    if (!newGoal.target_value || !newGoal.description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      type: newGoal.type || 'weight',
      target_value: newGoal.target_value,
      current_value: newGoal.current_value || 0,
      target_date: newGoal.target_date || new Date(),
      measurement_type: newGoal.measurement_type,
      description: newGoal.description
    };

    setGoals(prev => [...prev, goal]);
    setNewGoal({
      type: 'weight',
      target_value: 0,
      current_value: 0,
      target_date: new Date(),
      description: ''
    });
    setIsAddingGoal(false);
    toast.success('Meta adicionada com sucesso!');
  };

  const latestMeasurement = measurements[measurements.length - 1];
  const filteredMeasurements = getFilteredMeasurements();

  const chartData = filteredMeasurements.map(m => ({
    date: m.date.toLocaleDateString('pt-BR'),
    weight: m.weight,
    bmi: calculateBMI(m.weight, m.height),
    body_fat: m.body_fat,
    muscle_mass: m.muscle_mass
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Medidas Corporais</h2>
          <p className="text-muted-foreground">Acompanhe sua evolução física e metas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddingGoal(true)} variant="outline" className="gap-2">
            <Target className="h-4 w-4" />
            Nova Meta
          </Button>
          <Button onClick={() => setIsAddingMeasurement(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Medição
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumo</TabsTrigger>
          <TabsTrigger value="measurements">Medições</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {latestMeasurement ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Peso Atual</p>
                        <p className="text-2xl font-bold">{latestMeasurement.weight} kg</p>
                      </div>
                      <div className="h-4 w-4 bg-blue-500 rounded-full" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">IMC</p>
                        <p className="text-2xl font-bold">
                          {calculateBMI(latestMeasurement.weight, latestMeasurement.height).toFixed(1)}
                        </p>
                        <p className={`text-xs ${getBMICategory(calculateBMI(latestMeasurement.weight, latestMeasurement.height)).color}`}>
                          {getBMICategory(calculateBMI(latestMeasurement.weight, latestMeasurement.height)).category}
                        </p>
                      </div>
                      <div className="h-4 w-4 bg-green-500 rounded-full" />
                    </div>
                  </CardContent>
                </Card>

                {latestMeasurement.body_fat && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">% Gordura</p>
                          <p className="text-2xl font-bold">{latestMeasurement.body_fat}%</p>
                        </div>
                        <div className="h-4 w-4 bg-orange-500 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {latestMeasurement.muscle_mass && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Massa Muscular</p>
                          <p className="text-2xl font-bold">{latestMeasurement.muscle_mass} kg</p>
                        </div>
                        <div className="h-4 w-4 bg-purple-500 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Medidas Corporais Atuais</CardTitle>
                  <CardDescription>
                    Última medição: {latestMeasurement.date.toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(latestMeasurement.measurements).map(([key, value]) => {
                      if (!value) return null;
                      
                      const labels: Record<string, string> = {
                        chest: 'Peito',
                        waist: 'Cintura',
                        hips: 'Quadril',
                        bicep_left: 'Bíceps E',
                        bicep_right: 'Bíceps D',
                        thigh_left: 'Coxa E',
                        thigh_right: 'Coxa D',
                        forearm_left: 'Antebraço E',
                        forearm_right: 'Antebraço D',
                        neck: 'Pescoço',
                        shoulders: 'Ombros'
                      };

                      return (
                        <div key={key} className="text-center p-3 bg-secondary rounded-lg">
                          <div className="text-sm text-muted-foreground">{labels[key]}</div>
                          <div className="text-xl font-bold">{value} cm</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Ruler className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma medição registrada</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Comece adicionando suas primeiras medições para acompanhar seu progresso
                </p>
                <Button onClick={() => setIsAddingMeasurement(true)}>
                  Adicionar Primeira Medição
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Evolução</h3>
            <div className="flex gap-2">
              {(['1m', '3m', '6m', '1y', 'all'] as const).map(timeframe => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                >
                  {timeframe === 'all' ? 'Tudo' : timeframe.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Peso</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>IMC</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="bmi" 
                      stroke="#10b981" 
                      fill="#10b981"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map(goal => {
              const progress = goal.current_value / goal.target_value * 100;
              const daysRemaining = Math.ceil((goal.target_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              
              return (
                <Card key={goal.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{goal.description}</CardTitle>
                      <Badge variant={daysRemaining > 0 ? 'default' : 'destructive'}>
                        {daysRemaining > 0 ? `${daysRemaining} dias` : 'Vencido'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Atual: {goal.current_value}</span>
                      <span>Meta: {goal.target_value}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Measurement Dialog */}
      <Dialog open={isAddingMeasurement} onOpenChange={setIsAddingMeasurement}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Medição</DialogTitle>
            <DialogDescription>
              Registre suas medidas corporais e acompanhe seu progresso
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={newMeasurement.date?.toISOString().split('T')[0]}
                  onChange={(e) => setNewMeasurement(prev => ({ 
                    ...prev, 
                    date: new Date(e.target.value) 
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Peso (kg) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newMeasurement.weight || ''}
                  onChange={(e) => setNewMeasurement(prev => ({ 
                    ...prev, 
                    weight: Number(e.target.value) 
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Altura (cm) *</Label>
                <Input
                  type="number"
                  value={newMeasurement.height || ''}
                  onChange={(e) => setNewMeasurement(prev => ({ 
                    ...prev, 
                    height: Number(e.target.value) 
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>% Gordura</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newMeasurement.body_fat || ''}
                  onChange={(e) => setNewMeasurement(prev => ({ 
                    ...prev, 
                    body_fat: Number(e.target.value) 
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Massa Muscular (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newMeasurement.muscle_mass || ''}
                  onChange={(e) => setNewMeasurement(prev => ({ 
                    ...prev, 
                    muscle_mass: Number(e.target.value) 
                  }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Medidas Corporais (cm)</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: 'chest', label: 'Peito' },
                  { key: 'waist', label: 'Cintura' },
                  { key: 'hips', label: 'Quadril' },
                  { key: 'bicep_left', label: 'Bíceps Esquerdo' },
                  { key: 'bicep_right', label: 'Bíceps Direito' },
                  { key: 'thigh_left', label: 'Coxa Esquerda' },
                  { key: 'thigh_right', label: 'Coxa Direita' },
                  { key: 'forearm_left', label: 'Antebraço Esquerdo' },
                  { key: 'forearm_right', label: 'Antebraço Direito' },
                  { key: 'neck', label: 'Pescoço' },
                  { key: 'shoulders', label: 'Ombros' }
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={(newMeasurement.measurements as any)?.[key] || ''}
                      onChange={(e) => setNewMeasurement(prev => ({
                        ...prev,
                        measurements: {
                          ...prev.measurements,
                          [key]: Number(e.target.value)
                        }
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Input
                placeholder="Adicione observações sobre esta medição..."
                value={newMeasurement.notes || ''}
                onChange={(e) => setNewMeasurement(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddingMeasurement(false)}>
                Cancelar
              </Button>
              <Button onClick={addMeasurement}>
                Salvar Medição
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Goal Dialog */}
      <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Meta</DialogTitle>
            <DialogDescription>
              Defina uma meta para acompanhar seu progresso
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Descrição da Meta</Label>
              <Input
                placeholder="Ex: Perder 5kg até o verão"
                value={newGoal.description || ''}
                onChange={(e) => setNewGoal(prev => ({ 
                  ...prev, 
                  description: e.target.value 
                }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Meta</Label>
                <select 
                  value={newGoal.type} 
                  onChange={(e) => setNewGoal(prev => ({ 
                    ...prev, 
                    type: e.target.value as any 
                  }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="weight">Peso</option>
                  <option value="body_fat">% Gordura</option>
                  <option value="muscle_mass">Massa Muscular</option>
                  <option value="measurement">Medida Corporal</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Data Limite</Label>
                <Input
                  type="date"
                  value={newGoal.target_date?.toISOString().split('T')[0]}
                  onChange={(e) => setNewGoal(prev => ({ 
                    ...prev, 
                    target_date: new Date(e.target.value) 
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor Atual</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newGoal.current_value || ''}
                  onChange={(e) => setNewGoal(prev => ({ 
                    ...prev, 
                    current_value: Number(e.target.value) 
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor Meta</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newGoal.target_value || ''}
                  onChange={(e) => setNewGoal(prev => ({ 
                    ...prev, 
                    target_value: Number(e.target.value) 
                  }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddingGoal(false)}>
                Cancelar
              </Button>
              <Button onClick={addGoal}>
                Criar Meta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
