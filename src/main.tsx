import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './components/theme-provider.tsx'
import { InvoiceProvider } from './context/InvoiceContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <InvoiceProvider>
          <App />
        </InvoiceProvider>
      </ThemeProvider>
    </HashRouter>
  </StrictMode>,
)
