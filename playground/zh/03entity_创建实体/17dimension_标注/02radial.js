window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --半径标注--RadialDimensionEnt创建示例
        const { MainView, initCadContainer, RadialDimensionEnt, CircleEnt, ArcEnt, Point2D, Engine , message } = vjcad;
        
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
        
        // 创建圆
        const circle = new CircleEnt([50, 50], 40);
        circle.setDefaults();
        circle.color = 7;
        entities.push(circle);
        
        // 创建半径标注（从圆心到圆周）
        const radialDim = new RadialDimensionEnt(
            new Point2D(50, 50),    // center: 圆心
            new Point2D(90, 50),    // chordPoint: 圆周点（圆心+半径方向）
            10                       // leaderLength: 引线延伸长度
        );
        radialDim.setDefaults();
        radialDim.color = 1;
        entities.push(radialDim);
        
        // 创建另一个角度的半径标注
        const angle = Math.PI / 4; // 45度
        const radialDim2 = new RadialDimensionEnt(
            new Point2D(50, 50),
            new Point2D(
                50 + Math.cos(angle) * 40,
                50 + Math.sin(angle) * 40
            ),
            15
        );
        radialDim2.setDefaults();
        radialDim2.color = 3;
        entities.push(radialDim2);
        
        // 创建圆弧和对应的半径标注
        const arc = new ArcEnt();
        arc.center = new Point2D(150, 50);
        arc.radius = 35;
        arc.startAngle = Math.PI / 6;
        arc.endAngle = Math.PI * 2 / 3;
        arc.setDefaults();
        arc.color = 7;
        entities.push(arc);
        
        // 圆弧的半径标注
        const arcAngle = (arc.startAngle + arc.endAngle) / 2;
        const arcRadialDim = new RadialDimensionEnt(
            new Point2D(150, 50),
            new Point2D(
                150 + Math.cos(arcAngle) * 35,
                50 + Math.sin(arcAngle) * 35
            ),
            12
        );
        arcRadialDim.setDefaults();
        arcRadialDim.color = 5;
        entities.push(arcRadialDim);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("半径标注已创建");
        console.log("圆的半径:", circle.radius);
        console.log("半径标注测量值:", radialDim.getMeasurement());
        console.log("圆弧半径:", arc.radius);
        
        message.info("半径标注：圆(红/绿)和圆弧(蓝)");
        
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
