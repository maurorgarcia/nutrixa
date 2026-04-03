import jsPDF from 'jspdf';
import type { Patient, Anamnesis, MealPlan, FollowUp } from '@/types';
import { calculateAge, calculateBMI, getBMICategory } from './calculations';

// ============================================
// EXPORTACIÓN A PDF
// ============================================

const addHeader = (doc: jsPDF, title: string) => {
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, 210, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('NUTRIXA', 15, 12);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 15, 20);
  
  doc.setTextColor(0, 0, 0);
};

const addFooter = (doc: jsPDF, pageNumber: number) => {
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setDrawColor(200, 200, 200);
  doc.line(15, pageHeight - 20, 195, pageHeight - 20);
  
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text(`Página ${pageNumber}`, 15, pageHeight - 12);
  doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, 195, pageHeight - 12, { align: 'right' });
};

// ============================================
// EXPORTAR ANAMNESIS A PDF
// ============================================

export const exportAnamnesisToPDF = (
  patient: Patient, 
  anamnesis: Anamnesis,
  filename?: string
): void => {
  const doc = new jsPDF();
  let y = 35;
  let pageNumber = 1;
  
  addHeader(doc, 'Anamnesis Nutricional');
  
  // Patient info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${patient.first_name} ${patient.last_name}`, 15, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Edad: ${calculateAge(patient.birth_date)} años | Sexo: ${patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Femenino' : 'Otro'}`, 15, y);
  y += 6;
  
  if (patient.email) {
    doc.text(`Email: ${patient.email}`, 15, y);
    y += 6;
  }
  
  if (patient.phone) {
    doc.text(`Teléfono: ${patient.phone}`, 15, y);
    y += 6;
  }
  
  y += 10;
  
  // Section helper
  const addSection = (title: string, content: string | string[]) => {
    if (y > 250) {
      addFooter(doc, pageNumber);
      doc.addPage();
      pageNumber++;
      y = 25;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 15, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (Array.isArray(content)) {
      content.forEach(line => {
        if (y > 270) {
          addFooter(doc, pageNumber);
          doc.addPage();
          pageNumber++;
          y = 25;
        }
        doc.text(`• ${line}`, 20, y);
        y += 6;
      });
    } else {
      const lines = doc.splitTextToSize(content, 170);
      lines.forEach((line: string) => {
        if (y > 270) {
          addFooter(doc, pageNumber);
          doc.addPage();
          pageNumber++;
          y = 25;
        }
        doc.text(line, 20, y);
        y += 6;
      });
    }
    
    y += 4;
  };
  
  // Anthropometric Data
  const bmi = anamnesis.anthropometric_data.bmi;
  const bmiCategory = getBMICategory(bmi);
  
  addSection('Datos Antropométricos', [
    `Peso: ${anamnesis.anthropometric_data.weight} kg`,
    `Altura: ${anamnesis.anthropometric_data.height} cm`,
    `IMC: ${bmi} (${bmiCategory.label})`,
    ...(anamnesis.anthropometric_data.waist_circumference ? [`Circunferencia de cintura: ${anamnesis.anthropometric_data.waist_circumference} cm`] : []),
    ...(anamnesis.anthropometric_data.hip_circumference ? [`Circunferencia de cadera: ${anamnesis.anthropometric_data.hip_circumference} cm`] : []),
    ...(anamnesis.anthropometric_data.body_fat_percentage ? [`% Grasa corporal: ${anamnesis.anthropometric_data.body_fat_percentage}%`] : []),
  ]);
  
  // Consultation Reason
  addSection('Motivo de Consulta', anamnesis.consultation_reason || 'No especificado');
  
  // Physical Activity
  if (anamnesis.physical_activity) {
    addSection('Actividad Física', [
      `Nivel: ${anamnesis.physical_activity.level}`,
      ...(anamnesis.physical_activity.activities?.length ? [`Actividades: ${anamnesis.physical_activity.activities.join(', ')}`] : []),
      ...(anamnesis.physical_activity.frequency ? [`Frecuencia: ${anamnesis.physical_activity.frequency}`] : []),
      ...(anamnesis.physical_activity.duration ? [`Duración: ${anamnesis.physical_activity.duration}`] : []),
    ]);
  }
  
  // Diseases
  if (anamnesis.diseases?.length) {
    addSection('Enfermedades', anamnesis.diseases);
  }
  
  // Medications
  if (anamnesis.medications?.length) {
    addSection('Medicación', anamnesis.medications.map(m => 
      `${m.name}${m.dosage ? ` - ${m.dosage}` : ''}${m.frequency ? ` (${m.frequency})` : ''}`
    ));
  }
  
  // Family History
  if (anamnesis.family_history?.length) {
    addSection('Antecedentes Familiares', anamnesis.family_history.map(fh => 
      `${fh.condition}${fh.relationship ? ` (${fh.relationship})` : ''}`
    ));
  }
  
  // Eating Habits
  if (anamnesis.eating_habits) {
    const habits = [];
    if (anamnesis.eating_habits.meal_frequency) {
      habits.push(`Frecuencia de comidas: ${anamnesis.eating_habits.meal_frequency}`);
    }
    if (anamnesis.eating_habits.cooking_methods?.length) {
      habits.push(`Métodos de cocción: ${anamnesis.eating_habits.cooking_methods.join(', ')}`);
    }
    if (anamnesis.eating_habits.food_preferences?.length) {
      habits.push(`Preferencias: ${anamnesis.eating_habits.food_preferences.join(', ')}`);
    }
    if (anamnesis.eating_habits.food_dislikes?.length) {
      habits.push(`Alimentos que rechaza: ${anamnesis.eating_habits.food_dislikes.join(', ')}`);
    }
    if (anamnesis.eating_habits.allergies?.length) {
      habits.push(`Alergias: ${anamnesis.eating_habits.allergies.join(', ')}`);
    }
    if (anamnesis.eating_habits.intolerances?.length) {
      habits.push(`Intolerancias: ${anamnesis.eating_habits.intolerances.join(', ')}`);
    }
    
    if (habits.length) {
      addSection('Hábitos Alimentarios', habits);
    }
  }
  
  // 24h Recall
  if (anamnesis.recall_24h) {
    const recallLines = [];
    
    if (anamnesis.recall_24h.weekday) {
      recallLines.push('Día de semana:');
      Object.entries(anamnesis.recall_24h.weekday).forEach(([key, value]) => {
        if (value) recallLines.push(`  ${key}: ${value}`);
      });
    }
    
    if (anamnesis.recall_24h.weekend) {
      recallLines.push('Fin de semana:');
      Object.entries(anamnesis.recall_24h.weekend).forEach(([key, value]) => {
        if (value) recallLines.push(`  ${key}: ${value}`);
      });
    }
    
    if (recallLines.length) {
      addSection('Recordatorio 24h', recallLines);
    }
  }
  
  // Lab Results
  if (anamnesis.lab_results?.length) {
    addSection('Análisis Clínicos', anamnesis.lab_results.map(lr => 
      `${lr.test_name}: ${lr.value} ${lr.unit}${lr.reference_range ? ` (Ref: ${lr.reference_range})` : ''}`
    ));
  }
  
  addFooter(doc, pageNumber);
  
  const defaultFilename = `anamnesis_${patient.last_name}_${patient.first_name}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename || defaultFilename);
};

// ============================================
// EXPORTAR PLAN DE ALIMENTACIÓN A PDF
// ============================================

export const exportMealPlanToPDF = (
  patient: Patient,
  mealPlan: MealPlan,
  filename?: string
): void => {
  const doc = new jsPDF();
  let y = 35;
  let pageNumber = 1;
  
  addHeader(doc, 'Plan de Alimentación');
  
  // Patient info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${patient.first_name} ${patient.last_name}`, 15, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Edad: ${calculateAge(patient.birth_date)} años`, 15, y);
  y += 6;
  
  // Plan info
  y += 4;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(mealPlan.name, 15, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (mealPlan.description) {
    const descLines = doc.splitTextToSize(mealPlan.description, 170);
    descLines.forEach((line: string) => {
      doc.text(line, 15, y);
      y += 6;
    });
  }
  
  y += 4;
  doc.text(`Calorías diarias: ${mealPlan.daily_calories} kcal`, 15, y);
  y += 6;
  doc.text(`Macronutrientes: Proteínas ${mealPlan.macros.protein}% | Carbohidratos ${mealPlan.macros.carbs}% | Grasas ${mealPlan.macros.fats}%`, 15, y);
  y += 6;
  doc.text(`Período: ${new Date(mealPlan.start_date).toLocaleDateString('es-ES')} ${mealPlan.end_date ? `al ${new Date(mealPlan.end_date).toLocaleDateString('es-ES')}` : ''}`, 15, y);
  y += 12;
  
  // Days
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  mealPlan.days.forEach((day, index) => {
    if (y > 230) {
      addFooter(doc, pageNumber);
      doc.addPage();
      pageNumber++;
      y = 25;
    }
    
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y - 5, 180, 10, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(dayNames[index], 20, y);
    y += 12;
    
    if (day.meals.length === 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('Sin comidas asignadas', 20, y);
      doc.setTextColor(0, 0, 0);
      y += 8;
    } else {
      day.meals.forEach(meal => {
        if (y > 260) {
          addFooter(doc, pageNumber);
          doc.addPage();
          pageNumber++;
          y = 25;
        }
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${meal.name} (${meal.time})`, 20, y);
        y += 6;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        if (meal.recipes.length === 0) {
          doc.text('Sin recetas asignadas', 25, y);
          y += 6;
        } else {
          meal.recipes.forEach(recipe => {
            doc.text(`• ${recipe.recipe_name} - ${recipe.quantity} ${recipe.unit}`, 25, y);
            y += 5;
          });
        }
        
        if (meal.notes) {
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(128, 128, 128);
          const noteLines = doc.splitTextToSize(`Nota: ${meal.notes}`, 160);
          noteLines.forEach((line: string) => {
            doc.text(line, 25, y);
            y += 5;
          });
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
        }
        
        y += 4;
      });
    }
    
    y += 8;
  });
  
  addFooter(doc, pageNumber);
  
  const defaultFilename = `plan_alimentacion_${patient.last_name}_${patient.first_name}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename || defaultFilename);
};

// ============================================
// EXPORTAR SEGUIMIENTO A PDF
// ============================================

export const exportFollowUpToPDF = (
  patient: Patient,
  followUps: FollowUp[],
  filename?: string
): void => {
  const doc = new jsPDF();
  let y = 35;
  let pageNumber = 1;
  
  addHeader(doc, 'Seguimiento del Paciente');
  
  // Patient info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${patient.first_name} ${patient.last_name}`, 15, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Edad: ${calculateAge(patient.birth_date)} años`, 15, y);
  y += 12;
  
  // Follow-ups table
  if (followUps.length === 0) {
    doc.setFontSize(11);
    doc.text('No hay registros de seguimiento', 15, y);
  } else {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Historial de Seguimiento', 15, y);
    y += 10;
    
    followUps.forEach((fu, index) => {
      if (y > 250) {
        addFooter(doc, pageNumber);
        doc.addPage();
        pageNumber++;
        y = 25;
      }
      
      // Date and weight
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${new Date(fu.date).toLocaleDateString('es-ES')}`, 15, y);
      y += 6;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Peso: ${fu.weight} kg`, 20, y);
      y += 6;
      
      if (fu.adherence) {
        const adherenceLabels = {
          excellent: 'Excelente',
          good: 'Buena',
          fair: 'Regular',
          poor: 'Deficiente',
        };
        doc.text(`Adherencia: ${adherenceLabels[fu.adherence]}`, 20, y);
        y += 6;
      }
      
      if (fu.symptoms?.length) {
        doc.text(`Síntomas: ${fu.symptoms.join(', ')}`, 20, y);
        y += 6;
      }
      
      if (fu.concerns?.length) {
        doc.text(`Inquietudes: ${fu.concerns.join(', ')}`, 20, y);
        y += 6;
      }
      
      if (fu.notes) {
        const noteLines = doc.splitTextToSize(`Notas: ${fu.notes}`, 165);
        noteLines.forEach((line: string) => {
          doc.text(line, 20, y);
          y += 5;
        });
      }
      
      if (fu.next_appointment) {
        doc.text(`Próxima cita: ${new Date(fu.next_appointment).toLocaleDateString('es-ES')}`, 20, y);
        y += 6;
      }
      
      y += 8;
      
      // Separator
      if (index < followUps.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(15, y - 4, 195, y - 4);
      }
    });
  }
  
  addFooter(doc, pageNumber);
  
  const defaultFilename = `seguimiento_${patient.last_name}_${patient.first_name}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename || defaultFilename);
};
