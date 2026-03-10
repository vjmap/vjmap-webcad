window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --坐标标注--OrdinateDimensionEnt坐标标注示例
        const { MainView, initCadContainer, OrdinateDimensionEnt, LineEnt, CircleEnt, Point2D, Engine , message } = vjcad;
        
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
        
        // 创建参考原点标记
        const originCircle = new CircleEnt([0, 0], 2);
        originCircle.setDefaults();
        originCircle.color = 1;
        entities.push(originCircle);
        
        const originX = new LineEnt([-5, 0], [5, 0]);
        originX.setDefaults();
        originX.color = 1;
        entities.push(originX);
        
        const originY = new LineEnt([0, -5], [0, 5]);
        originY.setDefaults();
        originY.color = 1;
        entities.push(originY);
        
        // 示例1：X,Y坐标标注（默认模式）
        const point1 = new Point2D(50, 30);
        const pointMark1 = new CircleEnt([point1.x, point1.y], 1);
        pointMark1.setDefaults();
        pointMark1.color = 7;
        entities.push(pointMark1);
        
        const ordDim1 = new OrdinateDimensionEnt(
            new Point2D(0, 0),      // origin: 原点
            point1,                  // definingPoint: 被标注点
            new Point2D(50, 50),    // leaderEndPoint: 引线终点
            'xy'                     // displayMode: X,Y坐标模式
        );
        ordDim1.setDefaults();
        ordDim1.color = 3;
        entities.push(ordDim1);
        
        // 示例2：仅X坐标标注
        const point2 = new Point2D(80, 20);
        const pointMark2 = new CircleEnt([point2.x, point2.y], 1);
        pointMark2.setDefaults();
        pointMark2.color = 7;
        entities.push(pointMark2);
        
        const ordDim2 = new OrdinateDimensionEnt(
            new Point2D(0, 0),
            point2,
            new Point2D(80, 45),    // 垂直引出
            'x'                      // 仅X坐标
        );
        ordDim2.setDefaults();
        ordDim2.color = 5;
        entities.push(ordDim2);
        
        // 示例3：仅Y坐标标注
        const point3 = new Point2D(30, 60);
        const pointMark3 = new CircleEnt([point3.x, point3.y], 1);
        pointMark3.setDefaults();
        pointMark3.color = 7;
        entities.push(pointMark3);
        
        const ordDim3 = new OrdinateDimensionEnt(
            new Point2D(0, 0),
            point3,
            new Point2D(55, 60),    // 水平引出
            'y'                      // 仅Y坐标
        );
        ordDim3.setDefaults();
        ordDim3.color = 4;
        entities.push(ordDim3);
        
        // 示例4：负坐标标注
        const point4 = new Point2D(-40, -25);
        const pointMark4 = new CircleEnt([point4.x, point4.y], 1);
        pointMark4.setDefaults();
        pointMark4.color = 7;
        entities.push(pointMark4);
        
        const ordDim4 = new OrdinateDimensionEnt(
            new Point2D(0, 0),
            point4,
            new Point2D(-40, -50),
            'xy'
        );
        ordDim4.setDefaults();
        ordDim4.color = 6;
        entities.push(ordDim4);
        
        // 示例5：相对于非原点的坐标标注
        const customOrigin = new Point2D(100, 0);
        const customOriginMark = new CircleEnt([customOrigin.x, customOrigin.y], 2);
        customOriginMark.setDefaults();
        customOriginMark.color = 2;
        entities.push(customOriginMark);
        
        const point5 = new Point2D(130, 40);
        const pointMark5 = new CircleEnt([point5.x, point5.y], 1);
        pointMark5.setDefaults();
        pointMark5.color = 7;
        entities.push(pointMark5);
        
        const ordDim5 = new OrdinateDimensionEnt(
            customOrigin,           // 自定义原点
            point5,
            new Point2D(130, 60),
            'xy'
        );
        ordDim5.setDefaults();
        ordDim5.color = 2;
        entities.push(ordDim5);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("坐标标注已创建");
        console.log("支持三种模式：'xy'同时显示, 'x'仅X坐标, 'y'仅Y坐标");
        console.log("可以指定自定义原点");
        
        message.info("坐标标注：XY模式(绿)、X模式(蓝)、Y模式(青)、负坐标(紫)、自定义原点(黄)");
        
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
