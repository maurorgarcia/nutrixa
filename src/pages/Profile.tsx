import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { User, Save, Loader2, ShieldCheck, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function Profile() {
  const { user, updateProfile } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    full_name: '',
  });

  useEffect(() => {
    if (user) {
      const nameParts = (user.full_name || '').split(' ');
      const knownTitles = ['Lic.', 'Dr.', 'Dra.', 'Nut.', 'Nutricionista'];
      let possibleTitle = '';
      let restOfName = user.full_name || '';

      if (nameParts.length > 0 && knownTitles.includes(nameParts[0])) {
        possibleTitle = nameParts[0];
        restOfName = nameParts.slice(1).join(' ');
      }

      setFormData({
        title: possibleTitle,
        full_name: restOfName,
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    const finalFullName = formData.title 
      ? `${formData.title} ${formData.full_name.trim()}`
      : formData.full_name.trim();

    const { error } = await updateProfile({
      full_name: finalFullName,
    } as any);

    if (error) {
      toast.error(typeof error === 'string' ? error : 'Error al actualizar el perfil');
    } else {
      toast.success('Perfil actualizado correctamente');
    }
    setSaving(false);
  };

  return (
    <div className="clinical-page space-y-8 max-w-7xl mx-auto">
      
      {/* ── PROFESSIONAL HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            Gestión de Perfil
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Administrá tu identidad profesional y credenciales de acceso institucional.
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="h-11 px-6 rounded-xl bg-[#09090b] text-white font-semibold hover:bg-[#18181b] shadow-lg shadow-slate-200 transition-all flex items-center gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* ── LEFT COLUMN: Security & Badge ── */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-[#09090b] rounded-xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.1),transparent_40%)] pointer-events-none" />
              
              <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner group transition-all">
                  <span className="text-3xl font-black text-senralis-main tracking-tighter">
                    {user?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                  </span>
                </div>
                <div>
                   <h3 className="text-xl font-extrabold tracking-tight">{user?.full_name}</h3>
                   <p className="text-xs font-bold text-senralis-soft uppercase tracking-widest mt-1">Profesional Verificado</p>
                </div>
                <div className="pt-6 w-full border-t border-white/5">
                   <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                      <ShieldCheck className="h-3.5 w-3.5 text-senralis-main" /> Identidad Auditada
                   </div>
                </div>
              </div>
           </div>

           <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Privacidad</h3>
              </div>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Tus datos están protegidos bajo estándares internacionales de seguridad clínica. El acceso a tu perfil está restringido a tu sesión cifrada.
              </p>
           </div>
        </div>

        {/* ── RIGHT COLUMN: Form ── */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Identidad Institucional</h3>
            </div>
            <div className="p-8 space-y-8">
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 <div className="space-y-2">
                   <Label htmlFor="title" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título Oficial</Label>
                   <select 
                     id="title"
                     value={formData.title}
                     onChange={e => setFormData({...formData, title: e.target.value})}
                     className="h-11 w-full bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold rounded-lg text-sm px-3"
                   >
                     <option value="">Sin título</option>
                     <option value="Lic.">Lic.</option>
                     <option value="Dr.">Dr.</option>
                     <option value="Dra.">Dra.</option>
                     <option value="Prof.">Prof.</option>
                   </select>
                 </div>
                 <div className="sm:col-span-2 space-y-2">
                   <Label htmlFor="full_name" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre Completo</Label>
                   <Input 
                     id="full_name" 
                     value={formData.full_name} 
                     onChange={e => setFormData({...formData, full_name: e.target.value})}
                     placeholder="María Pérez" 
                     className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold rounded-lg"
                   />
                 </div>
               </div>

               <div className="pt-8 border-t border-slate-50 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Acceso Principal</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico Registrado</Label>
                      <Input 
                        id="email" 
                        value={user?.email || ''} 
                        disabled 
                        className="h-11 bg-slate-100 border-slate-200 text-slate-500 font-semibold rounded-lg cursor-not-allowed" 
                      />
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-3">
                       <Shield className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                       <p className="text-[11px] font-bold text-amber-700 leading-normal">
                         Por razones de seguridad institucional, la modificación del correo electrónico maestro debe solicitarse vía soporte técnico auditado.
                       </p>
                    </div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
