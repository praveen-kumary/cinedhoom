import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  css: {
    transformer: 'postcss',
  },
  build: {
    cssMinify: false,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        movie: resolve(import.meta.dirname, 'movie.html'),
        category: resolve(import.meta.dirname, 'category.html'),
        dashboard: resolve(import.meta.dirname, 'dashboard.html'),
        legal: resolve(import.meta.dirname, 'legal.html'),
      },
    },
  },
});
