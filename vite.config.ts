import { fileURLToPath, URL } from 'node:url'

import glsl from 'vite-plugin-glsl';
import restart from 'vite-plugin-restart';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/vr-shooter/',
  plugins: [
    wasm(),
    topLevelAwait(),
    vue(),
    vueDevTools(),
    restart({
      restart: ['./src/canvas/types/shaders/**/*.glsl'],
    }),
    glsl(),
  ],
  build:{
    outDir: 'dist/vr-shooter',
    rollupOptions:{
      treeshake: false,
    }
  },
  server:{
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'server.crt')),
    },
    port: 3000
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
