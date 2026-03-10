window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --边界框--boundingBox方法用法
        const { MainView, initCadContainer, CircleEnt, PolylineEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建一个不规则多边形（使用简化写法）
        const pline = new PolylineEnt();
        pline.addVertex([20, 30]);
        pline.addVertex([80, 20]);
        pline.addVertex([100, 60]);
        pline.addVertex([70, 90]);
        pline.addVertex([30, 80]);
        pline.isClosed = true;
        pline.setDefaults();
        pline.color = 1;
        Engine.addEntities(pline);
        
        // 获取边界框
        const bbox = pline.boundingBox();
        
        console.log("=== 边界框属性 ===");
        console.log("最小点 (pt1):", bbox.pt1.x.toFixed(2), bbox.pt1.y.toFixed(2));
        console.log("最大点 (pt2):", bbox.pt2.x.toFixed(2), bbox.pt2.y.toFixed(2));
        console.log("宽度:", bbox.width.toFixed(2));
        console.log("高度:", bbox.height.toFixed(2));
        console.log("中心点:", bbox.center.x.toFixed(2), bbox.center.y.toFixed(2));
        
        // 绘制边界框（虚线矩形，使用简化写法）
        const bboxRect = new PolylineEnt();
        bboxRect.addVertex([bbox.pt1.x, bbox.pt1.y]);
        bboxRect.addVertex([bbox.pt2.x, bbox.pt1.y]);
        bboxRect.addVertex([bbox.pt2.x, bbox.pt2.y]);
        bboxRect.addVertex([bbox.pt1.x, bbox.pt2.y]);
        bboxRect.isClosed = true;
        bboxRect.setDefaults();
        bboxRect.color = 3;
        bboxRect.lineType = "HIDDEN";
        Engine.addEntities(bboxRect);
        
        // 标记中心点（使用简化写法）
        const centerMarker = new CircleEnt([bbox.center.x, bbox.center.y], 2);
        centerMarker.setDefaults();
        centerMarker.color = 5;
        Engine.addEntities(centerMarker);
        
        // 获取多个实体的边界框
        console.log("\n=== 多实体边界框 ===");
        const circle = new CircleEnt([150, 50], 25);
        circle.setDefaults();
        circle.color = 4;
        Engine.addEntities(circle);
        
        // 使用 Engine.getBoundsByEntities 获取多个实体的边界框
        const entities = [pline, circle];
        const combinedBbox = Engine.getBoundsByEntities(entities, "WCS");
        console.log("组合边界框:");
        console.log("  最小点:", combinedBbox.pt1.x.toFixed(2), combinedBbox.pt1.y.toFixed(2));
        console.log("  最大点:", combinedBbox.pt2.x.toFixed(2), combinedBbox.pt2.y.toFixed(2));
        
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
