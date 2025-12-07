import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dumbbell, 
  Play, 
  Clock, 
  Flame, 
  Target,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickWorkoutCardProps {
  onStartWorkout?: () => void;
}

export function QuickWorkoutCard({ onStartWorkout }: QuickWorkoutCardProps) {

  const todayWorkout = {
    name: 'Push Day',
    type: 'Peito e Tríceps',
    duration: 60,
    calories: 450,
    exercises: 8,
    difficulty: 'Intermediário'
  };

  const quickWorkouts = [
    { id: 1, name: 'Full Body', duration: 45, icon: '💪' },
    { id: 2, name: 'Cardio HIIT', duration: 30, icon: '🔥' },
    { id: 3, name: 'Legs Day', duration: 50, icon: '🦵' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-4"
    >
      {/* Main Workout Card */}
      <Card className="glass-card overflow-hidden border-primary/20">
        <CardContent className="p-0">
          <div className="relative">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent" />
            
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge variant="secondary" className="mb-2 bg-primary/20 text-primary border-0">
                    <Zap className="h-3 w-3 mr-1" />
                    Treino de Hoje
                  </Badge>
                  <h3 className="text-2xl font-bold">{todayWorkout.name}</h3>
                  <p className="text-muted-foreground">{todayWorkout.type}</p>
                </div>
                <motion.div
                  className="p-3 rounded-2xl bg-primary/20"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Dumbbell className="h-8 w-8 text-primary" />
                </motion.div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 rounded-xl bg-background/50">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-lg font-bold">{todayWorkout.duration}</p>
                  <p className="text-xs text-muted-foreground">minutos</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-background/50">
                  <Flame className="h-5 w-5 mx-auto mb-1 text-warning" />
                  <p className="text-lg font-bold">{todayWorkout.calories}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-background/50">
                  <Target className="h-5 w-5 mx-auto mb-1 text-accent" />
                  <p className="text-lg font-bold">{todayWorkout.exercises}</p>
                  <p className="text-xs text-muted-foreground">exercícios</p>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                className="w-full h-14 text-lg font-semibold gap-3 pulse-glow"
                asChild
              >
                <Link to="/fitness">
                  <Play className="h-6 w-6" />
                  Iniciar Treino
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-3 gap-3">
        {quickWorkouts.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Link to="/fitness" className="block">
              <Card className="glass-card cursor-pointer hover:border-primary/50 transition-all">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">{workout.icon}</div>
                  <p className="font-medium text-sm truncate">{workout.name}</p>
                  <p className="text-xs text-muted-foreground">{workout.duration} min</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
