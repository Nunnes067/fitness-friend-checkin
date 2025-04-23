import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { updateProfile } from '@/lib/supabase';

type GoalType = 'lose' | 'maintain' | 'gain';

export function WeightGoals({ userId }: { userId: string }) {
  const [currentWeight, setCurrentWeight] = useState<number>(70);
  const [targetWeight, setTargetWeight] = useState<number>(65);
  const [goalType, setGoalType] = useState<GoalType>('lose');
  const [weeklyRate, setWeeklyRate] = useState<number>(0.5);
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);
  const [estimatedDate, setEstimatedDate] = useState<string | null>(null);
  const [dailyCalories, setDailyCalories] = useState<number | null>(null);

  const calculateGoal = async () => {
    if (currentWeight <= 0 || targetWeight <= 0) {
      toast.error('Valores inválidos', {
        description: 'Os pesos devem ser números positivos'
      });
      return;
    }

    const weightDiff = Math.abs(currentWeight - targetWeight);
    const caloriesPerKg = 7700; // Aproximadamente 7700 calorias = 1kg
    const totalCalories = weightDiff * caloriesPerKg;
    
    // Calcular duração em semanas
    const durationWeeks = Math.ceil(weightDiff / weeklyRate);
    setEstimatedDuration(durationWeeks);
    
    // Calcular data estimada
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + (durationWeeks * 7));
    setEstimatedDate(targetDate.toLocaleDateString('pt-BR'));
    
    // Calcular calorias diárias
    const dailyCalorieDeficit = (weeklyRate * caloriesPerKg) / 7;
    setDailyCalories(Math.round(dailyCalorieDeficit));
    
    // Salvar meta no perfil do usuário (opcional)
    try {
      await updateProfile(userId, {
        name: undefined, // Keep the existing name
        photo_url: undefined, // Keep the existing photo URL
        // weight_goal removed as it's not a valid property
      });
      
      toast.success('Meta definida com sucesso', {
        description: 'Suas informações foram salvas no seu perfil'
      });
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      toast.error('Erro ao salvar meta', {
        description: 'Suas informações de meta foram calculadas, mas não puderam ser salvas'
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Target className="h-5 w-5 mr-2 text-primary" />
          Metas de Emagrecimento
        </CardTitle>
        <CardDescription>
          Defina e acompanhe suas metas de peso e composição corporal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currentWeight">Peso Atual (kg)</Label>
            <Input
              id="currentWeight"
              type="number"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetWeight">Peso Desejado (kg)</Label>
            <Input
              id="targetWeight"
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(Number(e.target.value))}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="goalType">Tipo de Meta</Label>
          <Select
            value={goalType}
            onValueChange={(value) => {
              setGoalType(value as GoalType);
              if (value === 'lose') {
                setTargetWeight(Math.min(targetWeight, currentWeight));
              } else if (value === 'gain') {
                setTargetWeight(Math.max(targetWeight, currentWeight));
              }
            }}
          >
            <SelectTrigger id="goalType">
              <SelectValue placeholder="Selecione seu objetivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lose">Perder Peso</SelectItem>
              <SelectItem value="maintain">Manter Peso</SelectItem>
              <SelectItem value="gain">Ganhar Peso</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {goalType !== 'maintain' && (
          <div className="space-y-2">
            <Label htmlFor="weeklyRate">Taxa Semanal ({goalType === 'lose' ? 'Perda' : 'Ganho'}) (kg)</Label>
            <Select
              value={weeklyRate.toString()}
              onValueChange={(value) => setWeeklyRate(parseFloat(value))}
            >
              <SelectTrigger id="weeklyRate">
                <SelectValue placeholder="Selecione a taxa semanal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.25">0.25 kg por semana (suave)</SelectItem>
                <SelectItem value="0.5">0.5 kg por semana (recomendado)</SelectItem>
                <SelectItem value="0.75">0.75 kg por semana (moderado)</SelectItem>
                <SelectItem value="1">1 kg por semana (intenso)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <Button onClick={calculateGoal} className="w-full">
          Calcular Meta
        </Button>
        
        {estimatedDuration !== null && estimatedDate !== null && dailyCalories !== null && (
          <div className="mt-4 p-4 rounded-md border bg-secondary/20 space-y-2">
            <h4 className="font-medium">Resumo da Meta:</h4>
            
            {goalType !== 'maintain' ? (
              <>
                <div className="flex justify-between">
                  <span>Duração estimada:</span>
                  <span className="font-bold">{estimatedDuration} semanas</span>
                </div>
                <div className="flex justify-between">
                  <span>Data estimada para conclusão:</span>
                  <span className="font-bold">{estimatedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>{goalType === 'lose' ? 'Déficit' : 'Superávit'} calórico diário:</span>
                  <span className="font-bold">{dailyCalories} calorias</span>
                </div>
              </>
            ) : (
              <p>Para manter seu peso atual, mantenha um equilíbrio entre calorias consumidas e gastas.</p>
            )}
            
            <div className="text-xs text-muted-foreground mt-2">
              <p>Dica: Combine dieta balanceada e exercícios regulares para melhores resultados.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
