window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --瓦片透明度--TILEALPHA设置瓦片图层透明度
        const { MainView, initCadContainer, Engine, DrawingManagerService, GeoBounds, Point2D, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 瓦片透明度设置示例 ===");
        message.info("TILEALPHA 命令设置 WMS 瓦片图层的透明度");
        
        message.info("");
        message.info("透明度范围：");
        message.info("  - 0: 完全透明");
        message.info("  - 50: 半透明");
        message.info("  - 100: 完全不透明(默认)");
        
        message.info("");
        message.info("使用场景：");
        message.info("  - 对比编辑区域与底图的差异");
        message.info("  - 降低底图干扰，专注编辑区域");
        message.info("  - 检查编辑内容与原图的对齐");
        
        // API 方式：先瓦片打开图纸，再设置透明度
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
        
        // 2. 获取当前透明度
        const currentAlpha = pcanvas.getWmsTileAlpha();
        message.info(`当前透明度: ${Math.round(currentAlpha * 100)}%`);
        
        // 3. 设置透明度为 50%
        pcanvas.setWmsTileAlpha(0.5);
        pcanvas.redraw();
        
        message.info('透明度已设置为 50%');
        
        // 命令方式
        /*
        setTimeout(async () => {
            const pcanvas = Engine.pcanvas;
            if (pcanvas && pcanvas.wmsTileLayer) {
                message.info("");
                message.info("检测到瓦片模式，3秒后设置透明度...");
                await Engine.editor.executerWithOp('TILEALPHA');
            } else {
                message.info("");
                message.info("当前不在瓦片模式，请先以瓦片方式打开图纸");
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
