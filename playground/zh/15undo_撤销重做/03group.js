window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --撤销组--start_undoMark和end_undoMark用法
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
        
        message.info("=== 撤销组（合并多个操作为一个撤销步骤）===");
        
        // 不使用撤销组：每个操作单独撤销
        message.info("\n不使用撤销组时，每个操作需要单独撤销");
        
        // 使用撤销组：多个操作合并为一个撤销步骤
        function createShapeWithUndoGroup() {
            // 开始撤销组
            undoMgr.start_undoMark();
            
            try {
                // 创建一个由多个实体组成的图形（使用简化写法）
                const line1 = new LineEnt([0, 0], [40, 0]);
                line1.setDefaults();
                line1.color = 1;
                Engine.addEntities(line1);
                
                const line2 = new LineEnt([40, 0], [40, 40]);
                line2.setDefaults();
                line2.color = 1;
                Engine.addEntities(line2);
                
                const line3 = new LineEnt([40, 40], [0, 40]);
                line3.setDefaults();
                line3.color = 1;
                Engine.addEntities(line3);
                
                const line4 = new LineEnt([0, 40], [0, 0]);
                line4.setDefaults();
                line4.color = 1;
                Engine.addEntities(line4);
                
                const circle = new CircleEnt([20, 20], 10);
                circle.setDefaults();
                circle.color = 3;
                Engine.addEntities(circle);
                
                // 记录所有实体的添加
                undoMgr.added_undoMark([line1, line2, line3, line4, circle]);
                
                message.info("创建了一个组合图形（4条边+1个圆）");
                
            } finally {
                // 结束撤销组
                undoMgr.end_undoMark();
            }
        }
        
        // 创建组合图形
        createShapeWithUndoGroup();
        Engine.zoomExtents();
        
        // 创建第二个组合图形（使用简化写法）
        setTimeout(() => {
            undoMgr.start_undoMark();
            try {
                const c1 = new CircleEnt([80, 20], 15);
                c1.setDefaults();
                c1.color = 5;
                Engine.addEntities(c1);
                
                const c2 = new CircleEnt([80, 20], 25);
                c2.setDefaults();
                c2.color = 4;
                Engine.addEntities(c2);
                
                undoMgr.added_undoMark([c1, c2]);
                message.info("创建了第二个组合图形（2个同心圆）");
            } finally {
                undoMgr.end_undoMark();
            }
        }, 1000);
        
        // 演示撤销
        setTimeout(() => {
            message.info("\n3秒后撤销（会一次性撤销整个组合图形）...");
            undoMgr.undo();
            Engine.redraw();
            message.info("当前实体数:", Engine.getEntities().length);
        }, 3000);
        
        setTimeout(() => {
            message.info("\n5秒后再次撤销...");
            undoMgr.undo();
            Engine.redraw();
            message.info("当前实体数:", Engine.getEntities().length);
        }, 5000);
        
        setTimeout(() => {
            message.info("\n7秒后重做...");
            undoMgr.redo();
            Engine.redraw();
            message.info("当前实体数:", Engine.getEntities().length);
        }, 7000);
        
        message.info("\nstart_undoMark() 和 end_undoMark() 将多个操作合并为一个撤销步骤");
        message.info("命令开发中通常在 main() 方法开头和结尾使用");
        
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
