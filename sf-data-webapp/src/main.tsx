import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createGlobal } from 'global';
import { Buffer } from 'buffer';
import process from 'process';

// This line defines `global` if it is not already defined.
if (typeof global === 'undefined') {
  (window as any).global = window;
}

(window as any).Buffer = Buffer;
(window as any).process = process;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
