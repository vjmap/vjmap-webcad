window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --文档事件--DocumentOpened和DocumentSaved事件
        const { MainView, initCadContainer, LineEnt, Engine, CadEvents , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 监听文档创建事件
        Engine.eventManager.on(CadEvents.DocumentCreating, (args) => {
            message.info("=== 即将创建文档 ===");
        });
        
        Engine.eventManager.on(CadEvents.DocumentCreated, (args) => {
            message.info("=== 文档已创建 ===");
            message.info("文档名:", args.document.name);
        });
        
        // 监听文档打开事件
        Engine.eventManager.on(CadEvents.DocumentOpening, (args) => {
            message.info("=== 即将打开文档 ===");
        });
        
        Engine.eventManager.on(CadEvents.DocumentOpened, (args) => {
            message.info("=== 文档已打开 ===");
            message.info("文档名:", args.document.name);
        });
        
        // 监听文档保存事件
        Engine.eventManager.on(CadEvents.DocumentSaving, (args) => {
            message.info("=== 即将保存文档 ===");
            // 可以在保存前进行验证
            // if (!validateDocument()) {
            //     args.cancel = true;
            //     message.info("文档验证失败，取消保存");
            // }
        });
        
        Engine.eventManager.on(CadEvents.DocumentSaved, (args) => {
            message.info("=== 文档已保存 ===");
            message.info("文档名:", args.document.name);
        });
        
        // 监听文档关闭事件
        Engine.eventManager.on(CadEvents.DocumentClosing, (args) => {
            message.info("=== 即将关闭文档 ===");
        });
        
        Engine.eventManager.on(CadEvents.DocumentClosed, (args) => {
            message.info("=== 文档已关闭 ===");
        });
        
        // 监听文档修改事件
        Engine.eventManager.on(CadEvents.DocumentModified, (args) => {
            message.info("=== 文档已修改 ===");
        });
        
        message.info("文档事件监听器已注册\n");
        
        // 创建示例内容（使用简化写法）
        const line = new LineEnt([0, 0], [100, 100]);
        line.setDefaults();
        Engine.addEntities(line);
        
        Engine.zoomExtents();
        
        message.info("=== 文档事件类型 ===");
        message.info("DocumentCreating/Created - 新建文档");
        message.info("DocumentOpening/Opened - 打开文档");
        message.info("DocumentSaving/Saved - 保存文档");
        message.info("DocumentClosing/Closed - 关闭文档");
        message.info("DocumentModified - 文档修改");
        message.info("\n以 -ing 结尾的事件可以通过 args.cancel = true 取消");
        
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
