window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --保存到本地缓存--SAVELOCAL命令与离线存储
        const { MainView, initCadContainer, Engine, LineEnt, CircleEnt, getLocalStorageService, writeMessage, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 保存到本地缓存示例 ===");
        message.info("快捷键: Ctrl+S");
        
        // 创建一些图形
        const circle = new CircleEnt([50, 50], 25);
        circle.setDefaults();
        circle.color = 1;
        Engine.addEntities(circle);
        
        const line = new LineEnt([0, 0], [100, 50]);
        line.setDefaults();
        line.color = 5;
        Engine.addEntities(line);
        
        Engine.zoomExtents();
        message.info("已创建示例图形");
        
        // 方式1：通过命令行执行
        /*
        await Engine.editor.executerWithOp('SAVELOCAL');
        */
        
        // 方式2：通过API保存
        const localService = getLocalStorageService();
        const currentDoc = Engine.currentDoc;
        const currentJson = JSON.stringify(currentDoc.toDb());
        
        const result = await localService.saveDrawing({
            serverSource: currentDoc.serverSource,
            webcadJson: currentJson,
            serviceUrl: env.serviceUrl,
            drawingName: currentDoc.name || '未命名图纸'
        });
        
        if (result.success) {
            message.info(`保存成功! ID: ${result.id}`);
            
            // 获取缓存统计
            const stats = await localService.getStats();
            message.info(`本地缓存: ${stats.totalCount} 个图纸`);
        }
        
        message.info("");
        message.info("本地缓存保存的内容：");
        message.info("  - webcadJson: 完整的图纸数据");
        message.info("  - serverSource: 服务器来源信息");
        message.info("  - serviceUrl: 后端服务地址");
        message.info("  - drawingName: 图纸名称");
        
        message.info("");
        message.info("使用场景：");
        message.info("  - 离线编辑，稍后同步到服务器");
        message.info("  - 临时保存工作进度");
        message.info("  - 瓦片模式下保存编辑区域状态");
        
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
