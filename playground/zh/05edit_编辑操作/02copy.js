window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --复制实体--clone方法示例
        const { MainView, initCadContainer, CircleEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建原始图形（支持 [x, y] 数组形式）
        const original = new CircleEnt([30, 50], 20);
        original.setDefaults();
        original.color = 1;  // 红色
        Engine.addEntities(original);
        
        message.info("原始圆 - 圆心:", original.center.x, original.center.y);
        
        // 使用 clone() 复制实体
        const copy1 = original.clone();
        // 移动到新位置（支持 [x, y] 数组形式）
        copy1.move([0, 0], [60, 0]);
        copy1.color = 2;  // 黄色
        Engine.addEntities(copy1);
        
        const copy2 = original.clone();
        copy2.move([0, 0], [120, 0]);
        copy2.color = 3;  // 绿色
        Engine.addEntities(copy2);
        
        const copy3 = original.clone();
        copy3.move([0, 0], [180, 0]);
        copy3.color = 4;  // 青色
        Engine.addEntities(copy3);
        
        Engine.zoomExtents();
        
        message.info("复制1 - 圆心:", copy1.center.x, copy1.center.y);
        message.info("复制2 - 圆心:", copy2.center.x, copy2.center.y);
        message.info("复制3 - 圆心:", copy3.center.x, copy3.center.y);
        message.info("clone() 创建独立的副本，修改副本不影响原实体");
        
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
