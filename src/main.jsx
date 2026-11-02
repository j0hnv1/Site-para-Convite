import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { applyTimingVars } from './lib/timings.js';
import './styles/base.css';
import './styles/envelope.css';
import './styles/transitions.css';
import './styles/event.css';

applyTimingVars();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
