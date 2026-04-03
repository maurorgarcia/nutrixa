import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePatientStore } from '@/stores/patientStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, DollarSign, CheckCircle2, Trash2, ExternalLink, Loader2,
  Clock, AlertTriangle, RefreshCw, MoreVertical, Search,
  ShieldCheck, Banknote, CreditCard, Zap
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PaymentForm } from './PaymentForm';
import { cn } from '@/lib/utils';
import type { Payment } from '@/types';

export function Payments() {
  const { user } = useAuthStore();
  const { patients, fetchPatients } = usePatientStore();
  const { payments, loading, fetchPayments, updatePaymentStatus, deletePayment } = usePaymentStore();
  
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchPayments(user.id);
      fetchPatients(user.id);
    }
  }, [user]);

  const stats = {
    totalCollected: payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0),
    totalPending: payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0),
    countPaid: payments.filter(p => p.status === 'paid').length,
    countPending: payments.filter(p => p.status === 'pending').length,
  };

  const filteredPayments = payments.filter(p => {
    const patient = patients.find(pt => pt.id === p.patient_id);
    const searchTarget = `${p.description} ${patient?.first_name} ${patient?.last_name}`.toLowerCase();
    return searchTarget.includes(searchQuery.toLowerCase());
  });

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'transfer': return <Banknote className="h-4 w-4" />;
      case 'mercadopago': return <Zap className="h-4 w-4" />;
      case 'stripe': return <CreditCard className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-zinc-100">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase">Gestión de Cobros</h1>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Facturación, saldos y conciliación de cuentas</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => user && fetchPayments(user.id)} className="h-12 w-12 rounded-2xl border-zinc-200">
            <RefreshCw className={cn("h-4 w-4 text-zinc-400", loading && "animate-spin")} />
          </Button>
          <Button onClick={() => setIsAddingPayment(true)} className="h-12 px-8 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl flex items-center gap-3">
            <Plus className="h-4 w-4" /> Nuevo Cobro
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Recaudación Total', value: `$${stats.totalCollected.toLocaleString('es-AR')}`, sub: 'Histórico Neto', icon: ShieldCheck, color: 'emerald' },
          { label: 'Saldos Pendientes', value: `$${stats.totalPending.toLocaleString('es-AR')}`, sub: 'Por Recibir', icon: Clock, color: 'amber' },
          { label: 'Pagos Confirmados', value: stats.countPaid, sub: 'Operaciones Éxito', icon: CheckCircle2, color: 'zinc' },
          { label: 'Ordenes Abiertas', value: stats.countPending, sub: 'En Seguimiento', icon: AlertTriangle, color: stats.countPending > 0 ? 'amber' : 'zinc' },
        ].map((kpi, i) => (
          <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-lg transition-all border border-zinc-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{kpi.label}</p>
                <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center", 
                  kpi.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                  kpi.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-zinc-50 text-zinc-500'
                )}>
                  <kpi.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-zinc-900 tracking-tight">{kpi.value}</p>
              <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-tighter">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main List Area */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Buscar por paciente o descripción..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white border border-zinc-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all shadow-sm"
              />
           </div>
        </div>

        <Card className="border-zinc-100 shadow-2xl rounded-[3rem] bg-white overflow-hidden border">
          <CardContent className="p-0">
             <div className="grid grid-cols-12 px-10 py-5 bg-zinc-50/50 border-b border-zinc-100">
                <span className="col-span-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Paciente / Concepto</span>
                <span className="col-span-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Monto</span>
                <span className="col-span-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Canal</span>
                <span className="col-span-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Estado</span>
                <span className="col-span-1"></span>
             </div>

             {loading && payments.length === 0 ? (
               <div className="py-24 text-center"><Loader2 className="h-10 w-10 animate-spin text-zinc-100 mx-auto" /></div>
             ) : filteredPayments.length === 0 ? (
               <div className="py-32 text-center px-10">
                  <Banknote className="h-12 w-12 text-zinc-100 mx-auto mb-4" />
                  <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Sin transacciones que coincidan</p>
               </div>
             ) : (
               <div className="divide-y divide-zinc-50">
                  {filteredPayments.map(payment => {
                    const patient = patients.find(p => p.id === payment.patient_id);
                    return (
                      <div key={payment.id} className="grid grid-cols-12 px-10 py-6 hover:bg-zinc-50/50 transition-all items-center group">
                        <div className="col-span-4 flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-black text-zinc-400">{patient ? `${patient.first_name[0]}${patient.last_name[0]}` : '?'}</span>
                           </div>
                           <div className="min-w-0">
                              <p className="text-sm font-black text-zinc-900 leading-tight truncate uppercase tracking-tighter">{patient ? `${patient.first_name} ${patient.last_name}` : 'Global'}</p>
                              <p className="text-[10px] font-bold text-zinc-400 mt-1 truncate">{payment.description}</p>
                           </div>
                        </div>
                        <div className="col-span-2">
                           <p className="text-lg font-black text-zinc-900 tracking-tighter">${payment.amount.toLocaleString('es-AR')}</p>
                        </div>
                        <div className="col-span-3 flex items-center gap-2">
                           <div className="p-2 bg-zinc-50 rounded-lg text-zinc-400 shadow-inner">{getMethodIcon(payment.method)}</div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{payment.method}</span>
                        </div>
                        <div className="col-span-2">
                           <Badge variant="outline" className={cn(
                             "rounded-xl h-7 px-4 text-[9px] font-black uppercase tracking-widest border shadow-sm",
                             payment.status === 'paid' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"
                           )}>
                             {payment.status === 'paid' ? 'Recibido' : 'Pendiente'}
                           </Badge>
                        </div>
                        <div className="col-span-1 flex justify-end">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-zinc-100 text-zinc-400 hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"><MoreVertical className="h-4 w-4" /></button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-zinc-100 shadow-2xl">
                                 {payment.status === 'pending' && (
                                   <DropdownMenuItem onClick={() => updatePaymentStatus(payment.id, 'paid')} className="h-12 rounded-xl text-emerald-600 font-bold focus:text-emerald-700 focus:bg-emerald-50">
                                      <CheckCircle2 className="h-4 w-4 mr-3" /> Confirmar Cobro
                                   </DropdownMenuItem>
                                 )}
                                 <DropdownMenuItem className="h-12 rounded-xl text-zinc-600 font-bold">
                                    <ExternalLink className="h-4 w-4 mr-3" /> Generar Link
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => setDeleteTarget(payment)} className="h-12 rounded-xl text-red-600 font-bold focus:text-red-700 focus:bg-red-50">
                                    <Trash2 className="h-4 w-4 mr-3" /> Eliminar Registro
                                 </DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
               </div>
             )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-3xl border-none p-10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-zinc-900 tracking-tighter uppercase">¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 font-medium text-base">
              Esta acción eliminará permanentemente el registro de <strong>${deleteTarget?.amount.toLocaleString()}</strong> de tu historial de asientos contables.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest border-zinc-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deletePayment(deleteTarget.id)} className="h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest">Eliminar permanentemente</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Payment Sheet */}
      <Sheet open={isAddingPayment} onOpenChange={setIsAddingPayment}>
        <SheetContent className="sm:max-w-[450px] p-0 overflow-hidden border-l border-zinc-100 shadow-2xl flex flex-col">
          <SheetHeader className="p-8 border-b border-zinc-50 bg-zinc-50/50 shrink-0 text-left">
            <SheetTitle className="text-2xl font-black text-zinc-900 tracking-tighter uppercase">Orden de Cobro</SheetTitle>
            <SheetDescription className="font-bold text-zinc-400 text-[10px] uppercase tracking-widest mt-1">
              Registro global de ingresos al consultorio
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-8">
            <PaymentForm 
              onSuccess={() => { setIsAddingPayment(false); user && fetchPayments(user.id); }}
              onCancel={() => setIsAddingPayment(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}
