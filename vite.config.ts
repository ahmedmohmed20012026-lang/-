import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      // IMPORTANT: 'data/**' must stay ignored here. The backend (server.ts) writes
      // the live database to data/database.json on every action (payments, new
      // customers, new contracts, settings...). Without this exclusion, Vite's
      // watcher detects that write and forces a full browser page reload right
      // after every successful action, which resets the SPA's in-memory
      // activeTab state back to 'dashboard'.
      watch: process.env.DISABLE_HMR === 'true' ? null : { ignored: ['**/data/**'] },
    },
  };
});
