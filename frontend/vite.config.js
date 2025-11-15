import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5137,
    host: true,
    open: false
  },
  define: {
    __REACT_ROUTER_FUTURE_FLAGS__: JSON.stringify({
      v7_startTransition: true,
      v7_relativeSplatPath: true
    })
  }
});