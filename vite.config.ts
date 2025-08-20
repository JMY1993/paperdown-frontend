import { defineConfig, loadEnv } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Parse frontend port
  const frontendPort = parseInt(env.VITE_PORT || '3000')
  
  return {
    plugins: [
      tanstackRouter({ 
        target: 'react',
        autoCodeSplitting: true 
      }),
      viteReact(),
      tailwindcss(),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: frontendPort,
    },
  }
})
