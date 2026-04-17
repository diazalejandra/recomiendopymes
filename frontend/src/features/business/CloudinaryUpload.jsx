import { useState, useRef, useEffect } from 'react';
import { mediaApi } from '../../utils/api';
import axios from 'axios';

export default function CloudinaryUpload({ label, onUpload, multiple = false, maxFiles = 8, initialUrls = [] }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState([]);
  const inputRef = useRef();

  useEffect(() => {
    // Only update if we hadn't already and we are getting valid URLs from parents (like EditBusiness async fetch)
    if (initialUrls && initialUrls.length > 0 && uploaded.length === 0) {
      setUploaded(Array.isArray(initialUrls) ? initialUrls : [initialUrls]);
    }
  }, [initialUrls]);

  const handleFiles = async (files) => {
    if (!files.length) return;
    if (multiple && uploaded.length + files.length > maxFiles) {
      alert(`Máximo ${maxFiles} imágenes`);
      return;
    }
    setUploading(true);
    try {
      const sig = await mediaApi.getUploadSignature();
      const urls = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', sig.signature);
        formData.append('timestamp', sig.timestamp);
        formData.append('api_key', sig.api_key);
        formData.append('folder', sig.folder);
        if (sig.transformation) formData.append('transformation', sig.transformation);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
          formData,
          { onUploadProgress: e => setProgress(Math.round(e.loaded * 100 / e.total)) }
        );
        urls.push(res.data.secure_url);
        setProgress(Math.round((i + 1) * 100 / files.length));
      }
      const newUploaded = multiple ? [...uploaded, ...urls] : urls;
      setUploaded(newUploaded);
      onUpload(multiple ? newUploaded : urls[0]);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error al subir la imagen. Intenta nuevamente.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(Array.from(e.dataTransfer.files)); }}
      >
        <input
          ref={inputRef} type="file" accept="image/*" multiple={multiple}
          className="hidden"
          onChange={e => handleFiles(Array.from(e.target.files))}
        />
        {uploading ? (
          <div>
            <div className="w-full bg-gray-200 rounded-full h-2 mx-auto mb-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-gray-500">Subiendo... {progress}%</p>
          </div>
        ) : (
          <>
            <p className="text-4xl mb-2">📸</p>
            <p className="text-sm text-gray-600">
              Arrastra imágenes aquí o <span className="text-primary">haz click para seleccionar</span>
            </p>
            {multiple && <p className="text-xs text-gray-400 mt-1">Máximo {maxFiles} imágenes</p>}
          </>
        )}
      </div>
      {uploaded.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {uploaded.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt={`Subida ${i + 1}`} className="w-full aspect-square object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  const newList = uploaded.filter((_, idx) => idx !== i);
                  setUploaded(newList);
                  onUpload(multiple ? newList : null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
