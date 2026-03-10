window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --三点圆弧--initBy3Pt方法创建圆弧
        const { MainView, initCadContainer, Point2D, ArcEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 通过三点创建圆弧（initBy3Pt 方法需要 Point2D 对象）
        const p1 = new Point2D(0, 0);      // 起点
        const p2 = new Point2D(50, 30);    // 经过点
        const p3 = new Point2D(100, 0);    // 终点
        
        const arc = new ArcEnt();
        arc.initBy3Pt(p1, p2, p3);  // 三点定弧
        arc.setDefaults();
        
        Engine.addEntities(arc);
        Engine.zoomExtents();
        
        message.info("三点圆弧已创建");
        message.info("起点:", arc.startPoint);
        message.info("终点:", arc.endPoint);
        message.info("圆心:", arc.center);
        message.info("弧长:", arc.length);
        
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
