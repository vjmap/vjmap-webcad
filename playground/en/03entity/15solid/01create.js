window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建实体填充--SolidEnt基本创建示例
        const { MainView, initCadContainer, SolidEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建实体填充（三角形，3点定义）
        // SolidEnt由4个点定义，如果只需要三角形，第4点设为第3点
        const triangle = new SolidEnt(
            [0, 0],      // point1
            [60, 0],     // point2
            [30, 50]     // point3（三角形只需3点）
        );
        triangle.setDefaults();
        triangle.color = 1; // 红色
        
        // 创建实体填充（四边形，4点定义）
        const quad = new SolidEnt(
            [80, 0],     // point1
            [140, 0],    // point2
            [150, 50],   // point3
            [70, 40]     // point4
        );
        quad.setDefaults();
        quad.color = 3; // 绿色
        
        // 创建平行四边形
        const parallelogram = new SolidEnt(
            [160, 0],    // point1
            [220, 0],    // point2
            [240, 50],   // point3
            [180, 50]    // point4
        );
        parallelogram.setDefaults();
        parallelogram.color = 5; // 蓝色
        
        Engine.addEntities([triangle, quad, parallelogram]);
        Engine.zoomExtents();
        
        console.log("实体填充已创建");
        console.log("三角形顶点:", triangle.getPoints());
        console.log("四边形顶点:", quad.getPoints());
        console.log("平行四边形顶点:", parallelogram.getPoints());
        
        message.info("实体填充：红=三角形, 绿=四边形, 蓝=平行四边形");
        
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
