window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --命令事件--CommandStarted和CommandEnded事件
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
        
        // 监听命令开始前事件（可取消）
        Engine.eventManager.on(CadEvents.CommandStarting, (args) => {
            message.info("=== 命令即将开始 ===");
            message.info("命令名:", args.commandName);
            
            // 可以取消命令执行
            // if (args.commandName === 'SOMECMD') {
            //     args.cancel = true;
            //     message.info("命令已取消");
            // }
        });
        
        // 监听命令开始后事件
        Engine.eventManager.on(CadEvents.CommandStarted, (args) => {
            message.info("=== 命令已开始 ===");
            message.info("命令名:", args.commandName);
        });
        
        // 监听命令结束事件
        Engine.eventManager.on(CadEvents.CommandEnded, (args) => {
            message.info("=== 命令已结束 ===");
            message.info("命令名:", args.commandName);
        });
        
        // 监听命令取消事件
        Engine.eventManager.on(CadEvents.CommandCancelled, (args) => {
            message.info("=== 命令已取消 ===");
            message.info("命令名:", args.commandName);
        });
        
        message.info("命令事件监听器已注册\n");
        
        // 创建一些实体（使用简化写法）
        const line = new LineEnt([0, 0], [100, 100]);
        line.setDefaults();
        Engine.addEntities(line);
        
        Engine.zoomExtents();
        
        message.info("在命令行输入命令测试事件，如：LINE、CIRCLE、ZOOM 等");
        message.info("按 ESC 可以测试命令取消事件");
        
        // 演示程序化执行命令
        setTimeout(async () => {
            message.info("\n3秒后执行 REGEN 命令...");
            await Engine.editor.executerWithOp('REGEN');
        }, 3000);
        
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
