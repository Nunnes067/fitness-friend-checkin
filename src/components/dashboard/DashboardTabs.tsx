import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Dumbbell, 
  Award, 
  History,
  Apple,
  Users,
  Trophy
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

  const tabItems = [
    { id: 'check-in', label: 'Check-ins', icon: Calendar },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'workout', label: 'Treinos', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrição', icon: Apple },
    { id: 'achievements', label: 'Conquistas', icon: Trophy },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="mt-8"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex flex-nowrap overflow-x-auto pb-2 mb-6">
          {tabItems.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="flex items-center gap-2 min-w-fit"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="check-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <UserList refreshTrigger={refreshTrigger} />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <WeeklyRanking />
            </motion.div>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <DailyHistory />
        </TabsContent>
        
        <TabsContent value="workout">
          <WorkoutForm />
        </TabsContent>
        
        <TabsContent value="nutrition">
          <NutritionTab userId={userId} />
        </TabsContent>
        
        <TabsContent value="achievements">
          <AchievementBadges />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
