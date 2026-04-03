/**
 * Asistente de IA para Anamnesis
 * 
 * Estrategia en capas (sin costo):
 * 1. Intenta usar Chrome Built-in AI (window.ai) — gratis, corre localmente
 * 2. Fallback: sistema experto local basado en reglas clínicas nutricionales
 * 
 * Para habilitar IA real en el futuro: agregar VITE_OPENAI_KEY en .env
 * y descomentar el bloque de OpenAI abajo.
 */

import type { AnamnesisFormData } from '@/types';

// ─── TIPOS ─────────────────────────────────────────────────────────────────

export interface AIAnalysisResult {
  summary: string;
  risks: string[];
  recommendations: string[];
  nutritionalPriorities: string[];
  estimatedCalories: number | null;
}

// ─── MOTOR DE REGLAS CLÍNICAS (Local Fallback) ──────────────────────────────

function applyExpertRules(data: AnamnesisFormData): AIAnalysisResult {
  const risks: string[] = [];
  const recommendations: string[] = [];
  const nutritionalPriorities: string[] = [];

  const weight = parseFloat(data.anthropometric_data.weight) || 0;
  const height = parseFloat(data.anthropometric_data.height) || 0;
  const bmi = height > 0 ? weight / Math.pow(height / 100, 2) : 0;
  const bodyFat = parseFloat(data.anthropometric_data.body_fat_percentage) || 0;
  const activityLevel = data.physical_activity?.level || 'sedentary';

  // ── BMI Analysis ──
  if (bmi > 0) {
    if (bmi < 18.5) {
      risks.push('IMC bajo (< 18.5): riesgo de desnutrición y pérdida de masa muscular.');
      nutritionalPriorities.push('Incrementar aporte calórico con énfasis en proteínas de alta calidad.');
      recommendations.push('Evaluar posible deficiencia de micronutrientes (hierro, vitamina D, zinc).');
    } else if (bmi >= 25 && bmi < 30) {
      risks.push('Sobrepeso (IMC 25-30): riesgo cardiovascular moderado.');
      recommendations.push('Déficit calórico moderado de 300-500 kcal/día con distribución proteica del 30%.');
      nutritionalPriorities.push('Reducción de carbohidratos refinados y grasas saturadas.');
    } else if (bmi >= 30) {
      risks.push('Obesidad (IMC ≥ 30): riesgo metabólico elevado. Considerar evaluación médica completa.');
      nutritionalPriorities.push('Plan hipocalórico estructurado. Priorizar proteínas y fibra para saciedad.');
      recommendations.push('Incorporar actividad física progresiva. Evaluar resistencia insulínica.');
    }
  }

  // ── Body Fat ──
  if (bodyFat > 30) {
    risks.push('Porcentaje de grasa corporal elevado (> 30%): indicador de obesidad metabólica.');
    nutritionalPriorities.push('Estrategia de recomposición corporal: mantener masa muscular mientras se reduce grasa.');
  }

  // ── Physical Activity ──
  if (activityLevel === 'sedentary') {
    risks.push('Sedentarismo: factor de riesgo independiente para enfermedades crónicas.');
    recommendations.push('Iniciar con 150 min/semana de actividad aeróbica de intensidad moderada.');
  } else if (activityLevel === 'very_active') {
    nutritionalPriorities.push('Alta demanda energética: asegurar ingesta adecuada de carbohidratos pre/post entrenamiento.');
    recommendations.push('Proteínas: 1.6-2.2 g/kg/día para soporte de rendimiento y recuperación muscular.');
  }

  // ── Diseases ──
  const diseases = data.diseases?.map(d => d.toLowerCase()) || [];
  if (diseases.some(d => d.includes('diabete') || d.includes('glucemia') || d.includes('insulin'))) {
    risks.push('Enfermedad metabólica detectada: manejo glucémico prioritario.');
    nutritionalPriorities.push('Distribución de CHO controlada (<45%). Evitar azúcares simples. Índice glucémico bajo.');
    recommendations.push('Monitoreo de carga glucémica. Considerar fraccionamiento en 5-6 comidas.');
  }
  if (diseases.some(d => d.includes('hiperten') || d.includes('presión'))) {
    risks.push('Hipertensión arterial: restricción de sodio recomendada.');
    recommendations.push('Dieta DASH. Sodio < 2300 mg/día. Aumentar potasio (frutas, verduras, legumbres).');
  }
  if (diseases.some(d => d.includes('celiaq') || d.includes('gluten'))) {
    risks.push('Enfermedad celíaca o sensibilidad al gluten: plan estrictamente libre de gluten.');
    recommendations.push('Verificar contaminación cruzada en todos los alimentos procesados.');
    nutritionalPriorities.push('Suplementar calcio, hierro, folato y vitamina D (frecuentemente deficientes en celíacos).');
  }
  if (diseases.some(d => d.includes('colesterol') || d.includes('dislipemia') || d.includes('triglicerido'))) {
    risks.push('Dislipemia: perfil lipídico en riesgo.');
    nutritionalPriorities.push('Reducir grasas saturadas y trans. Aumentar omega-3 y fibra soluble.');
    recommendations.push('Incorporar esteroles vegetales. Avena, linaza y nueces de manera regular.');
  }

  // ── Allergies / Intolerances ──
  const allergies = data.eating_habits?.allergies || [];
  const intolerances = data.eating_habits?.intolerances || [];
  if (allergies.length > 0) {
    risks.push(`Alergias alimentarias: ${allergies.join(', ')}. Riesgo de restricción nutricional.`);
    recommendations.push('Evaluar fuentes alternativas de los nutrientes aportados por los alimentos excluidos.');
  }
  if (intolerances.some(i => i.toLowerCase().includes('lactosa'))) {
    recommendations.push('Alternativas sin lactosa: bebidas vegetales fortificadas, quesos duros curados.');
    nutritionalPriorities.push('Garantizar aporte de calcio por fuentes no lácteas (brócoli, almendras, sardinas).');
  }

  // ── Meal Frequency ──
  const mealFreq = parseInt(data.eating_habits?.meal_frequency || '3');
  if (mealFreq <= 2) {
    risks.push('Baja frecuencia alimentaria: riesgo de hipoglucemia reactiva y pérdida muscular.');
    recommendations.push('Distribuir la ingesta en al menos 4 momentos del día para mejor control metabólico.');
  }

  // ── Caloric Estimate ──
  let estimatedCalories: number | null = null;
  if (weight > 0 && height > 0) {
    // Mifflin-St Jeor (gender-neutral estimate)
    const bmr = 10 * weight + 6.25 * height - 5 * 30 + 5;
    const activityFactors: Record<string, number> = {
      sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9
    };
    const af = activityFactors[activityLevel] || 1.2;
    estimatedCalories = Math.round(bmr * af);
  }

  // ── Summary ──
  const riskLevel = risks.length >= 3 ? 'alto' : risks.length >= 1 ? 'moderado' : 'bajo';
  const summary = `Análisis clínico-nutricional completado. Perfil de riesgo ${riskLevel}. ${
    bmi > 0 ? `IMC: ${bmi.toFixed(1)} kg/m².` : ''
  } ${risks.length} factores de riesgo identificados. ${recommendations.length + nutritionalPriorities.length} acciones terapéuticas recomendadas.`;

  // ── Ensure non-empty ──
  if (recommendations.length === 0) recommendations.push('Mantener hábitos alimentarios actuales con monitoreo periódico.');
  if (nutritionalPriorities.length === 0) nutritionalPriorities.push('Dieta variada y equilibrada con énfasis en alimentos de alta densidad nutricional.');

  return { summary, risks, recommendations, nutritionalPriorities, estimatedCalories };
}

// ─── CHROME BUILT-IN AI ─────────────────────────────────────────────────────

async function tryBrowserAI(data: AnamnesisFormData): Promise<string | null> {
  try {
    const ai = (window as any).ai;
    if (!ai || !ai.languageModel) return null;

    const capabilities = await ai.languageModel.capabilities();
    if (capabilities.available === 'no') return null;

    const session = await ai.languageModel.create({
      systemPrompt: `Sos un nutricionista clínico experto. Analizás datos de anamnesis nutricional y generás 
      un resumen profesional en español con: riesgos clínicos, prioridades nutricionales y recomendaciones concretas. 
      Respondé en formato JSON con campos: summary, risks (array), recommendations (array), nutritionalPriorities (array).`
    });

    const prompt = `Analizá estos datos de anamnesis: ${JSON.stringify({
      bmi_data: data.anthropometric_data,
      activity: data.physical_activity?.level,
      diseases: data.diseases,
      medications: data.medications?.map(m => m.name),
      allergies: data.eating_habits?.allergies,
      intolerances: data.eating_habits?.intolerances,
      meal_frequency: data.eating_habits?.meal_frequency,
      consultation_reason: data.consultation_reason,
    })}`;

    const result = await session.prompt(prompt);
    session.destroy();
    return result;
  } catch {
    return null;
  }
}

// ─── FUNCIÓN PRINCIPAL ───────────────────────────────────────────────────────

export async function analyzeAnamnesisWithAI(data: AnamnesisFormData): Promise<AIAnalysisResult> {
  // Primero intentar la IA del browser
  const aiResponse = await tryBrowserAI(data);
  if (aiResponse) {
    try {
      const parsed = JSON.parse(aiResponse);
      if (parsed.summary && parsed.risks && parsed.recommendations) {
        return {
          ...parsed,
          estimatedCalories: applyExpertRules(data).estimatedCalories,
        };
      }
    } catch {
      // Si el parse falla, caemos al sistema de reglas
    }
  }

  // Fallback: Motor de reglas experto
  return applyExpertRules(data);
}

// ─── GENERAR TEXTO LIBRE PARA EL MOTIVO DE CONSULTA ─────────────────────────

export function generateConsultationSuggestions(data: Partial<AnamnesisFormData>): string[] {
  const suggestions: string[] = [];
  const diseases = data.diseases || [];
  const activityLevel = data.physical_activity?.level;

  if (diseases.some(d => d.toLowerCase().includes('diabete'))) {
    suggestions.push('Control y optimización glucémica. Educación alimentaria en índice glucémico.');
  }
  if (activityLevel === 'sedentary') {
    suggestions.push('Cambio de composición corporal y mejora de hábitos alimentarios por sedentarismo.');
  }
  if (activityLevel === 'very_active' || activityLevel === 'active') {
    suggestions.push('Optimización de rendimiento deportivo y nutrición peri-entrenamiento.');
  }

  suggestions.push('Evaluación nutricional completa y diseño de plan personalizado.');
  suggestions.push('Educación alimentaria y modificación de hábitos.');
  return suggestions.slice(0, 3);
}
