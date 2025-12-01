-- Tabela de planos de treino
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL DEFAULT 'Intermediário',
  type TEXT NOT NULL DEFAULT 'Hipertrofia',
  duration INTEGER NOT NULL DEFAULT 60,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  rating NUMERIC DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de exercícios nos planos
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  muscle_groups TEXT[] DEFAULT ARRAY[]::TEXT[],
  equipment TEXT,
  difficulty TEXT DEFAULT 'Intermediário',
  instructions TEXT,
  video_url TEXT,
  sets INTEGER NOT NULL DEFAULT 3,
  reps TEXT NOT NULL DEFAULT '8-12',
  weight TEXT,
  rest_time INTEGER DEFAULT 90,
  tempo TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de histórico de treinos
CREATE TABLE IF NOT EXISTS public.workout_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  volume_total NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de entradas nutricionais
CREATE TABLE IF NOT EXISTS public.nutrition_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  fiber NUMERIC DEFAULT 0,
  meal_type TEXT NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de hidratação
CREATE TABLE IF NOT EXISTS public.water_intake (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de metas nutricionais
CREATE TABLE IF NOT EXISTS public.nutrition_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calories INTEGER NOT NULL DEFAULT 2500,
  protein INTEGER NOT NULL DEFAULT 150,
  carbs INTEGER NOT NULL DEFAULT 300,
  fat INTEGER NOT NULL DEFAULT 83,
  water_ml INTEGER NOT NULL DEFAULT 3000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela de medidas corporais
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight NUMERIC NOT NULL,
  height NUMERIC NOT NULL,
  body_fat NUMERIC,
  muscle_mass NUMERIC,
  chest NUMERIC,
  waist NUMERIC,
  hips NUMERIC,
  bicep_left NUMERIC,
  bicep_right NUMERIC,
  thigh_left NUMERIC,
  thigh_right NUMERIC,
  forearm_left NUMERIC,
  forearm_right NUMERIC,
  neck NUMERIC,
  shoulders NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de metas
CREATE TABLE IF NOT EXISTS public.fitness_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  target_date DATE NOT NULL,
  measurement_type TEXT,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de conquistas
CREATE TABLE IF NOT EXISTS public.user_fitness_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  max_progress INTEGER NOT NULL,
  unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Tabela de level do usuário
CREATE TABLE IF NOT EXISTS public.user_fitness_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  title TEXT DEFAULT 'Iniciante',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_fitness_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_fitness_levels ENABLE ROW LEVEL SECURITY;

-- RLS Policies para workout_plans
CREATE POLICY "Users can view own workout plans" ON public.workout_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout plans" ON public.workout_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout plans" ON public.workout_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout plans" ON public.workout_plans FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para workout_exercises
CREATE POLICY "Users can view own workout exercises" ON public.workout_exercises FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workout_plans WHERE id = workout_exercises.workout_plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own workout exercises" ON public.workout_exercises FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.workout_plans WHERE id = workout_exercises.workout_plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own workout exercises" ON public.workout_exercises FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.workout_plans WHERE id = workout_exercises.workout_plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own workout exercises" ON public.workout_exercises FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.workout_plans WHERE id = workout_exercises.workout_plan_id AND user_id = auth.uid())
);

-- RLS Policies para workout_history
CREATE POLICY "Users can view own workout history" ON public.workout_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout history" ON public.workout_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout history" ON public.workout_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout history" ON public.workout_history FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para nutrition_entries
CREATE POLICY "Users can view own nutrition entries" ON public.nutrition_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nutrition entries" ON public.nutrition_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nutrition entries" ON public.nutrition_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own nutrition entries" ON public.nutrition_entries FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para water_intake
CREATE POLICY "Users can view own water intake" ON public.water_intake FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own water intake" ON public.water_intake FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own water intake" ON public.water_intake FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own water intake" ON public.water_intake FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para nutrition_goals
CREATE POLICY "Users can view own nutrition goals" ON public.nutrition_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nutrition goals" ON public.nutrition_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nutrition goals" ON public.nutrition_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own nutrition goals" ON public.nutrition_goals FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para body_measurements
CREATE POLICY "Users can view own body measurements" ON public.body_measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own body measurements" ON public.body_measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own body measurements" ON public.body_measurements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own body measurements" ON public.body_measurements FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para fitness_goals
CREATE POLICY "Users can view own fitness goals" ON public.fitness_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fitness goals" ON public.fitness_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fitness goals" ON public.fitness_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fitness goals" ON public.fitness_goals FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para user_fitness_achievements
CREATE POLICY "Users can view own achievements" ON public.user_fitness_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_fitness_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON public.user_fitness_achievements FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies para user_fitness_levels
CREATE POLICY "Users can view own fitness level" ON public.user_fitness_levels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fitness level" ON public.user_fitness_levels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fitness level" ON public.user_fitness_levels FOR UPDATE USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workout_plans_updated_at BEFORE UPDATE ON public.workout_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nutrition_goals_updated_at BEFORE UPDATE ON public.nutrition_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fitness_goals_updated_at BEFORE UPDATE ON public.fitness_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_fitness_levels_updated_at BEFORE UPDATE ON public.user_fitness_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();