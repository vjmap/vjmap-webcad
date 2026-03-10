window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --旋转实体--rotate方法示例
        const { MainView, initCadContainer, Point2D, LineEnt, PolylineEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建一个矩形用于演示旋转（使用简化写法）
        function createRect(x, y, w, h) {
            const pline = new PolylineEnt();
            pline.addVertex([x, y]);
            pline.addVertex([x + w, y]);
            pline.addVertex([x + w, y + h]);
            pline.addVertex([x, y + h]);
            pline.isClosed = true;
            pline.setDefaults();
            return pline;
        }
        
        // 创建原始矩形
        const rect = createRect(40, 40, 40, 20);
        rect.color = 1;  // 红色
        Engine.addEntities(rect);
        
        // 复制并旋转不同角度
        // rotate 方法的基点参数需要 Point2D 对象
        const basePoint = new Point2D(60, 50);  // 旋转基点（矩形中心附近）
        
        // 旋转45度
        const rect45 = rect.clone();
        rect45.rotate(basePoint, Math.PI / 4);  // 45度
        rect45.color = 2;
        Engine.addEntities(rect45);
        
        // 旋转90度
        const rect90 = rect.clone();
        rect90.rotate(basePoint, Math.PI / 2);  // 90度
        rect90.color = 3;
        Engine.addEntities(rect90);
        
        // 旋转135度
        const rect135 = rect.clone();
        rect135.rotate(basePoint, Math.PI * 3 / 4);  // 135度
        rect135.color = 4;
        Engine.addEntities(rect135);
        
        // 绘制旋转基点标记（使用简化写法）
        const marker1 = new LineEnt([basePoint.x - 5, basePoint.y], [basePoint.x + 5, basePoint.y]);
        const marker2 = new LineEnt([basePoint.x, basePoint.y - 5], [basePoint.x, basePoint.y + 5]);
        marker1.setDefaults();
        marker2.setDefaults();
        marker1.color = 7;
        marker2.color = 7;
        Engine.addEntities([marker1, marker2]);
        
        Engine.zoomExtents();
        
        message.info("rotate(basePoint, angle) - 绕基点旋转指定角度（弧度）");
        message.info("红色: 原始  黄色: 45°  绿色: 90°  青色: 135°");
        
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
