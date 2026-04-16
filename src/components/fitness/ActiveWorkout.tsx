import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { 
  Dumbbell, Timer, CheckCircle2, SkipForward, Pause, Play, 
  ChevronLeft, ChevronRight, Trophy, Flame, X
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  equipment: string;
  difficulty: string;
  instructions: string;
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

interface SetLog {
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number;
  completed: boolean;
}

interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

interface ActiveWorkoutProps {
  workout: WorkoutPlan;
  onComplete: () => void;
  onCancel: () => void;
}

export function ActiveWorkout({ workout, onComplete, onCancel }: ActiveWorkoutProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Set logs for each exercise
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(() =>
    workout.exercises.map(ex => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      sets: Array.from({ length: ex.sets }, (_, i) => ({
        setNumber: i + 1,
        weight: 0,
        reps: parseInt(ex.reps) || 12,
        rpe: 7,
        completed: false,
      })),
    }))
  );

  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  const currentExercise = workout.exercises[currentExerciseIndex];
  const currentLog = exerciseLogs[currentExerciseIndex];
  const currentSet = currentLog?.sets[currentSetIndex];
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSets = exerciseLogs.reduce(
    (sum, log) => sum + log.sets.filter(s => s.completed).length, 0
  );

  // Elapsed time ticker
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime, isPaused]);

  // Rest timer
  useEffect(() => {
    if (!isResting || restTimer <= 0) return;
    const timer = setTimeout(() => setRestTimer(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [isResting, restTimer]);

  useEffect(() => {
    if (isResting && restTimer === 0) {
      setIsResting(false);
      toast.info('Descanso finalizado! Próxima série 💪');
    }
  }, [isResting, restTimer]);

  const updateSetField = useCallback((field: keyof SetLog, value: number) => {
    setExerciseLogs(prev => {
      const updated = [...prev];
      const log = { ...updated[currentExerciseIndex] };
      const sets = [...log.sets];
      sets[currentSetIndex] = { ...sets[currentSetIndex], [field]: value };
      log.sets = sets;
      updated[currentExerciseIndex] = log;
      return updated;
    });
  }, [currentExerciseIndex, currentSetIndex]);

  const completeSet = () => {
    setExerciseLogs(prev => {
      const updated = [...prev];
      const log = { ...updated[currentExerciseIndex] };
      const sets = [...log.sets];
      sets[currentSetIndex] = { ...sets[currentSetIndex], completed: true };
      log.sets = sets;
      updated[currentExerciseIndex] = log;
      return updated;
    });

    // Auto-fill next set with same weight
    if (currentSetIndex < currentLog.sets.length - 1) {
      const currentWeight = currentSet.weight;
      setExerciseLogs(prev => {
        const updated = [...prev];
        const log = { ...updated[currentExerciseIndex] };
        const sets = [...log.sets];
        if (sets[currentSetIndex + 1].weight === 0) {
          sets[currentSetIndex + 1] = { ...sets[currentSetIndex + 1], weight: currentWeight };
        }
        log.sets = sets;
        updated[currentExerciseIndex] = log;
        return updated;
      });
    }

    // Move to next set or exercise
    if (currentSetIndex < currentLog.sets.length - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
      setRestTimer(currentExercise.rest_time);
      setIsResting(true);
    } else if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
      setRestTimer(currentExercise.rest_time);
      setIsResting(true);
      toast.success(`${currentExercise.name} concluído! ✅`);
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = () => {
    const duration = Math.round(elapsedTime / 60);
    const totalVolume = exerciseLogs.reduce(
      (sum, log) => sum + log.sets.filter(s => s.completed).reduce((s, set) => s + set.weight * set.reps, 0), 0
    );
    toast.success(`Treino concluído em ${duration} min! Volume total: ${totalVolume}kg 🎉`);
    onComplete();
  };

  const skipExercise = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
      setIsResting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (completedSets / totalSets) * 100;

  const rpeColors: Record<number, string> = {
    6: 'bg-green-500', 7: 'bg-green-400', 8: 'bg-yellow-400',
    9: 'bg-orange-400', 10: 'bg-red-500',
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <Card className="border-primary/30">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
              <div>
                <p className="font-bold text-sm">{workout.name}</p>
                <p className="text-xs text-muted-foreground">
                  Exercício {currentExerciseIndex + 1}/{workout.exercises.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-mono text-lg font-bold">{formatTime(elapsedTime)}</p>
                <p className="text-[10px] text-muted-foreground">Tempo</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)} className="h-8 w-8">
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Progress value={progress} className="h-1.5 mt-2" />
        </CardContent>
      </Card>

      {/* Rest timer overlay */}
      <AnimatePresence>
        {isResting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6 text-center">
                <Timer className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-5xl font-mono font-bold text-primary mb-1">
                  {formatTime(restTimer)}
                </p>
                <p className="text-sm text-muted-foreground mb-4">Descansando...</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={() => setRestTimer(prev => prev + 15)}>
                    +15s
                  </Button>
                  <Button size="sm" onClick={() => { setIsResting(false); setRestTimer(0); }}>
                    Pular descanso
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setRestTimer(prev => Math.max(0, prev - 15))}>
                    -15s
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current exercise */}
      {!isResting && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{currentExercise.name}</CardTitle>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentExercise.muscle_groups.map(m => (
                    <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                  ))}
                </div>
              </div>
              <Badge variant="outline">{currentExercise.equipment}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Set tracking */}
            <div className="space-y-3">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground px-1">
                <span className="col-span-1">Série</span>
                <span className="col-span-3 text-center">Peso (kg)</span>
                <span className="col-span-3 text-center">Reps</span>
                <span className="col-span-3 text-center">RPE</span>
                <span className="col-span-2 text-center">✓</span>
              </div>

              {/* Sets */}
              {currentLog.sets.map((set, idx) => {
                const isActive = idx === currentSetIndex;
                const isDone = set.completed;
                return (
                  <motion.div
                    key={idx}
                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg transition-colors ${
                      isActive ? 'bg-primary/10 border border-primary/30' :
                      isDone ? 'bg-secondary/50 opacity-70' : 'bg-secondary/20'
                    }`}
                    animate={isActive ? { scale: [1, 1.01, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <span className={`col-span-1 text-sm font-bold ${isActive ? 'text-primary' : ''}`}>
                      {set.setNumber}
                    </span>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={set.weight || ''}
                        onChange={(e) => {
                          setCurrentSetIndex(idx);
                          updateSetField('weight', parseFloat(e.target.value) || 0);
                        }}
                        disabled={isDone}
                        className="h-8 text-center text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => {
                          setCurrentSetIndex(idx);
                          updateSetField('reps', parseInt(e.target.value) || 0);
                        }}
                        disabled={isDone}
                        className="h-8 text-center text-sm"
                        placeholder="12"
                      />
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center justify-center gap-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${rpeColors[set.rpe] || 'bg-muted'}`} />
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={set.rpe || ''}
                          onChange={(e) => {
                            setCurrentSetIndex(idx);
                            updateSetField('rpe', Math.min(10, Math.max(1, parseInt(e.target.value) || 7)));
                          }}
                          disabled={isDone}
                          className="h-8 text-center text-sm w-14"
                          placeholder="7"
                        />
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : isActive ? (
                        <Button
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setCurrentSetIndex(idx);
                            completeSet();
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button onClick={completeSet} className="flex-1 gap-2" disabled={isResting}>
                <CheckCircle2 className="h-4 w-4" />
                Completar série {currentSetIndex + 1}
              </Button>
              <Button variant="outline" onClick={skipExercise} disabled={currentExerciseIndex >= workout.exercises.length - 1}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise list progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Progresso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {workout.exercises.map((exercise, index) => {
              const log = exerciseLogs[index];
              const done = log.sets.every(s => s.completed);
              const partial = log.sets.some(s => s.completed);
              return (
                <div
                  key={exercise.id}
                  className={`flex items-center gap-2 p-2 rounded-lg text-sm cursor-pointer transition-colors ${
                    index === currentExerciseIndex ? 'bg-primary/10 font-semibold' : 'hover:bg-secondary/30'
                  }`}
                  onClick={() => { setCurrentExerciseIndex(index); setCurrentSetIndex(0); setIsResting(false); }}
                >
                  <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                    done ? 'bg-green-500' : partial ? 'bg-yellow-400' : index === currentExerciseIndex ? 'bg-primary' : 'bg-muted'
                  }`} />
                  <span className="truncate flex-1">{exercise.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {log.sets.filter(s => s.completed).length}/{exercise.sets}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Finish button */}
      {completedSets > 0 && (
        <Button variant="outline" className="w-full gap-2 border-primary/30 text-primary" onClick={finishWorkout}>
          <Trophy className="h-4 w-4" />
          Finalizar treino ({completedSets}/{totalSets} séries)
        </Button>
      )}
    </div>
  );
}
