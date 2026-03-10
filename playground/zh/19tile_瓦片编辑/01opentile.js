window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --瓦片打开--大型图纸的瓦片方式打开
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
        
        message.info("=== 瓦片方式打开图纸示例 ===");
        message.info("瓦片模式适用于超大型图纸，按需加载可视区域");
        
        message.info("");
        message.info("瓦片模式特点：");
        message.info("  - 不加载完整数据到前端");
        message.info("  - 使用 WMS 瓦片图层渲染");
        message.info("  - 按需加载编辑区域数据");
        message.info("  - 支持超大型图纸(数GB)");
        message.info("  - 初始为只读模式");
        
        message.info("");
        message.info("启用编辑的方式：");
        message.info("  - TILEEDITAREA: 选择矩形区域编辑");
        message.info("  - TILEEDITLAYER: 选择图层编辑");
        
        // API 方式瓦片打开
        const drawingManager = new DrawingManagerService();
        const service = drawingManager.getService();
        
        const mapid = env.exampleMapId;
        const version = 'v1';
        
        // 1. 获取图纸元数据
        const metadata = await service.metadata(mapid, version);
        const bounds = GeoBounds.fromString(metadata.bounds);
        
        // 2. 创建空白文档
        Engine.view.newDocument();
        Engine.currentDoc.name = `${mapid}_${version}_tile`;
        
        // 3. 配置并启用 WMS 瓦片图层
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
        
        // 4. 设置视口
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
        
        // 5. 设置为只读并保存来源信息
        Engine.currentDoc.isReadOnly = true;
        Engine.currentDoc.serverSource = {
            type: 'imports',
            mapid: mapid,
            version: version,
            branchName: 'main',
            lastPatchId: 'base'
        };
        
        message.info('瓦片模式已启用，使用 TILEEDITAREA 选择编辑区域');
        
        // 命令方式瓦片打开
        /*
        message.info("");
        message.info("操作流程：");
        message.info("  1. 执行 OPENFROMSERVER 命令");
        message.info("  2. 在图纸浏览器中选择图纸");
        message.info("  3. 点击「瓦片打开」按钮");
        message.info("  4. 使用 TILEEDITAREA 或 TILEEDITLAYER 启用编辑");
        
        setTimeout(async () => {
            message.info("");
            message.info("3秒后将打开图纸浏览器，请选择一个图纸并点击「瓦片打开」...");
            await Engine.editor.executerWithOp('OPENFROMSERVER');
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
