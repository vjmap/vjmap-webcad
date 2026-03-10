window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --切换当前图层--Engine.setCurrentLayer用法
        const { MainView, initCadContainer, LineEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 确保图层存在
        Engine.createLayer("图层A", { color: 1 });
        Engine.createLayer("图层B", { color: 3 });
        
        // 获取当前图层
        message.info("当前图层:", Engine.getCurrentLayer());
        
        // 切换到图层A
        Engine.setCurrentLayer("图层A");
        message.info("切换后当前图层:", Engine.getCurrentLayer());
        
        // 创建实体（会自动使用当前图层，使用简化写法）
        const line1 = new LineEnt([0, 0], [100, 0]);
        line1.setDefaults();  // 会应用当前图层
        Engine.addEntities(line1);
        message.info("line1 所在图层:", line1.layer);
        
        // 切换到图层B
        Engine.setCurrentLayer("图层B");
        message.info("切换后当前图层:", Engine.getCurrentLayer());
        
        const line2 = new LineEnt([0, 30], [100, 30]);
        line2.setDefaults();
        Engine.addEntities(line2);
        message.info("line2 所在图层:", line2.layer);
        
        // 也可以通过 Engine.currentDoc.CLAYER 访问当前图层名称
        message.info("currentDoc.CLAYER:", Engine.currentDoc.CLAYER);
        
        Engine.zoomExtents();
        
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
