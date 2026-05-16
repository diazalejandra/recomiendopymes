import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/api';
import { toast } from 'sonner';
import { Newspaper, Plus, Edit2, Trash2, Eye, EyeOff, X, Save, FileText, Image as ImageIcon, ExternalLink, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Default structure for a new post
  const defaultNews = {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    image_url: '',
    tag: 'Noticia',
    status: 'draft',
    source: 'manual'
  };
  
  const [currentNews, setCurrentNews] = useState(null);
  
  // Real-time markdown preview toggle on smaller screens, always side-by-side on large screens
  const [showPreview, setShowPreview] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi.getNews()
      .then(setNews)
      .catch(() => toast.error('Error al cargar noticias'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const generateSlug = (title) => {
    return title.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setCurrentNews(prev => ({
      ...prev,
      title,
      // Auto-generate slug only if it's a new post and they haven't manually edited the slug
      slug: prev.id ? prev.slug : generateSlug(title)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentNews.title || !currentNews.content || !currentNews.slug) {
      return toast.error('Título, Slug y Contenido son requeridos');
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
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      await adminApi.updateNews(item.id, { status: newStatus });
      toast.success(`Noticia ${newStatus === 'published' ? 'publicada' : 'ocultada'}`);
      load();
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col h-[calc(100vh-100px)]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper className="text-primary" />
            {currentNews.id ? 'Editar Noticia' : 'Nueva Noticia'}
          </h1>
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => setShowPreview(!showPreview)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium"
            >
              {showPreview ? <Edit2 size={16}/> : <Eye size={16}/>}
              {showPreview ? 'Ocultar Preview' : 'Ver Preview'}
            </button>
            <button 
              onClick={() => setIsEditing(false)} 
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50"
            >
              <X size={16} /> Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-white font-medium rounded-lg text-sm hover:bg-primary/90"
            >
              <Save size={16} /> Guardar
            </button>
          </div>
        </div>

        {/* Split Pane Editor / Preview */}
        <div className="flex flex-1 gap-6 min-h-0">
          {/* Form & Editor Pane */}
          <div className={`flex-1 flex flex-col bg-white border border-gray-200 rounded-xl overflow-y-auto p-6 ${showPreview ? 'hidden lg:flex' : 'flex'}`}>
            <form id="news-form" onSubmit={handleSave} className="space-y-6 flex-1 flex flex-col">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
                  <input type="text" value={currentNews.title} onChange={handleTitleChange} required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Escribe un título atrapante..." />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Slug (URL)</label>
                  <input type="text" value={currentNews.slug} onChange={e => setCurrentNews({...currentNews, slug: e.target.value})} required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
                    placeholder="mi-noticia-genial" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría / Tag</label>
                  <input type="text" value={currentNews.tag} onChange={e => setCurrentNews({...currentNews, tag: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ej. Noticias, Fondos..." />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <ImageIcon size={16} /> URL de Imagen Principal
                  </label>
                  <input type="url" value={currentNews.image_url || ''} onChange={e => setCurrentNews({...currentNews, image_url: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="https://..." />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <FileText size={16} /> Resumen Breve (Excerpt)
                  </label>
                  <textarea rows={2} value={currentNews.excerpt || ''} onChange={e => setCurrentNews({...currentNews, excerpt: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                    placeholder="Aparecerá en las tarjetas de la grilla..." />
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-y border-gray-100">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={currentNews.status === 'published'} 
                      onChange={() => setCurrentNews({...currentNews, status: 'published'})}
                      className="text-primary focus:ring-primary" />
                    <span className="text-sm font-medium">Publicado</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={currentNews.status === 'draft'} 
                      onChange={() => setCurrentNews({...currentNews, status: 'draft'})}
                      className="text-primary focus:ring-primary" />
                    <span className="text-sm font-medium text-gray-500">Borrador</span>
                  </label>
                </div>
                {currentNews.source === 'n8n' && (
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-md flex items-center gap-1">
                    <Bot size={14} /> Generado por IA (n8n)
                  </span>
                )}
              </div>

              <div className="flex-1 flex flex-col min-h-[300px]">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
                  <span>Contenido (Markdown)</span>
                  <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                    Guía Markdown <ExternalLink size={12}/>
                  </a>
                </label>
                <textarea 
                  required
                  value={currentNews.content} 
                  onChange={e => setCurrentNews({...currentNews, content: e.target.value})}
                  className="w-full flex-1 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none font-mono text-sm resize-none"
                  placeholder="## Título Secundario&#10;&#10;Escribe aquí tu contenido usando **negritas**, *cursivas*, o [enlaces](https://...)" 
                />
              </div>

            </form>
          </div>

          {/* Preview Pane */}
          <div className={`flex-1 flex flex-col bg-gray-50 border border-gray-200 rounded-xl overflow-y-auto p-8 ${!showPreview ? 'hidden lg:flex' : 'flex'}`}>
            <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center border-b border-gray-200 pb-2">
              <span>Previsualización en tiempo real</span>
              <span className="px-2 py-1 bg-white rounded shadow-sm text-gray-600">{currentNews.status}</span>
            </div>
            
            <article className="prose prose-blue max-w-none 
              prose-headings:font-bold 
              prose-a:text-primary hover:prose-a:underline
              prose-img:rounded-xl">
              
              <h1 className="text-4xl font-extrabold mb-4">{currentNews.title || 'Título de la Noticia'}</h1>
              
              {currentNews.excerpt && (
                <p className="text-xl text-gray-600 lead mb-8">{currentNews.excerpt}</p>
              )}

              {currentNews.image_url && (
                <img src={currentNews.image_url} alt="Portada" className="w-full h-auto object-cover rounded-xl mb-8 max-h-[400px]" />
              )}

              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {currentNews.content || '*Empieza a escribir para ver la magia...*'}
              </ReactMarkdown>
            </article>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper className="text-primary" />
            Noticias y Publicaciones
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gesti&oacute;n del blog y recursos. Revisa los borradores entrantes de n8n o crea nuevos.</p>
        </div>
        
        <button onClick={() => { setCurrentNews(defaultNews); setIsEditing(true); }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-xl text-sm hover:bg-primary/90 shadow-sm">
          <Plus size={18} />
          Redactar Noticia
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
          <p className="text-sm text-gray-500 max-w-sm mb-6">Crea artículos o configura n8n para empezar a recibir borradores automáticamente.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Noticia</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Fuente</th>
                <th className="px-6 py-4 font-semibold">Fecha</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {news.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {item.image_url ? 
                          <img src={item.image_url} alt="" className="w-full h-full object-cover" /> : 
                          <Newspaper className="w-full h-full p-2 text-gray-300" />
                        }
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 truncate max-w-xs">{item.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{item.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.status === 'published' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
                        <Eye size={12}/> Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700">
                        <EyeOff size={12}/> Borrador
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {item.source === 'n8n' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                        <Bot size={14}/> n8n
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                        <User size={14}/> Manual
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(item.created_at).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => togglePublished(item)} title={item.status === 'published' ? "Pasar a borrador" : "Publicar"}
                        className={`p-2 rounded-lg transition-colors ${item.status === 'published' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                        {item.status === 'published' ? <EyeOff size={18} /> : <Eye size={18} />}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
