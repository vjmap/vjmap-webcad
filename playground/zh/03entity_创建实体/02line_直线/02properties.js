window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --直线属性--获取直线长度、角度、起终点
        const { MainView, initCadContainer, LineEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建直线（支持 [x, y] 数组形式）
        const line = new LineEnt([0, 0], [100, 50]);
        line.setDefaults();
        Engine.addEntities(line);
        
        // 获取直线属性
        message.info("=== 直线属性 ===");
        message.info("起点:", line.startPoint.x, line.startPoint.y);
        message.info("终点:", line.endPoint.x, line.endPoint.y);
        message.info("长度:", line.Length);
        
        // 计算角度（弧度转角度）
        const dx = line.endPoint.x - line.startPoint.x;
        const dy = line.endPoint.y - line.startPoint.y;
        const angleRad = Math.atan2(dy, dx);
        const angleDeg = angleRad * 180 / Math.PI;
        message.info("角度:", angleDeg.toFixed(2), "度");
        
        // 获取边界框
        const bbox = line.boundingBox();
        message.info("边界框 最小点:", bbox.pt1);
        message.info("边界框 最大点:", bbox.pt2);
        
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
