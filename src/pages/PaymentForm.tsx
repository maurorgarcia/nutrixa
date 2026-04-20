import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { usePatientStore } from '@/stores/patientStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentInsert, PaymentMethod, PaymentStatus } from '@/types';

interface PaymentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialPatientId?: string;
}

export function PaymentForm({ onSuccess, onCancel, initialPatientId }: PaymentFormProps) {
  const { user } = useAuthStore();
  const { createPayment } = usePaymentStore();
  const { patients } = usePatientStore();
  const [saving, setSaving] = useState(false);

  const [patientId, setPatientId] = useState(initialPatientId || '');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState<Extract<PaymentStatus, 'pending' | 'paid'>>('pending');
  const [method, setMethod] = useState<PaymentMethod>('transfer');

  useEffect(() => {
    if (initialPatientId) setPatientId(initialPatientId);
  }, [initialPatientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !patientId || amount <= 0) return;

    const patient = patients.find((p) => p.id === patientId);
    const paidAt = status === 'paid' ? new Date().toISOString() : null;

    const row: PaymentInsert = {
      user_id: user.id,
      patient_id: patientId,
      patient_name: patient?.nombre_completo?.trim() || 'Paciente',
      patient_email: (patient?.correo || '').trim(),
      description: description.trim(),
      amount,
      currency: 'ARS',
      status,
      method,
      notes: '',
      paid_at: paidAt,
    };

    setSaving(true);
    try {
      const { error } = await createPayment(row);
      if (error) {
        toast.error(error);
        return;
      }
      toast.success('Cobro registrado correctamente');
      onSuccess?.();
    } catch (error) {
      console.error('Error saving payment:', error);
      toast.error('No se pudo registrar el cobro');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          {!initialPatientId && (
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Paciente *</Label>
              <Select
                value={patientId}
                onValueChange={setPatientId}
                required
              >
                <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                  <SelectValue placeholder="Seleccionar paciente..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.nombre_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Concepto / Descripción *</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Consulta Nutrición, Plan Mensual, etc."
              className="h-12 border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Monto ($) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="number"
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  required
                  placeholder="0.00"
                  className="h-12 border-slate-200 rounded-xl pl-10 font-black text-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Método *</Label>
              <Select
                value={method}
                onValueChange={(value) => setMethod(value as PaymentMethod)}
              >
                <SelectTrigger className="h-12 border-slate-200 rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="mercadopago">MercadoPago</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Estado Inicial *</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'pending' as const, label: 'Pendiente', color: 'data-[state=on]:bg-amber-50 data-[state=on]:text-amber-700 data-[state=on]:border-amber-200' },
                { id: 'paid' as const, label: 'Pagado Ya', color: 'data-[state=on]:bg-slate-50 data-[state=on]:text-senralis-dark data-[state=on]:border-emerald-200' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatus(item.id)}
                  className={cn(
                    "h-12 rounded-xl border border-slate-100 text-xs font-black uppercase tracking-widest transition-all",
                    status === item.id
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 right-0 left-0 p-6 bg-white border-t border-slate-100 z-10 sm:left-auto sm:w-[450px] flex gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 font-bold h-11 px-6">
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] h-11 rounded-xl shadow-lg active:scale-95 transition-all"
            disabled={saving || amount <= 0 || !description.trim()}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Emitir Cobro
          </Button>
        </div>
      </form>
    </div>
  );
}
