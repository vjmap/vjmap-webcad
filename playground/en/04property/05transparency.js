window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --透明度设置--transpMgr用法
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
        
        // 创建不同透明度的圆
        // 透明度范围：0-100（0=不透明，100=完全透明）
        
        const transparencies = [0, 25, 50, 75, 90];
        
        // 使用简化写法创建不同透明度的圆
        transparencies.forEach((tp, index) => {
            const circle = new CircleEnt([index * 40 + 30, 50], 25);
            circle.setDefaults();
            circle.color = 1;  // 红色
            circle.transpMgr.setTp100(tp);  // 设置透明度（0-100）
            Engine.addEntities(circle);
            
            message.info(`圆${index + 1}: 透明度 ${tp}%`);
        });
        
        // 演示随层透明度（使用简化写法）
        const byLayerCircle = new CircleEnt([250, 50], 25);
        byLayerCircle.setDefaults();
        byLayerCircle.color = 3;
        byLayerCircle.transpMgr.setValue(-1);  // 随层透明度
        Engine.addEntities(byLayerCircle);
        
        Engine.zoomExtents();
        
        message.info("透明度设置示例完成");
        
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
