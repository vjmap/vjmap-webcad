window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --撤销标记--added_undoMark用法
        const { MainView, initCadContainer, Point2D, LineEnt, CircleEnt, Engine , message } = vjcad;
        // 注意: 此文件保留 Point2D 因为 moved_undoMark 方法需要 Point2D 对象
        
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
        
        message.info("=== 撤销标记方法 ===");
        
        // 方式1：使用 Engine.addEntities（自动记录撤销）
        message.info("方式1: Engine.addEntities 自动记录撤销");
        const line1 = new LineEnt([0, 0], [50, 30]);
        line1.setDefaults();
        Engine.addEntities(line1);  // 自动记录撤销
        
        // 方式2：手动添加实体并记录撤销
        message.info("方式2: 手动添加并记录撤销");
        const circle1 = new CircleEnt([80, 30], 20);
        circle1.setDefaults();
        Engine.addEntities(circle1);  // 只添加，不记录撤销
        undoMgr.added_undoMark([circle1]);  // 手动记录撤销
        
        // 记录删除操作的撤销
        message.info("\n=== 删除操作撤销 ===");
        const toDelete = new LineEnt([0, 50], [100, 50]);
        toDelete.setDefaults();
        toDelete.color = 1;
        Engine.addEntities(toDelete);
        
        setTimeout(() => {
            message.info("3秒后删除红线（可撤销）...");
            Engine.eraseEntities(toDelete);  // 自动记录撤销
        }, 3000);
        
        // 记录移动操作的撤销
        message.info("\n=== 移动操作撤销 ===");
        const toMove = new CircleEnt([50, 80], 15);
        toMove.setDefaults();
        toMove.color = 3;
        Engine.addEntities(toMove);
        
        setTimeout(() => {
            message.info("5秒后移动绿圆（可撤销）...");
            const fromPt = new Point2D(0, 0);
            const toPt = new Point2D(40, 0);
            toMove.move(fromPt, toPt);
            undoMgr.moved_undoMark([toMove], fromPt, toPt);
            Engine.redraw();
        }, 5000);
        
        setTimeout(() => {
            message.info("\n7秒后执行撤销...");
            undoMgr.undo();
            Engine.redraw();
        }, 7000);
        
        Engine.zoomExtents();
        
        message.info("\n常用撤销标记方法:");
        message.info("added_undoMark([entities]) - 添加实体");
        message.info("erased_undoMark([entities]) - 删除实体");
        message.info("moved_undoMark(entities, from, to) - 移动");
        message.info("rotate_undoMark(entities, base, angle) - 旋转");
        message.info("scaled_undoMark(entities, base, scale) - 缩放");
        
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
