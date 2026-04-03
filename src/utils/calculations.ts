// ============================================
// FUNCIONES DE CÁLCULO
// ============================================

/**
 * Calcula el IMC (Índice de Masa Corporal)
 * @param weightKg - Peso en kilogramos
 * @param heightCm - Altura en centímetros
 * @returns IMC redondeado a 2 decimales
 */
export const calculateBMI = (weightKg: number, heightCm: number): number => {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 100) / 100;
};

/**
 * Obtiene la clasificación del IMC
 * @param bmi - Valor del IMC
 * @returns Clasificación en español
 */
export const getBMICategory = (bmi: number): { label: string; color: string } => {
  if (bmi <= 0) return { label: 'No calculable', color: 'text-gray-500' };
  if (bmi < 18.5) return { label: 'Bajo peso', color: 'text-blue-500' };
  if (bmi < 25) return { label: 'Peso normal', color: 'text-green-500' };
  if (bmi < 30) return { label: 'Sobrepeso', color: 'text-nutri-orange' };
  return { label: 'Obesidad', color: 'text-red-500' };
};

/**
 * Calcula la edad a partir de la fecha de nacimiento
 * @param birthDate - Fecha de nacimiento (string ISO o Date)
 * @returns Edad en años
 */
export const calculateAge = (birthDate: string | Date): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Calcula el rango de peso saludable basado en la altura
 * @param heightCm - Altura en centímetros
 * @returns Objeto con peso mínimo y máximo en kg
 */
export const getHealthyWeightRange = (heightCm: number): { min: number; max: number } => {
  const heightM = heightCm / 100;
  const minWeight = Math.round(18.5 * heightM * heightM * 10) / 10;
  const maxWeight = Math.round(24.9 * heightM * heightM * 10) / 10;
  return { min: minWeight, max: maxWeight };
};

/**
 * Calcula el peso ideal usando la fórmula de Devine
 * @param heightCm - Altura en centímetros
 * @param gender - Género ('male' | 'female' | 'other')
 * @returns Peso ideal en kg
 */
export const calculateIdealWeight = (heightCm: number, gender: string): number => {
  const heightInches = heightCm / 2.54;
  
  if (gender === 'female') {
    return Math.round((45.5 + 2.3 * (heightInches - 60)) * 10) / 10;
  }
  
  // Default to male formula
  return Math.round((50 + 2.3 * (heightInches - 60)) * 10) / 10;
};

/**
 * Calcula la relación cintura-cadera
 * @param waistCm - Circunferencia de cintura en cm
 * @param hipCm - Circunferencia de cadera en cm
 * @returns Relación cintura-cadera
 */
export const calculateWHR = (waistCm: number, hipCm: number): number => {
  if (hipCm <= 0) return 0;
  return Math.round((waistCm / hipCm) * 100) / 100;
};

/**
 * Obtiene la clasificación de la relación cintura-cadera
 * @param whr - Valor de la relación cintura-cadera
 * @param gender - Género ('male' | 'female' | 'other')
 */
export const getWHRCategory = (whr: number, gender: string): { label: string; risk: string } => {
  if (whr <= 0) return { label: 'No calculable', risk: 'neutral' };
  
  if (gender === 'female') {
    if (whr < 0.8) return { label: 'Bajo riesgo', risk: 'low' };
    if (whr < 0.85) return { label: 'Riesgo moderado', risk: 'moderate' };
    return { label: 'Alto riesgo', risk: 'high' };
  }
  
  // Default to male
  if (whr < 0.95) return { label: 'Bajo riesgo', risk: 'low' };
  if (whr < 1.0) return { label: 'Riesgo moderado', risk: 'moderate' };
  return { label: 'Alto riesgo', risk: 'high' };
};

/**
 * Calcula el metabolismo basal (TMB) usando la fórmula de Mifflin-St Jeor
 * @param weightKg - Peso en kg
 * @param heightCm - Altura en cm
 * @param age - Edad en años
 * @param gender - Género
 * @returns TMB en kcal/día
 */
export const calculateBMR = (
  weightKg: number, 
  heightCm: number, 
  age: number, 
  gender: string
): number => {
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  
  if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr += 5;
  }
  
  return Math.round(bmr);
};

/**
 * Calcula las necesidades calóricas diarias (TDEE)
 * @param bmr - Tasa metabólica basal
 * @param activityLevel - Nivel de actividad física
 * @returns TDEE en kcal/día
 */
export const calculateTDEE = (
  bmr: number, 
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number => {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  
  return Math.round(bmr * multipliers[activityLevel]);
};

/**
 * Calcula los macronutrientes objetivo
 * @param tdee - Calorías diarias totales
 * @param proteinPercent - Porcentaje de proteínas (default 30%)
 * @param carbsPercent - Porcentaje de carbohidratos (default 40%)
 * @param fatsPercent - Porcentaje de grasas (default 30%)
 */
export const calculateMacros = (
  tdee: number,
  proteinPercent: number = 30,
  carbsPercent: number = 40,
  fatsPercent: number = 30
): { protein: number; carbs: number; fats: number } => {
  // Protein and carbs = 4 kcal/g, fat = 9 kcal/g
  const protein = Math.round((tdee * (proteinPercent / 100)) / 4);
  const carbs = Math.round((tdee * (carbsPercent / 100)) / 4);
  const fats = Math.round((tdee * (fatsPercent / 100)) / 9);
  
  return { protein, carbs, fats };
};

/**
 * Formatea un número como porcentaje
 * @param value - Valor numérico
 * @param decimals - Número de decimales (default 0)
 */
export const formatPercent = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formatea un número con separador de miles
 * @param value - Valor numérico
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-ES').format(value);
};

/**
 * Calcula la diferencia de peso entre dos mediciones
 * @param currentWeight - Peso actual
 * @param previousWeight - Peso anterior
 */
export const calculateWeightChange = (
  currentWeight: number, 
  previousWeight: number
): { difference: number; percentage: number; direction: 'up' | 'down' | 'same' } => {
  const difference = Math.round((currentWeight - previousWeight) * 10) / 10;
  const percentage = previousWeight > 0 
    ? Math.round((difference / previousWeight) * 1000) / 10 
    : 0;
  
  return {
    difference,
    percentage,
    direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'same',
  };
};
