window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --瓦片区域编辑--TILEEDITAREA选择矩形区域编辑
        const { MainView, initCadContainer, Engine, DrawingManagerService, TileEditAreaCommand, GeoBounds, Point2D, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 瓦片区域编辑示例 ===");
        message.info("TILEEDITAREA 命令在瓦片模式下选择矩形区域进行编辑");
        
        message.info("");
        message.info("特点：");
        message.info("  - 支持多次选择不同区域（累积模式）");
        message.info("  - 与编辑图层是「或」的关系");
        message.info("  - 实体和块定义自动合并去重");
        message.info("  - 保存时只保存编辑区域的变更");
        
        // API 方式：先瓦片打开图纸，再加载编辑区域
        const drawingManager = new DrawingManagerService();
        const service = drawingManager.getService();
        
        const mapid = env.exampleMapId;
        const version = 'v1';
        
        // 1. 获取图纸元数据并瓦片打开
        const metadata = await service.metadata(mapid, version);
        const bounds = GeoBounds.fromString(metadata.bounds);
        
        Engine.view.newDocument();
        Engine.currentDoc.name = `${mapid}_${version}_tile`;
        
        const pcanvas = Engine.pcanvas;
        const tileConfig = {
            mapid: mapid,
            version: version,
            layers: metadata.styles && metadata.styles[0] && metadata.styles[0].layername,
            tileSize: 256,
            maxZoom: 20,
            minZoom: 0,
            transparent: true,
            preloadBuffer: 1,
            maxConcurrent: 6,
            cacheSize: 200
        };
        
        pcanvas.enableWmsTileLayer(service, tileConfig);
        
        const centerX = (bounds.min.x + bounds.max.x) / 2;
        const centerY = (bounds.min.y + bounds.max.y) / 2;
        const width = bounds.max.x - bounds.min.x;
        const height = bounds.max.y - bounds.min.y;
        const zoom = Math.min(
            pcanvas.div.clientWidth / width,
            pcanvas.div.clientHeight / height
        ) * 0.9;
        
        Engine.currentSpace.setZoom(zoom);
        Engine.currentSpace.lookPt = new Point2D(centerX * zoom, centerY * zoom);
        pcanvas.setCenter(new Point2D(centerX, centerY), true);
        
        Engine.currentDoc.isReadOnly = true;
        Engine.currentDoc.serverSource = {
            type: 'imports',
            mapid: mapid,
            version: version,
            branchName: 'main',
            lastPatchId: 'base'
        };
        
        message.info('瓦片模式已启用');
        
        // 2. 定义编辑区域（取图纸中心区域作为示例）
        const editArea = {
            minX: centerX - width * 0.1,
            minY: centerY - height * 0.1,
            maxX: centerX + width * 0.1,
            maxY: centerY + height * 0.1
        };
        
        // 3. 加载编辑区域
        const loadResult = await TileEditAreaCommand.loadEditArea(
            editArea,
            Engine.currentDoc.serverSource,
            pcanvas,
            Engine.currentDoc,
            drawingManager
        );
        
        if (loadResult.success) {
            Engine.currentDoc.isReadOnly = false;
            message.info(`加载完成: ${loadResult.loadedCount} 个可编辑实体`);
        }
        
        // 命令方式
        /*
        message.info("");
        message.info("操作步骤：");
        message.info("  1. 执行 TILEEDITAREA 命令");
        message.info("  2. 指定编辑区域的第一个角点");
        message.info("  3. 指定编辑区域的对角点");
        message.info("  4. 系统加载区域内的实体数据");
        message.info("  5. 添加遮盖层覆盖瓦片内容");
        message.info("  6. 区域内实体变为可编辑");
        
        setTimeout(async () => {
            const pcanvas = Engine.pcanvas;
            if (pcanvas && pcanvas.wmsTileLayer) {
                message.info("");
                message.info("检测到瓦片模式，3秒后执行区域编辑...");
                await Engine.editor.executerWithOp('TILEEDITAREA');
            } else {
                message.info("");
                message.info("当前不在瓦片模式，请先以瓦片方式打开图纸");
                message.info("执行 OPENFROMSERVER 并选择「瓦片打开」");
            }
        }, 3000);
        */
        
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
