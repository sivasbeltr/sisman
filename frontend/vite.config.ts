import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "tailwindcss";
import { UserConfigExport, PluginOption } from 'vite';

interface RollupOutputOptions {
  entryFileNames: string;
  chunkFileNames: string;
  assetFileNames: (assetInfo: { name: string }) => string;
}

interface ViteBuildOptions {
  outDir: string;
  emptyOutDir: boolean;
  rollupOptions: {
    output: RollupOutputOptions;
  };
}


export default defineConfig({
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: <ViteBuildOptions>{
    outDir: '../public',
    emptyOutDir: true,
    rollupOptions: {
      output: <RollupOutputOptions>{
        entryFileNames: 'static/js/app.js',
        chunkFileNames: 'static/js/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'static/css/app.css';
          }
          return 'static/assets/[name][extname]';
        },
      }
    }
  },
  plugins: <PluginOption[]>[
    react(),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  // HTML dosyasını bir üst dizine taşımak için ana dizin yapılandırması
  root: './',
  publicDir: '../public',
  base: './',
} as UserConfigExport);