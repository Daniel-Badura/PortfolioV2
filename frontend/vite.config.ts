import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'build',
    copyPublicDir: false,
    rolldownOptions: {
      onwarn(warning, warn) {
        // This is a client-rendered React app, not a React Server Components build.
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client') && warning.id?.includes('react-router')) return;
        warn(warning);
      },
    },
  },
  server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:5000' } },
});
