import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        emptyOutDir: false,
        lib: {
            entry: resolve(__dirname, 'src/background.ts'),
            name: 'background',
            formats: ['iife'],
            fileName: () => 'assets/background.js',
        },
    },
})
