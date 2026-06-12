import { createRoot } from 'react-dom/client';
import './index.css';
import { initNamespace } from './api/namespace';
import { App } from './App';

initNamespace();

createRoot(document.getElementById('root')!).render(<App />);
