window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建圆角矩形--Box圆角矩形示例
        const { MainView, initCadContainer, PolylineEnt, BulgePoints, BulgePoint, Point2D, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        /**
         * 创建圆角矩形
         * @param {Point2D} p1 - 第一个对角点
         * @param {Point2D} p2 - 第二个对角点
         * @param {number} cornerRadius - 圆角半径
         * @returns {PolylineEnt} 圆角矩形多段线
         */
        function createRoundedRectangle(p1, p2, cornerRadius = 0) {
            const minX = Math.min(p1.x, p2.x);
            const maxX = Math.max(p1.x, p2.x);
            const minY = Math.min(p1.y, p2.y);
            const maxY = Math.max(p1.y, p2.y);
            
            const width = maxX - minX;
            const height = maxY - minY;
            
            // 限制圆角半径不超过较短边的一半
            const maxRadius = Math.min(width, height) / 2;
            const r = Math.min(Math.max(cornerRadius, 0), maxRadius);
            
            const bulgePoints = new BulgePoints();
            
            if (r <= 0) {
                // 无圆角，普通矩形
                bulgePoints.add(new BulgePoint(new Point2D(minX, minY), 0));
                bulgePoints.add(new BulgePoint(new Point2D(maxX, minY), 0));
                bulgePoints.add(new BulgePoint(new Point2D(maxX, maxY), 0));
                bulgePoints.add(new BulgePoint(new Point2D(minX, maxY), 0));
            } else {
                // 90度圆弧的凸度值: tan(θ/4) = tan(22.5°) ≈ 0.41421356
                const bulge = Math.tan(Math.PI / 8);
                
                // 按逆时针方向创建圆角矩形的8个顶点
                bulgePoints.add(new BulgePoint(new Point2D(minX + r, minY), 0));      // 底边左端
                bulgePoints.add(new BulgePoint(new Point2D(maxX - r, minY), bulge));  // 底边右端 → 右下圆角
                bulgePoints.add(new BulgePoint(new Point2D(maxX, minY + r), 0));      // 右边下端
                bulgePoints.add(new BulgePoint(new Point2D(maxX, maxY - r), bulge));  // 右边上端 → 右上圆角
                bulgePoints.add(new BulgePoint(new Point2D(maxX - r, maxY), 0));      // 顶边右端
                bulgePoints.add(new BulgePoint(new Point2D(minX + r, maxY), bulge));  // 顶边左端 → 左上圆角
                bulgePoints.add(new BulgePoint(new Point2D(minX, maxY - r), 0));      // 左边上端
                bulgePoints.add(new BulgePoint(new Point2D(minX, minY + r), bulge));  // 左边下端 → 左下圆角
            }
            
            const polyline = new PolylineEnt(bulgePoints);
            polyline.isClosed = true;
            polyline.setDefaults();
            
            return polyline;
        }
        
        const entities = [];
        
        // 创建不同圆角半径的矩形
        // 矩形1：无圆角
        const rect1 = createRoundedRectangle(new Point2D(0, 0), new Point2D(40, 30), 0);
        rect1.color = 7;
        entities.push(rect1);
        
        // 矩形2：小圆角
        const rect2 = createRoundedRectangle(new Point2D(50, 0), new Point2D(90, 30), 3);
        rect2.color = 1;
        entities.push(rect2);
        
        // 矩形3：中等圆角
        const rect3 = createRoundedRectangle(new Point2D(100, 0), new Point2D(140, 30), 8);
        rect3.color = 3;
        entities.push(rect3);
        
        // 矩形4：大圆角（接近椭圆）
        const rect4 = createRoundedRectangle(new Point2D(150, 0), new Point2D(190, 30), 15);
        rect4.color = 5;
        entities.push(rect4);
        
        // 正方形带圆角
        const rect5 = createRoundedRectangle(new Point2D(0, -50), new Point2D(40, -10), 10);
        rect5.color = 4;
        entities.push(rect5);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("圆角矩形已创建");
        console.log("矩形1: 无圆角");
        console.log("矩形2: 圆角半径 3");
        console.log("矩形3: 圆角半径 8");
        console.log("矩形4: 圆角半径 15");
        console.log("正方形: 圆角半径 10");
        
        message.info("圆角矩形示例：从无圆角到大圆角的渐变效果");
        
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
