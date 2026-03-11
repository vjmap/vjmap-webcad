English | **[中文](README.md)**

## VJMap WebCAD

This repository contains all the source code for [VJMap](https://vjmap.com/en/) [WebCAD](https://vjmap.com/app/webcad/?lang=en) examples. VJMap WebCAD is a professional-grade Web CAD engine developed in TypeScript, providing comprehensive 2D CAD drawing capabilities. It features a modern architecture design with high-performance rendering, a robust plugin system, and rich API interfaces, suitable for various web applications requiring precise drawing and CAD functionality.

## Live Demo

| Name | URL |
|------|-----|
| VJMap WebCAD Editor | https://vjmap.com/app/webcad/?lang=en/ |
| VJMap WebCAD Examples | https://vjmap.com/app/democad/#/gallery/map?lang=en |
| VJMap WebCAD Documentation | https://vjmap.com/app/docscad/en/ |

## Core Features

- **Vector Graphics Engine** - GPU-accelerated rendering, supporting millions of entities
- **DWG Compatible** - Full DWG/DXF format read/write support, seamless integration with AutoCAD
- **Rich Entity Types** - Line, Circle, Arc, Polyline, Text, Hatch, Insert and 20+ entity types
- **Plugin System** - Complete lifecycle management with command registration, UI extensions, and event listeners
- **Undo/Redo** - Full undo/redo mechanism with batch operation merging
- **TypeScript** - Complete type definitions for a great development experience

## Directory Structure

html - A simple HTML WebCAD example

vite - A Vite project WebCAD example

playground - Source code for VJMap WebCAD online examples at https://vjmap.com/app/democad/#/gallery/map?lang=en

plugins - Source code for several plugins


## Installation

```bash
# npm
npm install vjcad

# yarn
yarn add vjcad

# pnpm
pnpm add vjcad
```

Or add to `package.json`:

```json
{
  "dependencies": {
    "vjcad": "^1.0.3"
  }
}
```

## Quick Start

### 1. Initialize the Engine

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

// Create MainView instance
const cadView = new MainView({
    appname: t('app.name'),
    version: "v1.0.0",
    serviceUrl: "https://your-service-url/api/v1",
    sidebarStyle: "none",  // "none" | "left" | "right" | "both"
});

// Mount to DOM container
initCadContainer("cad-app", cadView);

// Wait for initialization
await cadView.onLoad();
```

### 2. Draw Graphics

```javascript
// Create a line
const line = new LineEnt([0, 0], [100, 100]);
line.setDefaults();  // Must be called
Engine.addEntities(line);

// Create a circle
const circle = new CircleEnt([50, 50], 30);
circle.setDefaults();
Engine.addEntities(circle);

// Zoom to fit all
Engine.zoomExtents();
```

### 3. Create Custom Commands

```javascript
import { CommandDefinition, CommandRegistry, PointInputOptions, 
         InputStatusEnum, getPoint, Engine, LineEnt } from 'vjcad';

class MyLineCommand {
    async main() {
        // Get start point
        const opt1 = new PointInputOptions("Specify start point:");
        const result1 = await getPoint(opt1);
        if (result1.status !== InputStatusEnum.OK) return;
        
        // Get end point (with rubber band line)
        const opt2 = new PointInputOptions("Specify end point:");
        opt2.useBasePoint = true;
        opt2.basePoint = result1.value;
        const result2 = await getPoint(opt2);
        if (result2.status !== InputStatusEnum.OK) return;
        
        // Create line
        const line = new LineEnt(result1.value, result2.value);
        line.setDefaults();
        Engine.addEntities(line);
    }
}

// Register and execute command
const cmdDef = new CommandDefinition("MYLINE", "Draw Line", MyLineCommand);
CommandRegistry.regist(cmdDef);
await Engine.editor.executerWithOp("MYLINE");
```

## Common APIs

### Entity Creation

| Entity | Constructor | Description |
|--------|------------|-------------|
| `LineEnt` | `new LineEnt([x1,y1], [x2,y2])` | Line |
| `CircleEnt` | `new CircleEnt([cx,cy], radius)` | Circle |
| `ArcEnt` | `new ArcEnt([cx,cy], r, startAng, endAng)` | Arc |
| `PolylineEnt` | `new PolylineEnt()` + `setPoints()` | Polyline |
| `TextEnt` | `new TextEnt()` | Single-line Text |
| `MTextEnt` | `new MTextEnt()` | Multi-line Text |
| `HatchEnt` | `new HatchEnt()` | Hatch |

> **Important**: After creating an entity, you must call `setDefaults()` before setting other properties.

### Entity Properties

```javascript
const line = new LineEnt([0, 0], [100, 0]);
line.setDefaults();           // Must be called first

line.color = 1;               // Color (1=Red, 2=Yellow, 3=Green, 4=Cyan, 5=Blue, 6=Magenta, 7=White)
line.layer = "LayerName";     // Layer
line.lineType = "HIDDEN";     // Line type (CONTINUOUS, HIDDEN, CENTER)
line.lineTypeScale = 1.0;     // Line type scale

Engine.addEntities(line);
```

### Engine Core Methods

```javascript
// Entity operations
Engine.addEntities(entity);           // Add entity
Engine.addEntities([ent1, ent2]);     // Add multiple entities
Engine.eraseEntities(entity);         // Delete entity

// View operations
Engine.zoomExtents();                 // Zoom to fit all
Engine.zoomToEntities(entities);      // Zoom to specific entities
Engine.regen();                       // Refresh display

// Selection set
Engine.ssSetFirst([entity]);          // Set selection
Engine.ssGetFirst();                  // Get selection

// Query
Engine.getEntities();                 // Get all entities
Engine.getEntities(ent => ent.layer === "LayerA");  // Filter by condition
Engine.getEntitiesByType('LINE');     // Get by type
Engine.getLayers();                   // Get all layers
```

### Input Functions

```javascript
import { getPoint, getSelections, getReal, getInteger,
         PointInputOptions, SelectionInputOptions, 
         RealInputOptions, IntegerInputOptions, InputStatusEnum } from 'vjcad';

// Get point
const result = await getPoint(new PointInputOptions("Specify point:"));
if (result.status === InputStatusEnum.OK) {
    const point = result.value;  // {x, y}
}

// Get selection set
const result = await getSelections(new SelectionInputOptions("Select objects:"));

// Get numeric value
const result = await getReal(new RealInputOptions("Enter radius:"));
const result = await getInteger(new IntegerInputOptions("Enter number of sides:"));
```

### Layer Operations

```javascript
// Create layer
Engine.createLayer("NewLayer", {
    color: 1,
    lineType: "CONTINUOUS",
    layerOn: true,
    isFrozen: false,
    isLocked: false
});

// Set current layer
Engine.setCurrentLayer("LayerName");

// Layer visibility
const layer = Engine.getLayerByName("LayerName");
layer.layerOn = false;   // Turn off
layer.isFrozen = true;   // Freeze
layer.isLocked = true;   // Lock
Engine.regen(true);
```

### Undo Operations

```javascript
const undoMgr = Engine.undoManager;

// Undo/Redo
undoMgr.undo();
undoMgr.redo();

// Undo grouping (merge multiple operations into a single undo step)
undoMgr.start_undoMark();
try {
    // Multiple operations...
} finally {
    undoMgr.end_undoMark();
}
```

## Browser Support

| Browser | Minimum Version | Recommended |
|---------|----------------|-------------|
| Chrome | 80+ | Latest |
| Firefox | 75+ | Latest |
| Edge | 80+ | Latest |
| Safari | 13+ | Latest |

## Documentation

- [Getting Started](https://vjmap.com/app/docscad/en/guide/introduction.html) - Learn basic concepts and quick start
- [Core Concepts](https://vjmap.com/app/docscad/en/core/engine.html) - Engine, Document, Coordinate System
- [Entity System](https://vjmap.com/app/docscad/en/entity/) - Properties and methods of CAD entities
- [Command System](https://vjmap.com/app/docscad/en/command/command-basics.html) - Create and register custom commands
- [Plugin System](https://vjmap.com/app/docscad/en/plugin/plugin-basics.html) - Develop WebCAD plugins
- [Event System](https://vjmap.com/app/docscad/en/event/event-types.html) - Listen and handle system events

## Related Links

- [VJMap Official Website](https://vjmap.com/en/)

---

# VJMap Introduction

`VJMap` provides a one-stop solution for `CAD` drawings and `custom map format` WebGIS `visualization` development. It supports common formats such as `AutoCAD` `DWG` format files, `GeoJSON`, and other common `GIS` file formats. It uses WebGL `vector tiles` and `custom styles` to render interactive maps, offering cutting-edge `big data visualization` and `real-time streaming data` visualization capabilities. With this product, you can quickly achieve beautiful, smooth map rendering and spatial analysis in browsers and mobile devices, helping you build feature-rich, interactive, and customizable map applications for your website.

[VJMap](https://vjmap.com/en/) Official Website: https://vjmap.com/en/

## Highlights

- Fully compatible with `AutoCAD` `DWG` format files, no conversion needed
- Advanced rendering technology: WebGL-based, supports `vector map` rendering, raster, image, video rendering, and 3D model rendering
- Customizable maps: Both server-side and client-side rendering support custom style expressions, flexible and powerful
- Multiple view modes: Supports 2D and 3D perspectives, vertical view, 360-degree rotation
- Visual effects: Supports infinite zoom, particle and flight path animations, fly-to and pan motion effects
- Feature-rich: Supports all common map functions with extensive JavaScript APIs
- Interactive controls: Mouse/touch drag for panning, scroll wheel/double-click/pinch for zooming, Shift+drag for box zoom
- Big data visualization: Excellent performance for large-scale data visualization
- Cross-platform support (`Windows`, `Linux`); `Docker` deployment; `private` deployment; desktop language development (`C#`, `Java`, `C++`)
