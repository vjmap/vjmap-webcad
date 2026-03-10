window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --SVG导入API--通过API解析SVG内容并插入到当前图
        const { 
            MainView, initCadContainer, Engine, message, Point2D, 
            getWebCadCoreService, CadDocument, regen 
        } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // ==================== 通过 API 导入 SVG ====================
        
        // 示例 SVG 内容（一个简单的图形）
        const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
            <!-- 矩形 -->
            <rect x="20" y="20" width="60" height="40" fill="none" stroke="#ff0000" stroke-width="2"/>
            <!-- 圆形 -->
            <circle cx="150" cy="50" r="30" fill="none" stroke="#00ff00" stroke-width="2"/>
            <!-- 直线 -->
            <line x1="20" y1="100" x2="180" y2="100" stroke="#0000ff" stroke-width="2"/>
            <!-- 多段线 -->
            <polyline points="20,150 60,120 100,160 140,130 180,170" fill="none" stroke="#ff00ff" stroke-width="2"/>
            <!-- 路径 -->
            <path d="M 30 180 Q 100 200 170 180" fill="none" stroke="#00ffff" stroke-width="2"/>
        </svg>
        `;
        
        message.info("开始通过 API 导入 SVG...");
        
        // 1. 获取 WebCAD Core 服务
        const wasmService = getWebCadCoreService();
        await wasmService.initWasm();
        message.info("WASM 服务初始化完成");
        
        // 2. 解析 SVG 为 WebCAD 数据
        // parseSvgToWebcad 参数说明：
        // - svgContent: SVG 内容字符串
        // - whiteColorProcessing: 白色处理方式 (0=原样保留, 1=自动反色, 2=过滤排除)
        // - blackColorProcessing: 黑色处理方式 (0=原样保留, 1=自动反色, 2=过滤排除)
        // - enableFill: 是否启用填充 (0=否, 1=是)
        // - displayLineWeight: 是否显示线宽 (0=否, 1=是)
        // - lineWeightScale: 线宽缩放比例
        
        const webcadData = await wasmService.parseSvgToWebcad(
            svgContent,
            0,    // whiteColorProcessing: 原样保留
            0,    // blackColorProcessing: 原样保留
            0,    // enableFill: 不启用填充
            1,    // displayLineWeight: 显示线宽
            1.0   // lineWeightScale: 线宽缩放 1:1
        );
        
        if (!webcadData) {
            message.error("SVG 解析失败");
            throw new Error("SVG 解析失败");
        }
        
        message.info("SVG 解析成功");
        
        // 3. 解析 WebCAD 数据
        const parsedData = JSON.parse(webcadData);
        const entities = parsedData.entities || [];
        message.info("解析到实体数量: " + entities.length);
        
        if (entities.length === 0) {
            message.warn("没有解析到任何实体");
            throw new Error("没有解析到任何实体");
        }
        
        // 4. 计算边界和基点
        let basePoint = [0, 0];
        if (parsedData.bounds && parsedData.bounds.length === 4) {
            const [minX, minY, maxX, maxY] = parsedData.bounds;
            basePoint = [(minX + maxX) / 2, (minY + maxY) / 2];
            message.info(`边界: [${minX.toFixed(2)}, ${minY.toFixed(2)}, ${maxX.toFixed(2)}, ${maxY.toFixed(2)}]`);
        }
        
        // 5. 构建临时文档数据
        const docData = {
            appName: "WebCAD SVG Import",
            docVer: 0.3,
            dbBlocks: {
                "*Model": {
                    blockId: "*Model",
                    name: "*Model",
                    isLayout: false,
                    basePoint: [0, 0],
                    lookPt: [0, 0],
                    twistAngle: 0,
                    zoom: 1,
                    UCSXANG: 0,
                    UCSORG: [0, 0],
                    items: entities
                }
            },
            dbLayers: [{
                name: "0",
                layerId: "0",
                layerOn: true,
                color: 7,
                lineType: "Continuous",
                lineWeight: -3,
                plottable: true
            }],
            dbTextStyles: [],
            dbLayouts: [{
                layoutId: 0,
                name: "Model",
                spaceName: "*Model"
            }]
        };
        
        // 6. 创建临时文档
        const symbolDoc = new CadDocument();
        await symbolDoc.fromDb(docData);
        
        // 7. 合并实体到当前文档
        const insertPoint = new Point2D(0, 0);  // 插入点
        const scale = 1;                         // 缩放比例
        const rotation = 0;                      // 旋转角度（度）
        
        const modelBlock = symbolDoc.blocks.itemByName("*Model");
        const basePt = new Point2D(basePoint[0], basePoint[1]);
        const origin = new Point2D(0, 0);
        
        let addedCount = 0;
        for (const entity of modelBlock.items) {
            if (!entity.isAlive) continue;
            
            const cloned = entity.clone();
            // 移动到插入点（基于基点偏移）
            cloned.move(basePt, insertPoint);
            
            Engine.addEntities(cloned);
            addedCount++;
        }
        
        message.info(`已添加 ${addedCount} 个实体`);
        
        // 8. 刷新视图
        regen();
        Engine.zoomExtents();
        
        message.info("SVG 导入完成!");
        message.info("提示: 可以修改 svgContent 变量来导入不同的 SVG 内容");
        
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
