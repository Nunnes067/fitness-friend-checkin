
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dumbbell, Plus, Trash2, Save, ChevronDown, ChevronUp, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: string;
  category: string;
}

export function WorkoutForm() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Predefined categories
  const categories = [
    { id: 'peito', name: 'Peito' },
    { id: 'costas', name: 'Costas' },
    { id: 'pernas', name: 'Pernas' },
    { id: 'ombros', name: 'Ombros' },
    { id: 'biceps', name: 'Bíceps' },
    { id: 'triceps', name: 'Tríceps' },
    { id: 'abdomen', name: 'Abdômen' },
    { id: 'cardio', name: 'Cardio' },
    { id: 'outro', name: 'Outro' }
  ];
  
  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: 3,
      reps: 10,
      weight: '',
      category: 'outro',
    };
    
    setExercises([...exercises, newExercise]);
  };
  
  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };
  
  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };
  
  const toggleCategory = (category: string) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
  };
  
  const saveWorkout = async () => {
    if (!workoutName.trim()) {
      toast.error('Digite um nome para o treino');
      return;
    }
    
    if (exercises.length === 0) {
      toast.error('Adicione pelo menos um exercício');
      return;
    }
    
    // Validate exercises
    for (const ex of exercises) {
      if (!ex.name.trim()) {
        toast.error('Todos os exercícios precisam ter um nome');
        return;
      }
    }
    
    setIsSaving(true);
    
    try {
      // Here we would save to Supabase Database
      // For now just simulate the save process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Treino salvo com sucesso!');
      setWorkoutName('');
      setExercises([]);
      
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
      toast.error('Erro ao salvar o treino');
    } finally {
      setIsSaving(false);
    }
  };

  // Group exercises by category
  const exercisesByCategory = exercises.reduce((acc, exercise) => {
    const category = exercise.category || 'outro';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);
  
  return (
    <Card className="glass-card w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Meu Treino</CardTitle>
          <Dumbbell className="h-5 w-5 text-primary" />
        </div>
        <CardDescription>
          Crie e salve seus treinos personalizados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Nome do Treino (ex: Treino A - Peito e Tríceps)"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
          />
        </div>
        
        <ScrollArea className="h-[250px] pr-4">
          <AnimatePresence>
            {Object.keys(exercisesByCategory).length > 0 ? (
              Object.entries(exercisesByCategory).map(([category, categoryExercises]) => {
                const categoryInfo = categories.find(c => c.id === category) || { id: category, name: category };
                const isExpanded = expandedCategory === category;
                
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4"
                  >
                    <div 
                      className="bg-secondary/50 backdrop-blur-sm rounded-t-lg p-3 flex items-center justify-between cursor-pointer"
                      onClick={() => toggleCategory(category)}
                    >
                      <div className="flex items-center">
                        <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">{categoryInfo.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {categoryExercises.length}
                        </Badge>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          {categoryExercises.map((exercise, index) => (
                            <motion.div
                              key={exercise.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="bg-secondary/30 p-3 border-t border-border/10"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium">Exercício {index + 1}</div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeExercise(exercise.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                              
                              <div className="space-y-2">
                                <Input
                                  placeholder="Nome do exercício"
                                  value={exercise.name}
                                  onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                                />
                                
                                <div className="grid grid-cols-4 gap-2">
                                  <div className="col-span-1">
                                    <div className="text-xs text-muted-foreground mb-1">Séries</div>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={exercise.sets}
                                      onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value) || 1)}
                                    />
                                  </div>
                                  <div className="col-span-1">
                                    <div className="text-xs text-muted-foreground mb-1">Repetições</div>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={exercise.reps}
                                      onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value) || 1)}
                                    />
                                  </div>
                                  <div className="col-span-1">
                                    <div className="text-xs text-muted-foreground mb-1">Peso (kg)</div>
                                    <Input
                                      value={exercise.weight}
                                      onChange={(e) => updateExercise(exercise.id, 'weight', e.target.value)}
                                      placeholder="Peso"
                                    />
                                  </div>
                                  <div className="col-span-1">
                                    <div className="text-xs text-muted-foreground mb-1">Categoria</div>
                                    <Select
                                      value={exercise.category}
                                      onValueChange={(value) => updateExercise(exercise.id, 'category', value)}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Categoria" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {categories.map((cat) => (
                                          <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Comece adicionando um exercício ao seu treino
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
        
        <div className="pt-2">
          <Button
            variant="outline"
            onClick={addExercise}
            className="w-full flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Exercício
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={saveWorkout}
          disabled={isSaving || exercises.length === 0 || !workoutName}
        >
          {isSaving ? (
            <>
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-current rounded-full" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Treino
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
