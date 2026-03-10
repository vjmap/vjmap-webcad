window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --缩放实体--scale方法示例
        const { MainView, initCadContainer, Point2D, CircleEnt, LineEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 缩放基点（scale 方法需要 Point2D 对象）
        const basePoint = new Point2D(0, 0);
        
        // 创建原始圆（支持 [x, y] 数组形式）
        const circle = new CircleEnt([50, 50], 20);
        circle.setDefaults();
        circle.color = 1;  // 红色（原始）
        Engine.addEntities(circle);
        
        message.info("原始圆半径:", circle.radius);
        
        // 复制并缩放
        // scale(basePoint, scaleFactor) - 以基点为中心缩放
        
        // 缩小到 0.5 倍
        const circleSmall = circle.clone();
        circleSmall.scale(basePoint, 0.5);
        circleSmall.color = 2;
        Engine.addEntities(circleSmall);
        
        // 放大到 1.5 倍
        const circleLarge = circle.clone();
        circleLarge.scale(basePoint, 1.5);
        circleLarge.color = 3;
        Engine.addEntities(circleLarge);
        
        // 放大到 2 倍
        const circleXL = circle.clone();
        circleXL.scale(basePoint, 2);
        circleXL.color = 4;
        Engine.addEntities(circleXL);
        
        // 绘制基点标记（使用简化写法）
        const marker1 = new LineEnt([-5, 0], [5, 0]);
        const marker2 = new LineEnt([0, -5], [0, 5]);
        marker1.setDefaults();
        marker2.setDefaults();
        marker1.color = 7;
        marker2.color = 7;
        Engine.addEntities([marker1, marker2]);
        
        Engine.zoomExtents();
        
        message.info("缩小0.5倍后半径:", circleSmall.radius);
        message.info("放大1.5倍后半径:", circleLarge.radius);
        message.info("放大2倍后半径:", circleXL.radius);
        message.info("scale(basePoint, factor) - 以基点为中心按比例缩放");
        
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
