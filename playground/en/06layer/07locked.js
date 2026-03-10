window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --锁定图层--isLocked属性控制图层锁定状态
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
        Engine.createLayer("锁定图层", { color: 3 });
        Engine.createLayer("稍后锁定", { color: 5 });
        
        // 在各图层创建实体
        const line1 = new LineEnt([0, 0], [100, 0]);
        line1.setDefaults();
        line1.layer = "正常图层";
        Engine.addEntities(line1);
        
        const circle1 = new CircleEnt([50, 50], 30);
        circle1.setDefaults();
        circle1.layer = "锁定图层";
        Engine.addEntities(circle1);
        
        const line2 = new LineEnt([0, 100], [100, 100]);
        line2.setDefaults();
        line2.layer = "稍后锁定";
        Engine.addEntities(line2);
        
        // 锁定图层
        const lockedLayer = Engine.getLayerByName("锁定图层");
        if (lockedLayer) {
            lockedLayer.isLocked = true;
        }
        
        message.info("=== 图层锁定功能 ===");
        message.info("锁定的图层:");
        message.info("- 可见（正常渲染）");
        message.info("- 不可选择（点选、框选、全选都无效）");
        message.info("- 不可编辑");
        message.info("- 与冻结不同：锁定的实体仍然可见");
        
        // 显示各图层状态
        const layers = Engine.getLayers();
        layers.forEach(layer => {
            if (layer.name !== "0" && layer.name !== "Defpoints") {
                message.info(`${layer.name}: isLocked=${layer.isLocked}`);
            }
        });
        
        // 2秒后解锁图层
        setTimeout(() => {
            const layer = Engine.getLayerByName("锁定图层");
            if (layer) {
                layer.isLocked = false;
                message.info("2秒后: 锁定图层已解锁，圆可以被选中了");
            }
        }, 2000);
        
        // 4秒后锁定另一个图层
        setTimeout(() => {
            const layer = Engine.getLayerByName("稍后锁定");
            if (layer) {
                layer.isLocked = true;
                message.info("4秒后: '稍后锁定'图层已锁定，线不可选中了");
            }
        }, 4000);
        
        message.info("提示: 尝试用鼠标点击圆形，锁定状态下无法选中");
        message.info("提示: 按Ctrl+A全选，锁定图层的实体不会被选中");
        
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
