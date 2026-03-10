window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建圆弧--ArcEnt基本创建示例
        const { MainView, initCadContainer, ArcEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建圆弧实体
        // ArcEnt 构造函数：圆心、半径、起始角度(弧度)、终止角度(弧度)
        // 支持 [x, y] 数组形式
        const arc = new ArcEnt([50, 50], 30, 0, Math.PI / 2);
        
        // 应用系统默认属性
        arc.setDefaults();
        
        // 添加到画布
        Engine.addEntities(arc);
        
        // 缩放到图形范围
        Engine.zoomExtents();
        
        message.info("圆弧已创建");
        message.info("圆心:", arc.center);
        message.info("半径:", arc.radius);
        message.info("起始角度:", arc.startAng * 180 / Math.PI, "度");
        message.info("终止角度:", arc.endAng * 180 / Math.PI, "度");
        
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
