window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --预览视图组件--PreviewView在对话框中预览实体
        const { MainView, initCadContainer, LineEnt, CircleEnt, ArcEnt, Engine, PreviewView , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 在主视图中创建一些实体（使用简化写法）
        const line1 = new LineEnt([0, 0], [100, 0]);
        line1.setDefaults();
        line1.color = 1;
        
        const circle1 = new CircleEnt([50, 50], 30);
        circle1.setDefaults();
        circle1.color = 3;
        
        const arc1 = new ArcEnt([80, 0], 20, 0, Math.PI);
        arc1.setDefaults();
        arc1.color = 5;
        
        Engine.addEntities([line1, circle1, arc1]);
        Engine.zoomExtents();
        
        message.info("=== PreviewView 预览视图组件 ===");
        message.info("PreviewView 用于在对话框中独立预览实体，不影响主视图");
        
        // ========== 示例1：简单实体预览 ==========
        message.info("\n--- 示例1：简单实体预览 ---");
        
        // 创建对话框容器
        const dialog1 = document.createElement('div');
        dialog1.style.cssText = `
            position: fixed;
            top: 50px;
            right: 20px;
            width: 300px;
            height: 250px;
            background: #2d3748;
            border: 1px solid #4a5568;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1000;
            overflow: hidden;
        `;
        
        // 添加标题栏
        const title1 = document.createElement('div');
        title1.style.cssText = `
            padding: 8px 12px;
            background: #1a202c;
            color: white;
            font-size: 14px;
            border-bottom: 1px solid #4a5568;
        `;
        title1.textContent = '简单实体预览 (addEntity)';
        dialog1.appendChild(title1);
        
        // 创建 PreviewView 容器
        const previewContainer1 = document.createElement('div');
        previewContainer1.style.cssText = 'width: 100%; height: calc(100% - 36px);';
        dialog1.appendChild(previewContainer1);
        
        document.body.appendChild(dialog1);
        
        // 创建 PreviewView 实例
        const preview1 = new PreviewView({
            backgroundColor: 0x1a242e,
            interactive: true,      // 启用交互（缩放/平移）
            defaultColor: 0x00ff00  // 默认绿色
        });
        previewContainer1.appendChild(preview1);
        
        // 等待组件初始化完成
        await preview1.onLoad();
        
        // 添加实体到预览（使用简化渲染，颜色固定）
        const previewLine = new LineEnt([0, 0], [80, 0]);
        const previewCircle = new CircleEnt([40, 30], 20);
        const previewArc = new ArcEnt([60, 0], 15, 0, Math.PI / 2);
        
        preview1.addEntity(previewLine);
        preview1.addEntity(previewCircle, 0xff0000);  // 红色
        preview1.addEntity(previewArc, 0x00ffff);     // 青色
        preview1.zoomExtents();
        
        
        message.info("已创建简单预览，支持滚轮缩放、中键平移");
        message.info("中键双击可全图显示");
        
        // ========== 示例2：从文档数据加载（完整渲染） ==========
        message.info("\n--- 示例2：从文档数据加载 ---");
        
        const dialog2 = document.createElement('div');
        dialog2.style.cssText = `
            position: fixed;
            top: 320px;
            right: 20px;
            width: 300px;
            height: 250px;
            background: #2d3748;
            border: 1px solid #4a5568;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1000;
            overflow: hidden;
        `;
        
        const title2 = document.createElement('div');
        title2.style.cssText = `
            padding: 8px 12px;
            background: #1a202c;
            color: white;
            font-size: 14px;
            border-bottom: 1px solid #4a5568;
        `;
        title2.textContent = '文档数据预览 (loadDocument)';
        dialog2.appendChild(title2);
        
        const previewContainer2 = document.createElement('div');
        previewContainer2.style.cssText = 'width: 100%; height: calc(100% - 36px);';
        dialog2.appendChild(previewContainer2);
        
        document.body.appendChild(dialog2);
        
        const preview2 = new PreviewView({
            backgroundColor: 0x1e293b,
            interactive: true
        });
        previewContainer2.appendChild(preview2);
        
        // 等待组件初始化完成
        await preview2.onLoad();
        
        // 构造文档数据（与 webcad 实际格式一致）
        const dbDocument = {
            dbLayers: [
                { layerId: "0", name: "0", color: 7, layerOn: true, lineType: "Continuous" },
                { layerId: "layer-1", name: "图层1", color: 1, layerOn: true, lineType: "Continuous" },
                { layerId: "layer-2", name: "图层2", color: 3, layerOn: true, lineType: "Continuous" }
            ],
            dbBlocks: {
                "*Model": {
                    name: "*Model",
                    blockId: "*Model",
                    isLayout: false,
                    lookPt: [50, 40],
                    twistAngle: 0,
                    zoom: 1,
                    UCSXANG: 0,
                    UCSORG: [0, 0],
                    items: [
                        { type: "LINE", id: 1, startPoint: [0, 0], endPoint: [100, 0], color: 256, layerId: "layer-1", lineType: "ByLayer", lineTypeScale: 1, alpha: 1 },
                        { type: "LINE", id: 2, startPoint: [100, 0], endPoint: [100, 80], color: 256, layerId: "layer-1", lineType: "ByLayer", lineTypeScale: 1, alpha: 1 },
                        { type: "LINE", id: 3, startPoint: [100, 80], endPoint: [0, 80], color: 256, layerId: "layer-1", lineType: "ByLayer", lineTypeScale: 1, alpha: 1 },
                        { type: "LINE", id: 4, startPoint: [0, 80], endPoint: [0, 0], color: 256, layerId: "layer-1", lineType: "ByLayer", lineTypeScale: 1, alpha: 1 },
                        { type: "CIRCLE", id: 5, center: [50, 40], radius: 25, color: 256, layerId: "layer-2", lineType: "ByLayer", lineTypeScale: 1, alpha: 1 },
                        { type: "LINE", id: 6, startPoint: [0, 0], endPoint: [100, 80], color: 5, layerId: "0", lineType: "ByLayer", lineTypeScale: 1, alpha: 1 },
                        { type: "LINE", id: 7, startPoint: [100, 0], endPoint: [0, 80], color: 5, layerId: "0", lineType: "ByLayer", lineTypeScale: 1, alpha: 1 }
                    ]
                }
            },
            dbTextStyles: [],
            dbLayouts: [
                { layoutId: 0, name: "Model", spaceName: "*Model" }
            ]
        };
        
        // 从文档数据加载（支持完整渲染：图层颜色、线型、填充等）
        await preview2.loadDocument(dbDocument);
        
        message.info("已加载文档数据，使用完整 EntityRenderer 渲染");
        message.info("支持图层颜色、线型、填充、文本等");
        
        // ========== 示例3：API 说明 ==========
        message.info("\n=== PreviewView API ===");
        message.info("构造函数: new PreviewView(config?)");
        message.info("  - backgroundColor: 背景色，默认 0x1a242e");
        message.info("  - interactive: 是否启用交互，默认 true");
        message.info("  - defaultColor: 默认绘制颜色，默认白色");
        message.info("");
        message.info("方法:");
        message.info("  addEntity(entity, color?) - 添加单个实体（简化渲染）");
        message.info("  addEntities(entities, color?) - 批量添加实体");
        message.info("  loadDocument(dbDocument, blockName?) - 从文档数据加载（完整渲染）");
        message.info("  clear() - 清空所有实体");
        message.info("  zoomExtents() - 全图显示");
        message.info("  setView(center, zoom) - 设置视图中心和缩放");
        message.info("");
        message.info("属性:");
        message.info("  zoom - 当前缩放比例");
        message.info("  viewCenter - 当前视图中心");
        message.info("  document - 已加载的文档（loadDocument后可用）");
        
        message.info("\n交互:");
        message.info("  滚轮 - 缩放");
        message.info("  中键拖动 - 平移");
        message.info("  中键双击 - 全图显示");
        
        // 10秒后关闭对话框
        setTimeout(() => {
            dialog1.remove();
            dialog2.remove();
            message.info("\n预览对话框已关闭");
        }, 30000);
        
        message.info("\n对话框将在30秒后自动关闭");
        
    } catch (e) {
        console.error(e);
        if (typeof vjcad !== 'undefined' && vjcad.message) {
            vjcad.message.error({
                content: "catch error: " + (e.message || e.response || JSON.stringify(e).substr(0, 80)),
                duration: 60,
                key: "err"
            });
        }
    }
};
