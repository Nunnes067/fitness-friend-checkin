
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Apple, Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type Meal = {
  id: string;
  name: string;
  foods: FoodItem[];
};

type FoodItem = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
};

type MealPlan = {
  id: string;
  name: string;
  targetCalories: number;
  meals: Meal[];
};

// Lista de alimentos pré-definidos
const commonFoods: Omit<FoodItem, 'id' | 'quantity'>[] = [
  { name: 'Frango (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Arroz branco cozido (100g)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Ovo (unidade)', calories: 72, protein: 6.3, carbs: 0.6, fat: 5 },
  { name: 'Batata doce (100g)', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: 'Brócolis (100g)', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { name: 'Azeite (1 colher sopa)', calories: 119, protein: 0, carbs: 0, fat: 13.5 },
  { name: 'Aveia (30g)', calories: 110, protein: 4, carbs: 19, fat: 2 },
  { name: 'Whey Protein (30g)', calories: 120, protein: 24, carbs: 3, fat: 1.5 },
  { name: 'Pão integral (fatia)', calories: 70, protein: 3.5, carbs: 12, fat: 1 },
  { name: 'Banana (unidade média)', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
];

// Templates de planos de refeição
const mealPlanTemplates: { [key: string]: { name: string, meals: string[] } } = {
  cutting: { 
    name: 'Definição', 
    meals: ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar'] 
  },
  maintenance: { 
    name: 'Manutenção', 
    meals: ['Café da manhã', 'Almoço', 'Lanche', 'Jantar'] 
  },
  bulking: { 
    name: 'Ganho de Massa', 
    meals: ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar', 'Ceia'] 
  },
};

export function MealPlanner() {
  const [activePlan, setActivePlan] = useState<MealPlan | null>(null);
  const [activeTab, setActiveTab] = useState<string>('create');
  const [planName, setPlanName] = useState<string>('Meu Plano');
  const [targetCalories, setTargetCalories] = useState<number>(2000);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('maintenance');
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<string>('');
  const [foodQuantity, setFoodQuantity] = useState<number>(1);
  
  // Função para gerar ID único
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Criar um novo plano de refeição
  const createNewPlan = () => {
    const template = mealPlanTemplates[selectedTemplate];
    
    if (!template) {
      toast.error('Template inválido');
      return;
    }
    
    const meals: Meal[] = template.meals.map(mealName => ({
      id: generateId(),
      name: mealName,
      foods: []
    }));
    
    const newPlan: MealPlan = {
      id: generateId(),
      name: planName || `Plano ${template.name}`,
      targetCalories,
      meals
    };
    
    setActivePlan(newPlan);
    setSelectedMeal(meals[0].id);
    setActiveTab('edit');
    
    toast.success('Plano criado', {
      description: `${newPlan.name} foi criado com sucesso.`
    });
  };

  // Adicionar alimento à refeição
  const addFoodToMeal = () => {
    if (!activePlan || !selectedMeal || !selectedFood || foodQuantity <= 0) {
      toast.error('Selecione uma refeição e um alimento válido');
      return;
    }
    
    const food = commonFoods.find(f => f.name === selectedFood);
    if (!food) return;
    
    const newFood: FoodItem = {
      id: generateId(),
      name: food.name,
      calories: food.calories * foodQuantity,
      protein: food.protein * foodQuantity,
      carbs: food.carbs * foodQuantity,
      fat: food.fat * foodQuantity,
      quantity: foodQuantity
    };
    
    const updatedMeals = activePlan.meals.map(meal => {
      if (meal.id === selectedMeal) {
        return {
          ...meal,
          foods: [...meal.foods, newFood]
        };
      }
      return meal;
    });
    
    setActivePlan({
      ...activePlan,
      meals: updatedMeals
    });
    
    toast.success('Alimento adicionado', {
      description: `${newFood.name} adicionado à refeição`
    });
  };

  // Remover alimento da refeição
  const removeFoodFromMeal = (mealId: string, foodId: string) => {
    if (!activePlan) return;
    
    const updatedMeals = activePlan.meals.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          foods: meal.foods.filter(food => food.id !== foodId)
        };
      }
      return meal;
    });
    
    setActivePlan({
      ...activePlan,
      meals: updatedMeals
    });
    
    toast.success('Alimento removido', {
      description: 'Item removido da refeição'
    });
  };

  // Calcular totais do plano
  const calculateTotals = () => {
    if (!activePlan) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    return activePlan.meals.reduce((totals, meal) => {
      meal.foods.forEach(food => {
        totals.calories += food.calories;
        totals.protein += food.protein;
        totals.carbs += food.carbs;
        totals.fat += food.fat;
      });
      return totals;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const totals = calculateTotals();
  const caloriePercentage = activePlan ? Math.round((totals.calories / activePlan.targetCalories) * 100) : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Apple className="h-5 w-5 mr-2 text-primary" />
          Planejador de Refeições
        </CardTitle>
        <CardDescription>
          Organize sua alimentação de acordo com seus objetivos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="create">Criar Plano</TabsTrigger>
            <TabsTrigger value="edit" disabled={!activePlan}>Editar Plano</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="planName">Nome do Plano</Label>
              <Input
                id="planName"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Ex: Meu Plano Semanal"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetCalories">Calorias Diárias Alvo</Label>
              <Input
                id="targetCalories"
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template">Modelo de Plano</Label>
              <Select
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
              >
                <SelectTrigger id="template">
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cutting">Definição (5 refeições)</SelectItem>
                  <SelectItem value="maintenance">Manutenção (4 refeições)</SelectItem>
                  <SelectItem value="bulking">Ganho de Massa (6 refeições)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button className="w-full" onClick={createNewPlan}>
              Criar Novo Plano
            </Button>
          </TabsContent>
          
          <TabsContent value="edit">
            {activePlan && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-medium">{activePlan.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    Meta: {activePlan.targetCalories} cal
                  </div>
                </div>
                
                <div className="p-4 bg-secondary/20 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span>Progresso calórico:</span>
                    <span className={caloriePercentage > 100 ? "text-red-500 font-bold" : "font-bold"}>
                      {totals.calories} / {activePlan.targetCalories} cal ({caloriePercentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-secondary/40 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${caloriePercentage > 100 ? "bg-red-500" : "bg-primary"}`} 
                      style={{ width: `${Math.min(caloriePercentage, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Proteínas</div>
                      <div className="font-bold">{Math.round(totals.protein)}g</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Carboidratos</div>
                      <div className="font-bold">{Math.round(totals.carbs)}g</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Gorduras</div>
                      <div className="font-bold">{Math.round(totals.fat)}g</div>
                    </div>
                  </div>
                </div>
                
                {/* Seleção de refeição */}
                <div className="space-y-2">
                  <Label htmlFor="mealSelect">Selecione uma refeição</Label>
                  <Select
                    value={selectedMeal || ''}
                    onValueChange={setSelectedMeal}
                  >
                    <SelectTrigger id="mealSelect">
                      <SelectValue placeholder="Selecione uma refeição" />
                    </SelectTrigger>
                    <SelectContent>
                      {activePlan.meals.map(meal => (
                        <SelectItem key={meal.id} value={meal.id}>{meal.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Adicionar alimento */}
                {selectedMeal && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <Label htmlFor="foodSelect">Alimento</Label>
                        <Select
                          value={selectedFood}
                          onValueChange={setSelectedFood}
                        >
                          <SelectTrigger id="foodSelect">
                            <SelectValue placeholder="Selecione um alimento" />
                          </SelectTrigger>
                          <SelectContent>
                            {commonFoods.map(food => (
                              <SelectItem key={food.name} value={food.name}>{food.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantidade</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="0.25"
                          step="0.25"
                          value={foodQuantity}
                          onChange={(e) => setFoodQuantity(Number(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={addFoodToMeal}
                      disabled={!selectedFood || foodQuantity <= 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar à Refeição
                    </Button>
                    
                    {/* Lista de alimentos na refeição selecionada */}
                    <div className="space-y-2 mt-4">
                      <h4 className="font-medium">
                        {activePlan.meals.find(m => m.id === selectedMeal)?.name || 'Refeição'}
                      </h4>
                      
                      {activePlan.meals.find(m => m.id === selectedMeal)?.foods.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-2 bg-muted rounded">
                          Nenhum alimento adicionado a esta refeição
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {activePlan.meals.find(m => m.id === selectedMeal)?.foods.map(food => (
                            <div key={food.id} className="flex items-center justify-between p-2 bg-secondary/10 rounded">
                              <div>
                                <div className="font-medium">{food.name} x{food.quantity}</div>
                                <div className="text-xs text-muted-foreground">
                                  {food.calories} cal | P: {food.protein}g | C: {food.carbs}g | G: {food.fat}g
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeFoodFromMeal(selectedMeal, food.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
