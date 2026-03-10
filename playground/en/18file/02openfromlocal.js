window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --从本地缓存打开--OPENFROMLOCAL命令与IndexedDB存储
        const { MainView, initCadContainer, Engine, LineEnt, getLocalStorageService, writeMessage, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 从本地缓存打开图纸示例 ===");
        message.info("本地缓存使用 IndexedDB 存储，支持离线编辑");
        
        // 先创建一些图形并保存到本地
        const line1 = new LineEnt([0, 0], [100, 0]);
        line1.setDefaults();
        line1.color = 1;
        Engine.addEntities(line1);
        
        const line2 = new LineEnt([0, 0], [0, 100]);
        line2.setDefaults();
        line2.color = 3;
        Engine.addEntities(line2);
        
        Engine.zoomExtents();
        
        message.info("已创建示例图形，先保存到本地缓存...");
        
        // 方式1：通过命令行执行
        /*
        await Engine.editor.executerWithOp('SAVELOCAL');
        message.info("图纸已保存到本地缓存");
        await Engine.editor.executerWithOp('OPENFROMLOCAL');
        */
        
        // 方式2：通过API保存并打开
        const localService = getLocalStorageService();
        
        // 保存到本地
        const currentDoc = Engine.currentDoc;
        const currentJson = JSON.stringify(currentDoc.toDb());
        const saveResult = await localService.saveDrawing({
            serverSource: currentDoc.serverSource,
            webcadJson: currentJson,
            serviceUrl: env.serviceUrl,
            drawingName: '本地测试图纸'
        });
        
        if (saveResult.success) {
            message.info(`保存成功! ID: ${saveResult.id}`);
            
            // 获取所有本地图纸列表
            const drawings = await localService.listDrawings();
            message.info(`本地缓存共 ${drawings.length} 个图纸`);
            
            // 加载刚保存的图纸
            const loadResult = await localService.loadDrawingById(saveResult.id);
            if (loadResult.success) {
                message.info("从本地缓存加载成功!");
                message.info("本地缓存特点：");
                message.info("  - 使用 IndexedDB 存储，容量大");
                message.info("  - 支持离线访问");
                message.info("  - 保存服务器来源信息，支持后续同步");
            }
            
            // 获取缓存统计
            const stats = await localService.getStats();
            message.info(`缓存统计: ${stats.totalCount} 个图纸, 共 ${stats.totalSize} 字节`);
        }
        
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
