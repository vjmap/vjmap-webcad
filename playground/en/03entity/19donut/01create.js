window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建圆环--Donut圆环实体示例
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
         * 创建圆环实体
         * @param {Point2D} center - 圆心
         * @param {number} innerRadius - 内半径
         * @param {number} outerRadius - 外半径
         * @returns {PolylineEnt} 圆环多段线
         */
        function createDonut(center, innerRadius, outerRadius) {
            const middleRadius = (innerRadius + outerRadius) / 2;
            const lineWidth = outerRadius - innerRadius;
            
            // 计算圆弧凸度
            const arcParam = (middleRadius * Math.sqrt(2)) / 2;
            const bulgeValue = (middleRadius - arcParam) / arcParam;
            
            const bulgePoints = new BulgePoints();
            
            // 四个点构成圆（每段90度弧）
            bulgePoints.add(new BulgePoint(new Point2D(center.x + middleRadius, center.y), bulgeValue));
            bulgePoints.add(new BulgePoint(new Point2D(center.x, center.y + middleRadius), bulgeValue));
            bulgePoints.add(new BulgePoint(new Point2D(center.x - middleRadius, center.y), bulgeValue));
            bulgePoints.add(new BulgePoint(new Point2D(center.x, center.y - middleRadius), bulgeValue));
            bulgePoints.add(new BulgePoint(new Point2D(center.x + middleRadius, center.y), 0)); // 闭合点
            
            const donut = new PolylineEnt(bulgePoints);
            donut.isClosed = false;
            donut.globalWidth = lineWidth;
            donut.setDefaults();
            
            return donut;
        }
        
        const entities = [];
        
        // 创建不同大小的圆环
        // 圆环1：实心圆（内半径为0）
        const donut1 = createDonut(new Point2D(0, 0), 0, 15);
        donut1.color = 1;
        entities.push(donut1);
        
        // 圆环2：细圆环
        const donut2 = createDonut(new Point2D(50, 0), 10, 15);
        donut2.color = 3;
        entities.push(donut2);
        
        // 圆环3：粗圆环
        const donut3 = createDonut(new Point2D(100, 0), 5, 20);
        donut3.color = 5;
        entities.push(donut3);
        
        // 圆环4：大圆环
        const donut4 = createDonut(new Point2D(160, 0), 15, 30);
        donut4.color = 4;
        entities.push(donut4);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("圆环已创建");
        console.log("圆环1：实心圆 inner=0, outer=15");
        console.log("圆环2：细圆环 inner=10, outer=15");
        console.log("圆环3：粗圆环 inner=5, outer=20");
        console.log("圆环4：大圆环 inner=15, outer=30");
        
        message.info("4种圆环：实心圆(红)、细环(绿)、粗环(蓝)、大环(青)");
        
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
