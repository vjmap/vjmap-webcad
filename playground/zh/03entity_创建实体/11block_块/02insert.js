window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --插入块--InsertEnt块引用示例
        const { MainView, initCadContainer, LineEnt, InsertEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 首先创建块定义
        const doc = Engine.currentDoc;
        const blockName = "CrossSymbol";
        
        // 获取或创建块定义（支持 [x, y] 数组形式）
        let blockDef = doc.blocks.itemByName(blockName);
        if (!blockDef) {
            blockDef = doc.blocks.add(blockName);
            blockDef.basePoint = [0, 0];
            
            const line1 = new LineEnt([-10, 0], [10, 0]);
            const line2 = new LineEnt([0, -10], [0, 10]);
            line1.setDefaults();
            line2.setDefaults();
            
            blockDef.addEntity(line1);
            blockDef.addEntity(line2);
        }
        
        // 插入块引用（支持 [x, y] 数组形式）
        const insert1 = new InsertEnt();
        insert1.blockId = blockDef.blockId;       // 块ID（8位GUID字符串）
        insert1.insertionPoint = [20, 20];        // 插入点
        insert1.scaleFactor = 1;                  // 缩放因子
        insert1.rotation = 0;                     // 旋转角度（弧度）
        insert1.setDefaults();
        
        // 在不同位置插入多个块引用
        const insert2 = new InsertEnt();
        insert2.blockId = blockDef.blockId;
        insert2.insertionPoint = [60, 20];
        insert2.scaleFactor = 1.5;                // 放大1.5倍
        insert2.rotation = Math.PI / 4;           // 旋转45度
        insert2.setDefaults();
        
        const insert3 = new InsertEnt();
        insert3.blockId = blockDef.blockId;
        insert3.insertionPoint = [100, 20];
        insert3.scaleFactor = 2;                  // 放大2倍
        insert3.rotation = 0;
        insert3.setDefaults();
        
        Engine.addEntities([insert1, insert2, insert3]);
        Engine.zoomExtents();
        
        message.info("块引用已插入");
        message.info("块名:", blockName);
        message.info("插入了 3 个块引用");
        
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
