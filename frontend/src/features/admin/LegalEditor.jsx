import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/api';
import { toast } from 'sonner';
import { FileText, Save } from 'lucide-react';

export default function LegalEditor() {
  const [activeKey, setActiveKey] = useState('terms');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminApi.getLegal(activeKey)
      .then(d => setContent(d.content || ''))
      .catch(() => setContent(''))
      .finally(() => setLoading(false));
  }, [activeKey]);

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateLegal(activeKey, content);
      toast.success('Texto legal actualizado correctamente');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <FileText className="text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Textos Legales</h1>
      </div>
      
      <p className="text-sm text-gray-500">
        Estos textos se mostrarán en el footer del sitio público y durante el registro de usuarios. 
        Puedes utilizar formato Markdown.
      </p>

      <div className="flex gap-2">
        {[
          { key: 'terms', label: 'Términos y condiciones' },
          { key: 'privacy', label: 'Política de privacidad' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveKey(key)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeKey === key 
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}>
            {label}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="h-[500px] bg-white border border-gray-100 shadow-sm rounded-2xl animate-pulse" />
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between items-center">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">{activeKey}.md</span>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white font-medium rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors">
              <Save size={16} />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
          
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full h-[500px] p-6 text-sm font-mono outline-none resize-y"
            placeholder="Escribe el contenido en formato Markdown..."
            style={{ color: 'var(--ink)' }}
            spellCheck="false"
          />
        </div>
      )}
    </div>
  );
}
