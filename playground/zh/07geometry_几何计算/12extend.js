window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --延长算法--实体延长到边界
        const { MainView, initCadContainer, Point2D, LineEnt, CircleEnt, ArcEnt, Engine, GeometryCalculator, distance, getAngleBetweenPoints , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        console.log("=== 延长算法 ===");
        console.log("将实体延长到指定边界\n");
        
        // === 直线延长演示 ===
        console.log("--- 直线延长 ---");
        
        // 边界线（蓝色）
        const boundary = new LineEnt([150, 20], [150, 180]);
        boundary.setDefaults();
        boundary.color = 5;
        boundary.lineWeight = 2;
        Engine.addEntities(boundary);
        
        // 原始短线（灰色虚线表示原始位置）
        const originalLine = new LineEnt([30, 80], [100, 80]);
        const originalLineGhost = originalLine.clone();
        originalLineGhost.setDefaults();
        originalLineGhost.color = 8;
        originalLineGhost.lineType = "HIDDEN";
        Engine.addEntities(originalLineGhost);
        
        // 延长直线到边界
        function extendLineToBoundary(line, boundaryLine, extendEnd = true) {
            // 计算延长线与边界的交点
            const extLine = line.clone();
            
            // 计算直线方向
            const angle = line.angle;
            const length = 1000; // 延长足够长
            
            if (extendEnd) {
                // 延长终点方向
                const newEndX = line.endPoint.x + length * Math.cos(angle);
                const newEndY = line.endPoint.y + length * Math.sin(angle);
                extLine.endPoint = new Point2D(newEndX, newEndY);
            } else {
                // 延长起点方向（反向）
                const newStartX = line.startPoint.x - length * Math.cos(angle);
                const newStartY = line.startPoint.y - length * Math.sin(angle);
                extLine.startPoint = new Point2D(newStartX, newStartY);
            }
            
            // 计算与边界的交点
            const intersections = GeometryCalculator.LineExtToLineExt(line, boundaryLine);
            
            if (intersections.length > 0) {
                const intPt = intersections[0];
                // 判断交点在哪个方向
                const distToStart = distance(line.startPoint, intPt);
                const distToEnd = distance(line.endPoint, intPt);
                const lineLength = line.Length;
                
                if (extendEnd && distToEnd > distToStart - lineLength) {
                    return new LineEnt(line.startPoint, intPt);
                } else if (!extendEnd && distToStart > distToEnd - lineLength) {
                    return new LineEnt(intPt, line.endPoint);
                }
            }
            
            return line.clone();
        }
        
        // 延长到边界
        const extendedLine = extendLineToBoundary(originalLine, boundary, true);
        extendedLine.setDefaults();
        extendedLine.color = 3;
        extendedLine.lineWeight = 2;
        Engine.addEntities(extendedLine);
        
        console.log(`原始直线: (30,80) → (100,80)`);
        console.log(`延长后: (30,80) → (150,80)`);
        console.log("灰色虚线: 原始位置, 绿色: 延长后");
        
        // === 双向延长演示 ===
        console.log("\n--- 双向延长 ---");
        
        // 第二条边界
        const boundary2 = new LineEnt([30, 20], [30, 180]);
        boundary2.setDefaults();
        boundary2.color = 5;
        boundary2.lineWeight = 2;
        Engine.addEntities(boundary2);
        
        // 短线
        const shortLine = new LineEnt([60, 120], [120, 120]);
        const shortLineGhost = shortLine.clone();
        shortLineGhost.setDefaults();
        shortLineGhost.color = 8;
        shortLineGhost.lineType = "HIDDEN";
        Engine.addEntities(shortLineGhost);
        
        // 双向延长
        const intLeft = GeometryCalculator.LineExtToLineExt(shortLine, boundary2);
        const intRight = GeometryCalculator.LineExtToLineExt(shortLine, boundary);
        
        if (intLeft.length > 0 && intRight.length > 0) {
            const extendedBoth = new LineEnt(intLeft[0], intRight[0]);
            extendedBoth.setDefaults();
            extendedBoth.color = 3;
            extendedBoth.lineWeight = 2;
            Engine.addEntities(extendedBoth);
            
            console.log(`原始: (60,120) → (120,120)`);
            console.log(`双向延长: (30,120) → (150,120)`);
        }
        
        // === 圆弧延长演示 ===
        console.log("\n--- 圆弧延长 ---");
        
        // 圆弧
        const arc = new ArcEnt([90, 50], 25, Math.PI / 4, Math.PI * 3 / 4);
        const arcGhost = arc.clone();
        arcGhost.setDefaults();
        arcGhost.color = 8;
        arcGhost.lineType = "HIDDEN";
        Engine.addEntities(arcGhost);
        
        // 圆弧延长边界
        const arcBoundary = new LineEnt([50, 30], [130, 30]);
        arcBoundary.setDefaults();
        arcBoundary.color = 5;
        arcBoundary.lineWeight = 2;
        Engine.addEntities(arcBoundary);
        
        // 计算圆弧延长后与边界的交点
        // 圆弧延长实际上是延长圆弧所在的圆
        const fullCircle = new CircleEnt(arc.center, arc.radius);
        const arcExtIntersections = GeometryCalculator.CircleToLine(fullCircle, arcBoundary);
        
        console.log(`圆弧延长交点数: ${arcExtIntersections.length}`);
        
        if (arcExtIntersections.length > 0) {
            // 找到更接近圆弧端点的交点
            arcExtIntersections.forEach((intPt, i) => {
                const intAngle = getAngleBetweenPoints(arc.center, intPt);
                console.log(`  交点${i + 1}角度: ${(intAngle * 180 / Math.PI).toFixed(1)}°`);
                
                const marker = new CircleEnt([intPt.x, intPt.y], 2);
                marker.setDefaults();
                marker.color = 2;
                Engine.addEntities(marker);
            });
            
            // 延长圆弧的终点方向
            const targetIntersection = arcExtIntersections[0];
            const newEndAngle = getAngleBetweenPoints(arc.center, targetIntersection);
            
            const extendedArc = new ArcEnt(arc.center, arc.radius, arc.startAng, newEndAngle);
            extendedArc.setDefaults();
            extendedArc.color = 3;
            extendedArc.lineWeight = 2;
            Engine.addEntities(extendedArc);
        }
        
        // === 延长到圆边界 ===
        console.log("\n--- 延长到圆边界 ---");
        
        const circleBoundary = new CircleEnt([250, 100], 40);
        circleBoundary.setDefaults();
        circleBoundary.color = 5;
        circleBoundary.lineWeight = 2;
        Engine.addEntities(circleBoundary);
        
        const lineToCircle = new LineEnt([180, 100], [220, 100]);
        const lineToCircleGhost = lineToCircle.clone();
        lineToCircleGhost.setDefaults();
        lineToCircleGhost.color = 8;
        lineToCircleGhost.lineType = "HIDDEN";
        Engine.addEntities(lineToCircleGhost);
        
        // 计算直线延长与圆的交点
        const lineCircleInts = GeometryCalculator.LineExtToCircle(lineToCircle, circleBoundary);
        
        if (lineCircleInts.length > 0) {
            // 选择更远的交点（延长方向）
            const nearerInt = lineCircleInts.reduce((nearest, pt) => 
                distance(lineToCircle.endPoint, pt) < distance(lineToCircle.endPoint, nearest) ? pt : nearest
            , lineCircleInts[0]);
            
            const extendedToCircle = new LineEnt(lineToCircle.startPoint, nearerInt);
            extendedToCircle.setDefaults();
            extendedToCircle.color = 3;
            extendedToCircle.lineWeight = 2;
            Engine.addEntities(extendedToCircle);
            
            console.log("直线延长到圆边界");
        }
        
        // === 算法说明 ===
        console.log("\n=== 延长算法要点 ===");
        console.log("1. 确定延长方向（起点/终点）");
        console.log("2. 将实体虚拟延长到无穷");
        console.log("3. 计算与边界的交点");
        console.log("4. 选择正确方向的交点");
        console.log("5. 更新实体端点到交点");
        
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
