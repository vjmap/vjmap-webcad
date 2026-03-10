window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --裁剪算法--基于交点的实体裁剪
        const { MainView, initCadContainer, Point2D, LineEnt, CircleEnt, ArcEnt, Engine, GeometryCalculator, distance , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        console.log("=== 裁剪算法 ===");
        console.log("基于交点计算的实体裁剪原理\n");
        
        // === 直线裁剪演示 ===
        console.log("--- 直线裁剪 ---");
        
        // 创建裁剪边界（蓝色）
        const boundary1 = new LineEnt([50, 10], [50, 90]);
        boundary1.setDefaults();
        boundary1.color = 5; // 蓝色
        boundary1.lineWeight = 2;
        Engine.addEntities(boundary1);
        
        const boundary2 = new LineEnt([130, 10], [130, 90]);
        boundary2.setDefaults();
        boundary2.color = 5;
        boundary2.lineWeight = 2;
        Engine.addEntities(boundary2);
        
        // 被裁剪的直线（原始为白色，裁剪后删除部分为红色虚线）
        const targetLine = new LineEnt([20, 50], [160, 50]);
        
        // 计算交点
        const intersections1 = GeometryCalculator.LineToLine(targetLine, boundary1);
        const intersections2 = GeometryCalculator.LineToLine(targetLine, boundary2);
        
        console.log(`原始直线: (20,50) → (160,50)`);
        console.log(`边界1交点: ${intersections1.length > 0 ? `(${intersections1[0].x}, ${intersections1[0].y})` : "无"}`);
        console.log(`边界2交点: ${intersections2.length > 0 ? `(${intersections2[0].x}, ${intersections2[0].y})` : "无"}`);
        
        // 裁剪函数：保留靠近指定点的部分
        function trimLine(line, intersectionPoints, pickPoint) {
            if (intersectionPoints.length === 0) {
                return [line.clone()];
            }
            
            // 按距离起点排序
            const sortedPoints = [...intersectionPoints].sort((a, b) => 
                distance(line.startPoint, a) - distance(line.startPoint, b)
            );
            
            // 添加起点和终点
            const allPoints = [line.startPoint, ...sortedPoints, line.endPoint];
            
            // 找到点击点所在的段
            const pickDist = distance(line.startPoint, pickPoint);
            let segmentIndex = 0;
            
            for (let i = 0; i < allPoints.length - 1; i++) {
                const startDist = distance(line.startPoint, allPoints[i]);
                const endDist = distance(line.startPoint, allPoints[i + 1]);
                if (pickDist >= startDist && pickDist <= endDist) {
                    segmentIndex = i;
                    break;
                }
            }
            
            // 返回裁剪后的线段（删除点击的段）
            const result = [];
            for (let i = 0; i < allPoints.length - 1; i++) {
                if (i !== segmentIndex) {
                    const seg = new LineEnt(allPoints[i], allPoints[i + 1]);
                    seg.setDefaults();
                    result.push(seg);
                }
            }
            
            return result;
        }
        
        // 模拟裁剪中间部分
        const allIntersections = [...intersections1, ...intersections2];
        const pickPoint = new Point2D(90, 50); // 点击中间部分
        
        // 显示原始线和裁剪结果
        // 被删除的部分（红色虚线）
        const deletedPart = new LineEnt([50, 50], [130, 50]);
        deletedPart.setDefaults();
        deletedPart.color = 1;
        deletedPart.lineType = "DASHED";
        Engine.addEntities(deletedPart);
        
        // 保留的部分（绿色）
        const remainPart1 = new LineEnt([20, 50], [50, 50]);
        remainPart1.setDefaults();
        remainPart1.color = 3;
        remainPart1.lineWeight = 2;
        Engine.addEntities(remainPart1);
        
        const remainPart2 = new LineEnt([130, 50], [160, 50]);
        remainPart2.setDefaults();
        remainPart2.color = 3;
        remainPart2.lineWeight = 2;
        Engine.addEntities(remainPart2);
        
        console.log("绿色: 保留部分, 红色虚线: 被裁剪部分");
        
        // === 圆弧裁剪演示 ===
        console.log("\n--- 圆弧裁剪 ---");
        
        // 圆弧
        const arc = new ArcEnt([90, 140], 35, 0, Math.PI);
        arc.setDefaults();
        arc.color = 7;
        Engine.addEntities(arc);
        
        // 裁剪边界
        const arcBoundary = new LineEnt([70, 100], [70, 180]);
        arcBoundary.setDefaults();
        arcBoundary.color = 5;
        arcBoundary.lineWeight = 2;
        Engine.addEntities(arcBoundary);
        
        // 计算圆弧与直线的交点
        const arcIntersections = GeometryCalculator.ArcToLine(arc, arcBoundary);
        console.log(`圆弧与边界交点数: ${arcIntersections.length}`);
        
        arcIntersections.forEach((pt, i) => {
            console.log(`  交点${i + 1}: (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`);
            const marker = new CircleEnt([pt.x, pt.y], 2);
            marker.setDefaults();
            marker.color = 2;
            Engine.addEntities(marker);
        });
        
        // 圆弧裁剪原理：根据交点角度分割
        console.log("圆弧裁剪原理: 根据交点相对圆心的角度分割圆弧");
        
        // === 圆裁剪为圆弧演示 ===
        console.log("\n--- 圆裁剪为圆弧 ---");
        
        const circle = new CircleEnt([200, 140], 30);
        circle.setDefaults();
        circle.color = 8;
        circle.lineType = "HIDDEN";
        Engine.addEntities(circle);
        
        const circleBoundary = new LineEnt([185, 100], [185, 180]);
        circleBoundary.setDefaults();
        circleBoundary.color = 5;
        circleBoundary.lineWeight = 2;
        Engine.addEntities(circleBoundary);
        
        // 计算圆与直线的交点
        const circleIntersections = GeometryCalculator.CircleToLine(circle, circleBoundary);
        console.log(`圆与边界交点数: ${circleIntersections.length}`);
        
        if (circleIntersections.length === 2) {
            // 计算交点角度
            const center = circle.center;
            const angles = circleIntersections.map(pt => 
                Math.atan2(pt.y - center.y, pt.x - center.x)
            );
            
            // 裁剪后变成圆弧（保留右侧部分）
            const trimmedArc = new ArcEnt(center, circle.radius, angles[1], angles[0]);
            trimmedArc.setDefaults();
            trimmedArc.color = 3;
            trimmedArc.lineWeight = 2;
            Engine.addEntities(trimmedArc);
            
            console.log("圆裁剪后变为圆弧（绿色部分）");
        }
        
        // === 多实体裁剪演示 ===
        console.log("\n--- 裁剪算法步骤 ---");
        console.log("1. 选择裁剪边界");
        console.log("2. 选择要裁剪的实体和裁剪点");
        console.log("3. 计算实体与边界的所有交点");
        console.log("4. 根据裁剪点位置确定删除哪一段");
        console.log("5. 删除选中段，保留其他部分");
        
        // 标记交点
        allIntersections.forEach(pt => {
            const marker = new CircleEnt([pt.x, pt.y], 2);
            marker.setDefaults();
            marker.color = 2;
            Engine.addEntities(marker);
        });
        
        // 标记点击点
        const pickMarker = new CircleEnt([pickPoint.x, pickPoint.y], 3);
        pickMarker.setDefaults();
        pickMarker.color = 6;
        Engine.addEntities(pickMarker);
        console.log("\n黄色圆点: 交点, 青色圆点: 点击位置");
        
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
