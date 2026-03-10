window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --按条件过滤--getEntities过滤用法
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
        
        // 创建不同属性的实体（使用简化写法）
        // 图层1 - 红色直线
        Engine.createLayer("图层A", { color: 1 });
        for (let i = 0; i < 3; i++) {
            const line = new LineEnt([i * 30, 0], [i * 30 + 20, 30]);
            line.setDefaults();
            line.layer = "图层A";
            line.color = 1;
            Engine.addEntities(line);
        }
        
        // 图层2 - 绿色圆
        Engine.createLayer("图层B", { color: 3 });
        for (let i = 0; i < 2; i++) {
            const circle = new CircleEnt([i * 50 + 100, 40], 15);
            circle.setDefaults();
            circle.layer = "图层B";
            circle.color = 3;
            Engine.addEntities(circle);
        }
        
        // 默认图层 - 蓝色直线
        for (let i = 0; i < 2; i++) {
            const line = new LineEnt([i * 40, 60], [i * 40 + 30, 90]);
            line.setDefaults();
            line.color = 5;
            Engine.addEntities(line);
        }
        
        Engine.zoomExtents();
        
        // 使用 getEntities 带过滤函数获取实体
        message.info("=== 使用过滤函数获取实体 ===");
        
        // 获取所有实体
        const all = Engine.getEntities();
        message.info("所有实体:", all.length, "个");
        
        // 按颜色过滤
        const redEntities = Engine.getEntities(ent => ent.color === 1);
        message.info("红色实体:", redEntities.length, "个");
        
        const greenEntities = Engine.getEntities(ent => ent.color === 3);
        message.info("绿色实体:", greenEntities.length, "个");
        
        // 按图层过滤
        const layerAEntities = Engine.getEntities(ent => ent.layer === "图层A");
        message.info("图层A实体:", layerAEntities.length, "个");
        
        const layerBEntities = Engine.getEntities(ent => ent.layer === "图层B");
        message.info("图层B实体:", layerBEntities.length, "个");
        
        // 组合条件过滤
        const redLines = Engine.getEntities(ent => ent.type === "LINE" && ent.color === 1);
        message.info("红色直线:", redLines.length, "个");
        
        // 自定义复杂过滤
        const largeCircles = Engine.getEntities(ent => {
            return ent.type === "CIRCLE" && ent.radius > 10;
        });
        message.info("半径>10的圆:", largeCircles.length, "个");
        
        // 演示选择过滤结果
        setTimeout(() => {
            message.info("\n3秒后选择图层A的实体...");
            Engine.ssSetFirst(layerAEntities);
        }, 3000);
        
        setTimeout(() => {
            message.info("\n5秒后选择绿色实体...");
            Engine.ssSetFirst(greenEntities);
        }, 5000);
        
        message.info("\ngetEntities(filter) 支持传入过滤函数");
        
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
