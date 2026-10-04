import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// 網站版註冊離線快取(sw.js);開發模式與離線單檔(file://)不註冊
if (import.meta.env.PROD && import.meta.env.MODE !== 'offline' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
}
