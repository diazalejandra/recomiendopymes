import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/api';
import { toast } from 'sonner';
import { Newspaper, Plus, Edit2, Trash2, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNews, setCurrentNews] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi.getNews()
      .then(setNews)
      .catch(() => toast.error('Error al cargar noticias'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentNews.title || !currentNews.content || !currentNews.tag) {
      return toast.error('Título, contenido y etiqueta son requeridos');
    }

    try {
      if (currentNews.id) {
        await adminApi.updateNews(currentNews.id, currentNews);
        toast.success('Noticia actualizada');
      } else {
        await adminApi.createNews(currentNews);
        toast.success('Noticia creada');
      }
      setIsEditing(false);
      load();
    } catch {
      toast.error('Error al guardar la noticia');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta noticia?')) return;
    try {
      await adminApi.deleteNews(id);
      toast.success('Noticia eliminada');
      load();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const togglePublished = async (item) => {
    try {
      await adminApi.updateNews(item.id, { is_published: !item.is_published });
      toast.success(`Noticia ${!item.is_published ? 'publicada' : 'ocultada'}`);
      load();
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper className="text-primary" />
            {currentNews.id ? 'Editar Noticia' : 'Nueva Noticia'}
          </h1>
          <button onClick={() => setIsEditing(false)} className="text-sm text-gray-500 hover:text-gray-900">
            Cancelar
          </button>
        </div>

        <form onSubmit={handleSave} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-1">Título</label>
              <input type="text" value={currentNews.title || ''} onChange={e => setCurrentNews({...currentNews, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Ej. Sercotec abre nuevas líneas..." />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Etiqueta (Tag)</label>
              <input type="text" value={currentNews.tag || ''} onChange={e => setCurrentNews({...currentNews, tag: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Ej. Fondos, Regulación" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1">
                URL <span className="text-gray-400 font-normal">(Opcional)</span>
              </label>
              <input type="url" value={currentNews.url || ''} onChange={e => setCurrentNews({...currentNews, url: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="https://..." />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-1">Contenido Breve</label>
              <textarea rows={4} value={currentNews.content || ''} onChange={e => setCurrentNews({...currentNews, content: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-y"
                placeholder="Descripción breve de la noticia..." />
            </div>
            
            <div className="sm:col-span-2 flex items-center gap-2 mt-2">
              <input type="checkbox" id="is_published" checked={currentNews.is_published}
                onChange={e => setCurrentNews({...currentNews, is_published: e.target.checked})}
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
              <label htmlFor="is_published" className="text-sm font-medium text-gray-700">Publicar inmediatamente</label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" onClick={() => setIsEditing(false)}
              className="px-5 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl text-sm hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="px-5 py-2 bg-primary text-white font-medium rounded-xl text-sm hover:bg-primary/90 transition-colors">
              Guardar Noticia
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper className="text-primary" />
            Noticias y Recursos
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gesti&oacute;n del blog interno. Se mostrar&aacute;n las 3 m&aacute;s recientes en el Inicio.</p>
        </div>
        
        <button onClick={() => { setCurrentNews({ title: '', content: '', tag: '', is_published: true }); setIsEditing(true); }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-xl text-sm hover:bg-primary/90 transition-colors shadow-sm">
          <Plus size={18} />
          Nueva Noticia
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
        </div>
      ) : news.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 flex flex-col items-center justify-center text-center px-4 shadow-sm">
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            <Newspaper className="text-blue-500" size={32} />
          </div>
          <p className="text-gray-900 font-bold mb-1 text-lg">Aún no hay noticias</p>
          <p className="text-sm text-gray-500 max-w-sm mb-6">Crea recursos de interés para los emprendedores. Aparecerán de forma destacada en la página principal.</p>
          <button onClick={() => { setCurrentNews({ title: '', content: '', tag: '', is_published: true }); setIsEditing(true); }}
            className="flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary font-bold rounded-xl text-sm hover:bg-primary/5 transition-colors">
            <Plus size={16} /> Crear la primera
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {news.map(item => (
            <div key={item.id} className={`bg-white rounded-2xl border ${item.is_published ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-75'} p-5 flex flex-col sm:flex-row gap-4 sm:items-center shadow-sm`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                    {item.tag}
                  </span>
                  {!item.is_published && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 flex items-center gap-1">
                      <EyeOff size={12} /> Borrador
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString('es-CL')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{item.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2 hover:underline">
                    <LinkIcon size={12} /> Ver enlace original
                  </a>
                )}
              </div>
              
              <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-4">
                <button onClick={() => togglePublished(item)} title={item.is_published ? "Ocultar" : "Publicar"}
                  className={`p-2 rounded-lg transition-colors ${item.is_published ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                  {item.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button onClick={() => { setCurrentNews(item); setIsEditing(true); }} title="Editar"
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(item.id)} title="Eliminar"
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
