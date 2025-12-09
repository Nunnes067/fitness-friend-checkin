import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Droplets, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { foodDatabase, foodCategories } from '@/data/foods';

interface FoodEntry {
  id: string;
  foodId: string;
  name: string;
  amount: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export function NutritionTracker({ userId }: { userId: string }) {
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [amount, setAmount] = useState(100);
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [waterIntake, setWaterIntake] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const goals = { calories: 2500, protein: 150, carbs: 300, fat: 83, water: 3000 };

  const selectedFood = selectedFoodId ? foodDatabase.find(f => f.id === selectedFoodId) : null;

  const filteredFoods = foodDatabase.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const dailyTotals = foodEntries.reduce((acc, entry) => ({
    calories: acc.calories + entry.calories,
    protein: acc.protein + entry.protein,
    carbs: acc.carbs + entry.carbs,
    fat: acc.fat + entry.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const addFood = () => {
    if (!selectedFood) return;

    const multiplier = amount / 100;
    const entry: FoodEntry = {
      id: Date.now().toString(),
      foodId: selectedFood.id,
      name: selectedFood.name,
      amount,
      calories: selectedFood.calories * multiplier,
      protein: selectedFood.protein * multiplier,
      carbs: selectedFood.carbs * multiplier,
      fat: selectedFood.fat * multiplier,
      meal: selectedMeal,
    };

    setFoodEntries(prev => [...prev, entry]);
    setSelectedFoodId(null);
    setAmount(100);
    setIsDialogOpen(false);
    toast.success(`${selectedFood.name} adicionado!`);
  };

  const removeEntry = (id: string) => {
    setFoodEntries(prev => prev.filter(e => e.id !== id));
    toast.success('Alimento removido');
  };

  const addWater = (ml: number) => {
    setWaterIntake(prev => prev + ml);
    toast.success(`+${ml}ml de água`);
  };

  const mealNames = {
    breakfast: 'Café da Manhã',
    lunch: 'Almoço', 
    dinner: 'Jantar',
    snack: 'Lanche'
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Nutrição</h2>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </div>

      {/* Resumo do Dia */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Calorias</div>
            <div className="text-lg font-bold">{dailyTotals.calories.toFixed(0)}</div>
            <Progress value={(dailyTotals.calories / goals.calories) * 100} className="h-1 mt-1" />
            <div className="text-xs text-muted-foreground">/{goals.calories} kcal</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Proteína</div>
            <div className="text-lg font-bold text-green-500">{dailyTotals.protein.toFixed(0)}g</div>
            <Progress value={(dailyTotals.protein / goals.protein) * 100} className="h-1 mt-1" />
            <div className="text-xs text-muted-foreground">/{goals.protein}g</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Carboidratos</div>
            <div className="text-lg font-bold text-orange-500">{dailyTotals.carbs.toFixed(0)}g</div>
            <Progress value={(dailyTotals.carbs / goals.carbs) * 100} className="h-1 mt-1" />
            <div className="text-xs text-muted-foreground">/{goals.carbs}g</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Gorduras</div>
            <div className="text-lg font-bold text-red-500">{dailyTotals.fat.toFixed(0)}g</div>
            <Progress value={(dailyTotals.fat / goals.fat) * 100} className="h-1 mt-1" />
            <div className="text-xs text-muted-foreground">/{goals.fat}g</div>
          </CardContent>
        </Card>
      </div>

      {/* Água */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Água</span>
            </div>
            <span className="text-sm">{waterIntake}ml / {goals.water}ml</span>
          </div>
          <Progress value={(waterIntake / goals.water) * 100} className="h-2 mb-2" />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => addWater(250)}>+250ml</Button>
            <Button variant="outline" size="sm" onClick={() => addWater(500)}>+500ml</Button>
            <Button variant="outline" size="sm" onClick={() => addWater(1000)}>+1L</Button>
          </div>
        </CardContent>
      </Card>

      {/* Refeições */}
      {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(meal => {
        const entries = foodEntries.filter(e => e.meal === meal);
        if (entries.length === 0) return null;
        
        return (
          <Card key={meal}>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-sm">{mealNames[meal]}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {entries.map(entry => (
                <div key={entry.id} className="flex items-center justify-between bg-secondary/50 rounded p-2">
                  <div>
                    <div className="font-medium text-sm">{entry.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {entry.amount}g • {entry.calories.toFixed(0)} kcal
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {foodEntries.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Nenhum alimento adicionado hoje. Clique em "Adicionar" para começar.
          </CardContent>
        </Card>
      )}

      {/* Dialog para adicionar alimento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Adicionar Alimento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar alimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {foodCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs text-muted-foreground">
              {filteredFoods.length} alimentos encontrados
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 min-h-0 max-h-48">
              {filteredFoods.map(food => (
                <div
                  key={food.id}
                  onClick={() => setSelectedFoodId(food.id)}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    selectedFoodId === food.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{food.name}</span>
                    <Badge variant="outline" className="text-xs">{food.category}</Badge>
                  </div>
                  <div className="text-xs opacity-80">
                    {food.calories} kcal | P:{food.protein}g | C:{food.carbs}g | G:{food.fat}g
                  </div>
                </div>
              ))}
            </div>

            {selectedFood && (
              <div className="border-t pt-3 space-y-3">
                <div className="font-medium">{selectedFood.name}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Quantidade (g)</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Refeição</Label>
                    <Select value={selectedMeal} onValueChange={(v: any) => setSelectedMeal(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Café da Manhã</SelectItem>
                        <SelectItem value="lunch">Almoço</SelectItem>
                        <SelectItem value="dinner">Jantar</SelectItem>
                        <SelectItem value="snack">Lanche</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="text-sm bg-secondary p-2 rounded">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="font-bold">{(selectedFood.calories * amount / 100).toFixed(0)}</div>
                      <div className="text-xs text-muted-foreground">kcal</div>
                    </div>
                    <div>
                      <div className="font-bold text-green-500">{(selectedFood.protein * amount / 100).toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">prot</div>
                    </div>
                    <div>
                      <div className="font-bold text-orange-500">{(selectedFood.carbs * amount / 100).toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">carb</div>
                    </div>
                    <div>
                      <div className="font-bold text-red-500">{(selectedFood.fat * amount / 100).toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">gord</div>
                    </div>
                  </div>
                </div>
                <Button onClick={addFood} className="w-full">
                  Adicionar {selectedFood.name}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
