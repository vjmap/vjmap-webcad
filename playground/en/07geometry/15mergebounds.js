window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --边界框合并--多个边界框的合并
        const { MainView, initCadContainer, Point2D, LineEnt, CircleEnt, PolylineEnt, ArcEnt, Engine, BoundingBox, mergeBoundingBoxes , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        console.log("=== 边界框合并 ===");
        console.log("计算多个实体的最小包围边界框\n");
        
        // 绘制边界框辅助函数
        function drawBoundingBox(bbox, color, lineType = "CONTINUOUS") {
            const rect = new PolylineEnt();
            rect.addVertex([bbox.minX, bbox.minY]);
            rect.addVertex([bbox.maxX, bbox.minY]);
            rect.addVertex([bbox.maxX, bbox.maxY]);
            rect.addVertex([bbox.minX, bbox.maxY]);
            rect.isClosed = true;
            rect.setDefaults();
            rect.color = color;
            rect.lineType = lineType;
            Engine.addEntities(rect);
            return rect;
        }
        
        // === 创建多个不同类型的实体 ===
        console.log("--- 创建测试实体 ---");
        
        // 直线
        const line = new LineEnt([20, 50], [80, 90]);
        line.setDefaults();
        line.color = 1;
        Engine.addEntities(line);
        
        // 圆
        const circle = new CircleEnt([130, 70], 25);
        circle.setDefaults();
        circle.color = 3;
        Engine.addEntities(circle);
        
        // 多段线
        const pline = new PolylineEnt();
        pline.addVertex([180, 30]);
        pline.addVertex([230, 40]);
        pline.addVertex([220, 80]);
        pline.addVertex([190, 90]);
        pline.isClosed = true;
        pline.setDefaults();
        pline.color = 4;
        Engine.addEntities(pline);
        
        // 圆弧
        const arc = new ArcEnt([280, 60], 30, Math.PI / 6, Math.PI * 5 / 6);
        arc.setDefaults();
        arc.color = 5;
        Engine.addEntities(arc);
        
        // === 获取每个实体的边界框 ===
        console.log("\n--- 单个实体的边界框 ---");
        
        const lineBbox = line.boundingBox();
        const circleBbox = circle.boundingBox();
        const plineBbox = pline.boundingBox();
        const arcBbox = arc.boundingBox();
        
        // 绘制每个边界框
        drawBoundingBox(lineBbox, 1, "DASHED");
        drawBoundingBox(circleBbox, 3, "DASHED");
        drawBoundingBox(plineBbox, 4, "DASHED");
        drawBoundingBox(arcBbox, 5, "DASHED");
        
        console.log(`直线边界框: (${lineBbox.minX.toFixed(1)}, ${lineBbox.minY.toFixed(1)}) - (${lineBbox.maxX.toFixed(1)}, ${lineBbox.maxY.toFixed(1)})`);
        console.log(`圆边界框: (${circleBbox.minX.toFixed(1)}, ${circleBbox.minY.toFixed(1)}) - (${circleBbox.maxX.toFixed(1)}, ${circleBbox.maxY.toFixed(1)})`);
        console.log(`多段线边界框: (${plineBbox.minX.toFixed(1)}, ${plineBbox.minY.toFixed(1)}) - (${plineBbox.maxX.toFixed(1)}, ${plineBbox.maxY.toFixed(1)})`);
        console.log(`圆弧边界框: (${arcBbox.minX.toFixed(1)}, ${arcBbox.minY.toFixed(1)}) - (${arcBbox.maxX.toFixed(1)}, ${arcBbox.maxY.toFixed(1)})`);
        
        // === 合并边界框 ===
        console.log("\n--- 合并后的边界框 ---");
        
        // 方法1：使用 mergeBoundingBoxes 函数
        const mergedBbox = mergeBoundingBoxes([lineBbox, circleBbox, plineBbox, arcBbox]);
        drawBoundingBox(mergedBbox, 2, "CONTINUOUS");
        
        console.log(`合并边界框: (${mergedBbox.minX.toFixed(1)}, ${mergedBbox.minY.toFixed(1)}) - (${mergedBbox.maxX.toFixed(1)}, ${mergedBbox.maxY.toFixed(1)})`);
        console.log(`宽度: ${mergedBbox.width.toFixed(1)}, 高度: ${mergedBbox.height.toFixed(1)}`);
        console.log(`中心: (${mergedBbox.center.x.toFixed(1)}, ${mergedBbox.center.y.toFixed(1)})`);
        
        // 标记中心点
        const centerMarker = new CircleEnt([mergedBbox.center.x, mergedBbox.center.y], 3);
        centerMarker.setDefaults();
        centerMarker.color = 2;
        Engine.addEntities(centerMarker);
        
        // === 方法2：使用 Engine.getBoundsByEntities ===
        console.log("\n--- 使用 Engine.getBoundsByEntities ---");
        
        const entities = [line, circle, pline, arc];
        const engineBbox = Engine.getBoundsByEntities(entities, "WCS");
        
        console.log(`Engine.getBoundsByEntities 结果:`);
        console.log(`  最小点: (${engineBbox.pt1.x.toFixed(1)}, ${engineBbox.pt1.y.toFixed(1)})`);
        console.log(`  最大点: (${engineBbox.pt2.x.toFixed(1)}, ${engineBbox.pt2.y.toFixed(1)})`);
        
        // === 边界框交集 ===
        console.log("\n--- 边界框相交判断 ---");
        
        function bboxIntersects(bbox1, bbox2) {
            return !(bbox1.maxX < bbox2.minX || 
                     bbox1.minX > bbox2.maxX ||
                     bbox1.maxY < bbox2.minY || 
                     bbox1.minY > bbox2.maxY);
        }
        
        function bboxIntersection(bbox1, bbox2) {
            if (!bboxIntersects(bbox1, bbox2)) {
                return null;
            }
            
            return new BoundingBox(
                new Point2D(Math.max(bbox1.minX, bbox2.minX), Math.max(bbox1.minY, bbox2.minY)),
                new Point2D(Math.min(bbox1.maxX, bbox2.maxX), Math.min(bbox1.maxY, bbox2.maxY))
            );
        }
        
        // 创建两个重叠的边界框
        const bbox1 = new BoundingBox(new Point2D(20, 120), new Point2D(100, 180));
        const bbox2 = new BoundingBox(new Point2D(60, 140), new Point2D(140, 200));
        
        drawBoundingBox(bbox1, 1, "CONTINUOUS");
        drawBoundingBox(bbox2, 3, "CONTINUOUS");
        
        const intersection = bboxIntersection(bbox1, bbox2);
        if (intersection) {
            drawBoundingBox(intersection, 2, "CONTINUOUS");
            console.log(`边界框1和2相交`);
            console.log(`交集: (${intersection.minX}, ${intersection.minY}) - (${intersection.maxX}, ${intersection.maxY})`);
        }
        
        // === 边界框包含判断 ===
        console.log("\n--- 边界框包含判断 ---");
        
        function bboxContainsPoint(bbox, point) {
            return point.x >= bbox.minX && point.x <= bbox.maxX &&
                   point.y >= bbox.minY && point.y <= bbox.maxY;
        }
        
        const testPoint = new Point2D(75, 160);
        const contains1 = bboxContainsPoint(bbox1, testPoint);
        const contains2 = bboxContainsPoint(bbox2, testPoint);
        
        console.log(`点 (75, 160):`);
        console.log(`  在bbox1内: ${contains1}`);
        console.log(`  在bbox2内: ${contains2}`);
        
        const testMarker = new CircleEnt([testPoint.x, testPoint.y], 3);
        testMarker.setDefaults();
        testMarker.color = contains1 && contains2 ? 2 : (contains1 || contains2 ? 6 : 1);
        Engine.addEntities(testMarker);
        
        // === 算法说明 ===
        console.log("\n=== 边界框操作 ===");
        console.log("合并: min取最小, max取最大");
        console.log("相交: min取最大, max取最小");
        console.log("包含: 点在min和max之间");
        
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
