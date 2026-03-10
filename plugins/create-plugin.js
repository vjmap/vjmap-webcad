#!/usr/bin/env node
/**
 * vjcad Plugin Scaffold Tool
 *
 * Creates a new plugin project with the standard directory structure,
 * build configuration, i18n support, and a sample command.
 *
 * Usage:
 *   node create-plugin.js                    # Interactive mode
 *   node create-plugin.js my-awesome         # Quick create
 *   node create-plugin.js my-awesome --displayName "我的插件" --description "插件描述"
 *   node create-plugin.js --help             # Show help
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Naming Utilities
// ============================================================================

/**
 * Derive all naming variants from a raw plugin name.
 *
 * Input examples: "insert", "network-graph", "my-awesome-plugin"
 * The trailing "-plugin" is stripped if present.
 */
function getNames(rawName) {
    const id = rawName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .replace(/-plugin$/, '');

    const camel = id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const pascal = camel.charAt(0).toUpperCase() + camel.slice(1);

    return {
        id,                                     // network-graph
        dirName: `${id}-plugin`,                // network-graph-plugin
        packageName: `vcad-plugin-${id}`,       // vcad-plugin-network-graph
        globalName: `vjcadPlugin${pascal}`,     // vjcadPluginNetworkGraph
        commandName: id.replace(/-/g, '').toUpperCase(), // NETWORKGRAPH
        camel,                                  // networkGraph
        pascal,                                 // NetworkGraph
    };
}

// ============================================================================
// Template Generators
// ============================================================================

function genPackageJson(names, config) {
    return JSON.stringify({
        name: names.packageName,
        version: '1.0.0',
        description: config.description || `${config.displayName || names.pascal} 插件`,
        type: 'module',
        main: `dist/${names.packageName}.js`,
        module: `dist/${names.packageName}.js`,
        vjcadPlugin: {
            id: names.id,
            displayName: config.displayName || names.pascal,
            autoLoad: config.autoLoad ?? false,
            keywords: config.keywords?.length ? config.keywords : [names.id],
        },
        files: ['dist'],
        scripts: {
            dev: 'vite build --watch',
            build: 'tsc --noEmit && vite build',
            preview: 'vite preview',
        },
        keywords: ['webcad', 'plugin', names.id, ...(config.keywords || [])],
        author: config.author || 'vjmap.com',
        license: 'MIT',
        peerDependencies: {
            vjcad: 'link:../../webcad-lib-ts',
        },
        devDependencies: {
            typescript: '^5.3.0',
            vite: '^5.0.0',
            vjcad: 'link:../../webcad-lib-ts',
        },
    }, null, 2) + '\n';
}

function genTsConfig() {
    return JSON.stringify({
        compilerOptions: {
            target: 'ES2020',
            useDefineForClassFields: true,
            module: 'ESNext',
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            skipLibCheck: true,
            moduleResolution: 'bundler',
            allowImportingTsExtensions: true,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            strict: true,
            noUnusedLocals: false,
            noUnusedParameters: false,
            noFallthroughCasesInSwitch: true,
            declaration: true,
            declarationMap: true,
            sourceMap: true,
            baseUrl: '.',
            paths: { '@/*': ['src/*'] },
        },
        include: ['src'],
    }, null, 2) + '\n';
}

function genViteConfig(names) {
    return `import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
const pluginFileName = pkg.name;

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            formats: ['iife'],
            fileName: () => \`\${pluginFileName}.js\`,
            name: '${names.globalName}'
        },
        rollupOptions: {
            external: ['vjcad'],
            output: {
                globals: {
                    'vjcad': 'vjcad'
                },
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'style.css') {
                        return \`\${pluginFileName}.css\`;
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
`;
}

function genGitignore() {
    return `node_modules/
dist/
.vscode/
.idea/
*.swp
*.swo
.DS_Store
Thumbs.db
*.log
npm-debug.log*
*.local
`;
}

function genViteEnvDts() {
    return `/// <reference types="vite/client" />
`;
}

function genIcons(names) {
    return `/**
 * ${names.pascal} Plugin Icons
 * Theme color: #73C5FF
 */

export const ICON_${names.commandName} = \`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#73C5FF" stroke-width="2"/>
  <path d="M7 12h10M12 7v10" stroke="#73C5FF" stroke-width="2" stroke-linecap="round"/>
</svg>\`;
`;
}

function genI18nIndex(names) {
    return `import { registerMessages, type TranslationMessages } from 'vjcad';
import zhCN from './zh-CN';
import enUS from './en-US';

export function register${names.pascal}PluginMessages(): void {
    registerMessages({
        'zh-CN': zhCN as unknown as TranslationMessages,
        'en-US': enUS as unknown as TranslationMessages,
    });
}
`;
}

function genI18nZhCN(names, config) {
    const p = names.camel;
    const displayName = config.displayName || names.pascal;
    return `export default {
    '${p}.plugin.name': '${displayName}',
    '${p}.plugin.description': '${config.description || `${displayName}插件`}',
    '${p}.plugin.loaded': '插件已加载',
    '${p}.plugin.activated': '插件已激活',
    '${p}.plugin.deactivated': '插件已停用',
    '${p}.plugin.unloaded': '插件已卸载',

    '${p}.cmd.label': '${displayName}',
    '${p}.cmd.executed': '命令已执行',

    '${p}.ribbon.groupLabel': '${displayName}',
} as const;
`;
}

function genI18nEnUS(names, config) {
    const p = names.camel;
    const enName = config.enName || names.pascal;
    return `export default {
    '${p}.plugin.name': '${enName}',
    '${p}.plugin.description': '${enName} plugin',
    '${p}.plugin.loaded': 'Plugin loaded',
    '${p}.plugin.activated': 'Plugin activated',
    '${p}.plugin.deactivated': 'Plugin deactivated',
    '${p}.plugin.unloaded': 'Plugin unloaded',

    '${p}.cmd.label': '${enName}',
    '${p}.cmd.executed': 'Command executed',

    '${p}.ribbon.groupLabel': '${enName}',
} as const;
`;
}

function genCommand(names) {
    const p = names.camel;
    return `import { t } from 'vjcad';

export class ${names.pascal}Command {
    async main(): Promise<void> {
        console.log(\`[${names.commandName}] \${t('${p}.cmd.executed')}\`);
        // TODO: Implement command logic
    }

    cancel(): void {
        // noop
    }
}
`;
}

function genIndexTs(names, config) {
    const p = names.camel;
    return `import type { Plugin, PluginContext } from 'vjcad';
import { t } from 'vjcad';
import { ICON_${names.commandName} } from './icons';
import { ${names.pascal}Command } from './commands/${names.pascal}Command';
import { register${names.pascal}PluginMessages } from './i18n';

const plugin: Plugin = {
    manifest: {
        id: '${names.id}',
        name: '${config.displayName || names.pascal}',
        version: '1.0.0',
        author: '${config.author || 'vjmap.com'}',
        description: '${config.description || `${names.pascal} plugin`}',
        keywords: ${JSON.stringify(config.keywords?.length ? config.keywords : [names.id])}
    },

    onLoad(context: PluginContext): void {
        register${names.pascal}PluginMessages();
        console.log(\`[\${context.manifest.name}] \${t('${p}.plugin.loaded')}\`);
    },

    onActivate(context: PluginContext): void {
        console.log(\`[\${context.manifest.name}] \${t('${p}.plugin.activated')}\`);

        context.registerIcon('${names.commandName}', ICON_${names.commandName});

        context.registerCommand('${names.commandName}', t('${p}.cmd.label'), ${names.pascal}Command);

        context.addMenuItem('tool', { command: '${names.commandName}' });

        context.addRibbonGroup('plugins', {
            id: '${names.id}',
            label: t('${p}.ribbon.groupLabel'),
            primaryButtons: [
                { icon: '${names.commandName.toLowerCase()}', cmd: '${names.commandName}', prompt: t('${p}.cmd.label'), type: 'large' }
            ]
        });
    },

    onDeactivate(context: PluginContext): void {
        console.log(\`[\${context.manifest.name}] \${t('${p}.plugin.deactivated')}\`);
    },

    onUnload(context: PluginContext): void {
        console.log(\`[\${context.manifest.name}] \${t('${p}.plugin.unloaded')}\`);
    }
};

export default plugin;
`;
}

// ============================================================================
// File Creation
// ============================================================================

function createPlugin(config) {
    const names = getNames(config.name);
    const baseDir = config.output
        ? (path.isAbsolute(config.output) ? config.output : path.resolve(process.cwd(), config.output))
        : __dirname;
    const pluginDir = path.join(baseDir, names.dirName);
    const srcDir = path.join(pluginDir, 'src');
    const cmdDir = path.join(srcDir, 'commands');
    const i18nDir = path.join(srcDir, 'i18n');

    if (fs.existsSync(pluginDir)) {
        console.error(`\n❌ 目录已存在: ${pluginDir}`);
        console.error(`   请先删除或使用其他名称。\n`);
        process.exit(1);
    }

    console.log(`\n📦 创建插件: ${names.packageName}`);
    console.log(`   目录: ${names.dirName}/`);
    console.log(`   插件 ID: ${names.id}`);
    console.log(`   命令名: ${names.commandName}`);
    console.log(`   全局变量: ${names.globalName}\n`);

    // Create directories
    for (const dir of [pluginDir, srcDir, cmdDir, i18nDir]) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Generate files
    const files = [
        ['package.json',                         genPackageJson(names, config)],
        ['tsconfig.json',                        genTsConfig()],
        ['vite.config.ts',                       genViteConfig(names)],
        ['.gitignore',                           genGitignore()],
        ['src/vite-env.d.ts',                    genViteEnvDts()],
        ['src/icons.ts',                         genIcons(names)],
        ['src/index.ts',                         genIndexTs(names, config)],
        [`src/commands/${names.pascal}Command.ts`, genCommand(names)],
        ['src/i18n/index.ts',                    genI18nIndex(names)],
        ['src/i18n/zh-CN.ts',                    genI18nZhCN(names, config)],
        ['src/i18n/en-US.ts',                    genI18nEnUS(names, config)],
    ];

    for (const [relPath, content] of files) {
        const fullPath = path.join(pluginDir, relPath);
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`   ✅ ${relPath}`);
    }

    console.log(`
🎉 插件创建成功！

目录结构:
  ${names.dirName}/
  ├── package.json
  ├── tsconfig.json
  ├── vite.config.ts
  ├── .gitignore
  └── src/
      ├── index.ts              # 插件入口
      ├── icons.ts              # SVG 图标
      ├── vite-env.d.ts
      ├── commands/
      │   └── ${names.pascal}Command.ts
      └── i18n/
          ├── index.ts
          ├── zh-CN.ts
          └── en-US.ts

下一步:
  cd ${names.dirName}
  npm install
  npm run dev     # 开发模式 (watch)
  npm run build   # 构建
`);
}

// ============================================================================
// CLI
// ============================================================================

function showHelp() {
    console.log(`
vjcad 插件脚手架工具

用法:
  node create-plugin.js                            交互式创建
  node create-plugin.js <name>                     快速创建
  node create-plugin.js <name> [options]            带参数创建
  node create-plugin.js --help                     显示帮助

参数:
  --displayName <name>      显示名称（中文名）
  --description <desc>      插件描述
  --author <author>         作者（默认: vjmap.com）
  --keywords <k1,k2,...>    逗号分隔的关键词
  --autoLoad                设为自动加载（默认: false）
  --output, -o <dir>        输出目录（默认: 当前脚本所在目录）

命名约定:
  输入: network-graph
  ├── 目录:       network-graph-plugin/
  ├── 包名:       vcad-plugin-network-graph
  ├── 插件 ID:    network-graph
  ├── 命令名:     NETWORKGRAPH
  └── 全局变量:   vjcadPluginNetworkGraph

示例:
  node create-plugin.js my-awesome
  node create-plugin.js my-awesome --displayName "我的工具" --description "自定义工具集"
  node create-plugin.js my-awesome --autoLoad --keywords "tool,utility"
`);
}

function parseArgs(args) {
    const config = { name: null, output: null };
    let i = 0;

    while (i < args.length) {
        const arg = args[i];
        if (arg === '--help' || arg === '-h') {
            showHelp();
            process.exit(0);
        } else if (arg === '--output' || arg === '-o') {
            config.output = args[++i] || null;
        } else if (arg === '--author') {
            config.author = args[++i] || '';
        } else if (arg === '--description') {
            config.description = args[++i] || '';
        } else if (arg === '--displayName') {
            config.displayName = args[++i] || '';
        } else if (arg === '--keywords') {
            config.keywords = (args[++i] || '').split(',').map(k => k.trim()).filter(Boolean);
        } else if (arg === '--autoLoad') {
            config.autoLoad = true;
        } else if (!arg.startsWith('-') && !config.name) {
            config.name = arg;
        }
        i++;
    }

    return config;
}

async function interactiveMode() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

    console.log('\n🔧 vjcad 插件脚手架工具\n');

    try {
        const name = await ask('插件名称 (如 my-awesome): ');
        if (!name.trim()) {
            console.error('❌ 插件名称不能为空');
            rl.close();
            process.exit(1);
        }

        const displayName = await ask('显示名称（中文名，可选）: ');
        const description = await ask('插件描述（可选）: ');
        const author = await ask('作者（默认 vjmap.com）: ');
        const keywordsStr = await ask('关键词（逗号分隔，可选）: ');
        const autoLoadStr = await ask('自动加载？(y/N): ');

        rl.close();

        createPlugin({
            name: name.trim(),
            displayName: displayName.trim() || undefined,
            description: description.trim() || undefined,
            author: author.trim() || undefined,
            keywords: keywordsStr.split(',').map(k => k.trim()).filter(Boolean),
            autoLoad: /^y(es)?$/i.test(autoLoadStr.trim()),
        });
    } catch (err) {
        rl.close();
        if (err.code !== 'ERR_USE_AFTER_CLOSE') throw err;
        console.log('\n已取消。');
    }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        await interactiveMode();
    } else {
        const config = parseArgs(args);
        if (!config.name) {
            console.error('❌ 请提供插件名称。使用 --help 查看用法。\n');
            process.exit(1);
        }
        createPlugin(config);
    }
}

main().catch((err) => {
    console.error('❌ 错误:', err.message);
    process.exit(1);
});
