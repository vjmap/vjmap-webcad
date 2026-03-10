window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --椭圆弧--创建部分椭圆（椭圆弧）
        const { MainView, initCadContainer, EllipseEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        const entities = [];
        
        // 完整椭圆（参考）
        const fullEllipse = new EllipseEnt([50, 80], 40, 20, 0);
        fullEllipse.setDefaults();
        fullEllipse.color = 8; // 灰色参考
        entities.push(fullEllipse);
        
        // 椭圆弧（上半部分）
        const ellipseArc1 = new EllipseEnt([50, 80], 40, 20, 0);
        ellipseArc1.startAngle = 0;
        ellipseArc1.endAngle = Math.PI;  // 180度
        ellipseArc1.setDefaults();
        ellipseArc1.color = 1; // 红色
        entities.push(ellipseArc1);
        
        // 椭圆弧（四分之一）
        const ellipseArc2 = new EllipseEnt([150, 80], 40, 20, 0);
        ellipseArc2.startAngle = 0;
        ellipseArc2.endAngle = Math.PI / 2;  // 90度
        ellipseArc2.setDefaults();
        ellipseArc2.color = 3; // 绿色
        entities.push(ellipseArc2);
        
        // 旋转的椭圆弧
        const ellipseArc3 = new EllipseEnt([250, 80], 40, 20, Math.PI / 6); // 旋转30度
        ellipseArc3.startAngle = Math.PI / 4;
        ellipseArc3.endAngle = Math.PI * 5 / 4;  // 从45度到225度
        ellipseArc3.setDefaults();
        ellipseArc3.color = 5; // 蓝色
        entities.push(ellipseArc3);
        
        // 不同比例的椭圆弧
        const ellipseArc4 = new EllipseEnt([50, 0], 50, 15, 0);
        ellipseArc4.startAngle = -Math.PI / 3;
        ellipseArc4.endAngle = Math.PI / 3;
        ellipseArc4.setDefaults();
        ellipseArc4.color = 4; // 青色
        entities.push(ellipseArc4);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("椭圆弧已创建");
        console.log("椭圆弧1 - 起始角:", ellipseArc1.startAngle, "终止角:", ellipseArc1.endAngle);
        console.log("椭圆弧2 - 四分之一椭圆");
        console.log("椭圆弧3 - 旋转30度的椭圆弧");
        console.log("椭圆弧4 - 扁平椭圆弧");
        
        message.info("椭圆弧：设置startAngle和endAngle");
        
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
