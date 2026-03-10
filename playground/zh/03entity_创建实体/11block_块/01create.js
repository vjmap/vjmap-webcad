window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建块定义--BlockDefinition示例
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
        
        // 创建块内的实体（支持 [x, y] 数组形式）
        const line1 = new LineEnt([-10, 0], [10, 0]);
        const line2 = new LineEnt([0, -10], [0, 10]);
        const circle = new CircleEnt([0, 0], 8);
        
        line1.setDefaults();
        line2.setDefaults();
        circle.setDefaults();
        
        // 创建块定义
        const blockName = "MySymbol";
        
        // 使用 Engine.currentDoc 创建块定义
        const doc = Engine.currentDoc;
        const blockDef = doc.blocks.add(blockName);
        blockDef.basePoint = [0, 0];  // 基点（支持数组形式）
        
        // 添加实体到块定义
        blockDef.addEntity(line1);
        blockDef.addEntity(line2);
        blockDef.addEntity(circle);
        
        message.info("块定义已创建");
        message.info("块名:", blockName);
        message.info("基点:", blockDef.basePoint);
        message.info("块内实体数:", blockDef.items.length);
        
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
