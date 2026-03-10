window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --按类型获取--getEntitiesByType用法
        const { MainView, initCadContainer, LineEnt, CircleEnt, ArcEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建不同类型的实体（使用简化写法）
        // 直线
        for (let i = 0; i < 3; i++) {
            const line = new LineEnt([i * 30, 0], [i * 30 + 20, 20]);
            line.setDefaults();
            line.color = 1;
            Engine.addEntities(line);
        }
        
        // 圆
        for (let i = 0; i < 2; i++) {
            const circle = new CircleEnt([i * 50 + 120, 30], 15);
            circle.setDefaults();
            circle.color = 3;
            Engine.addEntities(circle);
        }
        
        // 圆弧
        const arc = new ArcEnt([50, 60], 20, 0, Math.PI);
        arc.setDefaults();
        arc.color = 5;
        Engine.addEntities(arc);
        
        Engine.zoomExtents();
        
        // 使用 getEntitiesByType 按类型获取实体
        message.info("=== 按类型获取实体 ===");
        
        // 获取所有直线
        const lines = Engine.getEntitiesByType('LINE');
        message.info("直线 (LINE):", lines.length, "个");
        
        // 获取所有圆
        const circles = Engine.getEntitiesByType('CIRCLE');
        message.info("圆 (CIRCLE):", circles.length, "个");
        
        // 获取所有圆弧
        const arcs = Engine.getEntitiesByType('ARC');
        message.info("圆弧 (ARC):", arcs.length, "个");
        
        // 获取多段线（这里没有创建，应该为0）
        const plines = Engine.getEntitiesByType('PLINE');
        message.info("多段线 (PLINE):", plines.length, "个");
        
        // 演示选择所有圆
        setTimeout(() => {
            message.info("\n3秒后选择所有圆...");
            Engine.ssSetFirst(circles);
        }, 3000);
        
        // 演示选择所有直线
        setTimeout(() => {
            message.info("\n5秒后选择所有直线...");
            Engine.ssSetFirst(lines);
        }, 5000);
        
        message.info("\n常用实体类型:");
        message.info("LINE - 直线");
        message.info("CIRCLE - 圆");
        message.info("ARC - 圆弧");
        message.info("PLINE - 多段线");
        message.info("TEXT - 单行文字");
        message.info("MTEXT - 多行文字");
        message.info("INSERT - 块引用");
        message.info("HATCH - 填充");
        
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
