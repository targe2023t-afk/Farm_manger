import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  build: {
    outDir: 'dist',
    rollupOptions: {
      // ✅ يحل مشكلة @supabase/supabase-js مع Vite
      external: [],
    }
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
  },
  define: {
    // ✅ مطلوب لـ Supabase في بيئة browser
    global: 'globalThis',
  }
})
