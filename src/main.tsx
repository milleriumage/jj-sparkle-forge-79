import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Aplicação otimizada para máxima performance e estabilidade
console.log('✅ Aplicação carregada com otimizações de performance ativas');

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
