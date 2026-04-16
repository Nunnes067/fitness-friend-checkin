import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Dumbbell, Target, ChevronRight, Info, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  exerciseDatabase,
  muscleGroups,
  exerciseTypes,
  equipmentTypes,
} from '@/data/exercises';

// Enhanced exercise data with instructions and tips
const exerciseDetails: Record<string, { instructions: string; tips: string[]; primaryMuscles: string[]; secondaryMuscles: string[] }> = {
  'agachamento-livre': {
    instructions: 'Posicione a barra nas costas (trapézio), pés na largura dos ombros. Desça controladamente flexionando quadris e joelhos até as coxas ficarem paralelas ao chão. Empurre o chão para subir mantendo o peito ereto.',
    tips: ['Mantenha os joelhos alinhados com os pés', 'Não deixe os joelhos passarem muito à frente', 'Core ativado durante todo o movimento', 'Olhe para frente, não para baixo'],
    primaryMuscles: ['Quadríceps', 'Glúteos'],
    secondaryMuscles: ['Isquiotibiais', 'Core', 'Eretores da coluna'],
  },
  'supino-reto-barra': {
    instructions: 'Deite no banco reto, pegue a barra com pegada na largura dos ombros. Desça a barra controladamente até o meio do peito e empurre para cima até estender os braços.',
    tips: ['Escápulas retraídas e deprimidas', 'Pés firmes no chão', 'Não quique a barra no peito', 'Mantenha os cotovelos a ~45° do corpo'],
    primaryMuscles: ['Peitoral maior'],
    secondaryMuscles: ['Tríceps', 'Deltóide anterior'],
  },
  'levantamento-terra': {
    instructions: 'Pés na largura dos quadris, barra sobre o meio dos pés. Agache, segure a barra, peito alto, costas retas. Empurre o chão com os pés e estenda quadris e joelhos simultaneamente.',
    tips: ['Mantenha a barra próxima ao corpo', 'Não arredonde as costas', 'Ative o core antes de puxar', 'Trave o glúteo no topo'],
    primaryMuscles: ['Posterior da coxa', 'Glúteos', 'Eretores'],
    secondaryMuscles: ['Quadríceps', 'Core', 'Trapézio', 'Antebraços'],
  },
  'rosca-direta': {
    instructions: 'Em pé, segure a barra com pegada supinada (palmas para cima) na largura dos ombros. Flexione os cotovelos levando a barra até os ombros, depois desça controladamente.',
    tips: ['Cotovelos fixos ao lado do corpo', 'Não balance o tronco', 'Controle a fase excêntrica (descida)', 'Contraia o bíceps no topo'],
    primaryMuscles: ['Bíceps braquial'],
    secondaryMuscles: ['Braquial', 'Braquiorradial'],
  },
  'triceps-pulley': {
    instructions: 'Em pé de frente para o cabo, segure a barra/corda com os cotovelos flexionados. Estenda os cotovelos empurrando para baixo até os braços estarem retos. Retorne controladamente.',
    tips: ['Cotovelos fixos ao lado do corpo', 'Apenas o antebraço se move', 'Contraia o tríceps no final', 'Não use impulso do corpo'],
    primaryMuscles: ['Tríceps'],
    secondaryMuscles: ['Antebraços'],
  },
  'pulldown': {
    instructions: 'Sentado na máquina, segure a barra larga com pegada pronada. Puxe a barra até a altura do queixo/peito, contraindo as escápulas. Retorne controladamente.',
    tips: ['Não puxe atrás da cabeça', 'Contraia as escápulas', 'Incline levemente o tronco para trás', 'Foque em puxar com os cotovelos'],
    primaryMuscles: ['Latíssimo do dorso'],
    secondaryMuscles: ['Bíceps', 'Romboides', 'Trapézio inferior'],
  },
  'desenvolvimento-militar': {
    instructions: 'Em pé ou sentado, segure a barra na altura dos ombros com pegada pronada. Empurre a barra para cima até estender os braços completamente. Desça controladamente.',
    tips: ['Core ativado para estabilizar', 'Não hiperextenda a lombar', 'Cotovelos ligeiramente à frente da barra', 'Expire ao empurrar'],
    primaryMuscles: ['Deltóide anterior', 'Deltóide lateral'],
    secondaryMuscles: ['Tríceps', 'Trapézio', 'Core'],
  },
  'leg-press-45': {
    instructions: 'Sente-se na máquina com os pés na plataforma na largura dos ombros. Solte as travas e desça a plataforma flexionando os joelhos até ~90°. Empurre para cima sem travar os joelhos.',
    tips: ['Não trave os joelhos no topo', 'Mantenha as costas apoiadas', 'Pés mais altos = mais glúteo/posterior', 'Pés mais baixos = mais quadríceps'],
    primaryMuscles: ['Quadríceps', 'Glúteos'],
    secondaryMuscles: ['Isquiotibiais', 'Panturrilhas'],
  },
  'barra-fixa': {
    instructions: 'Segure a barra com pegada pronada, mãos afastadas além da largura dos ombros. Puxe o corpo para cima até o queixo ultrapassar a barra. Desça controladamente.',
    tips: ['Escápulas retraídas e deprimidas', 'Não balance o corpo (kipping)', 'Se não conseguir, use elástico', 'Foque em puxar com os cotovelos'],
    primaryMuscles: ['Latíssimo do dorso', 'Bíceps'],
    secondaryMuscles: ['Romboides', 'Trapézio', 'Core'],
  },
  'prancha': {
    instructions: 'Apoie antebraços e ponta dos pés no chão, corpo reto da cabeça aos pés. Mantenha o core contraído e respire normalmente. Segure a posição pelo tempo determinado.',
    tips: ['Não deixe o quadril cair', 'Não eleve demais o quadril', 'Contraia glúteos e abdômen', 'Olhe para o chão, pescoço neutro'],
    primaryMuscles: ['Reto abdominal', 'Transverso'],
    secondaryMuscles: ['Oblíquos', 'Eretores', 'Deltóides'],
  },
};

// Simplified muscle group categories for filtering
const mainMuscleCategories = [
  'Todos',
  'Pernas',
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Abdômen',
  'Cardio',
  'Corpo inteiro',
  'Glúteos',
];

const difficultyMap: Record<string, string> = {
  'Musculação': 'Intermediário',
  'Máquina': 'Iniciante',
  'Funcional': 'Intermediário',
  'Calistenia': 'Iniciante',
  'Cardio': 'Iniciante',
  'Crossover': 'Intermediário',
  'Luta': 'Avançado',
  'Capoeira': 'Avançado',
};

export function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('Todos');
  const [filterType, setFilterType] = useState('Todos');
  const [selectedExercise, setSelectedExercise] = useState<typeof exerciseDatabase[0] | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredExercises = useMemo(() => {
    return exerciseDatabase.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.equipment.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMuscle = filterMuscle === 'Todos' || ex.muscleGroup.includes(filterMuscle);
      const matchesType = filterType === 'Todos' || ex.type === filterType;
      return matchesSearch && matchesMuscle && matchesType;
    });
  }, [searchTerm, filterMuscle, filterType]);

  const groupedExercises = useMemo(() => {
    const groups: Record<string, typeof exerciseDatabase> = {};
    filteredExercises.forEach(ex => {
      const key = ex.muscleGroup;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ex);
    });
    return groups;
  }, [filteredExercises]);

  const details = selectedExercise ? exerciseDetails[selectedExercise.id] : null;
  const difficulty = selectedExercise ? difficultyMap[selectedExercise.type] || 'Intermediário' : '';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Biblioteca de Exercícios</h2>
        <p className="text-muted-foreground text-sm">{exerciseDatabase.length} exercícios disponíveis</p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar exercício, músculo ou equipamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterMuscle} onValueChange={setFilterMuscle}>
                <SelectTrigger className="sm:max-w-[200px]">
                  <SelectValue placeholder="Grupo muscular" />
                </SelectTrigger>
                <SelectContent>
                  {mainMuscleCategories.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="sm:max-w-[200px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseTypes.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(filterMuscle !== 'Todos' || filterType !== 'Todos') && (
                <Button variant="ghost" size="sm" onClick={() => { setFilterMuscle('Todos'); setFilterType('Todos'); }}>
                  Limpar filtros
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick muscle group chips */}
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {mainMuscleCategories.map(cat => (
            <Badge
              key={cat}
              variant={filterMuscle === cat ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap shrink-0"
              onClick={() => setFilterMuscle(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </ScrollArea>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredExercises.length} exercício{filteredExercises.length !== 1 ? 's' : ''} encontrado{filteredExercises.length !== 1 ? 's' : ''}
      </p>

      {/* Exercise list grouped by muscle */}
      <div className="space-y-6">
        {Object.entries(groupedExercises).map(([group, exercises]) => (
          <div key={group}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
              <Target className="h-3.5 w-3.5" />
              {group} ({exercises.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {exercises.map((exercise, idx) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  <Card
                    className="cursor-pointer hover:bg-secondary/50 transition-colors border-border/50"
                    onClick={() => setSelectedExercise(exercise)}
                  >
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Dumbbell className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{exercise.name}</p>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {exercise.type}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{exercise.equipment}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Nenhum exercício encontrado</p>
            <Button variant="link" onClick={() => { setSearchTerm(''); setFilterMuscle('Todos'); setFilterType('Todos'); }}>
              Limpar busca
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Exercise detail dialog */}
      <Dialog open={!!selectedExercise} onOpenChange={(open) => !open && setSelectedExercise(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              {selectedExercise?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedExercise && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>{selectedExercise.muscleGroup}</Badge>
                <Badge variant="outline">{selectedExercise.type}</Badge>
                <Badge variant="secondary">{selectedExercise.equipment}</Badge>
                <Badge variant={difficulty === 'Iniciante' ? 'default' : difficulty === 'Avançado' ? 'destructive' : 'secondary'}>
                  {difficulty}
                </Badge>
              </div>

              {details ? (
                <>
                  <div>
                    <h4 className="font-semibold text-sm mb-1.5 flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-primary" />
                      Como executar
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{details.instructions}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-1.5">💡 Dicas</h4>
                    <ul className="space-y-1">
                      {details.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h4 className="font-semibold text-xs text-muted-foreground mb-1">MÚSCULOS PRIMÁRIOS</h4>
                      <div className="flex flex-wrap gap-1">
                        {details.primaryMuscles.map(m => (
                          <Badge key={m} variant="default" className="text-xs">{m}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-muted-foreground mb-1">MÚSCULOS SECUNDÁRIOS</h4>
                      <div className="flex flex-wrap gap-1">
                        {details.secondaryMuscles.map(m => (
                          <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <h4 className="font-semibold text-sm mb-1.5 flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-primary" />
                    Instruções
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Execute o exercício <strong>{selectedExercise.name}</strong> com foco no grupo muscular <strong>{selectedExercise.muscleGroup}</strong>.
                    Utilize equipamento: <strong>{selectedExercise.equipment}</strong>.
                    Mantenha a postura correta e controle o movimento em todas as fases.
                  </p>
                </div>
              )}

              <Card className="bg-secondary/30">
                <CardContent className="p-3">
                  <h4 className="font-semibold text-xs text-muted-foreground mb-2">SUGESTÃO DE SÉRIES</h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold">3-4</p>
                      <p className="text-xs text-muted-foreground">Séries</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">8-12</p>
                      <p className="text-xs text-muted-foreground">Repetições</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">60-90s</p>
                      <p className="text-xs text-muted-foreground">Descanso</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
