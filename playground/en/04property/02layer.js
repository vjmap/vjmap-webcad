window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --图层设置--layer属性用法
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
        
        // 获取当前文档
        const doc = Engine.currentDoc;
        
        // 创建新图层（如果不存在）
        if (!doc.layers.has("标注层")) {
            doc.layers.add("标注层", {
                color: 3,           // 绿色
                lineType: "CONTINUOUS",
                layerOn: true,
                frozen: false
            });
        }
        
        if (!doc.layers.has("辅助线层")) {
            doc.layers.add("辅助线层", {
                color: 5,           // 蓝色
                lineType: "HIDDEN",
                layerOn: true,
                frozen: false
            });
        }
        
        // 在不同图层创建实体（使用简化写法）
        const line1 = new LineEnt([0, 0], [100, 0]);
        line1.setDefaults();
        line1.layer = "0";  // 默认图层
        Engine.addEntities(line1);
        
        const line2 = new LineEnt([0, 20], [100, 20]);
        line2.setDefaults();
        line2.layer = "标注层";  // 设置图层
        Engine.addEntities(line2);
        
        const line3 = new LineEnt([0, 40], [100, 40]);
        line3.setDefaults();
        line3.layer = "辅助线层";  // 设置图层
        Engine.addEntities(line3);
        
        Engine.zoomExtents();
        
        message.info("图层设置示例完成");
        message.info("line1 图层:", line1.layer);
        message.info("line2 图层:", line2.layer);
        message.info("line3 图层:", line3.layer);
        
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
