import { supabase } from '../supabase';

// Workout Plans
export const createWorkoutPlan = async (plan: {
  name: string;
  description?: string;
  difficulty: string;
  type: string;
  duration: number;
  tags?: string[];
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('workout_plans')
    .insert([{ ...plan, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserWorkoutPlans = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('workout_plans')
    .select('*, workout_exercises(*)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const addExerciseToWorkout = async (workoutPlanId: string, exercise: any) => {
  const { data, error } = await supabase
    .from('workout_exercises')
    .insert([{ ...exercise, workout_plan_id: workoutPlanId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Nutrition
export const addNutritionEntry = async (entry: {
  food_name: string;
  amount: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  meal_type: string;
  entry_date?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('nutrition_entries')
    .insert([{ ...entry, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getTodayNutrition = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('nutrition_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('entry_date', today);

  if (error) throw error;
  return data || [];
};

export const addWaterIntake = async (amount_ml: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('water_intake')
    .insert([{ user_id: user.id, amount_ml, entry_date: today }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getTodayWaterIntake = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('water_intake')
    .select('*')
    .eq('user_id', user.id)
    .eq('entry_date', today);

  if (error) throw error;
  
  const total = data?.reduce((sum, entry) => sum + entry.amount_ml, 0) || 0;
  return total;
};

export const getUserNutritionGoals = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('nutrition_goals')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  // Create default goals if none exist
  if (!data) {
    const { data: newGoals, error: createError } = await supabase
      .from('nutrition_goals')
      .insert([{
        user_id: user.id,
        calories: 2500,
        protein: 150,
        carbs: 300,
        fat: 83,
        water_ml: 3000
      }])
      .select()
      .single();
    
    if (createError) throw createError;
    return newGoals;
  }
  
  return data;
};

// Body Measurements
export const addBodyMeasurement = async (measurement: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('body_measurements')
    .insert([{ ...measurement, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserBodyMeasurements = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', user.id)
    .order('measurement_date', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Goals
export const addFitnessGoal = async (goal: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('fitness_goals')
    .insert([{ ...goal, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserFitnessGoals = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('fitness_goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('target_date', { ascending: true });

  if (error) throw error;
  return data || [];
};

// User Level
export const getUserFitnessLevel = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_fitness_levels')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  // Create default level if none exists
  if (!data) {
    const { data: newLevel, error: createError } = await supabase
      .from('user_fitness_levels')
      .insert([{
        user_id: user.id,
        level: 1,
        xp: 0,
        total_xp: 0,
        coins: 0,
        title: 'Iniciante'
      }])
      .select()
      .single();
    
    if (createError) throw createError;
    return newLevel;
  }
  
  return data;
};

export const updateUserFitnessLevel = async (updates: { xp?: number; coins?: number; level?: number; title?: string }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_fitness_levels')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};