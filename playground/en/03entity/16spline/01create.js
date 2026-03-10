window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建样条曲线--SplineEnt基本创建示例
        const { MainView, initCadContainer, SplineEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建样条曲线
        const spline = new SplineEnt();
        
        // 使用简化接口设置控制点
        // 格式: [x, y] 或 [[x, y], weight]
        spline.setControlPoints([
            [0, 0],
            [30, 50],
            [60, 20],
            [90, 60],
            [120, 30],
            [150, 50]
        ]);
        
        spline.setDefaults();
        Engine.addEntities(spline);
        Engine.zoomExtents();
        
        // 输出详细信息到控制台
        console.log("样条曲线已创建");
        console.log("控制点数量:", spline.numberOfControlPoints);
        console.log("控制点坐标:", spline.getControlPoints());
        console.log("次数(degree):", spline.degree);
        console.log("是否闭合:", spline.isClosed);
        console.log("曲线长度:", spline.length);
        
        message.info("样条曲线已创建，控制点数: " + spline.numberOfControlPoints);
        
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
