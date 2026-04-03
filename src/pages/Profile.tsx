import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { User, Save, Loader2, ShieldCheck, Mail } from 'lucide-react';
import { toast } from 'sonner';

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
    <div className="space-y-10 max-w-5xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2 border-b border-zinc-100">
        <div className="space-y-1.5">
          <h1 className="text-4xl font-extrabold text-nutri-forest tracking-tight">Mi Perfil</h1>
          <p className="text-zinc-500 text-lg font-medium">Administra tu información personal y credenciales de acceso a la plataforma</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-nutri-emerald hover:bg-nutri-forest hover:-translate-y-0.5 hover:shadow-lg text-white shadow-md transition-all duration-300 px-6 h-12 rounded-xl text-base">
          {saving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
          Guardar Cambios
        </Button>
      </div>

      <div className="space-y-12 divide-y divide-zinc-200 mt-8">
        
        {/* Identidad Setup */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pt-8">
          <div className="md:col-span-1 space-y-4">
            <div className="p-3 bg-emerald-50 rounded-2xl w-fit">
              <User className="h-6 w-6 text-nutri-emerald" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-nutri-forest tracking-tight">Perfil e Identidad</h3>
              <p className="text-sm font-medium text-zinc-500 mt-2 leading-relaxed">
                Información pública que se mostrará en los comunicados a tus pacientes y en tu catálogo público.
              </p>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <Card className="border-zinc-200 shadow-sm transition-all duration-300 rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-6 sm:p-8 space-y-8">
                {/* Avatar Row */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="flex-shrink-0 relative">
                    <div className="w-28 h-28 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-inner">
                      <span className="text-4xl font-extrabold text-nutri-emerald tracking-tighter">
                        {user?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                      </span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-emerald-100 text-nutri-forest p-1.5 rounded-full border-2 border-white shadow-sm" title="Profesional Verificado">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-5 text-center sm:text-left w-full pt-2">
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                      <div className="space-y-2 w-full sm:w-1/3">
                        <Label htmlFor="title" className="text-sm font-bold text-zinc-700 text-left block">Título</Label>
                        <select 
                          id="title"
                          value={formData.title}
                          onChange={e => setFormData({...formData, title: e.target.value})}
                          className="h-14 w-full border border-zinc-200 focus:ring-nutri-emerald focus:border-nutri-emerald rounded-xl shadow-sm transition-all duration-200 text-base px-3 bg-white"
                        >
                          <option value="">Sin título</option>
                          <option value="Lic.">Licenciada/o</option>
                          <option value="Dr.">Doctor</option>
                          <option value="Dra.">Doctora</option>
                          <option value="Nut.">Nutricionista</option>
                        </select>
                      </div>
                      <div className="space-y-2 w-full sm:w-2/3">
                        <Label htmlFor="full_name" className="text-sm font-bold text-zinc-700 text-left block">Nombre Completo</Label>
                        <Input 
                          id="full_name" 
                          value={formData.full_name} 
                          onChange={e => setFormData({...formData, full_name: e.target.value})}
                          placeholder="María Pérez" 
                          className="h-14 w-full border-zinc-200 focus:ring-nutri-emerald focus:border-nutri-emerald rounded-xl shadow-sm transition-all duration-200 text-base"
                        />
                      </div>
                    </div>
                    <p className="text-xs font-bold text-nutri-forest flex items-center justify-center sm:justify-start gap-1.5 mt-2">
                      Tus datos biográficos han sido verificados satisfactoriamente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Credentials Setup */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pt-12">
          <div className="md:col-span-1 space-y-4">
            <div className="p-3 bg-zinc-100 rounded-2xl w-fit">
              <Mail className="h-6 w-6 text-zinc-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-nutri-forest tracking-tight">Acceso y Seguridad</h3>
              <p className="text-sm font-medium text-zinc-500 mt-2 leading-relaxed">
                Credenciales exclusivas que utilizas para el inicio de sesión autorizado en Nutrixa.
              </p>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <Card className="border-zinc-200 shadow-sm transition-all duration-300 rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-6 sm:p-8">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-bold text-zinc-700">Correo Electrónico Registrado</Label>
                  <Input 
                    id="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="h-14 w-full bg-zinc-50 text-zinc-500 cursor-not-allowed opacity-80 border-zinc-200 rounded-xl shadow-sm text-base" 
                  />
                  <div className="flex items-start gap-2 bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 shadow-sm mt-4">
                    <ShieldCheck className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium leading-relaxed">
                      La modificación del correo electrónico maestral está deshabilitada temporalmente por políticas de seguridad estrictas en tu cuenta.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
