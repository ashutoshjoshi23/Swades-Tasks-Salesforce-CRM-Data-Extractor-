import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        emptyOutDir: false,
        lib: {
            entry: resolve(__dirname, 'src/content.ts'),
            name: 'content',
            formats: ['iife'],
            fileName: () => 'assets/content.js',
        },
        rollupOptions: {
            output: {
                extend: true,
            },
        },
    },
})
