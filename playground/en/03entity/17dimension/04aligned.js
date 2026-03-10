window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --对齐标注--AlignedDimensionEnt测量倾斜距离
        const { MainView, initCadContainer, AlignedDimensionEnt, LineEnt, PolylineEnt, Point2D, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        const entities = [];
        
        // 创建一个多边形
        const polygon = new PolylineEnt();
        polygon.setPoints([
            [0, 0],
            [80, 30],
            [120, 80],
            [50, 100],
            [0, 60]
        ]);
        polygon.isClosed = true;
        polygon.setDefaults();
        polygon.color = 7;
        entities.push(polygon);
        
        // 获取多边形顶点
        const points = polygon.getPoints();
        
        // 为每条边添加对齐标注
        const colors = [1, 3, 5, 4, 6];
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            
            // 计算标注偏移位置（向外偏移）
            const midX = (p1[0] + p2[0]) / 2;
            const midY = (p1[1] + p2[1]) / 2;
            
            // 计算法线方向（向外）
            const dx = p2[0] - p1[0];
            const dy = p2[1] - p1[1];
            const len = Math.sqrt(dx * dx + dy * dy);
            const nx = -dy / len; // 法线
            const ny = dx / len;
            
            // 判断法线方向是否朝外（简单使用向量到中心的点积）
            const centerX = 54, centerY = 54; // 多边形大致中心
            const toCenter = { x: centerX - midX, y: centerY - midY };
            const dot = nx * toCenter.x + ny * toCenter.y;
            const sign = dot < 0 ? 1 : -1;
            
            const offsetDist = 15;
            const thirdPoint = new Point2D(
                midX + sign * nx * offsetDist,
                midY + sign * ny * offsetDist
            );
            
            // 创建对齐标注
            const dim = new AlignedDimensionEnt(
                new Point2D(p1[0], p1[1]),
                new Point2D(p2[0], p2[1]),
                thirdPoint
            );
            dim.setDefaults();
            dim.color = colors[i % colors.length];
            entities.push(dim);
            
            console.log(`边${i + 1}长度:`, dim.getMeasurement().toFixed(2));
        }
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("对齐标注用于测量倾斜线段的实际长度");
        
        message.info("对齐标注：测量多边形各边的实际长度");
        
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
