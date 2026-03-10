window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --块替换--REPLACEBLOCK替换块引用示例
        const { MainView, initCadContainer, LineEnt, InsertEnt, Engine, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 块替换示例 ===");
        
        // ========== 创建块定义 ==========
        const doc = Engine.currentDoc;
        
        // 创建源块定义：十字符号
        const line1 = new LineEnt([-10, 0], [10, 0]);
        const line2 = new LineEnt([0, -10], [0, 10]);
        line1.setDefaults();
        line1.color = 1;
        line2.setDefaults();
        line2.color = 1;
        
        const sourceBlock = doc.blocks.add("SourceBlock");
        sourceBlock.basePoint = [0, 0];
        sourceBlock.addEntity(line1);
        sourceBlock.addEntity(line2);
        
        message.info("已创建源块: SourceBlock（红色十字）");
        
        // 创建目标块定义：方形符号
        const line3 = new LineEnt([-8, -8], [8, -8]);
        const line4 = new LineEnt([8, -8], [8, 8]);
        const line5 = new LineEnt([8, 8], [-8, 8]);
        const line6 = new LineEnt([-8, 8], [-8, -8]);
        line3.setDefaults();
        line3.color = 3;
        line4.setDefaults();
        line4.color = 3;
        line5.setDefaults();
        line5.color = 3;
        line6.setDefaults();
        line6.color = 3;
        
        const targetBlock = doc.blocks.add("TargetBlock");
        targetBlock.basePoint = [0, 0];
        targetBlock.addEntity(line3);
        targetBlock.addEntity(line4);
        targetBlock.addEntity(line5);
        targetBlock.addEntity(line6);
        
        message.info("已创建目标块: TargetBlock（绿色方形）");
        
        // ========== 插入源块引用 ==========
        const sourceBlockRefs = [];
        for (let i = 0; i < 4; i++) {
            const insert = new InsertEnt();
            insert.blockId = sourceBlock.blockId;
            insert.insertionPoint = [i * 40, 0];
            insert.scaleFactor = 1;
            insert.rotation = 0;
            insert.setDefaults();
            Engine.addEntities(insert);
            sourceBlockRefs.push(insert);
        }
        message.info("已插入 4 个 SourceBlock 块引用");
        
        // 插入一个目标块作为参考
        const refInsert = new InsertEnt();
        refInsert.blockId = targetBlock.blockId;
        refInsert.insertionPoint = [60, 50];
        refInsert.scaleFactor = 1;
        refInsert.rotation = 0;
        refInsert.setDefaults();
        Engine.addEntities(refInsert);
        message.info("已插入 1 个 TargetBlock 作为参考（上方）");
        
        Engine.zoomExtents();
        
        // ========== 块替换方法 ==========
        message.info("\n=== 块替换方法 ===");
        
        /**
         * 替换块引用
         * @param {object} sourceBlockDef - 源块定义
         * @param {object} targetBlockDef - 目标块定义
         * @returns {number} - 替换的块数量
         */
        function replaceBlocks(sourceBlockDef, targetBlockDef) {
            // 找出所有源块引用
            const toReplace = Engine.getEntities(ent => 
                ent.type === "INSERT" && ent.blockId === sourceBlockDef.blockId
            );
            
            if (toReplace.length === 0) {
                message.info(`未找到块 "${sourceBlockDef.name}" 的引用`);
                return 0;
            }
            
            // 替换每个块引用
            toReplace.forEach((oldInsert) => {
                // 创建新的块引用，保持位置、旋转、缩放
                const newInsert = new InsertEnt();
                newInsert.blockId = targetBlockDef.blockId;
                newInsert.insertionPoint = oldInsert.insertionPoint;
                newInsert.scaleFactor = oldInsert.scaleFactor;
                newInsert.rotation = oldInsert.rotation;
                newInsert.setDefaults();
                
                // 复制图层等属性
                if (oldInsert.layer) {
                    newInsert.layer = oldInsert.layer;
                }
                
                Engine.addEntities(newInsert);
            });
            
            // 删除旧的块引用
            Engine.eraseEntities(toReplace);
            
            Engine.pcanvas.regen(true);
            
            return toReplace.length;
        }
        
        // ========== 5秒后执行替换 ==========
        setTimeout(() => {
            message.info("\n正在将 SourceBlock 替换为 TargetBlock...");
            const count = replaceBlocks(sourceBlock, targetBlock);
            message.info(`已替换 ${count} 个块引用`);
        }, 5000);
        
        message.info("\n5秒后将自动执行块替换");
        message.info("SourceBlock（红色十字） -> TargetBlock（绿色方形）");
        
        // ========== 命令说明 ==========
        message.info("\n=== REPLACEBLOCK 命令 ===");
        message.info("REPLACEBLOCK - 将选中的块替换为另一个块");
        message.info("使用流程：");
        message.info("  1. 选择要替换的块引用");
        message.info("  2. 选择目标块或输入目标块名称");
        message.info("\n执行命令: Engine.editor.executerWithOp('REPLACEBLOCK')");
        
        // ========== 列出所有块定义 ==========
        message.info("\n=== 当前块定义 ===");
        const blockDefs = doc.blocks.items;
        blockDefs.forEach((block) => {
            if (!block.name.startsWith("*")) {
                message.info(`  - ${block.name}`);
            }
        });
        
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
