window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建多段线--简化接口用法
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
        
        // 创建多段线实体
        const pline = new PolylineEnt();
        
        // 方式1: 批量设置点 - 推荐
        // setPoints([[x, y], ...]) 或 setPoints([[[x, y], bulge], ...])
        pline.setPoints([
            [0, 0],
            [100, 0],
            [100, 50],
            [50, 80],
            [0, 50]
        ]);
        
        // 方式2: 逐个添加点（支持链式调用）
        // pline.addPoint([0, 0])
        //      .addPoint([100, 0])
        //      .addPoint([100, 50], -0.5);  // 第二参数是凸度
        
        // 方式3: 批量追加点
        // pline.addPoints([[0, 0], [100, 0], [[100, 50], -0.5]]);
        
        // 应用系统默认属性
        pline.setDefaults();
        
        // 添加到画布
        Engine.addEntities(pline);
        Engine.zoomExtents();
        
        message.info("多段线已创建");
        message.info("顶点数:", pline.bulgePoints.length);
        message.info("长度:", pline.length);
        
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
