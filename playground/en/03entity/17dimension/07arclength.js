window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --弧长标注--ArcDimensionEnt弧长标注示例
        const { MainView, initCadContainer, ArcDimensionEnt, ArcEnt, Point2D, Engine , message } = vjcad;
        
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
        
        // 辅助函数：极坐标转直角坐标
        function polarToCartesian(center, angle, radius) {
            return new Point2D(
                center.x + radius * Math.cos(angle),
                center.y + radius * Math.sin(angle)
            );
        }
        
        // 示例1：90度弧的弧长标注
        const center1 = new Point2D(0, 0);
        const radius1 = 40;
        const startAngle1 = 0;
        const endAngle1 = Math.PI / 2;
        
        const arc1 = new ArcEnt(center1, radius1, startAngle1, endAngle1);
        arc1.setDefaults();
        arc1.color = 7;
        entities.push(arc1);
        
        // 创建弧长标注
        const arcDim1 = new ArcDimensionEnt(
            center1,                                          // centerPoint: 圆心
            polarToCartesian(center1, startAngle1, radius1),  // xLine1Point: 弧起点
            polarToCartesian(center1, endAngle1, radius1),    // xLine2Point: 弧终点
            polarToCartesian(center1, (startAngle1 + endAngle1) / 2, radius1 * 1.3)  // arcPoint: 标注弧位置
        );
        arcDim1.setDefaults();
        arcDim1.color = 1;
        entities.push(arcDim1);
        
        // 示例2：60度弧的弧长标注
        const center2 = new Point2D(100, 0);
        const radius2 = 35;
        const startAngle2 = Math.PI / 6;
        const endAngle2 = Math.PI / 2;
        
        const arc2 = new ArcEnt(center2, radius2, startAngle2, endAngle2);
        arc2.setDefaults();
        arc2.color = 7;
        entities.push(arc2);
        
        const arcDim2 = new ArcDimensionEnt(
            center2,
            polarToCartesian(center2, startAngle2, radius2),
            polarToCartesian(center2, endAngle2, radius2),
            polarToCartesian(center2, (startAngle2 + endAngle2) / 2, radius2 * 1.4)
        );
        arcDim2.setDefaults();
        arcDim2.color = 3;
        entities.push(arcDim2);
        
        // 示例3：180度弧（半圆）的弧长标注
        const center3 = new Point2D(200, 0);
        const radius3 = 30;
        const startAngle3 = 0;
        const endAngle3 = Math.PI;
        
        const arc3 = new ArcEnt(center3, radius3, startAngle3, endAngle3);
        arc3.setDefaults();
        arc3.color = 7;
        entities.push(arc3);
        
        const arcDim3 = new ArcDimensionEnt(
            center3,
            polarToCartesian(center3, startAngle3, radius3),
            polarToCartesian(center3, endAngle3, radius3),
            polarToCartesian(center3, Math.PI / 2, radius3 * 1.5)
        );
        arcDim3.setDefaults();
        arcDim3.color = 5;
        entities.push(arcDim3);
        
        // 示例4：小弧的弧长标注
        const center4 = new Point2D(0, -80);
        const radius4 = 50;
        const startAngle4 = -Math.PI / 6;
        const endAngle4 = Math.PI / 6;
        
        const arc4 = new ArcEnt(center4, radius4, startAngle4, endAngle4);
        arc4.setDefaults();
        arc4.color = 7;
        entities.push(arc4);
        
        const arcDim4 = new ArcDimensionEnt(
            center4,
            polarToCartesian(center4, startAngle4, radius4),
            polarToCartesian(center4, endAngle4, radius4),
            polarToCartesian(center4, 0, radius4 * 1.3)
        );
        arcDim4.setDefaults();
        arcDim4.color = 4;
        entities.push(arcDim4);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("弧长标注已创建");
        console.log("弧长 = 半径 × 弧角（弧度）");
        console.log("90度弧、60度弧、180度弧（半圆）、小弧");
        
        message.info("弧长标注：90°弧(红)、60°弧(绿)、半圆(蓝)、小弧(青)");
        
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
