import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { Save, Plus, Trash2, Clock, Globe, Copy, ExternalLink, Loader2, List, Settings as SettingsIcon, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { NutritionService } from '@/types';
import { cn } from '@/lib/utils';

export function Settings() {
  const { user, updateProfile } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    working_hours_start: '',
    working_hours_end: '',
    working_days: [] as number[],
    services: [] as NutritionService[],
    bio: '',
    specialty: '',
  });

  const daysOfWeek = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 7, label: 'Domingo' },
  ];

  useEffect(() => {
    if (user && !saving) {
      setFormData({
        slug: user.slug || '',
        working_hours_start: user.working_hours_start?.substring(0, 5) || '09:00',
        working_hours_end: user.working_hours_end?.substring(0, 5) || '18:00',
        working_days: user.working_days || [1, 2, 3, 4, 5],
        services: user.services || [],
        bio: user.bio || '',
        specialty: user.specialty || '',
      });
    }
  }, [user, saving]);

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      working_days: prev.working_days.includes(day)
        ? prev.working_days.filter(d => d !== day)
        : [...prev.working_days, day].sort()
    }));
  };

  const addService = () => {
    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Date.now().toString(36) + Math.random().toString(36).substring(2);

    const newService: NutritionService = {
      id: uniqueId,
      name: '',
      price: 0,
      duration: 60,
    };
    setFormData(prev => ({ ...prev, services: [...prev.services, newService] }));
  };

  const updateService = (id: string, field: keyof NutritionService, value: any) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const removeService = (id: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== id)
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      const hasInvalidService = formData.services.some(s => 
        !s || typeof s.name !== 'string' || !s.name.trim() || s.price < 0 || s.duration <= 0
      );

      if (hasInvalidService) {
        toast.error('Revisa que todos los servicios tengan nombre, precio y duración válidos.');
        setSaving(false);
        return;
      }

      const cleanSlug = (formData.slug || '')
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const payload = {
        slug: cleanSlug || null,
        working_hours_start: formData.working_hours_start,
        working_hours_end: formData.working_hours_end,
        working_days: formData.working_days,
        services: formData.services,
        bio: formData.bio || null,
        specialty: formData.specialty || null,
      };

      const result = await updateProfile(payload as any);

      if (result && result.error) {
        if (typeof result.error === 'string' && result.error.includes('duplicate key') && result.error.includes('slug')) {
          toast.error('Este link personalizado ya está siendo usado por otro profesional.');
        } else {
          toast.error(typeof result.error === 'string' ? result.error : 'Error al guardar configuración');
        }
      } else {
        toast.success('Configuración guardada correctamente');
        if (cleanSlug) {
          setFormData(prev => ({ ...prev, slug: cleanSlug }));
        }
      }
    } catch (err: any) {
      toast.error('Ocurrió un error inesperado al intentar guardar.');
    } finally {
      setSaving(false);
    }
  };

  const domainUrl = window.location.origin;

  return (
    <div className="clinical-page space-y-8 max-w-7xl mx-auto">
      
      {/* ── PROFESSIONAL HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            Configuración Profesional
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Personalizá tu consultorio digital, agenda pública y catálogo de servicios.
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
        
        {/* ── LEFT COLUMN: Navigation/Info ── */}
        <div className="lg:col-span-4 space-y-6">
           {user && (
             <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Plan de cuenta</p>
               <p className="font-bold text-slate-900 capitalize">{user.plan ?? 'trial'}</p>
               {user.trial_ends_at && (
                 <p className="text-xs text-slate-500 mt-1">
                   Prueba hasta {format(parseISO(user.trial_ends_at), 'd MMM yyyy', { locale: es })}
                 </p>
               )}
             </div>
           )}
           <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Globe className="h-5 w-5 text-senralis-main" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Presencia Digital</h3>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">
                Este identificador define tu dirección web personalizada para que pacientes externos agenden turnos.
              </p>
              
              {formData.slug ? (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 group transition-all">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">URL Pública Activa</p>
                     <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-md border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
                        <span className="truncate max-w-[180px]">{formData.slug}</span>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-300 group-hover:text-senralis-main cursor-pointer" onClick={() => window.open(`${domainUrl}/book/${formData.slug}`, '_blank')} />
                     </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full h-10 text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg"
                    onClick={() => {
                      navigator.clipboard.writeText(`${domainUrl}/book/${formData.slug}`);
                      toast.success('¡Enlace copiado! Listo para compartir');
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" /> Copiar Link Público
                  </Button>
                </div>
              ) : (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-700 font-bold leading-relaxed">Definí un slug para activar tu agenda online.</p>
                </div>
              )}
           </div>

           <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-senralis-soft" />
                <h3 className="text-lg font-bold tracking-tight">Seguridad</h3>
              </div>
              <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
                Tus datos de facturación y pacientes están protegidos con encriptación de grado médico.
              </p>
              <Button variant="ghost" className="w-full h-10 bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 rounded-lg">
                Revisar Logs de Acceso
              </Button>
           </div>
        </div>

        {/* ── RIGHT COLUMN: Main Settings ── */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Perfil Profesional */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Perfil Público</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="specialty" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Especialidad Clínica</Label>
                  <Input 
                    id="specialty" 
                    value={formData.specialty} 
                    onChange={e => setFormData({...formData, specialty: e.target.value})}
                    placeholder="Ej: Psicología / Kinesiología / Medicina Clínica" 
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Identificador (Slug)</Label>
                  <Input 
                    id="slug" 
                    value={formData.slug} 
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                    placeholder="ej-lic-maria-perez" 
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Biografía Profesional</Label>
                <Textarea 
                  id="bio" 
                  value={formData.bio} 
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  placeholder="Contanos sobre tu formación y experiencia..." 
                  className="min-h-[120px] bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold rounded-lg pt-3"
                />
              </div>
            </div>
          </div>

          {/* Disponibilidad Agenda */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Disponibilidad de Agenda</h3>
               <div className="flex items-center gap-2">
                 <Clock className="h-3.5 w-3.5 text-slate-400" />
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{formData.working_hours_start} - {formData.working_hours_end}</span>
               </div>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="start_time" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Horario de Apertura</Label>
                  <Input 
                    id="start_time" 
                    type="time" 
                    className="h-12 bg-slate-50 border-slate-200 font-bold text-base rounded-lg"
                    value={formData.working_hours_start}
                    onChange={e => setFormData({...formData, working_hours_start: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="end_time" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Horario de Cierre</Label>
                  <Input 
                    id="end_time" 
                    type="time" 
                    className="h-12 bg-slate-50 border-slate-200 font-bold text-base rounded-lg"
                    value={formData.working_hours_end}
                    onChange={e => setFormData({...formData, working_hours_end: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Días Laborales</Label>
                <div className="flex flex-wrap gap-2.5">
                  {daysOfWeek.map(day => {
                    const isActive = formData.working_days.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={cn(
                          "px-4 py-2 text-xs font-bold rounded-lg border transition-all",
                          isActive
                            ? "bg-senralis-main text-white border-senralis-dark shadow-md shadow-slate-100"
                            : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600"
                        )}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Catálogo de Servicios */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Catálogo de Servicios</h3>
               <Button onClick={addService} variant="ghost" size="sm" className="h-8 px-3 text-senralis-main font-bold hover:bg-slate-50 hover:text-senralis-dark">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Nuevo Servicio
               </Button>
            </div>
            <div className="p-6">
              {formData.services.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-slate-100 bg-slate-50/30">
                  <List className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-400">No tenés servicios configurados.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.services.map((service) => (
                    <div key={service.id} className="group flex flex-col sm:flex-row gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all relative">
                      <div className="flex-1 space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre del Servicio</Label>
                        <Input 
                          placeholder="Consulta Clínica..."
                          value={service.name}
                          onChange={e => updateService(service.id, 'name', e.target.value)}
                          className="h-10 text-sm font-bold bg-slate-50 border-slate-100 focus:bg-white rounded-lg"
                        />
                      </div>
                      <div className="w-full sm:w-32 space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Arancel</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold">$</span>
                          <Input 
                            type="number"
                            value={service.price === 0 ? '' : service.price}
                            onChange={e => updateService(service.id, 'price', e.target.value ? Number(e.target.value) : 0)}
                            className="h-10 pl-7 text-sm font-bold bg-slate-50 border-slate-100 focus:bg-white rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="w-full sm:w-28 space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duración</Label>
                        <div className="relative">
                          <Input 
                            type="number"
                            value={service.duration || ''}
                            onChange={e => updateService(service.id, 'duration', e.target.value ? Number(e.target.value) : 0)}
                            className="h-10 pr-9 text-sm font-bold bg-slate-50 border-slate-100 focus:bg-white rounded-lg"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 text-[10px] font-bold uppercase">min</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0 rounded-lg mt-5"
                        onClick={() => removeService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
