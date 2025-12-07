import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Verifica se está rodando dentro do Capacitor
const isRunningInCapacitor = (): boolean => {
  return (window as any).isInCapacitor === true || 
         document.URL.indexOf('capacitor://') === 0 ||
         document.URL.indexOf('http://localhost') === 0;
};

// Define uma variável global para que componentes possam verificar o ambiente
(window as any).isInCapacitorApp = isRunningInCapacitor();

// Log para depuração
console.log('Rodando em Capacitor:', isRunningInCapacitor());

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
