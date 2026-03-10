window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --角度标注--AngleDimensionEnt角度标注示例
        const { MainView, initCadContainer, AngleDimensionEnt, LineEnt, Point2D, Engine , message } = vjcad;
        
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
        
        // 示例1：90度角标注
        const line1a = new LineEnt([0, 0], [50, 0]);
        line1a.setDefaults();
        line1a.color = 7;
        entities.push(line1a);
        
        const line1b = new LineEnt([0, 0], [0, 50]);
        line1b.setDefaults();
        line1b.color = 7;
        entities.push(line1b);
        
        // 创建角度标注：顶点、起始边点、结束边点
        const angleDim1 = new AngleDimensionEnt(
            new Point2D(0, 0),    // vertex: 角度顶点
            new Point2D(50, 0),   // startPoint: 起始边上的点
            new Point2D(0, 50),   // endPoint: 结束边上的点
            20                     // arcRadius: 标注弧半径
        );
        angleDim1.setDefaults();
        angleDim1.color = 1;
        entities.push(angleDim1);
        
        // 示例2：60度角标注
        const line2a = new LineEnt([80, 0], [130, 0]);
        line2a.setDefaults();
        line2a.color = 7;
        entities.push(line2a);
        
        const angle60 = 60 * Math.PI / 180;
        const line2b = new LineEnt([80, 0], [80 + 50 * Math.cos(angle60), 50 * Math.sin(angle60)]);
        line2b.setDefaults();
        line2b.color = 7;
        entities.push(line2b);
        
        const angleDim2 = new AngleDimensionEnt(
            new Point2D(80, 0),
            new Point2D(130, 0),
            new Point2D(80 + 50 * Math.cos(angle60), 50 * Math.sin(angle60)),
            25
        );
        angleDim2.setDefaults();
        angleDim2.color = 3;
        entities.push(angleDim2);
        
        // 示例3：锐角标注（30度）
        const line3a = new LineEnt([0, -60], [60, -60]);
        line3a.setDefaults();
        line3a.color = 7;
        entities.push(line3a);
        
        const angle30 = 30 * Math.PI / 180;
        const line3b = new LineEnt([0, -60], [60 * Math.cos(angle30), -60 + 60 * Math.sin(angle30)]);
        line3b.setDefaults();
        line3b.color = 7;
        entities.push(line3b);
        
        const angleDim3 = new AngleDimensionEnt(
            new Point2D(0, -60),
            new Point2D(60, -60),
            new Point2D(60 * Math.cos(angle30), -60 + 60 * Math.sin(angle30)),
            30
        );
        angleDim3.setDefaults();
        angleDim3.color = 5;
        entities.push(angleDim3);
        
        // 示例4：钝角标注（120度）
        const line4a = new LineEnt([100, -60], [150, -60]);
        line4a.setDefaults();
        line4a.color = 7;
        entities.push(line4a);
        
        const angle120 = 120 * Math.PI / 180;
        const line4b = new LineEnt([100, -60], [100 + 50 * Math.cos(angle120), -60 + 50 * Math.sin(angle120)]);
        line4b.setDefaults();
        line4b.color = 7;
        entities.push(line4b);
        
        const angleDim4 = new AngleDimensionEnt(
            new Point2D(100, -60),
            new Point2D(150, -60),
            new Point2D(100 + 50 * Math.cos(angle120), -60 + 50 * Math.sin(angle120)),
            20
        );
        angleDim4.setDefaults();
        angleDim4.color = 4;
        entities.push(angleDim4);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("角度标注已创建");
        console.log("90度角(红)、60度角(绿)、30度角(蓝)、120度角(青)");
        
        message.info("角度标注：90°(红)、60°(绿)、30°(蓝)、120°(青)");
        
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
