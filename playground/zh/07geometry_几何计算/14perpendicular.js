window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --垂足计算--点到直线的垂足
        const { MainView, initCadContainer, Point2D, LineEnt, CircleEnt, Engine, distance, isEqual , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        console.log("=== 垂足计算 ===");
        console.log("计算点到直线的垂足（最近点）\n");
        
        // 垂足计算函数
        function calculatePerpendicularPoint(lineStart, lineEnd, point) {
            const tolerance = 1e-6;
            
            // 检查是否为垂直线
            if (isEqual(lineStart.x, lineEnd.x, tolerance)) {
                return new Point2D(lineStart.x, point.y);
            }
            
            // 检查是否为水平线
            if (isEqual(lineStart.y, lineEnd.y, tolerance)) {
                return new Point2D(point.x, lineStart.y);
            }
            
            // 一般情况：使用向量投影
            const lineVectorX = lineEnd.x - lineStart.x;
            const lineVectorY = lineEnd.y - lineStart.y;
            const lineSlope = lineVectorY / lineVectorX;
            
            // 垂线斜率
            const perpSlope = -1 / lineSlope;
            
            // 直线方程: y = lineSlope * x + lineIntercept
            const lineIntercept = lineStart.y - lineSlope * lineStart.x;
            
            // 垂线方程: y = perpSlope * x + perpIntercept
            const perpIntercept = point.y - perpSlope * point.x;
            
            // 交点
            const intersectionX = (perpIntercept - lineIntercept) / (lineSlope - perpSlope);
            const intersectionY = lineSlope * intersectionX + lineIntercept;
            
            return new Point2D(intersectionX, intersectionY);
        }
        
        // 向量投影法计算垂足
        function perpendicularByProjection(lineStart, lineEnd, point) {
            // 向量 AB
            const ABx = lineEnd.x - lineStart.x;
            const ABy = lineEnd.y - lineStart.y;
            
            // 向量 AP
            const APx = point.x - lineStart.x;
            const APy = point.y - lineStart.y;
            
            // AB · AP
            const dotProduct = ABx * APx + ABy * APy;
            
            // |AB|²
            const lengthSq = ABx * ABx + ABy * ABy;
            
            // 投影比例
            const t = dotProduct / lengthSq;
            
            // 垂足点
            return new Point2D(
                lineStart.x + t * ABx,
                lineStart.y + t * ABy
            );
        }
        
        // === 示例1：普通斜线 ===
        console.log("--- 普通斜线的垂足 ---");
        
        const line1 = new LineEnt([20, 30], [150, 100]);
        line1.setDefaults();
        line1.color = 7;
        Engine.addEntities(line1);
        
        const point1 = new Point2D(100, 30);
        const perp1 = calculatePerpendicularPoint(line1.startPoint, line1.endPoint, point1);
        
        // 标记点和垂足
        const marker1 = new CircleEnt([point1.x, point1.y], 3);
        marker1.setDefaults();
        marker1.color = 1;
        Engine.addEntities(marker1);
        
        const perpMarker1 = new CircleEnt([perp1.x, perp1.y], 3);
        perpMarker1.setDefaults();
        perpMarker1.color = 3;
        Engine.addEntities(perpMarker1);
        
        // 绘制垂线
        const perpLine1 = new LineEnt([point1.x, point1.y], [perp1.x, perp1.y]);
        perpLine1.setDefaults();
        perpLine1.color = 5;
        perpLine1.lineType = "DASHED";
        Engine.addEntities(perpLine1);
        
        const dist1 = distance(point1, perp1);
        console.log(`点 (100, 30) 到直线的垂足: (${perp1.x.toFixed(2)}, ${perp1.y.toFixed(2)})`);
        console.log(`距离: ${dist1.toFixed(2)}`);
        
        // === 示例2：水平线 ===
        console.log("\n--- 水平线的垂足 ---");
        
        const line2 = new LineEnt([20, 140], [150, 140]);
        line2.setDefaults();
        line2.color = 7;
        Engine.addEntities(line2);
        
        const point2 = new Point2D(80, 180);
        const perp2 = calculatePerpendicularPoint(line2.startPoint, line2.endPoint, point2);
        
        const marker2 = new CircleEnt([point2.x, point2.y], 3);
        marker2.setDefaults();
        marker2.color = 1;
        Engine.addEntities(marker2);
        
        const perpMarker2 = new CircleEnt([perp2.x, perp2.y], 3);
        perpMarker2.setDefaults();
        perpMarker2.color = 3;
        Engine.addEntities(perpMarker2);
        
        const perpLine2 = new LineEnt([point2.x, point2.y], [perp2.x, perp2.y]);
        perpLine2.setDefaults();
        perpLine2.color = 5;
        perpLine2.lineType = "DASHED";
        Engine.addEntities(perpLine2);
        
        console.log(`点 (80, 180) 到水平线的垂足: (${perp2.x.toFixed(2)}, ${perp2.y.toFixed(2)})`);
        
        // === 示例3：垂直线 ===
        console.log("\n--- 垂直线的垂足 ---");
        
        const line3 = new LineEnt([200, 30], [200, 150]);
        line3.setDefaults();
        line3.color = 7;
        Engine.addEntities(line3);
        
        const point3 = new Point2D(250, 90);
        const perp3 = calculatePerpendicularPoint(line3.startPoint, line3.endPoint, point3);
        
        const marker3 = new CircleEnt([point3.x, point3.y], 3);
        marker3.setDefaults();
        marker3.color = 1;
        Engine.addEntities(marker3);
        
        const perpMarker3 = new CircleEnt([perp3.x, perp3.y], 3);
        perpMarker3.setDefaults();
        perpMarker3.color = 3;
        Engine.addEntities(perpMarker3);
        
        const perpLine3 = new LineEnt([point3.x, point3.y], [perp3.x, perp3.y]);
        perpLine3.setDefaults();
        perpLine3.color = 5;
        perpLine3.lineType = "DASHED";
        Engine.addEntities(perpLine3);
        
        console.log(`点 (250, 90) 到垂直线的垂足: (${perp3.x.toFixed(2)}, ${perp3.y.toFixed(2)})`);
        
        // === 示例4：多点的垂足 ===
        console.log("\n--- 多点到同一直线的垂足 ---");
        
        const baseLine = new LineEnt([270, 50], [350, 130]);
        baseLine.setDefaults();
        baseLine.color = 7;
        baseLine.lineWeight = 2;
        Engine.addEntities(baseLine);
        
        const testPoints = [
            new Point2D(280, 110),
            new Point2D(330, 70),
            new Point2D(310, 130),
        ];
        
        testPoints.forEach((pt, i) => {
            const perp = perpendicularByProjection(baseLine.startPoint, baseLine.endPoint, pt);
            
            // 标记点
            const ptMarker = new CircleEnt([pt.x, pt.y], 2);
            ptMarker.setDefaults();
            ptMarker.color = 1;
            Engine.addEntities(ptMarker);
            
            // 标记垂足
            const perpPtMarker = new CircleEnt([perp.x, perp.y], 2);
            perpPtMarker.setDefaults();
            perpPtMarker.color = 3;
            Engine.addEntities(perpPtMarker);
            
            // 绘制垂线
            const perpLine = new LineEnt([pt.x, pt.y], [perp.x, perp.y]);
            perpLine.setDefaults();
            perpLine.color = 8;
            perpLine.lineType = "DOT";
            Engine.addEntities(perpLine);
            
            const dist = distance(pt, perp);
            console.log(`点${i + 1} 距离: ${dist.toFixed(2)}`);
        });
        
        // === 算法说明 ===
        console.log("\n=== 垂足计算算法 ===");
        console.log("方法1: 斜率法");
        console.log("  - 计算直线斜率 k");
        console.log("  - 垂线斜率 = -1/k");
        console.log("  - 求两直线交点");
        console.log("\n方法2: 向量投影法");
        console.log("  - 向量 AB = B - A");
        console.log("  - 向量 AP = P - A");
        console.log("  - t = (AB · AP) / |AB|²");
        console.log("  - 垂足 = A + t * AB");
        
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
