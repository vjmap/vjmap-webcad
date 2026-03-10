window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建构造线--XLineEnt基本创建示例
        const { MainView, initCadContainer, XLineEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建构造线（无限长直线）
        // 构造线由基点(basePoint)和角度(angle)定义
        // 从基点向两侧无限延伸
        
        // 水平构造线
        const xline1 = new XLineEnt([50, 0], 0);
        xline1.setDefaults();
        xline1.color = 1; // 红色
        
        // 垂直构造线
        const xline2 = new XLineEnt([50, 0], Math.PI / 2);
        xline2.setDefaults();
        xline2.color = 3; // 绿色
        
        // 45度构造线
        const xline3 = new XLineEnt([50, 0], Math.PI / 4);
        xline3.setDefaults();
        xline3.color = 5; // 蓝色
        
        // -45度构造线
        const xline4 = new XLineEnt([50, 0], -Math.PI / 4);
        xline4.setDefaults();
        xline4.color = 4; // 青色
        
        Engine.addEntities([xline1, xline2, xline3, xline4]);
        Engine.zoomExtents();
        
        console.log("构造线已创建");
        console.log("构造线1 - 基点:", xline1.basePoint, "角度:", xline1.angle, "(水平)");
        console.log("构造线2 - 基点:", xline2.basePoint, "角度:", xline2.angle, "(垂直)");
        console.log("构造线3 - 角度:", (xline3.angle * 180 / Math.PI).toFixed(1) + "度");
        console.log("方向向量:", xline1.vector);
        console.log("远端点1:", xline1.farPoint1);
        console.log("远端点2:", xline1.farPoint2);
        
        message.info("从同一点发出4条不同角度的构造线（双向无限延伸）");
        
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
