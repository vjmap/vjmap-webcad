import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Read package.json to get plugin name
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
const pluginFileName = pkg.name; // vcad-plugin-annotation

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            // Use IIFE format so vjcad is accessed as global variable
            formats: ['iife'],
            fileName: () => `${pluginFileName}.js`,
            name: 'vjcadPluginAnnotation'
        },
        rollupOptions: {
            external: ['vjcad'],
            output: {
                // vjcad provided as global variable
                globals: {
                    'vjcad': 'vjcad'
                },
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'style.css') {
                        return `${pluginFileName}.css`;
                    }
                    return assetInfo.name || 'assets/[name][extname]';
                },
                // Export to global variable in IIFE format
                extend: true
            }
        },
        outDir: 'dist',
        sourcemap: true,
        emptyOutDir: true
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    }
});
