import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initGA } from './utils/analytics';

// Initialize Google Analytics
initGA();

createRoot(document.getElementById('root')!).render(<App />);
