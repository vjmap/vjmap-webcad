window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --删除实体--Engine.eraseEntities用法
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
        
        // 创建多个实体（支持 [x, y] 数组形式）
        const line1 = new LineEnt([0, 0], [100, 0]);
        line1.setDefaults();
        line1.color = 1;
        Engine.addEntities(line1);
        
        const line2 = new LineEnt([0, 20], [100, 20]);
        line2.setDefaults();
        line2.color = 2;
        Engine.addEntities(line2);
        
        const line3 = new LineEnt([0, 40], [100, 40]);
        line3.setDefaults();
        line3.color = 3;
        Engine.addEntities(line3);
        
        const circle = new CircleEnt([50, 80], 20);
        circle.setDefaults();
        circle.color = 4;
        Engine.addEntities(circle);
        
        message.info("创建了 4 个实体");
        message.info("line1 isAlive:", line1.isAlive);
        
        // 删除单个实体
        Engine.eraseEntities(line1);
        message.info("删除 line1 后 isAlive:", line1.isAlive);
        
        // 删除多个实体
        Engine.eraseEntities([line2, circle]);
        message.info("删除 line2 和 circle");
        
        // 检查剩余实体
        const remainingEntities = Engine.getEntities();
        message.info("剩余实体数:", remainingEntities.length);
        
        Engine.zoomExtents();
        
        message.info("Engine.eraseEntities(entity) - 删除单个实体");
        message.info("Engine.eraseEntities([e1, e2]) - 删除多个实体");
        message.info("删除后实体的 isAlive 属性变为 false");
        
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
