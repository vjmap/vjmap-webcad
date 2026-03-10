window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建平行四边形--Parallelogram平行四边形示例
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
         * 创建平行四边形
         * @param {Point2D} p1 - 第一点
         * @param {Point2D} p2 - 第二点
         * @param {Point2D} p3 - 第三点
         * @returns {PolylineEnt} 平行四边形多段线
         */
        function createParallelogram(p1, p2, p3) {
            // 计算第四点（平行四边形的对角点）
            const offsetX = p3.x - p2.x;
            const offsetY = p3.y - p2.y;
            const p4 = new Point2D(p1.x + offsetX, p1.y + offsetY);
            
            const bulgePoints = new BulgePoints();
            bulgePoints.add(new BulgePoint(p1, 0));
            bulgePoints.add(new BulgePoint(p2, 0));
            bulgePoints.add(new BulgePoint(p3, 0));
            bulgePoints.add(new BulgePoint(p4, 0));
            
            const parallelogram = new PolylineEnt(bulgePoints);
            parallelogram.isClosed = true;
            parallelogram.setDefaults();
            
            return parallelogram;
        }
        
        const entities = [];
        
        // 平行四边形1：标准平行四边形
        const para1 = createParallelogram(
            new Point2D(0, 0),
            new Point2D(60, 0),
            new Point2D(80, 30)
        );
        para1.color = 1;
        entities.push(para1);
        
        // 平行四边形2：倾斜较大
        const para2 = createParallelogram(
            new Point2D(100, 0),
            new Point2D(160, 0),
            new Point2D(200, 40)
        );
        para2.color = 3;
        entities.push(para2);
        
        // 平行四边形3：菱形（特殊平行四边形）
        const para3 = createParallelogram(
            new Point2D(0, -60),
            new Point2D(30, -30),
            new Point2D(60, -60)
        );
        para3.color = 5;
        entities.push(para3);
        
        // 平行四边形4：高度较大
        const para4 = createParallelogram(
            new Point2D(100, -70),
            new Point2D(140, -70),
            new Point2D(150, -20)
        );
        para4.color = 4;
        entities.push(para4);
        
        // 矩形（特殊平行四边形）
        const rect = createParallelogram(
            new Point2D(180, -70),
            new Point2D(240, -70),
            new Point2D(240, -30)
        );
        rect.color = 6;
        entities.push(rect);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("平行四边形已创建");
        console.log("通过三点定义：P1->P2为一边，P2->P3为另一边");
        console.log("第四点自动计算：P4 = P1 + (P3 - P2)");
        
        message.info("平行四边形：标准型、倾斜型、菱形、高型、矩形");
        
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
