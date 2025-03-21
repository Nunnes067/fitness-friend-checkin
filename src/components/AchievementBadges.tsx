
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Award, Zap, Flame, Calendar, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  unlocked: boolean;
}

export function AchievementBadges() {
  // Static achievements (in a real app, this would come from a database)
  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'Primeiro Check-in',
      description: 'Fez seu primeiro check-in na academia',
      icon: <Zap className="h-4 w-4" />,
      unlocked: true
    },
    {
      id: '2',
      name: 'Três Seguidos',
      description: 'Completou 3 dias seguidos de treino',
      icon: <Flame className="h-4 w-4" />,
      unlocked: true
    },
    {
      id: '3',
      name: 'Uma Semana Completa',
      description: 'Treinou todos os dias por uma semana',
      icon: <Calendar className="h-4 w-4" />,
      unlocked: false
    },
    {
      id: '4',
      name: 'Mestre dos Treinos',
      description: 'Criou 5 treinos diferentes',
      icon: <Target className="h-4 w-4" />,
      unlocked: false
    },
    {
      id: '5',
      name: 'Progresso Constante',
      description: 'Adicionou 10 fotos de progresso',
      icon: <TrendingUp className="h-4 w-4" />,
      unlocked: false
    }
  ];

  const badgeVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.3 }
    })
  };

  return (
    <Card className="glass-card w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Conquistas</CardTitle>
          <Award className="h-5 w-5 text-primary" />
        </div>
        <CardDescription>
          Desbloqueie conquistas treinando regularmente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 justify-center">
          {achievements.map((achievement, index) => (
            <TooltipProvider key={achievement.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={badgeVariants}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge 
                      variant={achievement.unlocked ? "default" : "outline"} 
                      className={`px-3 py-2 ${!achievement.unlocked ? "opacity-50" : ""} cursor-help`}
                    >
                      <span className="flex items-center gap-1">
                        {achievement.icon}
                        {achievement.name}
                      </span>
                    </Badge>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{achievement.description}</p>
                  {!achievement.unlocked && <p className="text-xs text-muted-foreground mt-1">Ainda não desbloqueado</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
