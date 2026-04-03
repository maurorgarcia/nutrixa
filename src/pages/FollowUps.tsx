import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useFollowUpStore } from '@/stores/followUpStore';
import { usePatientStore } from '@/stores/patientStore';
import { Card, CardContent } from '@/components/ui/card';
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
  Target
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
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Paciente no encontrado';
  };

  const getInitials = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return '?';
    return `${patient.first_name[0]}${patient.last_name[0]}`.toUpperCase();
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
    { label: 'Total Controles', value: followUpsWithPatient.length, sub: 'Gestión Acumulada', icon: History, color: 'zinc' },
    { label: 'Citas esta Semana', value: followUpsWithPatient.filter(fu => {
      if (!fu.next_appointment) return false;
      const nextDate = new Date(fu.next_appointment);
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return nextDate >= today && nextDate <= nextWeek;
    }).length, sub: 'Agenda Próxima', icon: Calendar, color: 'emerald' },
    { label: 'Pacientes Únicos', value: new Set(followUpsWithPatient.map(fu => fu.patient_id)).size, sub: 'Fidelización Activa', icon: Target, color: 'blue' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-zinc-100">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase">Bitácora de Evolución</h1>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Seguimiento clínico y monitoreo de adherencia</p>
        </div>
        <Button onClick={() => setIsAddingFollowUp(true)} className="h-12 px-8 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl flex items-center gap-3 active:scale-95 transition-all">
          <Plus className="h-4 w-4" /> Registrar Progreso
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((s, i) => (
          <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white border border-zinc-100/50">
            <CardContent className="p-6 flex items-center gap-5">
               <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border", 
                 s.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                 s.color === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-zinc-50 text-zinc-500 border-zinc-100'
               )}>
                  <s.icon className="h-6 w-6" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">{s.label}</p>
                  <p className="text-2xl font-black text-zinc-900 tracking-tighter leading-none">{s.value}</p>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase mt-1.5">{s.sub}</p>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Follow Ups List */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-zinc-100" />
        </div>
      ) : followUpsWithPatient.length === 0 ? (
        <div className="py-32 text-center bg-white rounded-[3rem] border border-zinc-100 shadow-sm">
           <Activity className="h-16 w-16 text-zinc-100 mx-auto mb-6" />
           <h3 className="text-xl font-black text-zinc-900 tracking-tighter uppercase mb-2">Sin registros de evolución</h3>
           <p className="text-zinc-400 max-w-sm mx-auto text-xs font-bold uppercase tracking-widest mb-10 leading-relaxed">Comenzá registrando el peso y las observaciones clínicas para ver la curva de progreso.</p>
           <Button onClick={() => setIsAddingFollowUp(true)} className="bg-zinc-900 text-white font-black uppercase tracking-widest h-12 px-10 rounded-2xl text-[10px] shadow-xl">
             Registrar Primer Control
           </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {followUpsWithPatient.map((followUp) => (
            <Card key={followUp.id} className="group border-zinc-100 shadow-sm rounded-[2rem] overflow-hidden hover:shadow-xl transition-all duration-500 bg-white hover:border-zinc-200">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-16 w-16 border-4 border-zinc-50 shadow-sm ring-1 ring-zinc-100">
                      <AvatarFallback className="bg-zinc-900 text-white font-black uppercase text-xl">
                        {getInitials(followUp.patient_id)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                         <p className="text-xl font-black text-zinc-900 tracking-tighter uppercase group-hover:text-emerald-700 transition-colors">
                           {getPatientName(followUp.patient_id)}
                         </p>
                         <Badge variant="outline" className={cn(
                           "rounded-lg h-6 px-3 text-[9px] font-black uppercase tracking-widest border",
                           followUp.adherence === 'excellent' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                           followUp.adherence === 'good' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-slate-50 border-slate-100 text-slate-500'
                         )}>
                            {followUp.adherence || 'Sin adherencia'}
                         </Badge>
                      </div>
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                        <Calendar className="h-3 w-3" /> {format(new Date(followUp.date), "dd MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12 pl-22 md:pl-0">
                    <div className="text-center">
                       <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest leading-none mb-2">Peso Actual</p>
                       <p className="text-3xl font-black text-zinc-900 tracking-tighter leading-none">{followUp.weight} <span className="text-[10px] uppercase text-zinc-400">kg</span></p>
                    </div>

                    {followUp.next_appointment && (
                      <div className="text-center hidden lg:block bg-zinc-50 px-6 py-3 rounded-2xl border border-zinc-100">
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 underline underline-offset-4 decoration-emerald-500/30">Próximo Turno</p>
                        <p className="text-sm font-black text-zinc-900 uppercase">
                          {format(new Date(followUp.next_appointment), "dd MMM", { locale: es })}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border border-zinc-100 hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900 transition-all opacity-0 group-hover:opacity-100">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-zinc-100 shadow-2xl">
                            <DropdownMenuItem onClick={() => { setSelectedFollowUpId(followUp.id); setIsAddingFollowUp(true); }} className="h-11 rounded-xl font-bold">
                              <Edit className="h-4 w-4 mr-3" /> Editar Registro
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(followUp)} className="h-11 rounded-xl font-bold">
                              <Download className="h-4 w-4 mr-3" /> Exportar Reporte
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="h-11 rounded-xl text-red-600 font-bold focus:bg-red-50 focus:text-red-700"
                              onClick={() => {
                                setFollowUpToDelete(followUp);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-3" /> Eliminar permanentemente
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                       <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border border-zinc-100 hover:bg-zinc-50 text-zinc-400 group-hover:text-zinc-900 transition-all sm:hidden" onClick={() => navigate(`/patients/${followUp.patient_id}`)}>
                          <ChevronRight className="h-5 w-5" />
                       </Button>
                    </div>
                  </div>
                </div>

                {(followUp.symptoms?.length > 0 || followUp.concerns?.length > 0 || followUp.notes) && (
                  <div className="mt-8 pt-8 border-t border-zinc-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-wrap gap-2">
                       {followUp.symptoms?.map((s, i) => (
                         <span key={i} className="px-3 py-1 bg-red-50 text-red-700 text-[9px] font-black uppercase tracking-widest border border-red-100 rounded-lg">{s}</span>
                       ))}
                       {followUp.concerns?.map((c, i) => (
                         <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-widest border border-amber-100 rounded-lg">{c}</span>
                       ))}
                    </div>
                    {followUp.notes && (
                      <p className="text-xs font-bold text-zinc-400 leading-relaxed italic border-l-2 border-zinc-100 pl-4">
                        "{followUp.notes}"
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-none p-10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-zinc-900 tracking-tighter uppercase">¿Eliminar control?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 font-medium text-base leading-relaxed">
              Estás a punto de borrar definitivamente este registro clinico de <strong>{followUpToDelete ? getPatientName(followUpToDelete.patient_id) : ''}</strong>. Esta acción romperá la continuidad histórica de su peso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest border-zinc-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl">
              Eliminar Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sheet for Adding/Editing Follow Up */}
      <Sheet open={isAddingFollowUp} onOpenChange={(v) => { setIsAddingFollowUp(v); if(!v) setSelectedFollowUpId(null); }}>
        <SheetContent className="sm:max-w-[450px] p-0 overflow-hidden border-l border-zinc-100 shadow-2xl flex flex-col">
          <SheetHeader className="p-8 border-b border-zinc-50 bg-zinc-50/50 shrink-0 text-left">
            <SheetTitle className="text-2xl font-black text-zinc-900 tracking-tighter uppercase">{selectedFollowUpId ? 'Editar Evolución' : 'Ficha de Progreso'}</SheetTitle>
            <SheetDescription className="font-bold text-zinc-400 text-[10px] uppercase tracking-widest mt-1">
              Registro manual de parámetros clínico-nutricionales
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-8">
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
