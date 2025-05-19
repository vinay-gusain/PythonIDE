// Environment variables are typed in vite-env.d.ts
/// <reference types="./vite-env.d.ts" />

const config = {
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
};

export default config; 