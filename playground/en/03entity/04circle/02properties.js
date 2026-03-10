window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --圆属性--获取圆半径、面积、周长
        const { MainView, initCadContainer, CircleEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建圆（支持 [x, y] 数组形式）
        const circle = new CircleEnt([50, 50], 30);
        circle.setDefaults();
        Engine.addEntities(circle);
        
        // 获取圆属性
        message.info("=== 圆属性 ===");
        message.info("圆心:", circle.center.x, circle.center.y);
        message.info("半径:", circle.radius);
        message.info("直径:", circle.radius * 2);
        message.info("面积:", circle.area);
        message.info("周长:", circle.circumference);
        
        // 获取边界框
        const bbox = circle.boundingBox();
        message.info("边界框 最小点:", bbox.pt1);
        message.info("边界框 最大点:", bbox.pt2);
        
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
