window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建图层--Engine.createLayer用法
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
        
        // 创建图层方法1：使用 Engine.createLayer
        const layer1 = Engine.createLayer("标注层", {
            color: 1,           // 红色
            lineType: "CONTINUOUS",
            layerOn: true,      // 是否显示
            isFrozen: false,    // 是否冻结
            isLocked: false     // 是否锁定
        });
        
        // 创建图层方法2：直接使用 doc.layers.addlayer
        if (!doc.layers.itemByName("辅助线层")) {
            doc.layers.addlayer("辅助线层", true, 3);  // 参数：名称, 是否显示, 颜色(绿色)
        }
        
        // 创建自动命名的图层
        const autoLayer = Engine.createLayer();  // 自动命名为 "图层1", "图层2" 等
        
        message.info("=== 已创建的图层 ===");
        message.info("标注层 - 颜色:", layer1.color);
        message.info("自动命名图层:", autoLayer.name);
        
        // 在不同图层上创建实体（使用简化写法）
        const line1 = new LineEnt([0, 0], [100, 0]);
        line1.setDefaults();
        line1.layer = "标注层";
        Engine.addEntities(line1);
        
        const line2 = new LineEnt([0, 20], [100, 20]);
        line2.setDefaults();
        line2.layer = "辅助线层";
        Engine.addEntities(line2);
        
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
