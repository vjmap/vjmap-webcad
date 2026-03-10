window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --图层可见性--layerOn属性控制图层开关
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
        
        const doc = Engine.currentDoc;
        
        // 创建测试图层
        Engine.createLayer("可见图层", { color: 1 });
        Engine.createLayer("关闭图层", { color: 3 });
        
        // 在各图层创建实体
        const line1 = new LineEnt([0, 0], [100, 0]);
        line1.setDefaults();
        line1.layer = "可见图层";
        Engine.addEntities(line1);
        
        const line2 = new LineEnt([0, 30], [100, 30]);
        line2.setDefaults();
        line2.layer = "关闭图层";
        Engine.addEntities(line2);
        
        // 关闭图层
        const closedLayer = Engine.getLayerByName("关闭图层");
        if (closedLayer) {
            closedLayer.layerOn = false;
            Engine.regen(true);
        }
        
        // 图层可见性说明
        message.info("=== 图层可见性 (layerOn) ===");
        message.info("layerOn: true/false - 控制图层是否显示");
        message.info("关闭的图层: 不可见，但仍参与重生成");
        message.info("");
        
        // 获取图层并显示状态
        const layers = Engine.getLayers();
        layers.forEach(layer => {
            if (layer.name !== "0" && layer.name !== "Defpoints") {
                message.info(`${layer.name}: layerOn=${layer.layerOn}`);
            }
        });
        
        // 切换图层可见性
        setTimeout(() => {
            const layer = Engine.getLayerByName("关闭图层");
            if (layer) {
                layer.layerOn = true;  // 打开图层
                Engine.regen(true); // 图层的操作必须全部重新渲染
                message.info("2秒后: 关闭图层已打开，绿色线条可见了");
            }
        }, 2000);
        
        message.info("");
        message.info("提示: 另见 06frozen.js 和 07locked.js 了解冻结和锁定功能");
        
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
