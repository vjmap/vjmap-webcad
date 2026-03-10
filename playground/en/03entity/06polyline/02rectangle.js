window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --绘制矩形--使用简化接口创建闭合多段线
        const { MainView, initCadContainer, PolylineEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 绘制矩形（闭合多段线）- 使用简化接口
        function drawRectangle(x, y, width, height) {
            const pline = new PolylineEnt();
            
            // 使用 setPoints 简化接口添加四个顶点
            pline.setPoints([
                [x, y],                      // 左下
                [x + width, y],              // 右下
                [x + width, y + height],     // 右上
                [x, y + height]              // 左上
            ]);
            
            // 设置为闭合
            pline.isClosed = true;
            pline.setDefaults();
            
            return pline;
        }
        
        // 创建矩形
        const rect = drawRectangle(10, 10, 100, 60);
        Engine.addEntities(rect);
        Engine.zoomExtents();
        
        message.info("矩形已创建");
        message.info("是否闭合:", rect.isClosed);
        message.info("周长:", rect.length);
        message.info("面积:", rect.area);
        
        // 获取顶点信息
        message.info("顶点坐标:", rect.getPoints());
        
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
