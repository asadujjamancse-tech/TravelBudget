import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Path aliases — every import in the codebase uses these instead of relative paths.
// This means files can be moved between folders without breaking imports.
// Usage:  import Footer from '@components/layout/Footer'
//         import { countries } from '@data/countries'
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@'           : path.resolve(__dirname, './src'),
      '@features'   : path.resolve(__dirname, './src/features'),
      '@components' : path.resolve(__dirname, './src/components'),
      '@data'       : path.resolve(__dirname, './src/data'),
      '@hooks'      : path.resolve(__dirname, './src/hooks'),
      '@context'    : path.resolve(__dirname, './src/context'),
      '@utils'      : path.resolve(__dirname, './src/utils'),
      '@constants'  : path.resolve(__dirname, './src/constants'),
    },
  },
})
