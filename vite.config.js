import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  // Tambahkan baris optimizeDeps ini untuk mengatasi impor tslib yang gagal:
  optimizeDeps: {
    include: ['tslib', '@supabase/supabase-js'],
  },
})