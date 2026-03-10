window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --点在多边形内判断--射线法用法
        const { MainView, initCadContainer, Point2D, LineEnt, PolylineEnt, CircleEnt, Engine, GeometryCalculator, pointInPolygon , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        console.log("=== 点在多边形内判断 ===");
        console.log("使用 SDK 的 pointInPolygon 函数（射线法）\n");
        
        // 创建测试多边形（使用 Point2D 数组，供 SDK 的 pointInPolygon 使用）
        const polygonVertices = [
            new Point2D(20, 20),
            new Point2D(100, 10),
            new Point2D(120, 50),
            new Point2D(90, 90),
            new Point2D(40, 80),
            new Point2D(10, 50),
        ];
        
        const polygon = new PolylineEnt();
        polygonVertices.forEach(pt => polygon.addVertex(pt));
        polygon.isClosed = true;
        polygon.setDefaults();
        polygon.color = 7;
        Engine.addEntities(polygon);
        
        // SDK 的 pointInPolygon(testPoint: Point2D, polygon: Point2D[]): boolean
        // 使用射线法判断点是否在多边形内部
        
        // 测试点数组
        const testPoints = [
            { pt: new Point2D(60, 50), name: "点A (内部中心)" },
            { pt: new Point2D(5, 5), name: "点B (外部左下)" },
            { pt: new Point2D(110, 50), name: "点C (边界附近)" },
            { pt: new Point2D(50, 85), name: "点D (外部上方)" },
            { pt: new Point2D(80, 30), name: "点E (内部右下)" },
            { pt: new Point2D(130, 70), name: "点F (外部右上)" },
        ];
        
        console.log("--- 测试结果 ---");
        
        testPoints.forEach((item, index) => {
            const { pt, name } = item;
            const inside = pointInPolygon(pt, polygonVertices);
            
            const marker = new CircleEnt([pt.x, pt.y], 3);
            marker.setDefaults();
            marker.color = inside ? 3 : 1; // 绿色=内部, 红色=外部
            Engine.addEntities(marker);
            
            console.log(`${name}: ${inside ? "在多边形内" : "在多边形外"}`);
            
            // 绘制向右的射线（可视化射线法）
            const ray = new LineEnt([pt.x, pt.y], [150, pt.y]);
            ray.setDefaults();
            ray.color = 8;
            ray.lineType = "DOT";
            Engine.addEntities(ray);
        });
        
        // === 使用 GeometryCalculator 计算交点数 ===
        console.log("\n=== 射线法原理演示 ===");
        console.log("从测试点向右发射水平射线，计算与多边形边界的交点数");
        console.log("交点数为奇数 → 点在内部");
        console.log("交点数为偶数 → 点在外部");
        
        // 详细展示一个点的射线交点
        const demoPoint = new Point2D(60, 50);
        const demoRay = new LineEnt([demoPoint.x, demoPoint.y], [200, demoPoint.y]);
        
        // 计算射线与多边形各边的交点
        let intersectionCount = 0;
        const n = polygonVertices.length;
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const edgeLine = new LineEnt(polygonVertices[i], polygonVertices[j]);
            const intersections = GeometryCalculator.LineToLine(demoRay, edgeLine);
            
            // 只计算在射线正方向的交点
            intersections.forEach(intPt => {
                if (intPt.x > demoPoint.x) {
                    intersectionCount++;
                    // 标记交点
                    const intMarker = new CircleEnt([intPt.x, intPt.y], 2);
                    intMarker.setDefaults();
                    intMarker.color = 5;
                    Engine.addEntities(intMarker);
                }
            });
        }
        
        console.log(`\n演示点 (60, 50) 的射线交点数: ${intersectionCount}`);
        console.log(`${intersectionCount % 2 === 1 ? "奇数，点在内部" : "偶数，点在外部"}`);
        
        // === 凸多边形快速判断 ===
        console.log("\n=== 凸多边形判断（使用叉积）===");
        
        // 创建凸多边形
        const convexPoints = [
            [160, 20],
            [200, 30],
            [210, 60],
            [190, 85],
            [160, 80],
            [145, 50],
        ];
        
        const convexPolygon = new PolylineEnt();
        convexPoints.forEach(pt => convexPolygon.addVertex(pt));
        convexPolygon.isClosed = true;
        convexPolygon.setDefaults();
        convexPolygon.color = 4;
        Engine.addEntities(convexPolygon);
        
        // 凸多边形判断函数（使用叉积）
        function pointInConvexPolygon(testPoint, vertices) {
            const n = vertices.length;
            let sign = 0;
            
            for (let i = 0; i < n; i++) {
                const j = (i + 1) % n;
                const v1 = new Point2D(vertices[i][0], vertices[i][1]);
                const v2 = new Point2D(vertices[j][0], vertices[j][1]);
                
                // 使用 GeometryCalculator 判断点在哪一侧
                const side = GeometryCalculator.witchSidePointToLine(v1, v2, testPoint);
                
                if (sign === 0) {
                    sign = side;
                } else if (side !== 0 && side !== sign) {
                    return false; // 不在同一侧，点在外部
                }
            }
            return true;
        }
        
        const convexTestPoint = new Point2D(180, 55);
        const inConvex = pointInConvexPolygon(convexTestPoint, convexPoints);
        
        const convexMarker = new CircleEnt([convexTestPoint.x, convexTestPoint.y], 3);
        convexMarker.setDefaults();
        convexMarker.color = inConvex ? 3 : 1;
        Engine.addEntities(convexMarker);
        
        console.log(`凸多边形测试点 (180, 55): ${inConvex ? "在内部" : "在外部"}`);
        
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
