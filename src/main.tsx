import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { DevToolsPanelWrapper } from './components/DevToolsPanel';

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <DevToolsPanelWrapper />
  </>
);
