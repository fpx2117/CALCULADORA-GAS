import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppToastProvider } from './hooks/use-app-toast.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppToastProvider>
      <App />
    </AppToastProvider>
  </StrictMode>,
)
