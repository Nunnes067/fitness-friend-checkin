import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Dumbbell, Target, TrendingUp, Users, Video, Zap, Timer, Award, Star, Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  exerciseDatabase as brazilianExercises, 
  muscleGroups as exerciseMuscleGroups, 
  exerciseTypes,
  equipmentTypes as exerciseEquipment 
} from '@/data/exercises';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  equipment: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  instructions: string;
  video_url?: string;
  sets: number;
  reps: string;
  weight?: string;
  rest_time: number;
  tempo?: string;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  duration: number;
  exercises: Exercise[];
  tags: string[];
  created_by: string;
  rating: number;
  completed_count: number;
}

const workoutTypes = [
  'Hipertrofia', 'Força', 'Resistência', 'Cardio', 'HIIT', 'Funcional', 'Crossfit', 'Calistenia'
];

export function WorkoutPlanner({ userId }: { userId: string }) {
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');
  const [exerciseFilterMuscle, setExerciseFilterMuscle] = useState('Todos');
  const [exerciseFilterType, setExerciseFilterType] = useState('Todos');

  // Workout creation state
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    description: '',
    difficulty: 'Intermediário',
    type: 'Hipertrofia',
    duration: 60,
    exercises: [] as Exercise[]
  });

  // Convert Brazilian exercises to the component's Exercise interface
  const exerciseDatabase: Exercise[] = brazilianExercises.map(ex => ({
    id: ex.id,
    name: ex.name,
    category: ex.type,
    muscle_groups: [ex.muscleGroup],
    equipment: ex.equipment,
    difficulty: 'Intermediário' as const,
    instructions: `Execute o exercício ${ex.name} com foco no grupo muscular ${ex.muscleGroup}.`,
    sets: 3,
    reps: '8-12',
    rest_time: 90
  }));

  // Filter exercises
  const filteredExerciseDatabase = exerciseDatabase.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase());
    const matchesMuscle = exerciseFilterMuscle === 'Todos' || ex.muscle_groups.includes(exerciseFilterMuscle);
    const matchesType = exerciseFilterType === 'Todos' || ex.category === exerciseFilterType;
    return matchesSearch && matchesMuscle && matchesType;
  });

  // Old hard-coded database (keeping as fallback)
  const legacyExerciseDatabase: Exercise[] = [
    {
      id: '1',
      name: 'Supino Reto',
      category: 'Peito',
      muscle_groups: ['Peito', 'Tríceps', 'Ombros'],
      equipment: 'Peso Livre',
      difficulty: 'Intermediário',
      instructions: 'Deite no banco, segure a barra com pegada média, desça controladamente até o peito e empurre para cima.',
      sets: 3,
      reps: '8-12',
      rest_time: 90,
      tempo: '3-1-1-1'
    },
    {
      id: '2',
      name: 'Agachamento',
      category: 'Pernas',
      muscle_groups: ['Quadríceps', 'Glúteos', 'Isquiotibiais'],
      equipment: 'Peso Livre',
      difficulty: 'Intermediário',
      instructions: 'Posicione a barra nas costas, desça mantendo o peito ereto até 90 graus e suba.',
      sets: 4,
      reps: '6-10',
      rest_time: 120,
      tempo: '3-2-1-1'
    },
    {
      id: '3',
      name: 'Remada Curvada',
      category: 'Costas',
      muscle_groups: ['Costas', 'Bíceps', 'Ombros'],
      equipment: 'Peso Livre',
      difficulty: 'Avançado',
      instructions: 'Incline o tronco, puxe a barra em direção ao abdômen, contraia as escápulas.',
      sets: 3,
      reps: '8-10',
      rest_time: 90,
      tempo: '2-1-2-1'
    }
  ];

  const addExerciseToWorkout = (exercise: Exercise) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, { ...exercise, id: Date.now().toString() }]
    }));
    toast.success('Exercício adicionado ao treino!');
  };

  const removeExerciseFromWorkout = (exerciseId: string) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== exerciseId)
    }));
  };

  const saveWorkout = () => {
    if (!newWorkout.name || newWorkout.exercises.length === 0) {
      toast.error('Adicione um nome e pelo menos um exercício');
      return;
    }

    const workout: WorkoutPlan = {
      id: Date.now().toString(),
      ...newWorkout,
      tags: [newWorkout.type, newWorkout.difficulty],
      created_by: userId,
      rating: 0,
      completed_count: 0
    };

    setWorkouts(prev => [...prev, workout]);
    setNewWorkout({
      name: '',
      description: '',
      difficulty: 'Intermediário',
      type: 'Hipertrofia',
      duration: 60,
      exercises: []
    });
    setIsCreating(false);
    toast.success('Treino criado com sucesso!');
  };

  const startWorkout = (workout: WorkoutPlan) => {
    setCurrentWorkout(workout);
    setActiveTab('active');
    toast.success('Treino iniciado! Boa sorte!');
  };

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || workout.tags.includes(filterCategory);
    const matchesDifficulty = filterDifficulty === 'all' || workout.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Planejador de Treinos</h2>
          <p className="text-muted-foreground">Crie, explore e execute treinos personalizados</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Dumbbell className="h-4 w-4" />
          Criar Treino
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Explorar</TabsTrigger>
          <TabsTrigger value="my-workouts">Meus Treinos</TabsTrigger>
          <TabsTrigger value="active">Treino Ativo</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Buscar treinos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:max-w-sm"
            />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="md:max-w-sm">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {workoutTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="md:max-w-sm">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Dificuldades</SelectItem>
                <SelectItem value="Iniciante">Iniciante</SelectItem>
                <SelectItem value="Intermediário">Intermediário</SelectItem>
                <SelectItem value="Avançado">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkouts.map(workout => (
              <Card key={workout.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{workout.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {workout.duration} min • {workout.exercises.length} exercícios
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{workout.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {workout.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {workout.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {workout.completed_count} completaram
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => startWorkout(workout)}
                      className="gap-1"
                    >
                      <Zap className="h-3 w-3" />
                      Iniciar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {currentWorkout ? (
            <WorkoutSession workout={currentWorkout} onComplete={() => setCurrentWorkout(null)} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum treino ativo</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Selecione um treino para começar sua sessão
                </p>
                <Button onClick={() => setActiveTab('browse')}>
                  Explorar Treinos
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Workout Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Treino</DialogTitle>
            <DialogDescription>
              Monte seu treino personalizado selecionando exercícios
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workout-name">Nome do Treino</Label>
                <Input
                  id="workout-name"
                  value={newWorkout.name}
                  onChange={(e) => setNewWorkout(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Treino Push Avançado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workout-type">Tipo</Label>
                <Select value={newWorkout.type} onValueChange={(value) => setNewWorkout(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workoutTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workout-description">Descrição</Label>
              <Textarea
                id="workout-description"
                value={newWorkout.description}
                onChange={(e) => setNewWorkout(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva os objetivos e características do treino"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workout-difficulty">Dificuldade</Label>
                <Select value={newWorkout.difficulty} onValueChange={(value) => setNewWorkout(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Iniciante">Iniciante</SelectItem>
                    <SelectItem value="Intermediário">Intermediário</SelectItem>
                    <SelectItem value="Avançado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workout-duration">Duração (min)</Label>
                <Input
                  id="workout-duration"
                  type="number"
                  value={newWorkout.duration}
                  onChange={(e) => setNewWorkout(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  min="15"
                  max="180"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Exercícios Selecionados ({newWorkout.exercises.length})</h4>
              {newWorkout.exercises.length > 0 ? (
                <div className="space-y-2">
                  {newWorkout.exercises.map((exercise, index) => (
                    <div key={exercise.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div>
                        <span className="font-medium">{index + 1}. {exercise.name}</span>
                        <p className="text-sm text-muted-foreground">
                          {exercise.sets} séries × {exercise.reps} reps
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeExerciseFromWorkout(exercise.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum exercício selecionado
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Banco de Exercícios ({filteredExerciseDatabase.length} exercícios)</h4>
              <div className="flex flex-col md:flex-row gap-2 mb-2">
                <Input
                  placeholder="Buscar exercício..."
                  value={exerciseSearchTerm}
                  onChange={(e) => setExerciseSearchTerm(e.target.value)}
                  className="md:max-w-xs"
                />
                <Select value={exerciseFilterMuscle} onValueChange={setExerciseFilterMuscle}>
                  <SelectTrigger className="md:max-w-[180px]">
                    <SelectValue placeholder="Grupo muscular" />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseMuscleGroups.map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={exerciseFilterType} onValueChange={setExerciseFilterType}>
                  <SelectTrigger className="md:max-w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseTypes.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {filteredExerciseDatabase.slice(0, 20).map(exercise => (
                  <div key={exercise.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-sm">{exercise.name}</h5>
                      <Badge variant="outline" className="text-xs">
                        {exercise.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {exercise.muscle_groups.join(', ')} • {exercise.equipment}
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => addExerciseToWorkout(exercise)}
                    >
                      Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
              <Button onClick={saveWorkout} disabled={!newWorkout.name || newWorkout.exercises.length === 0}>
                Salvar Treino
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Workout Session Component
function WorkoutSession({ workout, onComplete }: { workout: WorkoutPlan; onComplete: () => void }) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});

  const currentExercise = workout.exercises[currentExerciseIndex];

  useEffect(() => {
    if (isResting && restTimer > 0) {
      const timer = setTimeout(() => setRestTimer(restTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isResting && restTimer === 0) {
      setIsResting(false);
    }
  }, [isResting, restTimer]);

  const completeSet = () => {
    const key = `${currentExercise.id}-${currentSet}`;
    setCompletedSets(prev => ({ ...prev, [key]: 1 }));

    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);
      setRestTimer(currentExercise.rest_time);
      setIsResting(true);
    } else {
      // Move to next exercise
      if (currentExerciseIndex < workout.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSet(1);
      } else {
        // Workout complete
        const duration = Math.round((Date.now() - sessionStartTime) / 1000 / 60);
        toast.success(`Treino concluído em ${duration} minutos! 🎉`);
        onComplete();
      }
    }
  };

  const skipExercise = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setIsResting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{workout.name}</CardTitle>
              <CardDescription>
                Exercício {currentExerciseIndex + 1} de {workout.exercises.length}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {Math.round((Date.now() - sessionStartTime) / 1000 / 60)}min
              </div>
              <div className="text-sm text-muted-foreground">Tempo decorrido</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentExercise.name}</CardTitle>
          <div className="flex flex-wrap gap-2">
            {currentExercise.muscle_groups.map(muscle => (
              <Badge key={muscle} variant="secondary">{muscle}</Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{currentSet}</div>
              <div className="text-sm text-muted-foreground">Série Atual</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{currentExercise.sets}</div>
              <div className="text-sm text-muted-foreground">Total de Séries</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{currentExercise.reps}</div>
              <div className="text-sm text-muted-foreground">Repetições</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{currentExercise.rest_time}s</div>
              <div className="text-sm text-muted-foreground">Descanso</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Instruções:</Label>
            <p className="text-sm text-muted-foreground">
              {currentExercise.instructions}
            </p>
          </div>

          {isResting ? (
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-blue-500">
                {Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-muted-foreground">Tempo de descanso</div>
              <Button variant="outline" onClick={() => setIsResting(false)}>
                Pular Descanso
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button onClick={completeSet} className="flex-1">
                Completar Série
              </Button>
              <Button variant="outline" onClick={skipExercise}>
                Pular Exercício
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progresso do Treino</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {workout.exercises.map((exercise, index) => (
              <div key={exercise.id} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${
                  index < currentExerciseIndex ? 'bg-green-500' :
                  index === currentExerciseIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
                <span className={`text-sm ${
                  index === currentExerciseIndex ? 'font-semibold' : ''
                }`}>
                  {exercise.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
