import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.JPG'],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        secure: false
      }
    },
    hmr: {
      overlay: false
    }
  },
  build: {
    rollupOptions: {
      onwarn: (warning, warn) => {
        if (warning.code === 'THIS_IS_UNDEFINED') return
        warn(warning)
      }
    }
  }
})
