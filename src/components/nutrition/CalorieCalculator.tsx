
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';
import { toast } from 'sonner';

type ActivityLevel = 'sedentary' | 'lightlyActive' | 'moderatelyActive' | 'veryActive' | 'extraActive';
type Gender = 'male' | 'female';

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2, // Little or no exercise
  lightlyActive: 1.375, // Light exercise 1-3 days/week
  moderatelyActive: 1.55, // Moderate exercise 3-5 days/week
  veryActive: 1.725, // Hard exercise 6-7 days/week
  extraActive: 1.9, // Very hard exercise & physical job or 2x training
};

export function CalorieCalculator() {
  const [age, setAge] = useState<number>(30);
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [gender, setGender] = useState<Gender>('male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderatelyActive');
  const [bmr, setBmr] = useState<number | null>(null);
  const [tdee, setTdee] = useState<number | null>(null);

  const calculateCalories = () => {
    if (age <= 0 || weight <= 0 || height <= 0) {
      toast.error('Valores inválidos', {
        description: 'Todos os campos devem conter valores positivos'
      });
      return;
    }

    let basalMetabolicRate = 0;

    // Mifflin-St Jeor Equation
    if (gender === 'male') {
      basalMetabolicRate = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      basalMetabolicRate = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const totalDailyEnergy = Math.round(basalMetabolicRate * activityMultipliers[activityLevel]);

    setBmr(Math.round(basalMetabolicRate));
    setTdee(totalDailyEnergy);

    toast.success('Cálculo realizado com sucesso', {
      description: `Seu gasto calórico diário estimado é de ${totalDailyEnergy} calorias`
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Calculator className="h-5 w-5 mr-2 text-primary" />
          Calculadora de Gasto Energético
        </CardTitle>
        <CardDescription>
          Calcule seu metabolismo basal e gasto calórico diário
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Idade</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="height">Altura (cm)</Label>
          <Input
            id="height"
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Gênero</Label>
          <RadioGroup className="flex space-x-4"
            value={gender}
            onValueChange={(value) => setGender(value as Gender)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Masculino</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Feminino</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activity">Nível de Atividade</Label>
          <Select
            value={activityLevel}
            onValueChange={(value) => setActivityLevel(value as ActivityLevel)}
          >
            <SelectTrigger id="activity">
              <SelectValue placeholder="Selecione seu nível de atividade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentário (pouco ou nenhum exercício)</SelectItem>
              <SelectItem value="lightlyActive">Levemente ativo (exercício leve 1-3 dias/semana)</SelectItem>
              <SelectItem value="moderatelyActive">Moderadamente ativo (exercício moderado 3-5 dias/semana)</SelectItem>
              <SelectItem value="veryActive">Muito ativo (exercício intenso 6-7 dias/semana)</SelectItem>
              <SelectItem value="extraActive">Extremamente ativo (exercício muito intenso, trabalho físico)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={calculateCalories} className="w-full">
          Calcular Gasto Calórico
        </Button>
        
        {bmr !== null && tdee !== null && (
          <div className="mt-4 p-4 rounded-md border bg-secondary/20 space-y-2">
            <h4 className="font-medium">Seus resultados:</h4>
            <div className="flex justify-between">
              <span>Metabolismo Basal (BMR):</span>
              <span className="font-bold">{bmr} calorias/dia</span>
            </div>
            <div className="flex justify-between">
              <span>Gasto Energético Total (TDEE):</span>
              <span className="font-bold">{tdee} calorias/dia</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              <p>Para perder peso: aproximadamente {tdee - 500} calorias/dia</p>
              <p>Para ganhar peso: aproximadamente {tdee + 500} calorias/dia</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
