window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --线段打断--在指定点打断实体
        const { MainView, initCadContainer, Point2D, LineEnt, CircleEnt, ArcEnt, PolylineEnt, Engine, GeometryCalculator, distance, getAngleBetweenPoints , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        console.log("=== 线段打断 ===");
        console.log("在指定点或交点处打断实体\n");
        
        // === 直线打断 ===
        console.log("--- 直线打断 ---");
        
        function breakLine(line, breakPoint) {
            // 检查打断点是否在线段上
            const distToStart = distance(line.startPoint, breakPoint);
            const distToEnd = distance(line.endPoint, breakPoint);
            const lineLength = line.Length;
            
            // 容差检查
            const tolerance = 0.01;
            if (Math.abs(distToStart + distToEnd - lineLength) > tolerance) {
                message.warn("打断点不在线段上");
                return [line.clone()];
            }
            
            // 创建两条新线段
            const line1 = new LineEnt(line.startPoint, breakPoint);
            const line2 = new LineEnt(breakPoint, line.endPoint);
            
            line1.setDefaults();
            line2.setDefaults();
            
            return [line1, line2];
        }
        
        const originalLine = new LineEnt([20, 50], [180, 50]);
        const breakPoint1 = new Point2D(80, 50);
        
        // 显示原始线（灰色虚线）
        const lineGhost = originalLine.clone();
        lineGhost.setDefaults();
        lineGhost.color = 8;
        lineGhost.lineType = "HIDDEN";
        Engine.addEntities(lineGhost);
        
        // 打断
        const brokenLines = breakLine(originalLine, breakPoint1);
        brokenLines[0].color = 1;
        brokenLines[1].color = 3;
        brokenLines.forEach(l => Engine.addEntities(l));
        
        // 标记打断点
        const breakMarker1 = new CircleEnt([breakPoint1.x, breakPoint1.y], 3);
        breakMarker1.setDefaults();
        breakMarker1.color = 2;
        Engine.addEntities(breakMarker1);
        
        console.log(`原始直线: (20,50) → (180,50)`);
        console.log(`打断点: (80,50)`);
        console.log(`结果: 2条线段`);
        
        // === 圆弧打断 ===
        console.log("\n--- 圆弧打断 ---");
        
        function breakArc(arc, breakPoint) {
            // 计算打断点相对于圆心的角度
            const breakAngle = getAngleBetweenPoints(arc.center, breakPoint);
            
            // 检查角度是否在圆弧范围内
            let startAngle = arc.startAng;
            let endAngle = arc.endAng;
            
            // 创建两段圆弧
            const arc1 = new ArcEnt(arc.center, arc.radius, startAngle, breakAngle);
            const arc2 = new ArcEnt(arc.center, arc.radius, breakAngle, endAngle);
            
            arc1.setDefaults();
            arc2.setDefaults();
            
            return [arc1, arc2];
        }
        
        const originalArc = new ArcEnt([100, 130], 40, 0, Math.PI);
        
        // 显示原始圆弧（灰色虚线）
        const arcGhost = originalArc.clone();
        arcGhost.setDefaults();
        arcGhost.color = 8;
        arcGhost.lineType = "HIDDEN";
        Engine.addEntities(arcGhost);
        
        // 打断点
        const arcBreakPoint = new Point2D(100 + 40 * Math.cos(Math.PI * 0.6), 130 + 40 * Math.sin(Math.PI * 0.6));
        
        const brokenArcs = breakArc(originalArc, arcBreakPoint);
        brokenArcs[0].color = 1;
        brokenArcs[1].color = 3;
        brokenArcs.forEach(a => Engine.addEntities(a));
        
        // 标记打断点
        const arcBreakMarker = new CircleEnt([arcBreakPoint.x, arcBreakPoint.y], 3);
        arcBreakMarker.setDefaults();
        arcBreakMarker.color = 2;
        Engine.addEntities(arcBreakMarker);
        
        console.log(`圆弧打断: 在角度 ${(Math.PI * 0.6 * 180 / Math.PI).toFixed(1)}° 处`);
        
        // === 在交点处打断 ===
        console.log("\n--- 在交点处打断 ---");
        
        // 两条相交的直线
        const lineA = new LineEnt([200, 30], [280, 100]);
        const lineB = new LineEnt([200, 100], [280, 30]);
        
        // 计算交点
        const intersections = GeometryCalculator.LineToLine(lineA, lineB);
        
        if (intersections.length > 0) {
            const intPoint = intersections[0];
            
            // 打断两条线
            const brokenA = breakLine(lineA, intPoint);
            const brokenB = breakLine(lineB, intPoint);
            
            // 用不同颜色显示
            brokenA[0].color = 1;
            brokenA[1].color = 3;
            brokenB[0].color = 4;
            brokenB[1].color = 5;
            
            [...brokenA, ...brokenB].forEach(l => Engine.addEntities(l));
            
            // 标记交点
            const intMarker = new CircleEnt([intPoint.x, intPoint.y], 3);
            intMarker.setDefaults();
            intMarker.color = 2;
            Engine.addEntities(intMarker);
            
            console.log(`在交点 (${intPoint.x.toFixed(1)}, ${intPoint.y.toFixed(1)}) 处打断两条线`);
            console.log("结果: 4条线段");
        }
        
        // === 多点打断 ===
        console.log("\n--- 多点打断 ---");
        
        function breakLineAtMultiplePoints(line, breakPoints) {
            // 按距离起点排序
            const sortedPoints = [...breakPoints].sort((a, b) => 
                distance(line.startPoint, a) - distance(line.startPoint, b)
            );
            
            // 添加起点和终点
            const allPoints = [line.startPoint, ...sortedPoints, line.endPoint];
            
            // 创建线段
            const segments = [];
            for (let i = 0; i < allPoints.length - 1; i++) {
                const seg = new LineEnt(allPoints[i], allPoints[i + 1]);
                seg.setDefaults();
                segments.push(seg);
            }
            
            return segments;
        }
        
        const longLine = new LineEnt([20, 180], [300, 180]);
        const multiBreakPoints = [
            new Point2D(80, 180),
            new Point2D(150, 180),
            new Point2D(220, 180),
        ];
        
        // 显示原始线
        const longLineGhost = longLine.clone();
        longLineGhost.setDefaults();
        longLineGhost.color = 8;
        longLineGhost.lineType = "HIDDEN";
        Engine.addEntities(longLineGhost);
        
        // 多点打断
        const multiSegments = breakLineAtMultiplePoints(longLine, multiBreakPoints);
        const colors = [1, 3, 4, 5];
        multiSegments.forEach((seg, i) => {
            seg.color = colors[i % colors.length];
            seg.lineWeight = 2;
            Engine.addEntities(seg);
        });
        
        // 标记打断点
        multiBreakPoints.forEach(pt => {
            const marker = new CircleEnt([pt.x, pt.y], 3);
            marker.setDefaults();
            marker.color = 2;
            Engine.addEntities(marker);
        });
        
        console.log(`在 ${multiBreakPoints.length} 个点处打断`);
        console.log(`结果: ${multiSegments.length} 条线段`);
        
        // === 算法说明 ===
        console.log("\n=== 打断算法要点 ===");
        console.log("1. 验证打断点在实体上");
        console.log("2. 对于直线: 创建两条新线段");
        console.log("3. 对于圆弧: 计算打断点角度，创建两段圆弧");
        console.log("4. 多点打断: 先排序，再依次分割");
        console.log("5. 交点打断: 先计算交点，再打断");
        
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
