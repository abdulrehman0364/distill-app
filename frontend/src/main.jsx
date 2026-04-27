// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register service worker for PWA
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// src/index.css

@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  @apply transition-colors duration-200;
}

html {
  scroll-behavior: smooth;
}

body {
  @apply bg-slate-900 text-slate-100;
}

input, textarea, select {
  @apply transition-all duration-200;
}

input:focus, textarea:focus, select:focus {
  @apply ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #0f172a;
}

::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* PostCSS configuration */
// postcss.config.js

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
