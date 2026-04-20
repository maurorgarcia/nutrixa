import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientStore } from '@/stores/patientStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  ChevronRight, 
  Users, 
  Filter,
  ArrowUpDown,
  Mail,
  Phone,
  Calendar,
  Loader2,
  Trash2,
  FileText,
  UserCheck
} from 'lucide-react';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PatientForm } from './PatientForm';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function Patients() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { patients, loading, fetchPatients, deletePatient } = usePatientStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');

  useEffect(() => {
    if (user) {
      fetchPatients(user.id);
    }
  }, [user, fetchPatients]);

  const filteredPatients = useMemo(() => {
    return patients
      .filter(p => 
        p.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.correo?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'name') return a.nombre_completo.localeCompare(b.nombre_completo);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [patients, searchTerm, sortBy]);

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const onAddSuccess = () => {
    setIsAddingPatient(false);
    if (user) fetchPatients(user.id);
  };

  if (loading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-senralis-main" />
      </div>
    );
  }

  return (
    <div className="clinical-page space-y-6 max-w-full">
      
      {/* ── HEADER (Standard Pattern) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-senralis-main" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Archivo Institucional</p>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Directorio de Pacientes</h1>
          <p className="text-sm font-bold text-slate-500 opacity-80">{patients.length} expedientes registrados</p>
        </div>
        <Button
          onClick={() => setIsAddingPatient(true)}
          className="h-10 px-4 rounded-xl bg-senralis-main text-white font-bold text-xs uppercase tracking-widest"
        >
          <Plus className="w-4 h-4 mr-2" /> Nuevo Registro
        </Button>
      </div>

      {/* ── SEARCH & FILTERS (Compact) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            type="text" 
            placeholder="Buscar por nombre o correo..." 
            className="pl-11 h-11 bg-slate-50 border-transparent rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-senralis-main/20 transition-all w-full shadow-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setSortBy(sortBy === 'name' ? 'date' : 'name')}
            className="h-11 px-4 rounded-xl border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all gap-2"
          >
            <ArrowUpDown className="h-4 w-4" /> {sortBy === 'name' ? 'A-Z' : 'Fecha'}
          </Button>
          <Button variant="outline" className="h-11 w-11 rounded-xl border-slate-200 p-0 text-slate-400"><Filter className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* ── PATIENTS LIST (Compact Data Table Pattern) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="p-20 text-center">
             <Users className="h-10 w-10 text-slate-200 mx-auto mb-4" />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin resultados</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredPatients.map((patient) => (
              <div 
                key={patient.id} 
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group"
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-senralis-main transition-colors">
                    {getInitials(patient.nombre_completo)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-900 truncate leading-none mb-1.5">{patient.nombre_completo}</h3>
                    <div className="flex items-center gap-3">
                       <p className="text-[10px] font-bold text-slate-400 truncate flex items-center gap-1.5">
                          <Mail className="w-3 h-3" /> {patient.correo || '--'}
                       </p>
                       <span className="h-1 w-1 rounded-full bg-slate-200" />
                       <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" /> {format(new Date(patient.created_at), "dd/MM/yy")}
                       </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                   <div className="hidden sm:flex flex-col items-end px-4">
                      <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest">Activo</Badge>
                   </div>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                         <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-slate-900 rounded-lg"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-100 shadow-xl">
                         <DropdownMenuItem onClick={() => navigate(`/patients/${patient.id}`)} className="text-xs font-bold py-2.5">Ver Expediente</DropdownMenuItem>
                         <DropdownMenuItem className="text-xs font-bold py-2.5">Editar</DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem 
                           className="text-xs font-bold py-2.5 text-rose-500"
                           onClick={(e) => {
                             e.stopPropagation();
                             if (confirm('¿Eliminar paciente?')) deletePatient(patient.id);
                           }}
                         >
                           Eliminar
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                   <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-senralis-main group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ADD PATIENT SHEET ── */}
      <Sheet open={isAddingPatient} onOpenChange={setIsAddingPatient}>
        <SheetContent className="sm:max-w-xl p-0 border-none shadow-2xl flex flex-col bg-white">
          <SheetHeader className="p-8 border-b border-slate-100 bg-[#0F172A] text-left shrink-0">
            <SheetTitle className="text-xl font-black text-white tracking-widest uppercase mb-1">Nuevo Expediente</SheetTitle>
            <SheetDescription className="font-bold text-senralis-soft/70 text-[10px] uppercase tracking-widest">
              Alta de Registro Institucional
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            <PatientForm onSuccess={onAddSuccess} onCancel={() => setIsAddingPatient(false)} />
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}
