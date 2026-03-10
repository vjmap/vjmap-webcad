window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --获取图层列表--Engine.getLayers用法
        const { MainView, initCadContainer, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建一些测试图层
        Engine.createLayer("建筑层", { color: 1 });
        Engine.createLayer("标注层", { color: 2 });
        Engine.createLayer("辅助层", { color: 3 });
        
        // 获取所有图层
        const layers = Engine.getLayers();
        
        message.info("=== 所有图层 ===");
        message.info("图层总数:", layers.length);
        
        layers.forEach((layer, index) => {
            console.log(`${index + 1}. ${layer.name}`);
            console.log(`   颜色: ${layer.color}`);
            console.log(`   线型: ${layer.lineType}`);
            console.log(`   可见: ${layer.layerOn}`);
            console.log(`   冻结: ${layer.frozen}`);
        });
        
        // 根据名称获取图层
        const targetLayer = Engine.getLayerByName("标注层");
        if (targetLayer) {
            message.info("查找到图层: " + targetLayer.name + ", 颜色: " + targetLayer.color);
        }
        
        // 检查图层是否存在（使用 itemByName 方法）
        const doc = Engine.currentDoc;
        const hasBuilding = !!doc.layers.itemByName("建筑层");
        const hasNotExist = !!doc.layers.itemByName("不存在的层");
        message.info("建筑层存在:", hasBuilding, "| 不存在的层存在:", hasNotExist);
        
        // 获取当前图层
        message.info("当前图层:", Engine.getCurrentLayer());
        
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
