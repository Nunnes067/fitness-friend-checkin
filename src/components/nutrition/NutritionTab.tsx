
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalorieCalculator } from './CalorieCalculator';
import { BMICalculator } from './BMICalculator';
import { WeightGoals } from './WeightGoals';
import { MealPlanner } from './MealPlanner';
import { motion } from 'framer-motion';
import { Apple, Calculator, Weight, Utensils } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface NutritionTabProps {
  userId: string;
}

export function NutritionTab({ userId }: NutritionTabProps) {
  const [activeTab, setActiveTab] = useState('calories');
  const isMobile = useIsMobile();

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`${isMobile ? 'grid-cols-2 grid-rows-2' : 'grid-cols-4'} grid mb-6`}>
          <TabsTrigger value="calories" className="flex items-center justify-center">
            <Calculator className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Calculadora de Calorias</span>
            <span className="sm:hidden">Calorias</span>
          </TabsTrigger>
          <TabsTrigger value="bmi" className="flex items-center justify-center">
            <Weight className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Calculadora de IMC</span>
            <span className="sm:hidden">IMC</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center justify-center">
            <Apple className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Metas de Peso</span>
            <span className="sm:hidden">Metas</span>
          </TabsTrigger>
          <TabsTrigger value="meals" className="flex items-center justify-center">
            <Utensils className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Planejador de Refeições</span>
            <span className="sm:hidden">Refeições</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calories" className="mt-6">
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
          >
            <CalorieCalculator />
          </motion.div>
        </TabsContent>
        
        <TabsContent value="bmi" className="mt-6">
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
          >
            <BMICalculator />
          </motion.div>
        </TabsContent>
        
        <TabsContent value="goals" className="mt-6">
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
          >
            <WeightGoals userId={userId} />
          </motion.div>
        </TabsContent>
        
        <TabsContent value="meals" className="mt-6">
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
          >
            <MealPlanner />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
