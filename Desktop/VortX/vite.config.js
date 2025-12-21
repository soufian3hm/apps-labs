import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  assetsInclude: ['**/*.html'],

  // ===== SOURCE MAP SECURITY =====
  // Completely disable source maps in production
  build: {
    // No source maps in production - prevents code leakage
    sourcemap: false,

    // Minify code to make it harder to reverse engineer
    minify: 'terser',

    // Terser options for maximum obfuscation
    terserOptions: {
      compress: {
        // Remove console.log statements in production
        drop_console: mode === 'production',
        // Remove debugger statements
        drop_debugger: true,
        // Remove unused code
        dead_code: true,
      },
      mangle: {
        // Mangle property names for additional obfuscation
        properties: false, // Set to true for maximum obfuscation (may break code)
      },
      format: {
        // Remove all comments
        comments: false,
      },
    },

    // Rollup options for additional security
    rollupOptions: {
      output: {
        // Use hashed filenames to prevent caching attacks
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },

  // Disable source maps for CSS as well
  css: {
    devSourcemap: false,
  },

  // ESBuild options (used in dev mode)
  esbuild: {
    // Remove console in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}))

