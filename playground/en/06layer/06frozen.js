window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --冻结图层--isFrozen属性控制图层冻结状态
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
        
        const doc = Engine.currentDoc;
        
        // 创建测试图层
        Engine.createLayer("正常图层", { color: 1 });
        Engine.createLayer("冻结图层", { color: 3 });
        Engine.createLayer("稍后冻结", { color: 5 });
        
        // 在各图层创建实体
        const line1 = new LineEnt([0, 0], [100, 0]);
        line1.setDefaults();
        line1.layer = "正常图层";
        Engine.addEntities(line1);
        
        const circle1 = new CircleEnt([50, 50], 30);
        circle1.setDefaults();
        circle1.layer = "冻结图层";
        Engine.addEntities(circle1);
        
        const line2 = new LineEnt([0, 100], [100, 100]);
        line2.setDefaults();
        line2.layer = "稍后冻结";
        Engine.addEntities(line2);
        
        // 冻结图层
        const frozenLayer = Engine.getLayerByName("冻结图层");
        if (frozenLayer) {
            frozenLayer.isFrozen = true;
            Engine.regen(true); // 刷新显示
        }
        
        message.info("=== 图层冻结功能 ===");
        message.info("冻结的图层:");
        message.info("- 不可见（不渲染）");
        message.info("- 不可选择");
        message.info("- 不参与重生成");
        message.info("- 0图层和当前图层不能被冻结");
        
        // 显示各图层状态
        const layers = Engine.getLayers();
        layers.forEach(layer => {
            if (layer.name !== "0" && layer.name !== "Defpoints") {
                message.info(`${layer.name}: isFrozen=${layer.isFrozen}`);
            }
        });
        
        // 2秒后解冻图层
        setTimeout(() => {
            const layer = Engine.getLayerByName("冻结图层");
            if (layer) {
                layer.isFrozen = false;
                Engine.regen(true);
                message.info("2秒后: 冻结图层已解冻，圆可见了");
            }
        }, 2000);
        
        // 4秒后冻结另一个图层
        setTimeout(() => {
            const layer = Engine.getLayerByName("稍后冻结");
            if (layer) {
                layer.isFrozen = true;
                Engine.regen(true);
                message.info("4秒后: '稍后冻结'图层已冻结，线不可见了");
            }
        }, 4000);
        
        // 尝试冻结当前图层（会失败）
        message.info("提示: 尝试冻结0图层或当前图层会被拒绝");
        
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
