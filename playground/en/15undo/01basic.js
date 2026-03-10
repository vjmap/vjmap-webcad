window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --基本撤销--undo和redo用法
        const { MainView, initCadContainer, LineEnt, CircleEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        const undoMgr = Engine.undoManager;
        
        message.info("=== 撤销重做操作 ===");
        
        // 创建实体并记录撤销（使用简化写法）
        const line1 = new LineEnt([0, 0], [50, 30]);
        line1.setDefaults();
        line1.color = 1;
        Engine.addEntities(line1);
        message.info("创建红色直线");
        
        // 等待一下再创建下一个
        setTimeout(() => {
            const circle1 = new CircleEnt([80, 40], 20);
            circle1.setDefaults();
            circle1.color = 3;
            Engine.addEntities(circle1);
            message.info("创建绿色圆");
            Engine.zoomExtents();
        }, 500);
        
        setTimeout(() => {
            const line2 = new LineEnt([100, 0], [150, 50]);
            line2.setDefaults();
            line2.color = 5;
            Engine.addEntities(line2);
            message.info("创建蓝色直线");
        }, 1000);
        
        // 演示撤销
        setTimeout(() => {
            message.info("\n3秒后执行撤销...");
            if (undoMgr.canUndo()) {
                undoMgr.undo();
                message.info("已撤销");
            }
            message.info("当前实体数:", Engine.getEntities().length);
        }, 3000);
        
        setTimeout(() => {
            message.info("\n5秒后再次撤销...");
            if (undoMgr.canUndo()) {
                undoMgr.undo();
                message.info("已撤销");
            }
            message.info("当前实体数:", Engine.getEntities().length);
        }, 5000);
        
        // 演示重做
        setTimeout(() => {
            message.info("\n7秒后执行重做...");
            if (undoMgr.canRedo()) {
                undoMgr.redo();
                message.info("已重做");
            }
            message.info("当前实体数:", Engine.getEntities().length);
        }, 7000);
        
        setTimeout(() => {
            message.info("\n9秒后再次重做...");
            if (undoMgr.canRedo()) {
                undoMgr.redo();
                message.info("已重做");
            }
            message.info("当前实体数:", Engine.getEntities().length);
        }, 9000);
        
        message.info("\nundoManager.undo() - 撤销");
        message.info("undoManager.redo() - 重做");
        message.info("undoManager.canUndo() - 是否可撤销");
        message.info("undoManager.canRedo() - 是否可重做");
        message.info("也可以使用快捷键 Ctrl+Z 和 Ctrl+Y");
        
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
