
## 唯杰WebCAD

此工程为 [唯杰](https://vjmap.com)  [WebCAD](https://vjmap.com/app/webcad/) 示例的所有源代码。唯杰WebCAD 是一个基于 TypeScript 开发的专业级 Web 端 CAD 引擎，提供完整的 2D CAD 绘图功能。它采用现代化的架构设计，具有高性能渲染、完善的插件系统和丰富的 API 接口，适用于各类需要精确绘图和 CAD 功能的 Web 应用。

## 在线体验

| 名称 | 地址 |
|------|------|
| 唯杰WebCAD编辑平台 | https://vjmap.com/app/webcad/ |
| 唯杰WebCAD在线示例 | https://vjmap.com/app/democad |
| 唯杰WebCAD文档 | https://vjmap.com/app/docscad/ |

## 核心特性

- **矢量图形引擎** - GPU 加速渲染，支持百万级实体显示
- **DWG 兼容** - 完整支持 DWG/DXF 格式读写，与 AutoCAD 无缝对接
- **丰富实体类型** - Line、Circle、Arc、Polyline、Text、Hatch、Insert 等 20+ 种实体
- **插件系统** - 完善的生命周期管理，支持命令注册、UI 扩展、事件监听
- **撤销重做** - 完整的撤销重做机制，支持批量操作合并
- **TypeScript** - 完整的类型定义，良好的开发体验

## 目录结构

html 一个简单的html webcad示例

vite 一个vite工程的webcad示例

playground  唯杰WebCAD在线示例https://vjmap.com/app/democad 源码

plugins 几个插件的源码


## 安装

```bash
# npm
npm install vjcad

# yarn
yarn add vjcad

# pnpm
pnpm add vjcad
```

或在 `package.json` 中添加：

```json
{
  "dependencies": {
    "vjcad": "^1.0.0"
  }
}
```

## 快速开始

### 1. 初始化引擎

```html
<!-- index.html -->
<div id="cad-app" style="width: 100%; height: 100%;"></div>
```

```javascript
import { MainView, initCadContainer, Engine, LineEnt, initLocale, registerMessages, t } from 'vjcad';

// Initialize locale first (auto-detects from URL ?lang= > localStorage > browser language)
initLocale(); // 'zh-CN' or 'en-US'

// Register app-level translations
registerMessages({
    'zh-CN': {
        'app.name': '唯杰WebCAD'
    },
    'en-US': {
        'app.name': 'VJMap WebCAD'
    },
});

// 创建 MainView 实例
const cadView = new MainView({
    appname: t('app.name'),
    version: "v1.0.0",
    serviceUrl: "https://your-service-url/api/v1",
    sidebarStyle: "none",  // "none" | "left" | "right" | "both"
});

// 挂载到 DOM 容器
initCadContainer("cad-app", cadView);

// 等待初始化完成
await cadView.onLoad();
```

### 2. 绘制图形

```javascript
// 创建直线
const line = new LineEnt([0, 0], [100, 100]);
line.setDefaults();  // 必须调用
Engine.addEntities(line);

// 创建圆
const circle = new CircleEnt([50, 50], 30);
circle.setDefaults();
Engine.addEntities(circle);

// 缩放到全图
Engine.zoomExtents();
```

### 3. 创建自定义命令

```javascript
import { CommandDefinition, CommandRegistry, PointInputOptions, 
         InputStatusEnum, getPoint, Engine, LineEnt } from 'vjcad';

class MyLineCommand {
    async main() {
        // 获取起点
        const opt1 = new PointInputOptions("指定起点:");
        const result1 = await getPoint(opt1);
        if (result1.status !== InputStatusEnum.OK) return;
        
        // 获取终点（带橡皮筋线）
        const opt2 = new PointInputOptions("指定终点:");
        opt2.useBasePoint = true;
        opt2.basePoint = result1.value;
        const result2 = await getPoint(opt2);
        if (result2.status !== InputStatusEnum.OK) return;
        
        // 创建直线
        const line = new LineEnt(result1.value, result2.value);
        line.setDefaults();
        Engine.addEntities(line);
    }
}

// 注册并执行命令
const cmdDef = new CommandDefinition("MYLINE", "绘制直线", MyLineCommand);
CommandRegistry.regist(cmdDef);
await Engine.editor.executerWithOp("MYLINE");
```

## 常用 API

### 实体创建

| 实体 | 创建方式 | 说明 |
|------|----------|------|
| `LineEnt` | `new LineEnt([x1,y1], [x2,y2])` | 直线 |
| `CircleEnt` | `new CircleEnt([cx,cy], radius)` | 圆 |
| `ArcEnt` | `new ArcEnt([cx,cy], r, startAng, endAng)` | 圆弧 |
| `PolylineEnt` | `new PolylineEnt()` + `setPoints()` | 多段线 |
| `TextEnt` | `new TextEnt()` | 单行文字 |
| `MTextEnt` | `new MTextEnt()` | 多行文字 |
| `HatchEnt` | `new HatchEnt()` | 填充 |

> **重要**：创建实体后必须先调用 `setDefaults()`，再设置其他属性。

### 实体属性

```javascript
const line = new LineEnt([0, 0], [100, 0]);
line.setDefaults();           // 必须先调用

line.color = 1;               // 颜色（1红 2黄 3绿 4青 5蓝 6洋红 7白）
line.layer = "图层名";         // 图层
line.lineType = "HIDDEN";     // 线型（CONTINUOUS, HIDDEN, CENTER）
line.lineTypeScale = 1.0;     // 线型比例

Engine.addEntities(line);
```

### Engine 核心方法

```javascript
// 实体操作
Engine.addEntities(entity);           // 添加实体
Engine.addEntities([ent1, ent2]);     // 批量添加
Engine.eraseEntities(entity);         // 删除实体

// 视图操作
Engine.zoomExtents();                 // 缩放到全图
Engine.zoomToEntities(entities);      // 缩放到指定实体
Engine.regen();                       // 刷新显示

// 选择集
Engine.ssSetFirst([entity]);          // 设置选择集
Engine.ssGetFirst();                  // 获取选择集

// 查询
Engine.getEntities();                 // 获取所有实体
Engine.getEntities(ent => ent.layer === "图层A");  // 按条件过滤
Engine.getEntitiesByType('LINE');     // 按类型获取
Engine.getLayers();                   // 获取所有图层
```

### 输入函数

```javascript
import { getPoint, getSelections, getReal, getInteger,
         PointInputOptions, SelectionInputOptions, 
         RealInputOptions, IntegerInputOptions, InputStatusEnum } from 'vjcad';

// 获取点
const result = await getPoint(new PointInputOptions("指定点:"));
if (result.status === InputStatusEnum.OK) {
    const point = result.value;  // {x, y}
}

// 获取选择集
const result = await getSelections(new SelectionInputOptions("选择对象:"));

// 获取数值
const result = await getReal(new RealInputOptions("输入半径:"));
const result = await getInteger(new IntegerInputOptions("输入边数:"));
```

### 图层操作

```javascript
// 创建图层
Engine.createLayer("新图层", {
    color: 1,
    lineType: "CONTINUOUS",
    layerOn: true,
    isFrozen: false,
    isLocked: false
});

// 切换当前图层
Engine.setCurrentLayer("图层名");

// 图层可见性
const layer = Engine.getLayerByName("图层名");
layer.layerOn = false;   // 关闭
layer.isFrozen = true;   // 冻结
layer.isLocked = true;   // 锁定
Engine.regen(true);
```

### 撤销操作

```javascript
const undoMgr = Engine.undoManager;

// 撤销/重做
undoMgr.undo();
undoMgr.redo();

// 撤销分组（多个操作合并为一次撤销）
undoMgr.start_undoMark();
try {
    // 多个操作...
} finally {
    undoMgr.end_undoMark();
}
```

## 浏览器支持

| 浏览器 | 最低版本 | 推荐版本 |
|--------|---------|---------|
| Chrome | 80+ | 最新版 |
| Firefox | 75+ | 最新版 |
| Edge | 80+ | 最新版 |
| Safari | 13+ | 最新版 |

## 文档导航

- [入门指南](https://vjmap.com/app/docscad/guide/introduction.html) - 了解基本概念和快速上手
- [核心概念](https://vjmap.com/app/docscad/core/engine.html) - Engine、Document、坐标系统
- [实体系统](https://vjmap.com/app/docscad/entity/) - 各类 CAD 实体的属性和方法
- [命令系统](https://vjmap.com/app/docscad/command/command-basics.html) - 创建和注册自定义命令
- [插件系统](https://vjmap.com/app/docscad/plugin/plugin-basics.html) - 开发 WebCAD 插件
- [事件系统](https://vjmap.com/app/docscad/event/event-types.html) - 监听和处理系统事件

## 相关链接

- [唯杰地图官网](https://vjmap.com/)

---

# 唯杰地图介绍

`唯杰地图VJMAP`为`CAD`图或`自定义地图格式`WebGIS`可视化`显示开发提供的一站式解决方案，支持的格式如常用的`AutoCAD`的`DWG`格式文件、`GeoJSON`等常用`GIS`文件格式，它使用WebGL`矢量图块`和`自定义样式`呈现交互式地图, 提供了全新的`大数据可视化`、`实时流数据`可视化功能，通过本产品可快速实现浏览器和移动端上美观、流畅的地图呈现与空间分析，可帮助您在网站中构建功能丰富、交互性强、可定制的地图应用。

[唯杰地图](https://vjmap.com/)官网地址：https://vjmap.com/

## 特点

- 完全兼容`AutoCAD`格式的`DWG`文件，无需转换
- 绘图技术先进：采用WebGL技术，支持`矢量地图`渲染，支持栅格、图片、视频等图形渲染，支持3D模型渲染；
- 个性化地图：服务端渲染和前端渲染都支持自定义样式表达式，灵活强大；
- 多视角模式：支持2D、3D视角，支持垂直视角、360度旋转视角；
- 视觉特性：支持无极缩放、支持粒子、航线等动画效果、支持飞行、平移等运动特效；
- 功能完善：支持所有常见的地图功能，提供丰富的js接口；
- 交互控制：支持鼠标/单指拖拽、上下左右按键进行地图平移，支持鼠标滚轮、双击、双指进行地图缩放，支持Shift+拉框放大；
- 大数据可视化：性能卓越，支持大数据可视化展示
- 跨平台支持(支持`windows`,`linux`); 支持`docker`部署;支持`私有化`部署;支持桌面端语言开发(如`C#`、`Java`、`C++`语言)
