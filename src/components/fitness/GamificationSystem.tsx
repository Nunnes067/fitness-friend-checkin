
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Star, Target, Flame, Zap, Crown, Gift, Medal, Award, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'strength' | 'endurance' | 'consistency' | 'social' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirements: string[];
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  xpReward: number;
  coinReward: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  requirements: string[];
  progress: number;
  maxProgress: number;
  completed: boolean;
  expiresAt: Date;
  xpReward: number;
  coinReward: number;
  participants: number;
}

interface UserLevel {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  title: string;
  perks: string[];
}

interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'avatar' | 'theme' | 'badge' | 'feature' | 'discount';
  cost: number;
  icon: string;
  purchased: boolean;
  category: string;
}

export function GamificationSystem({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [userCoins, setUserCoins] = useState(1250);
  const [showRewardDialog, setShowRewardDialog] = useState(false);

  const userLevel: UserLevel = {
    level: 15,
    xp: 2350,
    xpToNextLevel: 650,
    totalXp: 12450,
    title: "Atleta Dedicado",
    perks: ["Acesso a treinos premium", "Análises avançadas", "Desafios exclusivos"]
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Primeira Milha',
      description: 'Complete seu primeiro treino',
      icon: '🏃',
      category: 'consistency',
      tier: 'bronze',
      requirements: ['Completar 1 treino'],
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedAt: new Date('2024-01-15'),
      xpReward: 50,
      coinReward: 10
    },
    {
      id: '2',
      title: 'Força Bruta',
      description: 'Levante 1000kg de volume total em um treino',
      icon: '💪',
      category: 'strength',
      tier: 'silver',
      requirements: ['Volume total ≥ 1000kg em um treino'],
      progress: 850,
      maxProgress: 1000,
      unlocked: false,
      xpReward: 150,
      coinReward: 30
    },
    {
      id: '3',
      title: 'Maratonista',
      description: 'Complete 100 treinos',
      icon: '🏆',
      category: 'consistency',
      tier: 'gold',
      requirements: ['Completar 100 treinos'],
      progress: 87,
      maxProgress: 100,
      unlocked: false,
      xpReward: 300,
      coinReward: 75
    },
    {
      id: '4',
      title: 'Fogo Interno',
      description: 'Mantenha um streak de 30 dias',
      icon: '🔥',
      category: 'consistency',
      tier: 'platinum',
      requirements: ['Streak de 30 dias consecutivos'],
      progress: 15,
      maxProgress: 30,
      unlocked: false,
      xpReward: 500,
      coinReward: 150
    },
    {
      id: '5',
      title: 'Queimador de Calorias',
      description: 'Queime 500 calorias em um treino',
      icon: '🔥',
      category: 'endurance',
      tier: 'silver',
      requirements: ['Queimar ≥ 500 calorias em um treino'],
      progress: 445,
      maxProgress: 500,
      unlocked: false,
      xpReward: 200,
      coinReward: 40
    },
    {
      id: '6',
      title: 'Mentor Fitness',
      description: 'Ajude 10 pessoas em grupos',
      icon: '🎓',
      category: 'social',
      tier: 'gold',
      requirements: ['Ajudar 10 membros de grupos'],
      progress: 6,
      maxProgress: 10,
      unlocked: false,
      xpReward: 350,
      coinReward: 80
    }
  ];

  const challenges: Challenge[] = [
    {
      id: '1',
      title: 'Desafio Diário: 30 Min',
      description: 'Treine por pelo menos 30 minutos hoje',
      type: 'daily',
      difficulty: 'easy',
      requirements: ['Treinar ≥ 30 minutos'],
      progress: 0,
      maxProgress: 30,
      completed: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      xpReward: 50,
      coinReward: 15,
      participants: 1247
    },
    {
      id: '2',
      title: 'Semana de Força',
      description: 'Complete 4 treinos de força esta semana',
      type: 'weekly',
      difficulty: 'medium',
      requirements: ['4 treinos de força'],
      progress: 2,
      maxProgress: 4,
      completed: false,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      xpReward: 200,
      coinReward: 50,
      participants: 856
    },
    {
      id: '3',
      title: 'Mestre do Cardio',
      description: 'Queime 2000 calorias este mês',
      type: 'monthly',
      difficulty: 'hard',
      requirements: ['Queimar 2000 calorias'],
      progress: 1450,
      maxProgress: 2000,
      completed: false,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      xpReward: 500,
      coinReward: 125,
      participants: 423
    },
    {
      id: '4',
      title: 'Evento Especial: Ironman',
      description: 'Complete o desafio Ironman em 48h',
      type: 'special',
      difficulty: 'extreme',
      requirements: ['Natação 3.8km', 'Ciclismo 180km', 'Corrida 42km'],
      progress: 0,
      maxProgress: 3,
      completed: false,
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      xpReward: 1000,
      coinReward: 300,
      participants: 89
    }
  ];

  const rewards: Reward[] = [
    {
      id: '1',
      name: 'Avatar Gladiador',
      description: 'Avatar exclusivo de gladiador romano',
      type: 'avatar',
      cost: 500,
      icon: '🏛️',
      purchased: false,
      category: 'Avatares'
    },
    {
      id: '2',
      name: 'Tema Neon',
      description: 'Tema escuro com acentos neon',
      type: 'theme',
      cost: 300,
      icon: '🌟',
      purchased: false,
      category: 'Temas'
    },
    {
      id: '3',
      name: 'Badge Lenda',
      description: 'Badge especial "Lenda do Fitness"',
      type: 'badge',
      cost: 750,
      icon: '👑',
      purchased: false,
      category: 'Badges'
    },
    {
      id: '4',
      name: 'Análise IA Premium',
      description: 'Análise avançada com IA por 1 mês',
      type: 'feature',
      cost: 1000,
      icon: '🤖',
      purchased: false,
      category: 'Recursos'
    },
    {
      id: '5',
      name: 'Desconto Suplementos',
      description: '20% off em suplementos parceiros',
      type: 'discount',
      cost: 200,
      icon: '💊',
      purchased: false,
      category: 'Descontos'
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'silver': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'gold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'platinum': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-orange-600 bg-orange-50';
      case 'extreme': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const purchaseReward = (reward: Reward) => {
    if (userCoins >= reward.cost) {
      setUserCoins(prev => prev - reward.cost);
      toast.success(`${reward.name} comprado com sucesso!`, {
        description: `Você gastou ${reward.cost} moedas`
      });
    } else {
      toast.error('Moedas insuficientes!', {
        description: `Você precisa de ${reward.cost - userCoins} moedas a mais`
      });
    }
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const completedChallenges = challenges.filter(c => c.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sistema de Gamificação</h2>
          <p className="text-muted-foreground">Conquistas, desafios e recompensas</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">{userCoins}</span>
          </div>
          <Badge variant="outline" className="gap-1">
            <Crown className="h-3 w-3" />
            Level {userLevel.level}
          </Badge>
        </div>
      </div>

      {/* Level Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{userLevel.title}</h3>
              <p className="text-sm text-muted-foreground">Level {userLevel.level}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{userLevel.xp} XP</div>
              <div className="text-sm text-muted-foreground">
                {userLevel.xpToNextLevel} XP para próximo nível
              </div>
            </div>
          </div>
          <Progress value={(userLevel.xp / (userLevel.xp + userLevel.xpToNextLevel)) * 100} className="mb-4" />
          <div className="flex flex-wrap gap-2">
            {userLevel.perks.map((perk, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {perk}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumo</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="challenges">Desafios</TabsTrigger>
          <TabsTrigger value="rewards">Loja</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
                <div className="text-sm text-muted-foreground">Conquistas Desbloqueadas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{completedChallenges.length}</div>
                <div className="text-sm text-muted-foreground">Desafios Completados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{userLevel.totalXp}</div>
                <div className="text-sm text-muted-foreground">XP Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{userCoins}</div>
                <div className="text-sm text-muted-foreground">Moedas</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Conquistas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {unlockedAchievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <Badge className={getTierColor(achievement.tier)}>
                      {achievement.tier}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Challenges */}
          <Card>
            <CardHeader>
              <CardTitle>Desafios Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {challenges.filter(c => !c.completed).slice(0, 3).map((challenge) => (
                  <div key={challenge.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{challenge.title}</h4>
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={(challenge.progress / challenge.maxProgress) * 100} className="flex-1" />
                        <span className="text-xs text-muted-foreground">
                          {challenge.progress}/{challenge.maxProgress}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-500">+{challenge.xpReward} XP</div>
                      <div className="text-xs text-muted-foreground">{challenge.participants} participantes</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={`cursor-pointer transition-all duration-200 ${
                  achievement.unlocked ? 'border-yellow-400 bg-yellow-50' : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedAchievement(achievement)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{achievement.icon}</div>
                    <Badge className={getTierColor(achievement.tier)}>
                      {achievement.tier}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-2">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                  
                  {!achievement.unlocked && (
                    <div className="space-y-2">
                      <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                        <span>{Math.round((achievement.progress / achievement.maxProgress) * 100)}%</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span>{achievement.xpReward} XP</span>
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      <span>{achievement.coinReward}</span>
                    </div>
                    {achievement.unlocked && (
                      <Badge variant="default">Desbloqueado</Badge>
                    )}
                  </div>
                  
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Desbloqueado em {achievement.unlockedAt.toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{challenge.title}</h3>
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                        <Badge variant="outline">{challenge.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span>{challenge.progress}/{challenge.maxProgress}</span>
                        </div>
                        <Progress value={(challenge.progress / challenge.maxProgress) * 100} />
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium text-blue-500 mb-1">+{challenge.xpReward} XP</div>
                      <div className="text-sm font-medium text-yellow-500 mb-2">+{challenge.coinReward} moedas</div>
                      <div className="text-xs text-muted-foreground">{challenge.participants} participantes</div>
                      <div className="text-xs text-muted-foreground">
                        Expira em {Math.ceil((challenge.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {challenge.requirements.map((req, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                  
                  {challenge.completed ? (
                    <Badge variant="default">Completado</Badge>
                  ) : (
                    <Button size="sm" className="w-full">
                      Participar do Desafio
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Loja de Recompensas</h3>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span className="font-bold">{userCoins} moedas</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{reward.icon}</div>
                    <h3 className="font-semibold">{reward.name}</h3>
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline">{reward.category}</Badge>
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold">{reward.cost}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => purchaseReward(reward)}
                    disabled={reward.purchased || userCoins < reward.cost}
                  >
                    {reward.purchased ? 'Comprado' : 
                     userCoins < reward.cost ? 'Moedas insuficientes' : 'Comprar'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Achievement Detail Dialog */}
      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent>
          {selectedAchievement && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="text-3xl">{selectedAchievement.icon}</span>
                  {selectedAchievement.title}
                </DialogTitle>
                <DialogDescription>{selectedAchievement.description}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getTierColor(selectedAchievement.tier)}>
                    {selectedAchievement.tier}
                  </Badge>
                  <Badge variant="outline">{selectedAchievement.category}</Badge>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Requisitos:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedAchievement.requirements.map((req, index) => (
                      <li key={index} className="text-sm text-muted-foreground">{req}</li>
                    ))}
                  </ul>
                </div>
                
                {!selectedAchievement.unlocked && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Progresso:</h4>
                    <Progress value={(selectedAchievement.progress / selectedAchievement.maxProgress) * 100} />
                    <div className="text-sm text-muted-foreground">
                      {selectedAchievement.progress}/{selectedAchievement.maxProgress} (
                      {Math.round((selectedAchievement.progress / selectedAchievement.maxProgress) * 100)}%)
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">+{selectedAchievement.xpReward} XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">+{selectedAchievement.coinReward} moedas</span>
                  </div>
                </div>
                
                {selectedAchievement.unlocked && selectedAchievement.unlockedAt && (
                  <div className="text-sm text-muted-foreground">
                    Desbloqueado em {selectedAchievement.unlockedAt.toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
