window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --Viewer查看模式--只显示绘图区域,隐藏菜单工具栏命令行
        const { MainView, initCadContainer, LineEnt, CircleEnt, ArcEnt, Engine, CadEventManager, CadEvents, message } = vjcad;
        
        message.info("=== Viewer 查看模式 ===");
        message.info("只显示绘图区域，隐藏菜单、工具栏、命令行等");
        message.info("适用于只需要查看和选择实体的场景");
        
        // 使用 viewMode: "viewer" 创建只显示绘图区域的视图
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            
            // 设置 viewer 模式，只显示绘图区域
            viewMode: "viewer",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建示例实体
        const line1 = new LineEnt([0, 0], [100, 0]);
        line1.setDefaults();
        line1.color = 1;
        
        const line2 = new LineEnt([100, 0], [100, 80]);
        line2.setDefaults();
        line2.color = 2;
        
        const circle = new CircleEnt([50, 40], 30);
        circle.setDefaults();
        circle.color = 3;
        
        const arc = new ArcEnt([50, 40], 50, 0, Math.PI / 2);
        arc.setDefaults();
        arc.color = 4;
        
        Engine.addEntities([line1, line2, circle, arc]);
        Engine.zoomExtents();
        
        // 监听选择变化事件，获取选中实体信息
        const events = CadEventManager.getInstance();
        events.on(CadEvents.SelectionChanged, (args) => {
            const entities = args.currentSelection;
            
            if (entities.length === 0) {
                message.info("选择已清空");
                return;
            }
            
            message.info(`选中 ${entities.length} 个实体:`);
            entities.forEach((ent, index) => {
                message.info(`  [${index + 1}] 类型: ${ent.entityType}, 句柄: ${ent.handle}, 颜色: ${ent.color}`);
            });
        });
        
        message.info("\n=== 使用说明 ===");
        message.info("1. 点击实体可选中");
        message.info("2. 框选可多选实体");
        message.info("3. 选择事件会输出实体信息");
        message.info("4. 可通过 Engine.getSelectedEntities() 获取选中实体");
        
        message.info("\n=== 配置示例 ===");
        message.info("viewMode: 'viewer' - 只显示绘图区域");
        message.info("或使用细粒度控制:");
        message.info("  showMenuBar: false");
        message.info("  showToolBar: false");
        message.info("  showDocBar: false");
        message.info("  showCoordsBar: false");
        message.info("  showCommandLine: false");
        message.info("  sidebarStyle: 'none'");
        
        // 演示获取选中实体的 API
        setTimeout(() => {
            message.info("\n=== API 示例 ===");
            message.info("Engine.getSelectedEntities() - 获取当前选中实体");
            message.info("CadEventManager.on(CadEvents.SelectionChanged, callback) - 监听选择变化");
        }, 1000);
        
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
