window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --面积计算--calculatePolygonArea用法
        const { MainView, initCadContainer, Point2D, PolylineEnt, CircleEnt, ArcEnt, Engine, calculatePolygonArea, MLeaderEnt, MLeaderContentType , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        console.log("=== 面积计算 ===");
        console.log("使用鞋带公式（Shoelace formula）计算多边形面积\n");
        
        // === 示例1：矩形面积 ===
        console.log("--- 矩形面积 ---");
        const rectPoints = [
            new Point2D(0, 0),
            new Point2D(40, 0),
            new Point2D(40, 30),
            new Point2D(0, 30),
        ];
        
        const rectPline = new PolylineEnt();
        rectPoints.forEach(pt => rectPline.addVertex([pt.x, pt.y]));
        rectPline.isClosed = true;
        rectPline.setDefaults();
        rectPline.color = 1;
        Engine.addEntities(rectPline);
        
        const rectDoubleArea = calculatePolygonArea(rectPoints);
        const rectArea = Math.abs(rectDoubleArea) / 2;
        console.log(`矩形: 40 × 30 = ${rectArea} 平方单位`);
        
        // 添加面积引线标注
        const rectLeader = new MLeaderEnt();
        rectLeader.contentType = MLeaderContentType.MText;
        rectLeader.textContent = `S=${rectArea}`;
        rectLeader.textHeight = 4;
        rectLeader.textPosition = new Point2D(55, 25);
        rectLeader.addLeaderLine(new Point2D(20, 15)); // 箭头指向矩形内部
        rectLeader.setDefaults();
        rectLeader.color = 1;
        Engine.addEntities(rectLeader);
        
        // === 示例2：三角形面积 ===
        console.log("\n--- 三角形面积 ---");
        const triPoints = [
            new Point2D(60, 0),
            new Point2D(100, 0),
            new Point2D(80, 35),
        ];
        
        const triPline = new PolylineEnt();
        triPoints.forEach(pt => triPline.addVertex([pt.x, pt.y]));
        triPline.isClosed = true;
        triPline.setDefaults();
        triPline.color = 3;
        Engine.addEntities(triPline);
        
        const triDoubleArea = calculatePolygonArea(triPoints);
        const triArea = Math.abs(triDoubleArea) / 2;
        console.log(`三角形: 底=40, 高=35`);
        console.log(`公式面积: 40×35/2 = 700`);
        console.log(`鞋带公式计算: ${triArea} 平方单位`);
        
        // 添加面积引线标注
        const triLeader = new MLeaderEnt();
        triLeader.contentType = MLeaderContentType.MText;
        triLeader.textContent = `S=${triArea}`;
        triLeader.textHeight = 4;
        triLeader.textPosition = new Point2D(115, 25);
        triLeader.addLeaderLine(new Point2D(80, 12)); // 箭头指向三角形内部
        triLeader.setDefaults();
        triLeader.color = 3;
        Engine.addEntities(triLeader);
        
        // === 示例3：不规则多边形面积 ===
        console.log("\n--- 不规则多边形面积 ---");
        const irregularPoints = [
            new Point2D(120, 10),
            new Point2D(160, 5),
            new Point2D(180, 25),
            new Point2D(170, 50),
            new Point2D(140, 45),
            new Point2D(125, 30),
        ];
        
        const irregularPline = new PolylineEnt();
        irregularPoints.forEach(pt => irregularPline.addVertex([pt.x, pt.y]));
        irregularPline.isClosed = true;
        irregularPline.setDefaults();
        irregularPline.color = 4;
        Engine.addEntities(irregularPline);
        
        const irregularDoubleArea = calculatePolygonArea(irregularPoints);
        const irregularArea = Math.abs(irregularDoubleArea) / 2;
        console.log(`不规则六边形面积: ${irregularArea.toFixed(2)} 平方单位`);
        
        // 添加面积引线标注
        const irregularLeader = new MLeaderEnt();
        irregularLeader.contentType = MLeaderContentType.MText;
        irregularLeader.textContent = `S=${irregularArea.toFixed(1)}`;
        irregularLeader.textHeight = 4;
        irregularLeader.textPosition = new Point2D(195, 45);
        irregularLeader.addLeaderLine(new Point2D(150, 27)); // 箭头指向多边形内部
        irregularLeader.setDefaults();
        irregularLeader.color = 4;
        Engine.addEntities(irregularLeader);
        
        // === 示例4：圆的面积（使用 CircleEnt.area 属性）===
        console.log("\n--- 圆的面积 ---");
        const circle = new CircleEnt([50, 80], 20);
        circle.setDefaults();
        circle.color = 5;
        Engine.addEntities(circle);
        
        console.log(`圆: 半径=20`);
        console.log(`公式面积: π×r² = ${(Math.PI * 20 * 20).toFixed(2)}`);
        console.log(`CircleEnt.area: ${circle.area.toFixed(2)} 平方单位`);
        
        // 添加面积引线标注
        const circleLeader = new MLeaderEnt();
        circleLeader.contentType = MLeaderContentType.MText;
        circleLeader.textContent = `S=${circle.area.toFixed(1)}`;
        circleLeader.textHeight = 4;
        circleLeader.textPosition = new Point2D(90, 90);
        circleLeader.addLeaderLine(new Point2D(60, 85)); // 箭头指向圆内部
        circleLeader.setDefaults();
        circleLeader.color = 5;
        Engine.addEntities(circleLeader);
        
        // === 示例5：圆弧扇形面积 ===
        console.log("\n--- 圆弧扇形面积 ---");
        const arc = new ArcEnt([130, 80], 25, 0, Math.PI / 2);
        arc.setDefaults();
        arc.color = 6;
        Engine.addEntities(arc);
        
        // 计算扇形面积
        const arcRadius = 25;
        const arcAngle = Math.PI / 2; // 90度
        const sectorArea = (arcAngle / (2 * Math.PI)) * Math.PI * arcRadius * arcRadius;
        console.log(`圆弧: 半径=25, 角度=90°`);
        console.log(`扇形面积: ${sectorArea.toFixed(2)} 平方单位`);
        
        // 添加面积引线标注
        const arcLeader = new MLeaderEnt();
        arcLeader.contentType = MLeaderContentType.MText;
        arcLeader.textContent = `S=${sectorArea.toFixed(1)}`;
        arcLeader.textHeight = 4;
        arcLeader.textPosition = new Point2D(175, 95);
        arcLeader.addLeaderLine(new Point2D(145, 90)); // 箭头指向扇形区域
        arcLeader.setDefaults();
        arcLeader.color = 6;
        Engine.addEntities(arcLeader);
        
        // === 鞋带公式原理说明 ===
        console.log("\n=== 鞋带公式原理 ===");
        console.log("面积 = ½ × |Σ(xi × (yi+1 - yi-1))|");
        console.log("或者: 面积 = ½ × |Σ(xi×yi+1 - xi+1×yi)|");
        console.log("顶点需按顺序（顺时针或逆时针）排列");
        
        // === 示例6：验证顺序影响 ===
        console.log("\n--- 顶点顺序影响 ---");
        const cwPoints = [
            new Point2D(0, -30),
            new Point2D(0, -60),
            new Point2D(40, -60),
            new Point2D(40, -30),
        ];
        const ccwPoints = [...cwPoints].reverse();
        
        const cwArea = calculatePolygonArea(cwPoints);
        const ccwArea = calculatePolygonArea(ccwPoints);
        
        console.log(`顺时针面积: ${cwArea} (负值表示顺时针)`);
        console.log(`逆时针面积: ${ccwArea} (正值表示逆时针)`);
        console.log(`实际面积取绝对值: ${Math.abs(cwArea) / 2}`);
        
        const demoPline = new PolylineEnt();
        cwPoints.forEach(pt => demoPline.addVertex([pt.x, pt.y]));
        demoPline.isClosed = true;
        demoPline.setDefaults();
        demoPline.color = 2;
        Engine.addEntities(demoPline);
        
        // 添加面积引线标注
        const cwLeader = new MLeaderEnt();
        cwLeader.contentType = MLeaderContentType.MText;
        cwLeader.textContent = `S=${Math.abs(cwArea) / 2}`;
        cwLeader.textHeight = 4;
        cwLeader.textPosition = new Point2D(60, -35);
        cwLeader.addLeaderLine(new Point2D(20, -45)); // 箭头指向矩形内部
        cwLeader.setDefaults();
        cwLeader.color = 2;
        Engine.addEntities(cwLeader);
        
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
