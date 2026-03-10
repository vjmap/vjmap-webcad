window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --闭合样条曲线--创建首尾相连的样条曲线
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
        
        // 创建闭合样条曲线（首尾点相同即闭合）
        const spline = new SplineEnt();
        
        // 创建一个类似花瓣的闭合形状
        const centerX = 50, centerY = 50;
        const radius = 40;
        const points = [];
        
        // 生成花瓣形控制点
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const r = (i % 2 === 0) ? radius : radius * 0.5;
            points.push([
                centerX + Math.cos(angle) * r,
                centerY + Math.sin(angle) * r
            ]);
        }
        // 闭合：添加起点作为终点
        points.push(points[0].slice());
        
        spline.setControlPoints(points);
        spline.setDefaults();
        spline.color = 3; // 绿色
        
        Engine.addEntities(spline);
        Engine.zoomExtents();
        
        console.log("闭合样条曲线已创建");
        console.log("是否闭合:", spline.isClosed);
        console.log("控制点数量:", spline.numberOfControlPoints);
        console.log("起点:", spline.startPoint);
        console.log("终点:", spline.endPoint);
        
        message.info("闭合样条曲线已创建");
        
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
