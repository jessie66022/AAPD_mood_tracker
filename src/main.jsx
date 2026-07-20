import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import router from './App.jsx'
import { SheetProvider } from './context/SheetContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <SheetProvider>
        <RouterProvider router={router} />
      </SheetProvider>
    </ToastProvider>
  </StrictMode>,
)
