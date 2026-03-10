window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --实体修改事件--EntityModified事件监听
        const { MainView, initCadContainer, CircleEnt, Engine, CadEvents , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 监听实体修改事件
        Engine.eventManager.on(CadEvents.EntityModified, (args) => {
            const entity = args.entity;
            message.info("=== 实体已修改 ===");
            message.info("实体类型:", entity.type);
            message.info("实体ID:", entity.id);
            message.info("当前颜色:", entity.color);
        });
        
        message.info("事件监听器已注册\n");
        
        // 创建实体（使用简化写法）
        const circle = new CircleEnt([50, 50], 30);
        circle.setDefaults();
        Engine.addEntities(circle);
        
        message.info("初始状态 - 颜色:", circle.color, "半径:", circle.radius);
        
        // 修改实体属性
        setTimeout(() => {
            message.info("\n2秒后修改颜色...");
            circle.color = 1;  // 修改颜色会触发事件
            Engine.regen();
        }, 2000);
        
        setTimeout(() => {
            message.info("\n4秒后修改半径...");
            circle.radius = 40;
            Engine.regen();
        }, 4000);
        
        setTimeout(() => {
            message.info("\n6秒后移动实体...");
            circle.move([0, 0], [30, 20]);
            Engine.regen();
        }, 6000);
        
        Engine.zoomExtents();
        
        
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
