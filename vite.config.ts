import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({
      router: {
        routesDirectory: '.',
        generatedRouteTree: '../.tanstack/routeTree.gen.ts',
        virtualRouteConfig: {
          type: 'root',
          file: 'tanstack-start-root.tsx',
        },
      },
    }),
    viteReact(),
  ],
})

export default config
