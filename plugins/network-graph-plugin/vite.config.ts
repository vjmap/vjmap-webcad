import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
const pluginFileName = pkg.name;

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            formats: ['iife'],
            fileName: () => `${pluginFileName}.js`,
            name: 'vjcadPluginNetworkGraph'
        },
        rollupOptions: {
            external: ['vjcad'],
            output: {
                globals: {
                    'vjcad': 'vjcad'
                },
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'style.css') {
                        return `${pluginFileName}.css`;
                    }
                    return assetInfo.name || 'assets/[name][extname]';
                },
                extend: true
            }
        },
        outDir: 'dist',
        sourcemap: true,
        emptyOutDir: true,
        cssCodeSplit: false
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    }
});
