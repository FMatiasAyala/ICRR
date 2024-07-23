import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { WebSocketProvider } from './components/Tablon/hooks/useWebSocket.jsx'
import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes';

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <NextUIProvider>
      <BrowserRouter>
        <WebSocketProvider>
          <NextThemesProvider attribute="class" defaultTheme="light">
            <App />
          </NextThemesProvider>
        </WebSocketProvider>
      </BrowserRouter>
    </NextUIProvider>
  </React.StrictMode>,
)
