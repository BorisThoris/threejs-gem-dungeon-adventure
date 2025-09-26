import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Important for Electron
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Optimize for Electron
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true,
        // Remove pure_funcs to keep console logs
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          rapier: ['@react-three/rapier'],
          utils: ['zustand']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // Electron-specific optimizations
    sourcemap: false,
    reportCompressedSize: false
  },
  server: {
    port: 5173,
    strictPort: true
  },
  optimizeDeps: {
    exclude: ['electron'],
    include: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/rapier']
  },
  // Additional Electron optimizations
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
})
