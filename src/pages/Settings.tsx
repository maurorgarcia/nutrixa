import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { Save, Plus, Trash2, Clock, Globe, Copy, ExternalLink, Loader2, List } from 'lucide-react';
import { toast } from 'sonner';
import type { NutritionService } from '@/types';

export function Settings() {
  const { user, updateProfile } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    working_hours_start: '',
    working_hours_end: '',
    working_days: [] as number[],
    services: [] as NutritionService[],
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
    // Solo sincronizamos con el store si hay usuario y NO estamos en medio de un guardado
    // Esto evita que al guardar, el estado local "parpadee" o se sobrescriba.
    if (user && !saving) {
      setFormData({
        slug: user.slug || '',
        working_hours_start: user.working_hours_start?.substring(0, 5) || '09:00',
        working_hours_end: user.working_hours_end?.substring(0, 5) || '18:00',
        working_days: user.working_days || [1, 2, 3, 4, 5],
        services: user.services || [],
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
    // Generate a secure unique ID compatible across all devices
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
    
    console.log('[Settings] Iniciando guardado de configuración...');
    setSaving(true);
    
    try {
      // Validate services
      const hasInvalidService = formData.services.some(s => 
        !s || typeof s.name !== 'string' || !s.name.trim() || s.price < 0 || s.duration <= 0
      );

      if (hasInvalidService) {
        console.warn('[Settings] Validación fallida: servicios inválidos detected');
        toast.error('Revisa que todos los servicios tengan nombre, precio y duración válidos.');
        setSaving(false);
        return;
      }

      let cleanSlug = (formData.slug || '')
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
      };

      console.log('[Settings] Enviando payload a updateProfile:', payload);

      const result = await updateProfile(payload as any);

      console.log('[Settings] Resultado del guardado:', result);

      if (result && result.error) {
        if (typeof result.error === 'string' && result.error.includes('duplicate key') && result.error.includes('slug')) {
          toast.error('Este link personalizado ya está siendo usado por otro nutricionista.');
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
      console.error('[Settings] Error crítico en handleSave:', err);
      toast.error('Ocurrió un error inesperado al intentar guardar.');
    } finally {
      console.log('[Settings] Finalizando guardado (saving = false)');
      setSaving(false);
    }
  };

  const domainUrl = window.location.origin;

  return (
    <div className="space-y-10 max-w-6xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2 border-b border-zinc-100">
        <div className="space-y-1.5">
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Configuración</h1>
          <p className="text-zinc-500 text-lg font-medium">Administra tu disponibilidad y los servicios de tu Turnera Pública</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-lg text-white shadow-md transition-all duration-300 px-6 h-12 rounded-xl text-base shrink-0">
          {saving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
          Guardar Integración
        </Button>
      </div>

      <div className="space-y-12 divide-y divide-zinc-200 mt-8">
        
        {/* Connection Setup */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pt-8">
          <div className="md:col-span-1 space-y-4">
            <div className="p-3 bg-emerald-50 rounded-2xl w-fit">
              <Globe className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Tu Turnera Pública</h3>
              <p className="text-sm font-medium text-zinc-500 mt-2 leading-relaxed">
                Define el identificador digital donde tus pacientes podrán agendar consultas directamente vía online.
              </p>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <Card className="border-zinc-200 shadow-sm transition-all duration-300 rounded-3xl overflow-hidden">
              <CardContent className="p-6 sm:p-8 space-y-5 bg-white">
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-bold text-zinc-700">Identificador (Slug)</Label>
                  <Input 
                    id="slug" 
                    value={formData.slug} 
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                    placeholder="ej-lic-maria-perez" 
                    className="h-12 border-zinc-200 focus:ring-emerald-600 focus:border-emerald-600 rounded-xl shadow-sm transition-all duration-200"
                  />
                </div>
                
                {formData.slug ? (
                  <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-4 shadow-inner">
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Enlace Activo</p>
                    <a 
                      href={`${domainUrl}/book/${formData.slug}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-zinc-200 text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer shadow-sm"
                    >
                      <span className="truncate">{domainUrl}/book/{formData.slug}</span>
                      <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0 text-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <Button 
                      variant="outline" 
                      className="w-full mt-2 h-11 text-sm font-bold border-zinc-200 text-zinc-700 hover:bg-zinc-100 rounded-xl"
                      onClick={() => {
                        navigator.clipboard.writeText(`${domainUrl}/book/${formData.slug}`);
                        toast.success('¡Enlace copiado! Listo para compartir en tus redes');
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copiar Link Público
                    </Button>
                  </div>
                ) : (
                  <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 shadow-sm">
                    <p className="text-sm text-amber-800 font-medium">Crea tu identificador ahora para activar tu agenda visible al público.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Agenda Setup */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pt-12">
          <div className="md:col-span-1 space-y-4">
            <div className="p-3 bg-zinc-100 rounded-2xl w-fit">
              <Clock className="h-6 w-6 text-zinc-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Horarios Disponibles</h3>
              <p className="text-sm font-medium text-zinc-500 mt-2 leading-relaxed">
                Establece la franja horaria y los días específicos en los que aceptarás nuevas reservas automáticas.
              </p>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <Card className="border-zinc-200 shadow-sm transition-all duration-300 rounded-3xl overflow-hidden p-6 sm:p-8 space-y-8 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start_time" className="text-sm font-bold text-zinc-700">Horario Apertura</Label>
                  <Input 
                    id="start_time" 
                    type="time" 
                    className="h-14 bg-zinc-50 border-zinc-200 focus:ring-emerald-600 focus:border-emerald-600 rounded-xl shadow-sm hover:bg-white transition-all duration-200 text-base"
                    value={formData.working_hours_start}
                    onChange={e => setFormData({...formData, working_hours_start: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time" className="text-sm font-bold text-zinc-700">Horario Cierre</Label>
                  <Input 
                    id="end_time" 
                    type="time" 
                    className="h-14 bg-zinc-50 border-zinc-200 focus:ring-emerald-600 focus:border-emerald-600 rounded-xl shadow-sm hover:bg-white transition-all duration-200 text-base"
                    value={formData.working_hours_end}
                    onChange={e => setFormData({...formData, working_hours_end: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-sm font-bold text-zinc-700">
                  Días Habilitados para Consultas
                </Label>
                <div className="flex flex-wrap gap-2.5">
                  {daysOfWeek.map(day => {
                    const isActive = formData.working_days.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 border ${
                          isActive
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md hover:-translate-y-0.5'
                            : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 hover:-translate-y-0.5 shadow-sm'
                        }`}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Services Manager */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pt-12">
          <div className="md:col-span-1 space-y-4">
            <div className="p-3 bg-zinc-100 rounded-2xl w-fit">
              <List className="h-6 w-6 text-zinc-700" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Catálogo de Servicios</h3>
               <p className="text-sm font-medium text-zinc-500 mt-2 leading-relaxed">
                 Ofrece el detalle de lo que cobras. Los pacientes tendrán que seleccionar un servicio para poder finalizar su reserva.
               </p>
            </div>
            <Button onClick={addService} variant="outline" className="w-full mt-4 border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl h-12 shadow-sm hover:-translate-y-0.5 transition-all">
              <Plus className="h-5 w-5 mr-2" />
              Añadir Nuevo Servicio
            </Button>
          </div>

          <div className="md:col-span-2">
            <Card className="border-zinc-200 shadow-sm transition-all duration-300 rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-6 sm:p-8">
                {formData.services.length === 0 ? (
                  <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50">
                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-zinc-100">
                      <List className="h-8 w-8 text-zinc-300" />
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 mb-2 tracking-tight">Tu catálogo está vacío</h3>
                    <p className="text-sm font-medium text-zinc-500 max-w-sm mx-auto">
                      Los pacientes no podrán reservar turnos hasta que agregues al menos un servicio con su precio y duración.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.services.map((service) => (
                      <div key={service.id} className="group flex flex-col sm:flex-row gap-5 p-5 bg-white border border-zinc-200 shadow-sm hover:shadow-md hover:border-emerald-300 rounded-2xl transition-all duration-300 relative">
                        
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Servicio</Label>
                          <Input 
                            placeholder="Ej. Consulta Primera Vez..."
                            value={service.name}
                            onChange={e => updateService(service.id, 'name', e.target.value)}
                            className="h-12 text-base font-bold text-zinc-900 bg-zinc-50/50 focus:bg-white focus:ring-emerald-600 focus:border-emerald-600 rounded-xl"
                          />
                        </div>
                        
                        <div className="w-full sm:w-36 space-y-2">
                          <Label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Precio</Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">$</span>
                            <Input 
                              type="number"
                              min="0"
                              step="1000"
                              value={service.price === 0 ? '' : service.price}
                              onChange={e => updateService(service.id, 'price', e.target.value ? Number(e.target.value) : 0)}
                              className="h-12 pl-8 text-base font-bold text-emerald-700 bg-zinc-50/50 focus:bg-white focus:ring-emerald-600 focus:border-emerald-600 rounded-xl"
                            />
                          </div>
                        </div>
                        
                        <div className="w-full sm:w-32 space-y-2">
                          <Label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Duración</Label>
                          <div className="relative">
                            <Input 
                              type="number"
                              min="15"
                              step="15"
                              value={service.duration || ''}
                              onChange={e => updateService(service.id, 'duration', e.target.value ? Number(e.target.value) : 0)}
                              className="h-12 pr-12 text-base font-bold text-zinc-900 bg-zinc-50/50 focus:bg-white focus:ring-emerald-600 focus:border-emerald-600 rounded-xl"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">min</span>
                          </div>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-700 hover:bg-red-50 transition-all sm:mt-7 shrink-0 rounded-xl h-12 w-12"
                          onClick={() => removeService(service.id)}
                          title="Eliminar servicio"
                        >
                          <Trash2 className="h-6 w-6" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
