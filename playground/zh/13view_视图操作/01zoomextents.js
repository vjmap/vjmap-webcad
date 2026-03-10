window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --缩放全图--zoomExtents用法
        const { MainView, initCadContainer, LineEnt, CircleEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 在不同位置创建实体（使用简化写法）
        const entities = [];
        
        // 左下角
        const line1 = new LineEnt([-100, -100], [-50, -50]);
        line1.setDefaults();
        line1.color = 1;
        entities.push(line1);
        
        // 右上角
        const circle1 = new CircleEnt([200, 150], 30);
        circle1.setDefaults();
        circle1.color = 3;
        entities.push(circle1);
        
        // 中心
        const circle2 = new CircleEnt([50, 25], 20);
        circle2.setDefaults();
        circle2.color = 5;
        entities.push(circle2);
        
        Engine.addEntities(entities);
        
        message.info("已创建分布在不同位置的实体");
        
        // zoomExtents - 缩放到显示所有实体
        Engine.zoomExtents();
        message.info("已执行 zoomExtents()");
        
        // 演示：先缩放到某个区域，然后再缩放回全图
        setTimeout(() => {
            message.info("\n2秒后放大到左下角区域...");
            // 使用 wcsBounds 参数指定缩放范围 [minX, minY, maxX, maxY]
            Engine.zoomExtents(undefined, {
                wcsBounds: [-120, -120, -30, -30]
            });
        }, 2000);
        
        setTimeout(() => {
            message.info("\n4秒后缩放回全图...");
            Engine.zoomExtents();
        }, 4000);
        
        message.info("\nzoomExtents() - 自动缩放以显示所有实体");
        
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
