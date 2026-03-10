window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --遮盖层透明度--TILEMASKALPHA设置编辑区域遮盖层透明度
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
        
        message.info("=== 遮盖层透明度设置示例 ===");
        message.info("TILEMASKALPHA 命令设置编辑区域遮盖层的透明度");
        
        message.info("");
        message.info("什么是遮盖层？");
        message.info("  - 使用 TILEEDITAREA 选择编辑区域后");
        message.info("  - 系统会在该区域添加背景色遮盖层");
        message.info("  - 遮盖层覆盖底图瓦片，显示可编辑实体");
        
        message.info("");
        message.info("透明度范围：");
        message.info("  - 0: 完全透明（可见底图）");
        message.info("  - 50: 半透明（底图和实体叠加）");
        message.info("  - 100: 完全不透明(默认，只见实体)");
        
        message.info("");
        message.info("使用场景：");
        message.info("  - 检查编辑区域边界对齐");
        message.info("  - 对比编辑前后的变化");
        message.info("  - 辅助定位和参照");
        
        // API 方式：先瓦片打开图纸，加载编辑区域，再设置遮盖层透明度
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
        
        // 2. 加载编辑区域（取图纸中心区域）
        const editArea = {
            minX: centerX - width * 0.1,
            minY: centerY - height * 0.1,
            maxX: centerX + width * 0.1,
            maxY: centerY + height * 0.1
        };
        
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
        
        // 3. 获取当前遮盖层透明度
        const currentAlpha = pcanvas.getReadOnlyAlpha();
        message.info(`当前遮盖层透明度: ${Math.round(currentAlpha * 100)}%`);
        
        // 4. 设置遮盖层透明度为 30%（可以看到底图）
        pcanvas.setReadOnlyAlpha(0.3);
        pcanvas.redraw();
        
        message.info('遮盖层透明度已设置为 30%');
        
        // 命令方式
        /*
        setTimeout(async () => {
            const pcanvas = Engine.pcanvas;
            const serverSource = Engine.currentDoc && Engine.currentDoc.serverSource;
            
            if (pcanvas && pcanvas.wmsTileLayer) {
                if (serverSource && serverSource.editAreas && serverSource.editAreas.length > 0) {
                    message.info("");
                    message.info("检测到编辑区域，3秒后设置遮盖层透明度...");
                    await Engine.editor.executerWithOp('TILEMASKALPHA');
                } else {
                    message.info("");
                    message.info("当前没有编辑区域，请先执行 TILEEDITAREA 选择区域");
                }
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
