import { useState } from 'react';
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
import type { Payment } from '@/types';

interface PaymentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialPatientId?: string;
}

export function PaymentForm({ onSuccess, onCancel, initialPatientId }: PaymentFormProps) {
  const { user } = useAuthStore();
  const { createPayment, loading: saving } = usePaymentStore();
  const { patients } = usePatientStore();
  
  const [formData, setFormData] = useState<Omit<Payment, 'id' | 'created_at' | 'updated_at'>>({
    patient_id: initialPatientId || '',
    nutritionist_id: user?.id || '',
    amount: 0,
    status: 'pending',
    method: 'transfer',
    description: '',
    external_reference: null,
    payment_url: null,
    paid_at: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.patient_id || formData.amount <= 0) return;

    try {
      await createPayment(formData);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          {!initialPatientId && (
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Paciente *</Label>
              <Select
                value={formData.patient_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, patient_id: value }))}
                required
              >
                <SelectTrigger className="h-12 border-zinc-200 rounded-xl">
                  <SelectValue placeholder="Seleccionar paciente..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Concepto / Descripción *</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              placeholder="Consulta Nutrición, Plan Mensual, etc."
              className="h-12 border-zinc-200 rounded-xl font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Monto ($) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  required
                  placeholder="0.00"
                  className="h-12 border-zinc-200 rounded-xl pl-10 font-black text-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Método *</Label>
              <Select
                value={formData.method}
                onValueChange={(value) => setFormData(prev => ({ ...prev, method: value as any }))}
              >
                <SelectTrigger className="h-12 border-zinc-200 rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="mercadopago">MercadoPago</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Estado Inicial *</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'pending', label: 'Pendiente', color: 'data-[state=on]:bg-amber-50 data-[state=on]:text-amber-700 data-[state=on]:border-amber-200' },
                { id: 'paid', label: 'Pagado Ya', color: 'data-[state=on]:bg-emerald-50 data-[state=on]:text-emerald-700 data-[state=on]:border-emerald-200' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: item.id as any }))}
                  className={cn(
                    "h-12 rounded-xl border border-zinc-100 text-xs font-black uppercase tracking-widest transition-all",
                    formData.status === item.id 
                      ? "bg-zinc-900 text-white border-zinc-900" 
                      : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 right-0 left-0 p-6 bg-white border-t border-zinc-100 z-10 sm:left-auto sm:w-[450px] flex gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 font-bold h-11 px-6">
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-[2] bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-[10px] h-11 rounded-xl shadow-lg active:scale-95 transition-all"
            disabled={saving || formData.amount <= 0 || !formData.description}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Emitir Cobro
          </Button>
        </div>
      </form>
    </div>
  );
}
