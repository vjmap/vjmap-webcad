window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --交点计算--GeometryCalculator用法
        const { MainView, initCadContainer, LineEnt, CircleEnt, Engine, GeometryCalculator , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // === 直线与直线交点 ===
        console.log("=== 直线与直线交点 ===");
        
        // 使用简化写法创建直线
        const line1 = new LineEnt([0, 0], [100, 100]);
        const line2 = new LineEnt([0, 100], [100, 0]);
        line1.setDefaults();
        line2.setDefaults();
        line1.color = 1;
        line2.color = 3;
        Engine.addEntities([line1, line2]);
        
        // 计算交点
        const lineIntersections = GeometryCalculator.LineToLine(line1, line2);
        console.log("交点数:", lineIntersections.length);
        lineIntersections.forEach((pt, i) => {
            console.log(`交点${i + 1}: (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`);
            // 标记交点（使用简化写法）
            const marker = new CircleEnt([pt.x, pt.y], 3);
            marker.setDefaults();
            marker.color = 2;
            Engine.addEntities(marker);
        });
        
        // === 直线与圆交点 ===
        console.log("\n=== 直线与圆交点 ===");
        
        const line3 = new LineEnt([150, 30], [250, 70]);
        const circle1 = new CircleEnt([200, 50], 30);
        line3.setDefaults();
        circle1.setDefaults();
        line3.color = 1;
        circle1.color = 4;
        Engine.addEntities([line3, circle1]);
        
        const lineCircleIntersections = GeometryCalculator.LineToCircle(line3, circle1);
        console.log("交点数:", lineCircleIntersections.length);
        lineCircleIntersections.forEach((pt, i) => {
            console.log(`交点${i + 1}: (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`);
            const marker = new CircleEnt([pt.x, pt.y], 2);
            marker.setDefaults();
            marker.color = 2;
            Engine.addEntities(marker);
        });
        
        // === 圆与圆交点 ===
        console.log("\n=== 圆与圆交点 ===");
        
        const circle2 = new CircleEnt([50, -80], 30);
        const circle3 = new CircleEnt([90, -80], 30);
        circle2.setDefaults();
        circle3.setDefaults();
        circle2.color = 1;
        circle3.color = 3;
        Engine.addEntities([circle2, circle3]);
        
        const circleCircleIntersections = GeometryCalculator.CircleToCircle(circle2, circle3);
        console.log("交点数:", circleCircleIntersections.length);
        circleCircleIntersections.forEach((pt, i) => {
            console.log(`交点${i + 1}: (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`);
            const marker = new CircleEnt([pt.x, pt.y], 2);
            marker.setDefaults();
            marker.color = 2;
            Engine.addEntities(marker);
        });
        
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
