window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --带圆弧多段线--使用简化接口设置凸度参数
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
        
        // 创建带圆弧的多段线
        // 凸度(bulge)表示弧段的弯曲程度：
        // - 0: 直线段
        // - 正值: 逆时针弧段
        // - 负值: 顺时针弧段
        // - 1: 半圆弧（逆时针）
        // - -1: 半圆弧（顺时针）
        // bulge = tan(圆心角/4)
        
        const pline = new PolylineEnt();
        
        // 使用简化接口设置点
        // 格式: [x, y] 表示直线段，[[x, y], bulge] 表示带凸度的弧段
        pline.setPoints([
            [0, 0],              // 起点，直线到下一点
            [[50, 0], 0.5],      // 弧段起点，凸度0.5（逆时针弧）
            [100, 0],            // 弧段终点，直线到下一点
            [[100, 50], -0.5],   // 弧段起点，负凸度（顺时针弧）
            [100, 100]           // 终点
        ]);
        
        pline.setDefaults();
        Engine.addEntities(pline);
        Engine.zoomExtents();
        
        message.info("带圆弧的多段线已创建");
        message.info("顶点数:", pline.bulgePoints.length);
        message.info("总长度:", pline.length);
        
        // 使用简化接口获取点信息
        message.info("所有顶点（含凸度）:", pline.getPointsWithBulge());
        
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
