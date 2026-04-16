import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/api';
import { toast } from 'sonner';
import { Settings, Save } from 'lucide-react';

export default function ConfigPanel() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    adminApi.getConfig()
      .then(d => setConfig(d.config || {}))
      .catch(() => toast.error('Error al cargar configuración'))
      .finally(() => setLoading(false));
  }, []);

  const save = async (key, value) => {
    setSaving(key);
    try {
      await adminApi.updateConfig(key, value);
      toast.success(`Configuración actualizada`);
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(null);
    }
  };

  const CONFIG_KEYS = [
    { key: 'site_name', label: 'Nombre del sitio', type: 'text', desc: 'Aparece en título de páginas y emails.' },
    { key: 'contact_email', label: 'Email de contacto', type: 'email', desc: 'Email principal para soporte comercial.' },
    { key: 'max_businesses_free', label: 'Máx. negocios gratuitos', type: 'number', desc: 'Límite de negocios que un usuario puede añadir.' },
    { key: 'review_boost_days', label: 'Días etiqueta "Nuevo"', type: 'number', desc: 'Duración del destacamento tras activación.' },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Settings className="text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Configuración Global</h1>
      </div>

      <p className="text-sm text-gray-500">
        Ajustes que afectan el funcionamiento general de la plataforma y reglas de negocio.
      </p>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white border border-gray-100 shadow-sm rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {CONFIG_KEYS.map(({ key, label, type, desc }) => (
            <div key={key} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:border-gray-300">
              <div className="flex-1">
                <label className="block text-base font-semibold text-gray-900 mb-1">{label}</label>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type={type}
                  defaultValue={config[key] ?? ''}
                  id={`config-${key}`}
                  className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900"
                  style={{ color: 'var(--ink)' }}
                />
                <button
                  onClick={() => {
                    const value = document.getElementById(`config-${key}`)?.value;
                    save(key, value);
                  }}
                  disabled={saving === key}
                  className="flex items-center justify-center gap-2 px-5 py-2 bg-primary text-white font-medium rounded-xl text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Save size={16} />
                  {saving === key ? '...' : 'Guardar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
