
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalorieCalculator } from './CalorieCalculator';
import { BMICalculator } from './BMICalculator';
import { WeightGoals } from './WeightGoals';
import { MealPlanner } from './MealPlanner';

interface NutritionTabProps {
  userId: string;
}

export function NutritionTab({ userId }: NutritionTabProps) {
  const [activeTab, setActiveTab] = useState('calories');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="calories">Calculadora de Calorias</TabsTrigger>
          <TabsTrigger value="bmi">Calculadora de IMC</TabsTrigger>
          <TabsTrigger value="goals">Metas de Peso</TabsTrigger>
          <TabsTrigger value="meals">Planejador de Refeições</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calories" className="mt-6">
          <CalorieCalculator />
        </TabsContent>
        
        <TabsContent value="bmi" className="mt-6">
          <BMICalculator />
        </TabsContent>
        
        <TabsContent value="goals" className="mt-6">
          <WeightGoals userId={userId} />
        </TabsContent>
        
        <TabsContent value="meals" className="mt-6">
          <MealPlanner />
        </TabsContent>
      </Tabs>
    </div>
  );
}
