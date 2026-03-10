window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --瓦片图层编辑--TILEEDITLAYER选择图层编辑
        const { MainView, initCadContainer, Engine, DrawingManagerService, TileEditLayerCommand, GeoBounds, Point2D, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 瓦片图层编辑示例 ===");
        message.info("TILEEDITLAYER 命令在瓦片模式下选择图层进行编辑");
        
        message.info("");
        message.info("与区域编辑的区别：");
        message.info("  - 区域编辑: 加载指定矩形区域内的实体");
        message.info("  - 图层编辑: 加载指定图层的所有实体");
        message.info("  - 两者是「或」的关系，可以同时使用");
        
        message.info("");
        message.info("特点：");
        message.info("  - 支持多选图层");
        message.info("  - 图层范围不固定，不添加遮盖层");
        message.info("  - 实体和块定义自动合并去重");
        
        // API 方式：先瓦片打开图纸，再加载编辑图层
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
        
        // 2. 获取图层列表（返回 ILayerInfo[] 对象数组）
        const layerInfos = await TileEditLayerCommand.getLayerListFromService(mapid, version);
        const layerNames = layerInfos.map(l => l.name);
        message.info(`可用图层: ${layerNames.join(', ')}`);
        
        // 3. 加载第一个图层（'0' 图层）
        const selectedLayers = ['0'];
        
        const loadResult = await TileEditLayerCommand.loadEditLayers(
            selectedLayers,
            Engine.currentDoc.serverSource,
            pcanvas,
            Engine.currentDoc,
            drawingManager
        );
        
        if (loadResult.success) {
            Engine.currentDoc.isReadOnly = false;
            message.info(`加载完成: ${loadResult.layersCount} 个图层，共 ${loadResult.totalLoadedCount} 个实体`);
        }
        
        // 命令方式
        /*
        message.info("");
        message.info("操作步骤：");
        message.info("  1. 执行 TILEEDITLAYER 命令");
        message.info("  2. 在对话框中选择要编辑的图层");
        message.info("  3. 点击确定");
        message.info("  4. 系统加载选中图层的所有实体");
        message.info("  5. 图层内实体变为可编辑");
        
        setTimeout(async () => {
            const pcanvas = Engine.pcanvas;
            if (pcanvas && pcanvas.wmsTileLayer) {
                message.info("");
                message.info("检测到瓦片模式，3秒后打开图层选择对话框...");
                await Engine.editor.executerWithOp('TILEEDITLAYER');
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
