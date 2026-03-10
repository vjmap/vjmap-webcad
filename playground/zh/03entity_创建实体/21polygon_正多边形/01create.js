window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建正多边形--Polygon正多边形示例
        const { MainView, initCadContainer, PolylineEnt, BulgePoint, Point2D, Engine , message } = vjcad;
        
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
         * 创建正多边形
         * @param {Point2D} center - 中心点
         * @param {number} radius - 外接圆半径
         * @param {number} sides - 边数
         * @param {number} startAngle - 起始角度（弧度）
         * @returns {PolylineEnt} 正多边形多段线
         */
        function createRegularPolygon(center, radius, sides, startAngle = 0) {
            const polygon = new PolylineEnt();
            
            for (let i = 0; i < sides; i++) {
                const angle = startAngle + (2 * i * Math.PI) / sides;
                const x = center.x + radius * Math.cos(angle);
                const y = center.y + radius * Math.sin(angle);
                polygon.bulgePoints.add(new BulgePoint(new Point2D(x, y), 0));
            }
            
            polygon.isClosed = true;
            polygon.setDefaults();
            
            return polygon;
        }
        
        const entities = [];
        
        // 创建不同边数的正多边形
        // 三角形
        const triangle = createRegularPolygon(new Point2D(0, 0), 20, 3, -Math.PI / 2);
        triangle.color = 1;
        entities.push(triangle);
        
        // 正方形
        const square = createRegularPolygon(new Point2D(60, 0), 20, 4, Math.PI / 4);
        square.color = 2;
        entities.push(square);
        
        // 五边形
        const pentagon = createRegularPolygon(new Point2D(120, 0), 20, 5, -Math.PI / 2);
        pentagon.color = 3;
        entities.push(pentagon);
        
        // 六边形
        const hexagon = createRegularPolygon(new Point2D(180, 0), 20, 6, 0);
        hexagon.color = 4;
        entities.push(hexagon);
        
        // 八边形
        const octagon = createRegularPolygon(new Point2D(240, 0), 20, 8, Math.PI / 8);
        octagon.color = 5;
        entities.push(octagon);
        
        // 十二边形
        const dodecagon = createRegularPolygon(new Point2D(300, 0), 20, 12, 0);
        dodecagon.color = 6;
        entities.push(dodecagon);
        
        // 二十四边形（接近圆形）
        const polygon24 = createRegularPolygon(new Point2D(360, 0), 20, 24, 0);
        polygon24.color = 7;
        entities.push(polygon24);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("正多边形已创建");
        console.log("三角形(3边)、正方形(4边)、五边形(5边)");
        console.log("六边形(6边)、八边形(8边)、十二边形(12边)、二十四边形(24边)");
        
        message.info("正多边形：从三角形到近似圆的多边形");
        
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
