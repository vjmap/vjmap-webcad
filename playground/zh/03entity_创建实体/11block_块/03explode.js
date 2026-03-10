window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --块炸开--将块引用炸开为独立实体
        const { MainView, initCadContainer, InsertEnt, LineEnt, CircleEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        const entities = [];
        
        // 创建块定义
        const doc = Engine.currentDoc;
        const blockName = "Symbol";
        
        // 获取或创建块定义
        let blockDef = doc.blocks.itemByName(blockName);
        if (!blockDef) {
            blockDef = doc.blocks.add(blockName);
            blockDef.basePoint = [0, 0];
        
            // 块内容：十字 + 圆
            const line1 = new LineEnt([-10, 0], [10, 0]);
            line1.setDefaults();
            line1.color = 0; // ByBlock
            blockDef.addEntity(line1);
        
            const line2 = new LineEnt([0, -10], [0, 10]);
            line2.setDefaults();
            line2.color = 0;
            blockDef.addEntity(line2);
        
            const circle = new CircleEnt([0, 0], 8);
            circle.setDefaults();
            circle.color = 0;
            blockDef.addEntity(circle);
        }
        
        console.log("块定义已创建:", blockDef.name);
        
        // 创建块引用（左边）
        const insert1 = new InsertEnt();
        insert1.blockId = blockDef.blockId;
        insert1.insertionPoint = [30, 50];
        insert1.scaleFactor = 1;
        insert1.rotation = 0;
        insert1.setDefaults();
        insert1.color = 3; // 绿色
        entities.push(insert1);
        console.log("块引用已创建 - 位置:", insert1.insertionPoint);
        
        // 创建另一个块引用（右边），准备炸开
        const insert2 = new InsertEnt();
        insert2.blockId = blockDef.blockId;
        insert2.insertionPoint = [100, 50];
        insert2.scaleFactor = 1;
        insert2.rotation = 0;
        insert2.setDefaults();
        insert2.color = 5; // 蓝色
        
        // 炸开块引用（使用 getNestEnts(true) 获取独立的嵌套实体）
        const explodedEnts = insert2.getNestEnts(true);
        console.log("炸开后实体数量:", explodedEnts.length);
        
        // 将炸开的实体设置属性
        explodedEnts.forEach(ent => {
            ent.setDefaults();
            ent.color = 1; // 改为红色
            entities.push(ent);
        });
        
        // 再创建一个缩放旋转的块引用
        const insert3 = new InsertEnt();
        insert3.blockId = blockDef.blockId;
        insert3.insertionPoint = [170, 50];
        insert3.scaleFactor = 1.5;
        insert3.rotation = Math.PI / 6;
        insert3.setDefaults();
        insert3.color = 4;
        entities.push(insert3);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("\n===== 块引用信息 =====");
        console.log("块引用1 - 颜色:绿, 缩放:1, 旋转:0");
        console.log("炸开的实体 - 颜色:红（已独立）");
        console.log("块引用3 - 颜色:青, 缩放:1.5, 旋转:30度");
        
        message.info("块操作：绿=块引用, 红=炸开后的独立实体, 青=缩放旋转的块");
        
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
