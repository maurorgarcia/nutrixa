import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { usePatientStore } from '@/stores/patientStore';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Search, Plus, Edit, Trash2, FileText,
  Loader2, MoreVertical, Users, ArrowRight
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PatientForm } from './PatientForm';
import type { PatientWithAge } from '@/types';
import { cn } from '@/lib/utils';

export function Patients() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { loading, fetchPatients, deletePatient, setSearchQuery, filteredPatients } = usePatientStore();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<PatientWithAge | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchPatients(user.id);
  }, [user]);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchValue), 300);
    return () => clearTimeout(t);
  }, [searchValue]);

  const handleDelete = async () => {
    if (patientToDelete) {
      await deletePatient(patientToDelete.id);
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
    }
  };

  const onSuccess = () => {
    setIsAddingPatient(false);
    setEditingPatientId(null);
    if (user) fetchPatients(user.id);
  };

  const displayedPatients = filteredPatients();

  const stressMap: Record<string, { label: string; cls: string }> = {
    low:      { label: 'Bajo',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    moderate: { label: 'Moderado', cls: 'bg-amber-50 text-amber-700 border-amber-100' },
    high:     { label: 'Alto',     cls: 'bg-red-50 text-red-700 border-red-100' },
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">

      {/* ── BOUTIQUE HEADER (Editorial) ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <div className="h-[1px] w-6 bg-primary/30" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Directorio Clínico</p>
           </div>
           <h1 className="text-5xl font-black text-primary leading-none tracking-tight">
              Pacientes.
           </h1>
           <p className="text-foreground/60 font-medium max-w-md">
             {displayedPatients.length} perfiles activos registrados bajo tu supervisión profesional.
           </p>
        </div>
        <Button
          onClick={() => setIsAddingPatient(true)}
          className="h-14 px-10 rounded-full bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 transition-transform active:scale-95 flex items-center gap-3"
        >
          <Plus className="h-5 w-5" /> Nuevo Registro
        </Button>
      </div>

      {/* ── SEARCH (Bespoke interaction) ── */}
      <div className="relative group max-w-2xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Filtrar por nombre, identificación o contacto..."
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          className="w-full h-16 pl-14 pr-6 text-sm font-bold border border-primary/5 rounded-[2rem] bg-white transition-all placeholder:text-primary/20 focus:ring-0 focus:border-primary/20 shadow-sm"
        />
      </div>

      {/* ── PATIENT GRID (Signature layout) ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="h-10 w-10 text-primary/20 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Sincronizando archivos...</p>
        </div>
      ) : displayedPatients.length === 0 ? (
        <div className="py-40 text-center bg-white/50 rounded-[3rem] border-2 border-dashed border-primary/5">
          <Users className="h-12 w-12 text-primary/10 mx-auto mb-4" />
          <p className="text-primary/40 text-[10px] font-black uppercase tracking-widest">No se encontraron registros asociados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedPatients.map((patient) => (
            <div
              key={patient.id}
              className="group relative bg-white border border-primary/5 p-8 rounded-[2.5rem] hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer"
              onClick={() => navigate(`/patients/${patient.id}`)}
            >
              <div className="flex items-start justify-between mb-8">
                <div className="h-14 w-14 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-center">
                   <p className="text-xl font-black text-primary uppercase">{patient.first_name[0]}{patient.last_name[0]}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-foreground/40 hover:text-primary">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl border-primary/10 shadow-xl">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingPatientId(patient.id); setIsAddingPatient(true); }} className="rounded-xl font-bold py-2">
                       <Edit className="h-4 w-4 mr-2" /> Editar Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setPatientToDelete(patient); setDeleteDialogOpen(true); }} className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-xl font-bold py-2">
                       <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-4">
                <div>
                   <h3 className="text-xl font-black text-primary leading-none group-hover:underline decoration-primary/20 underline-offset-4">{patient.first_name} {patient.last_name}</h3>
                   <p className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest mt-2">{patient.email || 'Sin contacto'}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4 border-t border-primary/5">
                   <span className="px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-wider">{patient.age} años</span>
                   {patient.stress_level && (
                     <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", stressMap[patient.stress_level].cls)}>
                        Stress {stressMap[patient.stress_level].label}
                     </span>
                   )}
                </div>
                
                <div className="pt-4 flex items-center justify-between">
                   <p className="text-[10px] font-black uppercase tracking-widest text-primary/30 group-hover:text-primary/60 transition-colors">Ver ficha completa</p>
                   <ArrowRight className="h-4 w-4 text-primary/10 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── FORMS ── */}
      <Sheet open={isAddingPatient} onOpenChange={setIsAddingPatient}>
        <SheetContent className="sm:max-w-xl rounded-l-[3rem] border-primary/10 p-0 overflow-hidden">
          <div className="h-full overflow-y-auto px-8 py-10 no-scrollbar">
            <SheetHeader className="mb-10 pl-6 border-l-4 border-primary">
              <SheetTitle className="text-3xl font-black text-primary tracking-tighter uppercase whitespace-pre-line leading-none">
                {editingPatientId ? 'Modificar\nRegistro.' : 'Nuevo\nPaciente.'}
              </SheetTitle>
              <SheetDescription className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
                Gestión de archivos clínicos Nutrixa
              </SheetDescription>
            </SheetHeader>
            <PatientForm 
              patientId={editingPatientId ?? undefined} 
              onSuccess={onSuccess} 
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem] border-primary/10 p-10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-black text-primary tracking-tighter leading-none mb-4 uppercase">¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/60 font-medium">
              Esta acción eliminará de forma permanente el expediente clínico del paciente y no podrá recuperarse el historial de anamnesis asociado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-4">
            <AlertDialogCancel className="rounded-full border-primary/10 h-14 px-8 font-black uppercase text-[10px] tracking-widest shadow-none">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-full bg-red-600 text-white h-14 px-8 font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-red-700">Confirmar Baja</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
