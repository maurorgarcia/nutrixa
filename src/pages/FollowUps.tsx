import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useFollowUpStore } from '@/stores/followUpStore';
import { usePatientStore } from '@/stores/patientStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Calendar,
  ChevronRight,
  Loader2,
  Download,
  Activity,
  History,
  Target,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { FollowUp } from '@/types';
import { exportFollowUpToPDF } from '@/utils/pdfExport';
import { FollowUpForm } from './FollowUpForm';
import { cn } from '@/lib/utils';

export function FollowUps() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { followUpsWithPatient, loading, fetchFollowUps, deleteFollowUp } = useFollowUpStore();
  const { patients } = usePatientStore();
  
  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [followUpToDelete, setFollowUpToDelete] = useState<FollowUp | null>(null);

  useEffect(() => {
    if (user) {
      fetchFollowUps(user.id);
    }
  }, [user]);

  const handleDelete = async () => {
    if (followUpToDelete) {
      await deleteFollowUp(followUpToDelete.id);
      setDeleteDialogOpen(false);
      setFollowUpToDelete(null);
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.nombre_completo : 'Paciente no encontrado';
  };

  const getInitials = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return '?';
    return patient.nombre_completo.substring(0, 2).toUpperCase();
  };

  const handleExport = (followUp: FollowUp) => {
    const patient = patients.find(p => p.id === followUp.patient_id);
    if (patient) {
      const patientFollowUps = followUpsWithPatient
        .filter(fu => fu.patient_id === patient.id)
        .map(fu => fu as FollowUp);
      exportFollowUpToPDF(patient, patientFollowUps);
    }
  };

  const stats = [
    { label: 'Controles Realizados', value: followUpsWithPatient.length, sub: 'Historial total', icon: History, color: 'slate' },
    { label: 'Agenda Semanal', value: followUpsWithPatient.filter(fu => {
      if (!fu.next_appointment) return false;
      const nextDate = new Date(fu.next_appointment);
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return nextDate >= today && nextDate <= nextWeek;
    }).length, sub: 'Próximos 7 días', icon: Calendar, color: 'emerald' },
    { label: 'Fidelización', value: new Set(followUpsWithPatient.map(fu => fu.patient_id)).size, sub: 'Pacientes recurrentes', icon: Target, color: 'blue' },
  ];

  return (
    <div className="clinical-page space-y-8 max-w-7xl mx-auto">
      
      {/* ── PROFESSIONAL HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            Seguimiento Clínico
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Monitoreo de evolución, adherencia y parámetros antropométricos.
          </p>
        </div>
        <Button
          onClick={() => setIsAddingFollowUp(true)}
          className="h-11 px-6 rounded-xl bg-[#09090b] text-white font-semibold hover:bg-[#18181b] shadow-lg shadow-slate-200 transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Registrar Control
        </Button>
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-5">
             <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center border", 
               s.color === 'emerald' ? 'bg-slate-50 text-senralis-main border-slate-100' :
               s.color === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100'
             )}>
                <s.icon className="h-6 w-6" />
             </div>
             <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">{s.label}</p>
                <div className="flex items-baseline gap-2">
                   <p className="text-2xl font-extrabold text-slate-900 leading-none">{s.value}</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase">{s.sub}</p>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* ── FOLLOW UPS LIST ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="h-10 w-10 text-senralis-main animate-spin" />
          <p className="text-sm font-medium text-slate-500">Cargando registros...</p>
        </div>
      ) : followUpsWithPatient.length === 0 ? (
        <div className="py-24 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100 text-slate-300">
            <Activity className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Sin registros de evolución</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto mb-6">
            Registrá la evolución de tus pacientes para ver sus curvas de progreso.
          </p>
          <Button
            onClick={() => setIsAddingFollowUp(true)}
            className="h-10 px-6 rounded-lg bg-slate-900 text-white font-bold text-xs"
          >
            Nuevo Registro
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {followUpsWithPatient.map((followUp) => (
            <div key={followUp.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 rounded-xl border border-slate-200">
                      <AvatarFallback className="bg-slate-900 text-white font-bold text-lg rounded-none">
                        {getInitials(followUp.patient_id)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                         <h3 className="text-lg font-bold text-slate-900 group-hover:text-senralis-dark transition-colors">
                           {getPatientName(followUp.patient_id)}
                         </h3>
                         <Badge variant="outline" className={cn(
                           "rounded-md border-none text-[9px] font-extrabold uppercase px-1.5",
                           followUp.adherence === 'excellent' ? 'bg-slate-100 text-senralis-dark' : 
                           followUp.adherence === 'good' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                         )}>
                            {followUp.adherence || 'Pte'}
                         </Badge>
                      </div>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" /> {format(new Date(followUp.date), "dd 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 lg:gap-16">
                    <div className="text-center">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Peso</p>
                       <p className="text-2xl font-extrabold text-slate-900 leading-none">{followUp.weight} <span className="text-[10px] font-bold text-slate-400 uppercase">kg</span></p>
                    </div>

                    {followUp.next_appointment && (
                      <div className="text-center hidden lg:block bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Siguiente Turno</p>
                        <p className="text-xs font-bold text-slate-900 uppercase">
                          {format(new Date(followUp.next_appointment), "dd 'de' MMM", { locale: es })}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 p-1 rounded-xl border-slate-200 shadow-xl font-sans">
                            <DropdownMenuItem onClick={() => { setSelectedFollowUpId(followUp.id); setIsAddingFollowUp(true); }} className="rounded-lg font-bold py-2.5 text-slate-600 cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" /> Editar Registro
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(followUp)} className="rounded-lg font-bold py-2.5 text-slate-600 cursor-pointer">
                              <Download className="h-4 w-4 mr-2" /> Exportar Reporte
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="rounded-lg font-bold py-2.5 text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                              onClick={() => {
                                setFollowUpToDelete(followUp);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                       <Button variant="ghost" size="icon" className="h-10 w-10 lg:hidden rounded-lg border border-slate-100 text-slate-300 group-hover:text-slate-600" onClick={() => navigate(`/patients/${followUp.patient_id}`)}>
                          <ChevronRight className="h-5 w-5" />
                       </Button>
                    </div>
                  </div>
                </div>

                {(followUp.symptoms?.length > 0 || followUp.concerns?.length > 0 || followUp.notes) && (
                  <div className="mt-6 pt-6 border-t border-slate-50 flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex flex-wrap gap-2">
                       {followUp.symptoms?.map((s, i) => (
                         <Badge key={i} variant="outline" className="bg-red-50 text-red-700 text-[9px] font-bold uppercase border-red-100 rounded-md">{s}</Badge>
                       ))}
                       {followUp.concerns?.map((c, i) => (
                         <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 text-[9px] font-bold uppercase border-blue-100 rounded-md">{c}</Badge>
                       ))}
                    </div>
                    {followUp.notes && (
                      <div className="flex items-start gap-2 max-w-md">
                        <Info className="h-3.5 w-3.5 text-slate-300 mt-0.5 shrink-0" />
                        <p className="text-xs font-semibold text-slate-500 leading-relaxed italic">
                          {followUp.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-slate-200 p-8 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900 mb-2">¿Eliminar registro de evolución?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium leading-relaxed">
              Borrarás el seguimiento clínico de <strong>{followUpToDelete ? getPatientName(followUpToDelete.patient_id) : ''}</strong> correspondiente a esta fecha. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3 sm:gap-0">
            <AlertDialogCancel className="rounded-xl border-slate-200 h-11 px-6 font-bold text-slate-500 hover:bg-slate-50 shadow-none">Descartar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-red-600 text-white h-11 px-6 font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-all">Confirmar Baja</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={isAddingFollowUp} onOpenChange={(v) => { setIsAddingFollowUp(v); if(!v) setSelectedFollowUpId(null); }}>
        <SheetContent className="sm:max-w-xl p-0 overflow-hidden border-l border-slate-200 shadow-2xl flex flex-col bg-white">
          <SheetHeader className="p-8 border-b border-slate-100 bg-slate-50/50 shrink-0 text-left">
            <Badge variant="outline" className="w-fit bg-slate-50 text-senralis-dark border-none px-2 rounded-md font-bold text-[10px] uppercase mb-4">
              {selectedFollowUpId ? 'Actualización Clínica' : 'Alta de Seguimiento'}
            </Badge>
            <SheetTitle className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {selectedFollowUpId ? 'Modificar Evolución' : 'Registrar Nuevo Progreso'}
            </SheetTitle>
            <SheetDescription className="text-sm font-medium text-slate-500 mt-1">
              Completá los parámetros antropométricos y observaciones de la consulta.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            <FollowUpForm 
              initialId={selectedFollowUpId || undefined}
              onSuccess={() => { setIsAddingFollowUp(false); setSelectedFollowUpId(null); if(user) fetchFollowUps(user.id); }}
              onCancel={() => { setIsAddingFollowUp(false); setSelectedFollowUpId(null); }}
            />
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}
