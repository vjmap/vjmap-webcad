window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --直径标注--DiametricDimensionEnt直径标注示例
        const { MainView, initCadContainer, DiametricDimensionEnt, CircleEnt, Point2D, Engine , message } = vjcad;
        
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
        
        // 示例1：基本直径标注
        const circle1 = new CircleEnt([0, 0], 30);
        circle1.setDefaults();
        circle1.color = 7;
        entities.push(circle1);
        
        // 直径标注：通过圆周上的两个对角点定义
        const diametricDim1 = new DiametricDimensionEnt(
            new Point2D(30, 0),   // chordPoint: 圆周第一点
            new Point2D(-30, 0)   // farChordPoint: 圆周对侧点
        );
        diametricDim1.setDefaults();
        diametricDim1.color = 1;
        entities.push(diametricDim1);
        
        // 示例2：斜向直径标注
        const circle2 = new CircleEnt([100, 0], 25);
        circle2.setDefaults();
        circle2.color = 7;
        entities.push(circle2);
        
        const angle45 = 45 * Math.PI / 180;
        const diametricDim2 = new DiametricDimensionEnt(
            new Point2D(100 + 25 * Math.cos(angle45), 25 * Math.sin(angle45)),
            new Point2D(100 - 25 * Math.cos(angle45), -25 * Math.sin(angle45))
        );
        diametricDim2.setDefaults();
        diametricDim2.color = 3;
        entities.push(diametricDim2);
        
        // 示例3：使用静态方法从圆创建直径标注
        const circle3 = new CircleEnt([200, 0], 40);
        circle3.setDefaults();
        circle3.color = 7;
        entities.push(circle3);
        
        // 使用静态方法创建（圆心、半径、角度）
        const diametricDim3 = DiametricDimensionEnt.createFromCircle(
            new Point2D(200, 0),  // 圆心
            40,                    // 半径
            -30 * Math.PI / 180   // 标注线方向角度
        );
        diametricDim3.setDefaults();
        diametricDim3.color = 5;
        entities.push(diametricDim3);
        
        // 示例4：带引线延伸的直径标注
        const circle4 = new CircleEnt([0, -100], 20);
        circle4.setDefaults();
        circle4.color = 7;
        entities.push(circle4);
        
        const diametricDim4 = new DiametricDimensionEnt(
            new Point2D(20, -100),
            new Point2D(-20, -100),
            15  // leaderLength: 引线延伸长度
        );
        diametricDim4.setDefaults();
        diametricDim4.color = 4;
        entities.push(diametricDim4);
        
        // 示例5：小圆的直径标注
        const circle5 = new CircleEnt([80, -100], 10);
        circle5.setDefaults();
        circle5.color = 7;
        entities.push(circle5);
        
        const diametricDim5 = DiametricDimensionEnt.createFromCircle(
            new Point2D(80, -100),
            10,
            0
        );
        diametricDim5.setDefaults();
        diametricDim5.color = 6;
        entities.push(diametricDim5);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("直径标注已创建");
        console.log("直径标注文本自动添加⌀符号");
        console.log("支持水平、斜向、带引线等多种样式");
        
        message.info("直径标注：水平(红)、斜向(绿)、角度(蓝)、带引线(青)、小圆(紫)");
        
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
