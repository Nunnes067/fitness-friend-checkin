
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Calendar, 
  Camera, 
  Dumbbell, 
  Award, 
  History,
  Calculator,
  Timer,
  Book,
  Target,
  Apple
} from 'lucide-react';
import { motion } from 'framer-motion';
import { UserList } from '@/components/UserList';
import { WeeklyRanking } from '@/components/WeeklyRanking';
import { ProgressTracking } from '@/components/ProgressTracking';
import { WorkoutForm } from '@/components/WorkoutForm';
import { AchievementBadges } from '@/components/AchievementBadges';
import { DailyHistory } from '@/components/DailyHistory';
import { NutritionTab } from '@/components/nutrition/NutritionTab';

interface DashboardTabsProps {
  refreshTrigger: number;
  userId: string;
}

export function DashboardTabs({ refreshTrigger, userId }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState('check-in');
  
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
      <TabsList className="grid grid-cols-6 mb-6">
        <TabsTrigger value="check-in" className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Check-ins</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center">
          <History className="h-4 w-4 mr-2" />
          <span>Histórico</span>
        </TabsTrigger>
        <TabsTrigger value="progress" className="flex items-center">
          <Camera className="h-4 w-4 mr-2" />
          <span>Progresso</span>
        </TabsTrigger>
        <TabsTrigger value="workout" className="flex items-center">
          <Dumbbell className="h-4 w-4 mr-2" />
          <span>Treinos</span>
        </TabsTrigger>
        <TabsTrigger value="nutrition" className="flex items-center">
          <Apple className="h-4 w-4 mr-2" />
          <span>Nutrição</span>
        </TabsTrigger>
        <TabsTrigger value="achievements" className="flex items-center">
          <Award className="h-4 w-4 mr-2" />
          <span>Conquistas</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="check-in" className="m-0">
        <motion.section 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
        >
          <motion.div 
            variants={fadeInUpVariants}
            transition={{ delay: 0.3 }}
          >
            <UserList refreshTrigger={refreshTrigger} />
          </motion.div>
          <motion.div 
            variants={fadeInUpVariants}
            transition={{ delay: 0.4 }}
          >
            <WeeklyRanking />
          </motion.div>
        </motion.section>
      </TabsContent>
      
      <TabsContent value="history" className="m-0">
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
        >
          <DailyHistory />
        </motion.section>
      </TabsContent>
      
      <TabsContent value="progress" className="m-0">
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
        >
          <ProgressTracking userId={userId} />
        </motion.section>
      </TabsContent>
      
      <TabsContent value="workout" className="m-0">
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
        >
          <WorkoutForm />
        </motion.section>
      </TabsContent>
      
      <TabsContent value="nutrition" className="m-0">
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
        >
          <NutritionTab userId={userId} />
        </motion.section>
      </TabsContent>
      
      <TabsContent value="achievements" className="m-0">
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
        >
          <AchievementBadges />
        </motion.section>
      </TabsContent>
    </Tabs>
  );
}
