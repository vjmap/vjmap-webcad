window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建射线--RayEnt基本创建示例
        const { MainView, initCadContainer, RayEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建射线
        // 射线由基点(basePoint)和角度(angle)定义
        // 从基点沿角度方向无限延伸
        
        // 水平射线（角度0）
        const ray1 = new RayEnt([0, 0], 0);
        ray1.setDefaults();
        ray1.color = 1; // 红色
        
        // 45度射线
        const ray2 = new RayEnt([0, 0], Math.PI / 4);
        ray2.setDefaults();
        ray2.color = 3; // 绿色
        
        // 90度射线（垂直向上）
        const ray3 = new RayEnt([0, 0], Math.PI / 2);
        ray3.setDefaults();
        ray3.color = 5; // 蓝色
        
        // 135度射线
        const ray4 = new RayEnt([0, 0], Math.PI * 3 / 4);
        ray4.setDefaults();
        ray4.color = 4; // 青色
        
        Engine.addEntities([ray1, ray2, ray3, ray4]);
        Engine.zoomExtents();
        
        console.log("射线已创建");
        console.log("射线1 - 基点:", ray1.basePoint, "角度:", ray1.angle, "(0度)");
        console.log("射线2 - 基点:", ray2.basePoint, "角度:", ray2.angle, "(45度)");
        console.log("射线3 - 基点:", ray3.basePoint, "角度:", ray3.angle, "(90度)");
        console.log("射线4 - 基点:", ray4.basePoint, "角度:", ray4.angle, "(135度)");
        console.log("射线方向向量:", ray1.vector);
        
        message.info("从原点发出4条不同角度的射线");
        
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
