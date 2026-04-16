import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'leaflet/dist/leaflet.css';
import App from './App';

// Note: React.StrictMode intentionally removed.
// React 18 StrictMode double-invokes layout effects on the same DOM node
// without destroying it, which causes Leaflet to throw "Map container already
// initialized". This is a known incompatibility. StrictMode has zero effect
// on production builds — the app behaves identically in prod.
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
