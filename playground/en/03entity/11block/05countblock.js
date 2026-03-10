window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --块统计--COUNTBLOCK统计块使用次数示例
        const { MainView, initCadContainer, LineEnt, CircleEnt, InsertEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 块统计示例 ===");
        
        // ========== 创建块定义 ==========
        const doc = Engine.currentDoc;
        
        // 创建块定义1：十字符号
        const line1 = new LineEnt([-10, 0], [10, 0]);
        const line2 = new LineEnt([0, -10], [0, 10]);
        line1.setDefaults();
        line2.setDefaults();
        
        const blockDef1 = doc.blocks.add("CrossSymbol");
        blockDef1.basePoint = [0, 0];
        blockDef1.addEntity(line1);
        blockDef1.addEntity(line2);
        
        message.info("已创建块定义: CrossSymbol");
        
        // 创建块定义2：圆形符号
        const circle = new CircleEnt([0, 0], 8);
        circle.setDefaults();
        
        const blockDef2 = doc.blocks.add("CircleSymbol");
        blockDef2.basePoint = [0, 0];
        blockDef2.addEntity(circle);
        
        message.info("已创建块定义: CircleSymbol");
        
        // ========== 插入块引用 ==========
        // 插入多个 CrossSymbol 块
        for (let i = 0; i < 5; i++) {
            const blockRef = new InsertEnt();
            blockRef.blockId = blockDef1.blockId;  // 使用 blockId（8位GUID字符串）
            blockRef.insertionPoint = [i * 30, 0];
            blockRef.scaleFactor = 1;
            blockRef.rotation = 0;
            blockRef.setDefaults();
            Engine.addEntities(blockRef);
        }
        message.info("已插入 5 个 CrossSymbol 块引用");
        
        // 插入多个 CircleSymbol 块
        for (let i = 0; i < 3; i++) {
            const blockRef = new InsertEnt();
            blockRef.blockId = blockDef2.blockId;  // 使用 blockId（8位GUID字符串）
            blockRef.insertionPoint = [i * 30, 50];
            blockRef.scaleFactor = 1;
            blockRef.rotation = 0;
            blockRef.setDefaults();
            Engine.addEntities(blockRef);
        }
        message.info("已插入 3 个 CircleSymbol 块引用");
        
        Engine.zoomExtents();
        
        // ========== 块统计方法 ==========
        message.info("\n=== 块统计 ===");
        
        // 方法1：遍历所有实体统计块引用
        function countBlocks() {
            const blockCounts = {};
            const entities = Engine.currentSpace.aliveItems;
            
            for (const ent of entities) {
                if (ent.type === "INSERT" || ent.type === "BLOCKREF") {
                    const blockName = ent.name || ent.blockName;
                    if (blockName) {
                        blockCounts[blockName] = (blockCounts[blockName] || 0) + 1;
                    }
                }
            }
            
            return blockCounts;
        }
        
        // 方法2：统计指定块的使用次数
        function countBlockByName(blockName) {
            let count = 0;
            const entities = Engine.currentSpace.aliveItems;
            
            for (const ent of entities) {
                if (ent.type === "INSERT" || ent.type === "BLOCKREF") {
                    const entBlockName = ent.name || ent.blockName;
                    if (entBlockName === blockName) {
                        count++;
                    }
                }
            }
            
            return count;
        }
        
        // 执行统计
        const allBlockCounts = countBlocks();
        message.info("\n所有块统计结果:");
        for (const [name, count] of Object.entries(allBlockCounts)) {
            message.info(`  ${name}: ${count} 个`);
        }
        
        // 统计特定块
        const crossCount = countBlockByName("CrossSymbol");
        const circleCount = countBlockByName("CircleSymbol");
        message.info("\n指定块统计:");
        message.info(`  CrossSymbol: ${crossCount} 个`);
        message.info(`  CircleSymbol: ${circleCount} 个`);
        
        // ========== 获取所有块定义 ==========
        message.info("\n=== 块定义列表 ===");
        const blockDefs = doc.blocks.items;
        message.info("块定义数量: " + blockDefs.length);
        blockDefs.forEach((block, index) => {
            if (!block.name.startsWith("*")) {  // 排除匿名块
                message.info(`  [${index}] ${block.name}`);
            }
        });
        
        // // ========== 命令说明 ==========
        // message.info("\n=== COUNTBLOCK 命令 ===");
        // message.info("COUNTBLOCK - 选择块引用，统计同名块的使用次数");
        // message.info("执行命令: Engine.editor.executerWithOp('COUNTBLOCK')");
        
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
