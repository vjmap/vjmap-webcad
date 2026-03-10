# vjcad 插件开发指南

本目录用于开发 vjcad 插件。每个子目录是一个独立的插件工程，使用 Vite 构建为 IIFE 格式，由 vjcad 运行时加载。

## 现有插件

| 目录 | 包名 | 功能 | 自动加载 |
|------|------|------|---------|
| `annotation-plugin/` | vcad-plugin-annotation | 批注/标记审阅（云线、箭头、印章等） | ❌ |
| `network-graph-plugin/` | vcad-plugin-network-graph | 拓扑网络图绘制 | ❌ |
| `view3d-plugin/` | vcad-plugin-view3d | 三维查看（带 Z 值实体 3D 可视化） | ❌ |

## 快速开始

### 使用脚手架创建插件

```bash
# 交互式创建
node create-plugin.js

# 快速创建
node create-plugin.js my-awesome

# 带参数创建
node create-plugin.js my-awesome --displayName "我的工具" --description "自定义工具集"

# 查看帮助
node create-plugin.js --help
```

### 命名约定

脚手架根据输入名称自动生成所有命名：

| 输入 | 生成 |
|------|------|
| `network-graph` | 目录: `network-graph-plugin/` |
| | 包名: `vcad-plugin-network-graph` |
| | 插件 ID: `network-graph` |
| | 命令名: `NETWORKGRAPH` |
| | 全局变量: `vjcadPluginNetworkGraph` |

### 安装依赖与构建

```bash
cd my-awesome-plugin
npm install
npm run dev     # 开发模式（watch 自动重建）
npm run build   # 构建
```

构建产物在 `dist/` 目录：
- `vcad-plugin-<name>.js` — IIFE 格式模块
- `vcad-plugin-<name>.css` — 样式文件（如有）

## 插件目录结构

脚手架生成的标准结构：

```
<name>-plugin/
├── package.json             # 插件元数据与依赖
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 构建配置
├── .gitignore
└── src/
    ├── index.ts             # 插件入口（生命周期 + 注册）
    ├── icons.ts             # SVG 图标定义
    ├── vite-env.d.ts        # Vite 类型声明
    ├── commands/            # 命令实现
    │   └── <Name>Command.ts
    ├── i18n/                # 国际化
    │   ├── index.ts
    │   ├── zh-CN.ts
    │   └── en-US.ts
    ├── services/            # 业务逻辑（可选）
    ├── entities/            # 自定义实体（可选）
    ├── ui/                  # UI 组件（可选）
    └── utils/               # 工具函数（可选）
```

## 核心概念

### Plugin 接口

每个插件的 `src/index.ts` 必须默认导出一个 `Plugin` 对象：

```typescript
import type { Plugin, PluginContext } from 'vjcad';
import { t } from 'vjcad';

const plugin: Plugin = {
    manifest: { ... },
    onLoad(context) { ... },
    onActivate(context) { ... },
    onDeactivate(context) { ... },
    onUnload(context) { ... },
};

export default plugin;
```

### manifest 配置

```typescript
manifest: {
    id: 'network-graph',                  // 唯一标识，与 package.json vjcadPlugin.id 一致
    name: 'Network Graph',                // 显示名称
    version: '1.0.0',
    author: 'vjmap.com',
    description: 'Topological network drawing',
    keywords: ['network', 'graph', 'topology']
}
```

### package.json 中的 vjcadPlugin 字段

```json
{
    "vjcadPlugin": {
        "id": "network-graph",
        "displayName": "网络图",
        "autoLoad": false,
        "keywords": ["network", "graph"]
    }
}
```

- `autoLoad: true` — 应用启动时自动加载
- `autoLoad: false` — 需要用户手动启用

### 生命周期

| 钩子 | 时机 | 典型用途 |
|------|------|---------|
| `onLoad` | 模块加载后 | 注册 i18n 消息、注册自定义实体 |
| `onActivate` | 插件激活时 | 注册命令、图标、菜单、Ribbon、启动服务 |
| `onDeactivate` | 插件停用时 | 清理资源、销毁 UI、停止服务监听 |
| `onUnload` | 插件卸载前 | 最终清理 |

## PluginContext API

### 命令

```typescript
// 注册命令（commandClass 需实现 main() 和 cancel()）
context.registerCommand(name: string, description: string, commandClass: Class);

// 注销命令
context.unregisterCommand(name: string);

// 执行命令
await context.executeCommand(name: string);
```

命令类模式：

```typescript
export class MyCommand {
    async main(): Promise<void> {
        // 命令逻辑
    }
    cancel(): void {
        // 取消处理
    }
}
```

### 图标

```typescript
// 注册 SVG 图标（commandName 大写，与命令名一致）
context.registerIcon('MYCOMMAND', svgString);
```

图标使用 24×24 SVG，主题色 `#73C5FF`：

```typescript
export const ICON_MYCOMMAND = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#73C5FF" stroke-width="2"/>
</svg>`;
```

### 菜单

```typescript
// 向已有菜单添加条目
context.addMenuItem('tool', { command: 'MYCOMMAND' });
context.addMenuItem('tool', { command: 'MYCOMMAND', after: 'EXISTINGCMD' });

// 创建新的顶级菜单（annotation-plugin / architecture-plugin 用法）
context.addMenu({ id: 'review', label: '审阅' });
context.addMenuItem('review', { command: 'MY_CMD' });
```

### Ribbon 工具栏

```typescript
// 在已有 Tab 下添加按钮组
context.addRibbonGroup('plugins', {
    id: 'my-group',
    label: '我的工具',
    pinnable: true,
    primaryButtons: [
        { icon: 'mycommand', cmd: 'MYCOMMAND', prompt: '我的命令', type: 'large' }
    ],
    moreButtons: [
        { icon: 'another', cmd: 'ANOTHER', prompt: '其他命令' }
    ]
});

// 向已有 Group 添加按钮
context.addRibbonButton('insert', 'import', {
    icon: 'myicon', cmd: 'MYCMD', prompt: '提示', type: 'large'
});

// 创建新的 Ribbon Tab（architecture-plugin / annotation-plugin 用法）
context.addRibbonTab(
    { id: 'architecture', label: '建筑', groups: [] },
    'insert'  // 插入到哪个 Tab 之后
);
```

RibbonGroupConfig 完整结构：

```typescript
interface RibbonGroupConfig {
    id: string;
    label: string;
    pinnable?: boolean;
    displayMode?: 'compact' | 'small-icons';  // 紧凑/小图标模式
    primaryButtons: RibbonButtonConfig[];
    secondaryButtons?: RibbonButtonConfig[];
    moreButtons?: RibbonButtonConfig[];        // 展开更多
}

interface RibbonButtonConfig {
    icon: string;       // 图标名（小写，与 registerIcon 的 key 小写对应）
    cmd: string;        // 命令名（大写）
    prompt: string;     // 提示文本
    type?: 'large' | 'small';
}
```

### 侧边栏面板

```typescript
// ai-plugin 用法：注册侧边栏面板
const { registerSidebarPanel, activateSidebarPanel } = (window as any).vjcad;

registerSidebarPanel({
    name: 'my-panel',
    label: '面板标题',
    icon: './images/actbar/actbar-commands.svg',
    position: 'right',       // 'left' | 'right'
    panelClass: MyPanelClass,
    order: 1,
});

// 切换面板显示
activateSidebarPanel('my-panel');
```

## 高级功能

### 自定义实体

需要在图纸中绘制持久化自定义图形时使用（architecture-plugin、network-graph-plugin）：

```typescript
import { CustomEntityRegistry } from 'vjcad';

// 在 onLoad 中注册
const registry = CustomEntityRegistry.getInstance();
registry.register('MY_ENTITY_TYPE', MyEntityClass);

// 在 onDeactivate 中注销
registry.unregister('MY_ENTITY_TYPE');
```

### 国际化 (i18n)

每个插件有独立的 i18n 模块，在 `onLoad` 生命周期中注册：

**src/i18n/index.ts**

```typescript
import { registerMessages, type TranslationMessages } from 'vjcad';
import zhCN from './zh-CN';
import enUS from './en-US';

export function registerMyPluginMessages(): void {
    registerMessages({
        'zh-CN': zhCN as unknown as TranslationMessages,
        'en-US': enUS as unknown as TranslationMessages,
    });
}
```

**src/i18n/zh-CN.ts**

```typescript
export default {
    'myPlugin.plugin.loaded': '插件已加载',
    'myPlugin.cmd.label': '我的命令',
} as const;
```

使用 `t()` 函数获取翻译文本：

```typescript
import { t } from 'vjcad';
console.log(t('myPlugin.plugin.loaded'));
```

i18n key 命名规范：`<pluginCamelCase>.<category>.<key>`

### 浮动工具栏

architecture-plugin 使用了浮动工具栏来集中展示多个命令按钮：

```typescript
import { createFloatingToolbar } from 'vjcad';

const toolbar = createFloatingToolbar('my-toolbar', {
    title: '工具栏标题',
    columns: 5,
    iconSize: 30,
    position: { top: '80px', left: '60px' },
    items: [
        { id: 'cmd1', icon: ICON_SVG, tooltip: '命令1', command: 'CMD1' },
        { id: 'cmd2', icon: ICON_SVG, tooltip: '命令2', command: 'CMD2' },
    ],
});
toolbar.show();
```

## 构建配置

### vite.config.ts

所有插件使用统一的 Vite 构建模式：

- **格式**: IIFE（立即调用函数表达式）
- **外部依赖**: `vjcad` 作为 external，运行时通过全局变量访问
- **输出**: `dist/vcad-plugin-<name>.js` + `dist/vcad-plugin-<name>.css`
- **路径别名**: `@` → `src/`

### tsconfig.json

推荐使用 strict 模式，标准配置如下：

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "strict": true,
        "baseUrl": ".",
        "paths": { "@/*": ["src/*"] }
    },
    "include": ["src"]
}
```

## 加载插件

```typescript
import { PluginManager } from 'vjcad';

const pm = PluginManager.getInstance();

// 从 URL 加载
await pm.loadFromUrl('/plugins/my-plugin/vcad-plugin-my-plugin.js');

// 从路径加载
await pm.loadFromPath('./plugins/my-plugin/vcad-plugin-my-plugin.js');
```

## 最佳实践

1. **模块化** — 将命令、服务、UI、工具函数分离到各自的目录
2. **i18n** — 所有用户可见文本使用 `t()` 函数，支持中英文切换
3. **命名规范** — 命令名大写 (`MYCOMMAND`)，插件 ID 小写连字符 (`my-plugin`)，图标名小写 (`mycommand`)
4. **资源清理** — 在 `onDeactivate` 中销毁 UI 面板、停止服务监听、注销自定义实体
5. **主题色** — 图标使用 `#73C5FF` 作为主色调，保持与其他插件视觉一致
6. **生命周期分工** — `onLoad` 注册 i18n 和实体，`onActivate` 注册命令/UI，`onDeactivate` 清理
7. **独立构建** — 每个插件是独立工程，不依赖其他插件，仅通过 `vjcad` 进行交互
