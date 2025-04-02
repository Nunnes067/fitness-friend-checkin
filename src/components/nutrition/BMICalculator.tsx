
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Activity, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function BMICalculator() {
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(70);
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('calculator');

  const calculateBMI = () => {
    if (height <= 0 || weight <= 0) {
      toast.error('Valores inválidos', {
        description: 'Altura e peso devem ser números positivos'
      });
      return;
    }

    // BMI formula: weight (kg) / (height (m))^2
    const heightInMeters = height / 100;
    const bmiValue = weight / (heightInMeters * heightInMeters);
    setBmi(parseFloat(bmiValue.toFixed(1)));

    // Determine BMI category
    if (bmiValue < 18.5) {
      setCategory('Abaixo do peso');
    } else if (bmiValue < 25) {
      setCategory('Peso normal');
    } else if (bmiValue < 30) {
      setCategory('Sobrepeso');
    } else if (bmiValue < 35) {
      setCategory('Obesidade grau I');
    } else if (bmiValue < 40) {
      setCategory('Obesidade grau II');
    } else {
      setCategory('Obesidade grau III');
    }

    toast.success('IMC calculado', {
      description: `Seu IMC é ${bmiValue.toFixed(1)} - ${category}`
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Activity className="h-5 w-5 mr-2 text-primary" />
          Calculadora de IMC
        </CardTitle>
        <CardDescription>
          Calcule seu Índice de Massa Corporal e avalie sua composição
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="calculator">Calculadora</TabsTrigger>
            <TabsTrigger value="info">Informações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Altura (cm)</label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[height]}
                  min={120}
                  max={220}
                  step={1}
                  onValueChange={(value) => setHeight(value[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Peso (kg)</label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[weight]}
                  min={30}
                  max={200}
                  step={0.5}
                  onValueChange={(value) => setWeight(value[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>
            
            <Button onClick={calculateBMI} className="w-full">
              Calcular IMC
            </Button>
            
            {bmi !== null && (
              <div className="mt-4 p-4 rounded-md border bg-secondary/20">
                <h4 className="font-medium mb-2">Seu resultado:</h4>
                <div className="flex justify-between">
                  <span>IMC:</span>
                  <span className="font-bold">{bmi}</span>
                </div>
                <div className="flex justify-between">
                  <span>Classificação:</span>
                  <span className="font-bold">{category}</span>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="info">
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">O que é IMC?</h4>
                  <p className="text-sm text-muted-foreground">
                    O Índice de Massa Corporal (IMC) é uma medida que relaciona seu peso e altura para avaliar se você está em um peso saudável.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Categorias de IMC:</h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="p-2 rounded bg-blue-100 dark:bg-blue-950/30 flex justify-between">
                    <span>Abaixo do peso</span>
                    <span className="font-semibold">Abaixo de 18.5</span>
                  </div>
                  <div className="p-2 rounded bg-green-100 dark:bg-green-950/30 flex justify-between">
                    <span>Peso normal</span>
                    <span className="font-semibold">18.5 - 24.9</span>
                  </div>
                  <div className="p-2 rounded bg-yellow-100 dark:bg-yellow-950/30 flex justify-between">
                    <span>Sobrepeso</span>
                    <span className="font-semibold">25 - 29.9</span>
                  </div>
                  <div className="p-2 rounded bg-orange-100 dark:bg-orange-950/30 flex justify-between">
                    <span>Obesidade grau I</span>
                    <span className="font-semibold">30 - 34.9</span>
                  </div>
                  <div className="p-2 rounded bg-red-100 dark:bg-red-950/30 flex justify-between">
                    <span>Obesidade grau II</span>
                    <span className="font-semibold">35 - 39.9</span>
                  </div>
                  <div className="p-2 rounded bg-red-200 dark:bg-red-900/30 flex justify-between">
                    <span>Obesidade grau III</span>
                    <span className="font-semibold">40 ou mais</span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>
                  O IMC é uma ferramenta de triagem, não um diagnóstico de saúde. Consulte um profissional de saúde para uma avaliação completa.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
