import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Apple, Utensils, TrendingUp, Target, Plus, Search, Droplets } from 'lucide-react';
import { toast } from 'sonner';
import { foodDatabase as brazilianFoods, foodCategories, type FoodItem as BrazilianFood } from '@/data/foods';

interface Food {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g?: number;
  category: string;
}

interface FoodEntry {
  id: string;
  food: Food;
  amount: number;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: Date;
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

interface DailyNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
}

const foodDatabase: Food[] = [
  {
    id: '1',
    name: 'Peito de Frango',
    calories_per_100g: 165,
    protein_per_100g: 31,
    carbs_per_100g: 0,
    fat_per_100g: 3.6,
    category: 'Proteína'
  },
  {
    id: '2',
    name: 'Arroz Integral',
    calories_per_100g: 111,
    protein_per_100g: 2.6,
    carbs_per_100g: 22,
    fat_per_100g: 0.9,
    fiber_per_100g: 1.8,
    category: 'Carboidrato'
  },
  {
    id: '3',
    name: 'Batata Doce',
    calories_per_100g: 86,
    protein_per_100g: 1.6,
    carbs_per_100g: 20,
    fat_per_100g: 0.1,
    fiber_per_100g: 3,
    category: 'Carboidrato'
  },
  {
    id: '4',
    name: 'Aveia',
    calories_per_100g: 389,
    protein_per_100g: 16.9,
    carbs_per_100g: 66,
    fat_per_100g: 6.9,
    fiber_per_100g: 10.6,
    category: 'Carboidrato'
  },
  {
    id: '5',
    name: 'Ovo',
    calories_per_100g: 155,
    protein_per_100g: 13,
    carbs_per_100g: 1.1,
    fat_per_100g: 11,
    category: 'Proteína'
  },
  {
    id: '6',
    name: 'Salmão',
    calories_per_100g: 208,
    protein_per_100g: 25,
    carbs_per_100g: 0,
    fat_per_100g: 12,
    category: 'Proteína'
  },
  {
    id: '7',
    name: 'Banana',
    calories_per_100g: 89,
    protein_per_100g: 1.1,
    carbs_per_100g: 23,
    fat_per_100g: 0.3,
    fiber_per_100g: 2.6,
    category: 'Fruta'
  },
  {
    id: '8',
    name: 'Amendoim',
    calories_per_100g: 567,
    protein_per_100g: 26,
    carbs_per_100g: 16,
    fat_per_100g: 49,
    category: 'Gordura'
  }
];

export function NutritionTracker({ userId }: { userId: string }) {
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [amount, setAmount] = useState(100);
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [waterIntake, setWaterIntake] = useState(0);
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [nutritionGoals] = useState<NutritionGoals>({
    calories: 2500,
    protein: 150,
    carbs: 300,
    fat: 83,
    water: 3000 // ml
  });

  const calculateDailyNutrition = (): DailyNutrition => {
    const today = new Date().toDateString();
    const todayEntries = foodEntries.filter(entry => entry.timestamp.toDateString() === today);

    return todayEntries.reduce((total, entry) => {
      const multiplier = entry.amount / 100;
      return {
        calories: total.calories + (entry.food.calories_per_100g * multiplier),
        protein: total.protein + (entry.food.protein_per_100g * multiplier),
        carbs: total.carbs + (entry.food.carbs_per_100g * multiplier),
        fat: total.fat + (entry.food.fat_per_100g * multiplier),
        fiber: total.fiber + ((entry.food.fiber_per_100g || 0) * multiplier),
        water: waterIntake
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: waterIntake });
  };

  const dailyNutrition = calculateDailyNutrition();

  const addFoodEntry = () => {
    if (!selectedFood) return;

    const entry: FoodEntry = {
      id: Date.now().toString(),
      food: selectedFood,
      amount: amount,
      meal: selectedMeal,
      timestamp: new Date()
    };

    setFoodEntries(prev => [...prev, entry]);
    setSelectedFood(null);
    setAmount(100);
    setIsAddingFood(false);
    toast.success('Alimento adicionado!');
  };

  const addWater = (ml: number) => {
    setWaterIntake(prev => prev + ml);
    toast.success(`${ml}ml de água adicionados!`);
  };

  const getMealEntries = (meal: string) => {
    const today = new Date().toDateString();
    return foodEntries.filter(entry => 
      entry.meal === meal && entry.timestamp.toDateString() === today
    );
  };

  const getMealNutrition = (meal: string) => {
    const entries = getMealEntries(meal);
    return entries.reduce((total, entry) => {
      const multiplier = entry.amount / 100;
      return {
        calories: total.calories + (entry.food.calories_per_100g * multiplier),
        protein: total.protein + (entry.food.protein_per_100g * multiplier),
        carbs: total.carbs + (entry.food.carbs_per_100g * multiplier),
        fat: total.fat + (entry.food.fat_per_100g * multiplier)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const filteredFoods = foodDatabase.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const MacroCard = ({ title, current, goal, unit, color }: {
    title: string;
    current: number;
    goal: number;
    unit: string;
    color: string;
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-sm text-muted-foreground">
            {current.toFixed(1)}/{goal}{unit}
          </span>
        </div>
        <Progress 
          value={(current / goal) * 100} 
          className="h-2"
          style={{ 
            backgroundColor: `${color}20`,
          }}
        />
        <div className="text-xs text-muted-foreground mt-1">
          {((current / goal) * 100).toFixed(1)}% da meta
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Nutrição</h2>
          <p className="text-muted-foreground">Acompanhe sua alimentação e metas nutricionais</p>
        </div>
        <Button onClick={() => setIsAddingFood(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Alimento
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumo</TabsTrigger>
          <TabsTrigger value="meals">Refeições</TabsTrigger>
          <TabsTrigger value="water">Hidratação</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MacroCard
              title="Calorias"
              current={dailyNutrition.calories}
              goal={nutritionGoals.calories}
              unit="kcal"
              color="#3b82f6"
            />
            <MacroCard
              title="Proteína"
              current={dailyNutrition.protein}
              goal={nutritionGoals.protein}
              unit="g"
              color="#10b981"
            />
            <MacroCard
              title="Carboidratos"
              current={dailyNutrition.carbs}
              goal={nutritionGoals.carbs}
              unit="g"
              color="#f59e0b"
            />
            <MacroCard
              title="Gorduras"
              current={dailyNutrition.fat}
              goal={nutritionGoals.fat}
              unit="g"
              color="#ef4444"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Distribuição de Macros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-500">
                      {((dailyNutrition.protein * 4 / dailyNutrition.calories) * 100 || 0).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Proteína</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-500">
                      {((dailyNutrition.carbs * 4 / dailyNutrition.calories) * 100 || 0).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Carboidratos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-500">
                      {((dailyNutrition.fat * 9 / dailyNutrition.calories) * 100 || 0).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Gorduras</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meals" className="space-y-4">
          {['breakfast', 'lunch', 'dinner', 'snack'].map(meal => {
            const mealNames = {
              breakfast: 'Café da Manhã',
              lunch: 'Almoço',
              dinner: 'Jantar',
              snack: 'Lanche'
            };
            
            const entries = getMealEntries(meal);
            const nutrition = getMealNutrition(meal);

            return (
              <Card key={meal}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{mealNames[meal as keyof typeof mealNames]}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {nutrition.calories.toFixed(0)} kcal
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {entries.length > 0 ? (
                    <div className="space-y-2">
                      {entries.map(entry => (
                        <div key={entry.id} className="flex justify-between items-center p-2 bg-secondary rounded">
                          <div>
                            <span className="font-medium">{entry.food.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {entry.amount}g
                            </span>
                          </div>
                          <div className="text-sm">
                            {((entry.food.calories_per_100g * entry.amount) / 100).toFixed(0)} kcal
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span>Total:</span>
                        <span>
                          {nutrition.calories.toFixed(0)} kcal | 
                          P: {nutrition.protein.toFixed(1)}g | 
                          C: {nutrition.carbs.toFixed(1)}g | 
                          G: {nutrition.fat.toFixed(1)}g
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum alimento adicionado
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="water" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Hidratação Diária
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-500 mb-2">
                  {waterIntake}ml
                </div>
                <div className="text-muted-foreground">
                  Meta: {nutritionGoals.water}ml
                </div>
                <Progress 
                  value={(waterIntake / nutritionGoals.water) * 100} 
                  className="mt-4"
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => addWater(250)}
                  className="flex-col h-16"
                >
                  <span className="text-xs">Copo</span>
                  <span className="font-bold">250ml</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => addWater(500)}
                  className="flex-col h-16"
                >
                  <span className="text-xs">Garrafa</span>
                  <span className="font-bold">500ml</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => addWater(750)}
                  className="flex-col h-16"
                >
                  <span className="text-xs">Garrafa G</span>
                  <span className="font-bold">750ml</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => addWater(1000)}
                  className="flex-col h-16"
                >
                  <span className="text-xs">Litro</span>
                  <span className="font-bold">1000ml</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Food Dialog */}
      <Dialog open={isAddingFood} onOpenChange={setIsAddingFood}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Alimento</DialogTitle>
            <DialogDescription>
              Busque e adicione alimentos às suas refeições
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label>Buscar Alimento</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Digite o nome do alimento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48 space-y-2">
                <Label>Categoria</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {foodCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {filteredFoods.map(food => (
                <div 
                  key={food.id} 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFood?.id === food.id ? 'border-primary bg-primary/5' : 'hover:bg-secondary'
                  }`}
                  onClick={() => setSelectedFood(food)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium">{food.name}</h4>
                    <Badge variant="outline">{food.category}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground grid grid-cols-2 gap-1">
                    <span>{food.calories_per_100g} kcal/100g</span>
                    <span>P: {food.protein_per_100g}g</span>
                    <span>C: {food.carbs_per_100g}g</span>
                    <span>G: {food.fat_per_100g}g</span>
                  </div>
                </div>
              ))}
            </div>

            {selectedFood && (
              <div className="space-y-4 p-4 border rounded-lg bg-secondary/50">
                <h4 className="font-semibold">{selectedFood.name}</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantidade (g)</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min="1"
                      max="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Refeição</Label>
                    <select 
                      value={selectedMeal} 
                      onChange={(e) => setSelectedMeal(e.target.value as any)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="breakfast">Café da Manhã</option>
                      <option value="lunch">Almoço</option>
                      <option value="dinner">Jantar</option>
                      <option value="snack">Lanche</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div>
                    <div className="font-bold">
                      {((selectedFood.calories_per_100g * amount) / 100).toFixed(0)}
                    </div>
                    <div className="text-muted-foreground">kcal</div>
                  </div>
                  <div>
                    <div className="font-bold">
                      {((selectedFood.protein_per_100g * amount) / 100).toFixed(1)}
                    </div>
                    <div className="text-muted-foreground">Proteína</div>
                  </div>
                  <div>
                    <div className="font-bold">
                      {((selectedFood.carbs_per_100g * amount) / 100).toFixed(1)}
                    </div>
                    <div className="text-muted-foreground">Carboidratos</div>
                  </div>
                  <div>
                    <div className="font-bold">
                      {((selectedFood.fat_per_100g * amount) / 100).toFixed(1)}
                    </div>
                    <div className="text-muted-foreground">Gorduras</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddingFood(false)}>
                Cancelar
              </Button>
              <Button onClick={addFoodEntry} disabled={!selectedFood}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
