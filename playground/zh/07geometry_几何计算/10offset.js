window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --偏移算法--直线、圆弧、圆、多段线偏移
        const { MainView, initCadContainer, Point2D, LineEnt, CircleEnt, ArcEnt, PolylineEnt, Engine, offsetLine, expandArc , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        console.log("=== 几何偏移算法 ===");
        console.log("演示直线、圆弧、圆、多段线的偏移\n");
        
        // 偏移距离
        const offsetDistance = 10;
        
        // === 直线偏移 ===
        console.log("--- 直线偏移 ---");
        console.log("使用 SDK 的 offsetLine 函数");
        
        const baseLine = new LineEnt([20, 50], [100, 50]);
        baseLine.setDefaults();
        baseLine.color = 7;
        Engine.addEntities(baseLine);
        
        const lineOffsetUp = offsetLine(baseLine, offsetDistance);
        lineOffsetUp.color = 3;
        Engine.addEntities(lineOffsetUp);
        
        const lineOffsetDown = offsetLine(baseLine, -offsetDistance);
        lineOffsetDown.color = 1;
        Engine.addEntities(lineOffsetDown);
        
        console.log(`原始直线 (白色): (20,50) → (100,50)`);
        console.log(`向上偏移 ${offsetDistance} (绿色)`);
        console.log(`向下偏移 ${offsetDistance} (红色)`);
        
        // === 圆偏移 (同心圆) ===
        console.log("\n--- 圆偏移 ---");
        
        function offsetCircle(circle, distance, direction) {
            // direction > 0: 向外, < 0: 向内
            const newRadius = circle.radius + distance * direction;
            if (newRadius <= 0) {
                message.warn("偏移距离过大，无法创建圆");
                return null;
            }
            
            const newCircle = new CircleEnt(circle.center, newRadius);
            newCircle.setDefaults();
            return newCircle;
        }
        
        const baseCircle = new CircleEnt([170, 50], 25);
        baseCircle.setDefaults();
        baseCircle.color = 7;
        Engine.addEntities(baseCircle);
        
        const circleOffsetOut = offsetCircle(baseCircle, offsetDistance, 1);
        circleOffsetOut.color = 3;
        Engine.addEntities(circleOffsetOut);
        
        const circleOffsetIn = offsetCircle(baseCircle, offsetDistance, -1);
        circleOffsetIn.color = 1;
        Engine.addEntities(circleOffsetIn);
        
        console.log(`原始圆 (白色): 圆心(170,50), 半径=25`);
        console.log(`向外偏移 ${offsetDistance} (绿色): 半径=35`);
        console.log(`向内偏移 ${offsetDistance} (红色): 半径=15`);
        
        // === 圆弧偏移 ===
        console.log("\n--- 圆弧偏移 ---");
        console.log("使用 SDK 的 expandArc 函数");
        
        const baseArc = new ArcEnt([260, 50], 30, Math.PI / 6, Math.PI * 5 / 6);
        baseArc.setDefaults();
        baseArc.color = 7;
        Engine.addEntities(baseArc);
        
        // expandArc(arc, distance): 正值向外扩展，负值向内收缩
        const arcOffsetOut = expandArc(baseArc, offsetDistance);
        if (arcOffsetOut) {
            arcOffsetOut.color = 3;
            Engine.addEntities(arcOffsetOut);
        }
        
        const arcOffsetIn = expandArc(baseArc, -offsetDistance);
        if (arcOffsetIn) {
            arcOffsetIn.color = 1;
            Engine.addEntities(arcOffsetIn);
        }
        
        console.log(`原始圆弧 (白色): 半径=30, 角度30°-150°`);
        console.log(`向外偏移 (绿色): 半径=40`);
        console.log(`向内偏移 (红色): 半径=20`);
        
        // === 多段线偏移 ===
        console.log("\n--- 多段线偏移 ---");
        
        function offsetPolyline(pline, distance) {
            const bulgePoints = pline.bulgePoints.items;
            const n = bulgePoints.length;
            const isClosed = pline.isClosed;
            
            // 计算每段的偏移
            const offsetSegments = [];
            const segCount = isClosed ? n : n - 1;
            
            for (let i = 0; i < segCount; i++) {
                const p1 = bulgePoints[i].point2d;
                const p2 = bulgePoints[(i + 1) % n].point2d;
                const bulge = bulgePoints[i].bulge;
                
                if (Math.abs(bulge) < 1e-6) {
                    // 直线段
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    const nx = -dy / len; // 法向量
                    const ny = dx / len;
                    
                    offsetSegments.push({
                        start: new Point2D(p1.x + nx * distance, p1.y + ny * distance),
                        end: new Point2D(p2.x + nx * distance, p2.y + ny * distance),
                        bulge: 0
                    });
                } else {
                    // 圆弧段 - 简化处理
                    offsetSegments.push({
                        start: p1.clone(),
                        end: p2.clone(),
                        bulge: bulge
                    });
                }
            }
            
            // 连接偏移段（简化版本，需要处理角点）
            const newPline = new PolylineEnt();
            offsetSegments.forEach((seg, i) => {
                if (i === 0) {
                    newPline.addVertex([seg.start.x, seg.start.y], seg.bulge);
                }
                newPline.addVertex([seg.end.x, seg.end.y], seg.bulge);
            });
            
            newPline.isClosed = isClosed;
            newPline.setDefaults();
            return newPline;
        }
        
        const basePline = new PolylineEnt();
        basePline.addVertex([20, 120]);
        basePline.addVertex([60, 130]);
        basePline.addVertex([100, 120]);
        basePline.addVertex([100, 160]);
        basePline.addVertex([60, 170]);
        basePline.addVertex([20, 160]);
        basePline.isClosed = true;
        basePline.setDefaults();
        basePline.color = 7;
        Engine.addEntities(basePline);
        
        // 使用简化的偏移
        const plineOffsetOut = offsetPolyline(basePline, 8);
        plineOffsetOut.color = 3;
        Engine.addEntities(plineOffsetOut);
        
        const plineOffsetIn = offsetPolyline(basePline, -8);
        plineOffsetIn.color = 1;
        Engine.addEntities(plineOffsetIn);
        
        console.log("原始多段线 (白色): 闭合六边形");
        console.log("向外偏移 8 (绿色)");
        console.log("向内偏移 8 (红色)");
        
        // === 偏移方向判断 ===
        console.log("\n--- 偏移方向判断 ---");
        
        // 判断点在多边形内外来确定偏移方向
        function determineOffsetDirection(pline, pickPoint) {
            // 使用射线法判断点在内部还是外部
            const testLine = new LineEnt([pickPoint.x, pickPoint.y], [pickPoint.x + 10000, pickPoint.y]);
            let crossCount = 0;
            
            const bulgePoints = pline.bulgePoints.items;
            const n = bulgePoints.length;
            
            for (let i = 0; i < n; i++) {
                const p1 = bulgePoints[i].point2d;
                const p2 = bulgePoints[(i + 1) % n].point2d;
                const edge = new LineEnt(p1, p2);
                
                // 简化：只检测水平射线与边的交点
                if ((p1.y > pickPoint.y) !== (p2.y > pickPoint.y)) {
                    const x = (p2.x - p1.x) * (pickPoint.y - p1.y) / (p2.y - p1.y) + p1.x;
                    if (pickPoint.x < x) {
                        crossCount++;
                    }
                }
            }
            
            return crossCount % 2 === 1 ? "内部" : "外部";
        }
        
        const testPointInside = new Point2D(60, 145);
        const testPointOutside = new Point2D(5, 145);
        
        console.log(`点 (60, 145): ${determineOffsetDirection(basePline, testPointInside)}`);
        console.log(`点 (5, 145): ${determineOffsetDirection(basePline, testPointOutside)}`);
        
        // 标记测试点
        const markerIn = new CircleEnt([testPointInside.x, testPointInside.y], 3);
        markerIn.setDefaults();
        markerIn.color = 5;
        Engine.addEntities(markerIn);
        
        const markerOut = new CircleEnt([testPointOutside.x, testPointOutside.y], 3);
        markerOut.setDefaults();
        markerOut.color = 6;
        Engine.addEntities(markerOut);
        
        // === 算法说明 ===
        console.log("\n=== 偏移算法要点 ===");
        console.log("1. 直线偏移: 沿法向量平移");
        console.log("2. 圆/圆弧偏移: 改变半径，保持圆心");
        console.log("3. 多段线偏移: 分段偏移后连接");
        console.log("4. 角点处理: 延伸相交或圆角");
        console.log("5. 方向判断: 点在内外决定偏移方向");
        
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
