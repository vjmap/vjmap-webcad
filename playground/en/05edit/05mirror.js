window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --镜像实体--mirror方法示例
        const { MainView, initCadContainer, Point2D, PolylineEnt, LineEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建一个不对称图形（使用简化写法）
        const shape = new PolylineEnt();
        shape.addVertex([20, 20]);
        shape.addVertex([60, 20]);
        shape.addVertex([60, 60]);
        shape.addVertex([40, 80]);
        shape.addVertex([20, 60]);
        shape.isClosed = true;
        shape.setDefaults();
        shape.color = 1;  // 红色（原始）
        Engine.addEntities(shape);
        
        // 沿垂直线镜像（X=100）
        // mirror 方法需要 Point2D 对象作为参数
        const mirrorLine1P1 = new Point2D(100, 0);
        const mirrorLine1P2 = new Point2D(100, 100);
        
        const mirrored1 = shape.clone();
        mirrored1.mirror(mirrorLine1P1, mirrorLine1P2);
        mirrored1.color = 3;  // 绿色
        Engine.addEntities(mirrored1);
        
        // 绘制镜像线（使用简化写法）
        const mirrorLineVert = new LineEnt([100, 0], [100, 100]);
        mirrorLineVert.setDefaults();
        mirrorLineVert.color = 5;  // 蓝色
        mirrorLineVert.lineType = "CENTER";
        Engine.addEntities(mirrorLineVert);
        
        // 沿水平线镜像（Y=0）
        const mirrorLine2P1 = new Point2D(0, 0);
        const mirrorLine2P2 = new Point2D(200, 0);
        
        const mirrored2 = shape.clone();
        mirrored2.mirror(mirrorLine2P1, mirrorLine2P2);
        mirrored2.color = 4;  // 青色
        Engine.addEntities(mirrored2);
        
        // 绘制镜像线（使用简化写法）
        const mirrorLineHoriz = new LineEnt([0, 0], [200, 0]);
        mirrorLineHoriz.setDefaults();
        mirrorLineHoriz.color = 5;
        mirrorLineHoriz.lineType = "CENTER";
        Engine.addEntities(mirrorLineHoriz);
        
        Engine.zoomExtents();
        
        message.info("mirror(p1, p2) - 沿 p1-p2 定义的直线镜像");
        message.info("红色: 原始  绿色: 垂直镜像  青色: 水平镜像");
        
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
