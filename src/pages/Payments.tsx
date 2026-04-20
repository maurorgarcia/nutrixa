import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePatientStore } from '@/stores/patientStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, DollarSign, CheckCircle2, Trash2, ExternalLink, Loader2,
  Clock, AlertTriangle, RefreshCw, MoreVertical, Search,
  Banknote, CreditCard, Zap, ChevronRight,
  ShieldAlert
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { PaymentForm } from './PaymentForm';
import { cn } from '@/lib/utils';
import type { Payment } from '@/types';

export function Payments() {
  const { user } = useAuthStore();
  const { patients, fetchPatients } = usePatientStore();
  const { payments, loading, error: paymentsError, fetchPayments, updatePaymentStatus, deletePayment } = usePaymentStore();
  
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
    const searchTarget = `${p.description} ${patient?.nombre_completo}`.toLowerCase();
    return searchTarget.includes(searchQuery.toLowerCase());
  });

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'transfer': return <Banknote className="h-4 w-4" />;
      case 'mercadopago': return <Zap className="h-4 w-4 text-amber-500" />;
      case 'card': return <CreditCard className="h-4 w-4 text-blue-500" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-senralis-main" />
      </div>
    );
  }

  return (
    <div className="clinical-page space-y-6 max-w-full">
      {paymentsError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
          {paymentsError}
        </div>
      )}

      {/* ── HEADER (Standard Pattern) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-senralis-main" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dashboard de Honorarios</p>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Gestión de Cobros</h1>
          <p className="text-sm font-bold text-slate-500 opacity-80">Administre ingresos y conciliación bancaria</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => user && fetchPayments(user.id)} variant="ghost" size="icon" className="h-10 w-10 text-slate-300 border border-transparent hover:border-slate-100"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /></Button>
          <Button onClick={() => setIsAddingPayment(true)} className="h-10 px-4 rounded-xl bg-senralis-main text-white font-bold text-xs uppercase tracking-widest">
            <Plus className="w-4 h-4 mr-2" /> Nuevo Cobro
          </Button>
        </div>
      </div>

      {/* ── STATS (Compact) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Recaudado', value: `$${stats.totalCollected.toLocaleString('es-AR')}`, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Pendiente', value: `$${stats.totalPending.toLocaleString('es-AR')}`, icon: Clock, color: 'text-amber-600' },
          { label: 'Operaciones', value: stats.countPaid, icon: Zap, color: 'text-blue-600' },
          { label: 'Alertas', value: stats.countPending, icon: AlertTriangle, color: 'text-rose-600' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{kpi.label}</p>
               <kpi.icon className={cn("h-3.5 w-3.5", kpi.color)} />
            </div>
            <p className="text-xl font-black text-slate-900 leading-none">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* ── SEARCH (Compact) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
           <Input 
            type="text" 
            placeholder="Buscar por paciente o concepto..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-11 h-11 bg-slate-50 border-transparent rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-senralis-main/20 transition-all w-full shadow-none"
           />
        </div>
      </div>

      {/* ── PAYMENTS LIST (Compact Table Pattern) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-20 text-center">
             <Banknote className="h-10 w-10 text-slate-200 mx-auto mb-4" />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin transacciones</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
             {filteredPayments.map(payment => {
               const patient = patients.find(p => p.id === payment.patient_id);
               return (
                 <div key={payment.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group">
                   <div className="flex items-center gap-4 min-w-0">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center font-black",
                        payment.status === 'paid' ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-300 border border-slate-100"
                      )}>
                         <DollarSign className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                         <h4 className="text-sm font-black text-slate-900 truncate leading-none mb-1.5">{patient ? patient.nombre_completo : 'Carga General'}</h4>
                         <p className="text-[10px] font-bold text-slate-400 leading-none truncate">{payment.description}</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-4">
                      <div className="hidden sm:flex flex-col items-end px-4">
                         <p className="text-base font-black text-slate-900 tracking-tight">${payment.amount.toLocaleString('es-AR')}</p>
                         <div className="flex items-center gap-2 mt-1">
                            {getMethodIcon(payment.method)}
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{payment.method}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <Badge className={cn(
                           "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                           payment.status === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                         )}>
                           {payment.status === 'paid' ? 'AUDITADO' : 'PENDIENTE'}
                         </Badge>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                               <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-slate-900 rounded-lg"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-100 shadow-xl">
                               {payment.status === 'pending' && (
                                 <DropdownMenuItem onClick={() => updatePaymentStatus(payment.id, 'paid')} className="text-xs font-bold py-2.5 text-senralis-main">Conciliar</DropdownMenuItem>
                               )}
                               <DropdownMenuItem className="text-xs font-bold py-2.5">Recibo PDF</DropdownMenuItem>
                               <DropdownMenuSeparator />
                               <DropdownMenuItem onClick={() => setDeleteTarget(payment)} className="text-xs font-bold py-2.5 text-rose-500">Anular</DropdownMenuItem>
                            </DropdownMenuContent>
                         </DropdownMenu>
                         <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-senralis-main transition-all" />
                      </div>
                   </div>
                 </div>
               );
             })}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl border-slate-100 p-8 shadow-2xl">
          <AlertDialogHeader>
            <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
               <ShieldAlert className="h-5 w-5 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-lg font-black text-slate-900 tracking-tight uppercase">¿Anular transacción?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-bold text-slate-400 leading-relaxed mb-4">
              Esta acción es definitiva y anulará el registro contable de <span className="text-slate-900">${deleteTarget?.amount.toLocaleString()}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-slate-100 h-10 px-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if(deleteTarget) deletePayment(deleteTarget.id); setDeleteTarget(null); }} className="rounded-xl bg-rose-600 text-white h-10 px-6 font-black text-[10px] uppercase tracking-widest">Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={isAddingPayment} onOpenChange={setIsAddingPayment}>
        <SheetContent className="sm:max-w-xl p-0 border-none shadow-2xl flex flex-col bg-white">
          <SheetHeader className="p-8 border-b border-slate-100 bg-[#0F172A] text-left shrink-0">
            <SheetTitle className="text-xl font-black text-white tracking-widest uppercase mb-1">Orden de Cobro</SheetTitle>
            <SheetDescription className="font-bold text-senralis-soft/70 text-[10px] uppercase tracking-widest">
              Emisión de Factura de Honorarios
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
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
