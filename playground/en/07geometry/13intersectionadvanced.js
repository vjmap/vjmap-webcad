window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --高级交点计算--多种实体类型的交点
        const { MainView, initCadContainer, Point2D, LineEnt, CircleEnt, ArcEnt, PolylineEnt, Engine, GeometryCalculator , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        console.log("=== 高级交点计算 ===");
        console.log("演示多种实体类型之间的交点计算\n");
        
        // 辅助函数：标记交点
        function markIntersection(pt, color = 2) {
            const marker = new CircleEnt([pt.x, pt.y], 2);
            marker.setDefaults();
            marker.color = color;
            Engine.addEntities(marker);
        }
        
        // === 圆弧与圆弧交点 ===
        console.log("--- 圆弧与圆弧交点 ---");
        
        const arc1 = new ArcEnt([50, 50], 30, 0, Math.PI);
        arc1.setDefaults();
        arc1.color = 1;
        Engine.addEntities(arc1);
        
        const arc2 = new ArcEnt([70, 60], 25, Math.PI * 0.5, Math.PI * 1.5);
        arc2.setDefaults();
        arc2.color = 3;
        Engine.addEntities(arc2);
        
        const arcArcInts = GeometryCalculator.ArcToArc(arc1, arc2);
        console.log(`圆弧-圆弧交点数: ${arcArcInts.length}`);
        arcArcInts.forEach((pt, i) => {
            console.log(`  交点${i + 1}: (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`);
            markIntersection(pt);
        });
        
        // === 圆与多段线交点 ===
        console.log("\n--- 圆与多段线交点 ---");
        
        const circle = new CircleEnt([160, 50], 25);
        circle.setDefaults();
        circle.color = 4;
        Engine.addEntities(circle);
        
        const pline = new PolylineEnt();
        pline.addVertex([130, 30]);
        pline.addVertex([180, 40]);
        pline.addVertex([190, 70]);
        pline.addVertex([150, 80]);
        pline.addVertex([125, 55]);
        pline.isClosed = true;
        pline.setDefaults();
        pline.color = 5;
        Engine.addEntities(pline);
        
        const circlePlineInts = GeometryCalculator.CircleToPline(circle, pline);
        console.log(`圆-多段线交点数: ${circlePlineInts.length}`);
        circlePlineInts.forEach((pt, i) => {
            markIntersection(pt, 2);
        });
        
        // === 直线与圆弧的延长交点 ===
        console.log("\n--- 直线与圆弧延长交点 ---");
        
        const line = new LineEnt([230, 30], [280, 30]);
        line.setDefaults();
        line.color = 1;
        Engine.addEntities(line);
        
        const arcForExt = new ArcEnt([260, 60], 20, Math.PI * 0.2, Math.PI * 0.8);
        arcForExt.setDefaults();
        arcForExt.color = 3;
        Engine.addEntities(arcForExt);
        
        // 直线与圆弧延长的交点（圆弧延伸到完整圆）
        const lineArcExtInts = GeometryCalculator.LineToArcExt(line, arcForExt);
        console.log(`直线与圆弧延长交点数: ${lineArcExtInts.length}`);
        lineArcExtInts.forEach((pt, i) => {
            console.log(`  交点${i + 1}: (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`);
            markIntersection(pt, 6);
        });
        
        // 显示圆弧延长的完整圆（虚线）
        const fullCircleGhost = new CircleEnt(arcForExt.center, arcForExt.radius);
        fullCircleGhost.setDefaults();
        fullCircleGhost.color = 8;
        fullCircleGhost.lineType = "HIDDEN";
        Engine.addEntities(fullCircleGhost);
        
        // === 多段线与多段线交点 ===
        console.log("\n--- 多段线与多段线交点 ---");
        
        const pline1 = new PolylineEnt();
        pline1.addVertex([30, 120]);
        pline1.addVertex([100, 130]);
        pline1.addVertex([90, 170]);
        pline1.addVertex([40, 160]);
        pline1.isClosed = true;
        pline1.setDefaults();
        pline1.color = 1;
        Engine.addEntities(pline1);
        
        const pline2 = new PolylineEnt();
        pline2.addVertex([50, 110]);
        pline2.addVertex([110, 140]);
        pline2.addVertex([80, 180]);
        pline2.addVertex([20, 150]);
        pline2.isClosed = true;
        pline2.setDefaults();
        pline2.color = 3;
        Engine.addEntities(pline2);
        
        const plinePlineInts = GeometryCalculator.PlineToPline(pline1, pline2);
        console.log(`多段线-多段线交点数: ${plinePlineInts.length}`);
        plinePlineInts.forEach((pt, i) => {
            markIntersection(pt, 2);
        });
        
        // === 圆与圆交点 ===
        console.log("\n--- 圆与圆交点 ---");
        
        const circle1 = new CircleEnt([180, 140], 25);
        circle1.setDefaults();
        circle1.color = 4;
        Engine.addEntities(circle1);
        
        const circle2 = new CircleEnt([210, 150], 30);
        circle2.setDefaults();
        circle2.color = 5;
        Engine.addEntities(circle2);
        
        const circleCircleInts = GeometryCalculator.CircleToCircle(circle1, circle2);
        console.log(`圆-圆交点数: ${circleCircleInts.length}`);
        circleCircleInts.forEach((pt, i) => {
            console.log(`  交点${i + 1}: (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`);
            markIntersection(pt, 2);
        });
        
        // === 直线延长与直线交点 ===
        console.log("\n--- 直线延长交点 ---");
        
        const lineA = new LineEnt([260, 120], [290, 140]);
        lineA.setDefaults();
        lineA.color = 1;
        Engine.addEntities(lineA);
        
        const lineB = new LineEnt([300, 110], [320, 150]);
        lineB.setDefaults();
        lineB.color = 3;
        Engine.addEntities(lineB);
        
        // 普通交点
        const normalInts = GeometryCalculator.LineToLine(lineA, lineB);
        console.log(`直线-直线交点: ${normalInts.length}`);
        
        // 延长交点
        const extInts = GeometryCalculator.LineExtToLineExt(lineA, lineB);
        console.log(`直线延长交点: ${extInts.length}`);
        extInts.forEach((pt, i) => {
            console.log(`  延长交点: (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`);
            markIntersection(pt, 6);
            
            // 显示延长虚线
            const extLineA = new LineEnt(lineA.endPoint, pt);
            extLineA.setDefaults();
            extLineA.color = 8;
            extLineA.lineType = "HIDDEN";
            Engine.addEntities(extLineA);
            
            const extLineB = new LineEnt(lineB.startPoint, pt);
            extLineB.setDefaults();
            extLineB.color = 8;
            extLineB.lineType = "HIDDEN";
            Engine.addEntities(extLineB);
        });
        
        // === 交点计算方法总结 ===
        console.log("\n=== GeometryCalculator 交点方法 ===");
        console.log("LineToLine - 直线与直线");
        console.log("LineToCircle - 直线与圆");
        console.log("LineToArc - 直线与圆弧");
        console.log("LineToArcExt - 直线与圆弧延长");
        console.log("LineToPline - 直线与多段线");
        console.log("CircleToCircle - 圆与圆");
        console.log("CircleToPline - 圆与多段线");
        console.log("ArcToArc - 圆弧与圆弧");
        console.log("PlineToPline - 多段线与多段线");
        console.log("LineExtToLineExt - 直线延长与直线延长");
        console.log("以及更多组合...");
        
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
