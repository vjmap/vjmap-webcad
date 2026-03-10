window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --图层状态综合--layerOn、isFrozen、isLocked三种状态对比
        const { MainView, initCadContainer, LineEnt, CircleEnt, TextEnt, Engine , message } = vjcad;
        
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
        
        // 创建四种状态的图层
        Engine.createLayer("正常状态", { color: 3 });      // 绿色 - 可见可选
        Engine.createLayer("关闭状态", { color: 1 });      // 红色 - 不可见
        Engine.createLayer("冻结状态", { color: 4 });      // 青色 - 不可见不可选
        Engine.createLayer("锁定状态", { color: 5 });      // 蓝色 - 可见不可选
        
        // 在各图层创建实体
        const entities = [
            { layer: "正常状态", y: 0 },
            { layer: "关闭状态", y: 40 },
            { layer: "冻结状态", y: 80 },
            { layer: "锁定状态", y: 120 }
        ];
        
        entities.forEach(({ layer, y }) => {
            // 创建线
            const line = new LineEnt([0, y], [60, y]);
            line.setDefaults();
            line.layer = layer;
            Engine.addEntities(line);
            
            // 创建圆
            const circle = new CircleEnt([90, y], 15);
            circle.setDefaults();
            circle.layer = layer;
            Engine.addEntities(circle);
        });
        
        // 设置各图层状态
        const offLayer = Engine.getLayerByName("关闭状态");
        if (offLayer) offLayer.layerOn = false;
        
        const frozenLayer = Engine.getLayerByName("冻结状态");
        if (frozenLayer) frozenLayer.isFrozen = true;
        
        const lockedLayer = Engine.getLayerByName("锁定状态");
        if (lockedLayer) lockedLayer.isLocked = true;
        
        Engine.regen(true);
        
        // 显示说明
        message.info("=== 图层状态对比 ===");
        message.info("");
        message.info("【正常状态】layerOn=true, isFrozen=false, isLocked=false");
        message.info("  → 可见 ✓  可选 ✓  可编辑 ✓");
        message.info("");
        message.info("【关闭状态】layerOn=false");
        message.info("  → 不可见 ✗  仍参与重生成");
        message.info("");
        message.info("【冻结状态】isFrozen=true");
        message.info("  → 不可见 ✗  不可选 ✗  不参与重生成");
        message.info("  → 0图层和当前图层不能冻结");
        message.info("");
        message.info("【锁定状态】isLocked=true");
        message.info("  → 可见 ✓  不可选 ✗  不可编辑 ✗");
        message.info("");
        message.info("提示: 只有绿色(正常)和蓝色(锁定)的图形可见");
        message.info("提示: 尝试点击或框选，只有绿色图形能被选中");
        
        // 打印当前状态
        message.info("");
        message.info("=== 当前图层状态 ===");
        const layers = Engine.getLayers();
        layers.forEach(layer => {
            if (layer.name !== "0" && layer.name !== "Defpoints") {
                message.info(`${layer.name}: on=${layer.layerOn}, frozen=${layer.isFrozen}, locked=${layer.isLocked}`);
            }
        });
        
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
