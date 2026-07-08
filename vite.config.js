import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  preview: {
    host: true,
    port: process.env.PORT ? Number(process.env.PORT) : 4173,
    // Railway sert l'app depuis un sous-domaine *.up.railway.app (ou un domaine personnalisé).
    // Ajoutez votre domaine personnalisé ici si vous en configurez un dans Railway.
    allowedHosts: ['.up.railway.app', '.railway.app'],
  },
});
