window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --块属性文字--InsertEnt属性定义和属性值示例
        const { MainView, initCadContainer, LineEnt, TextEnt, InsertEnt, Engine, TextAlignmentEnum , message } = vjcad;
        
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
        const blockName = "TitleBlock";
        
        // 创建带属性定义的块
        let blockDef = doc.blocks.itemByName(blockName);
        if (!blockDef) {
            blockDef = doc.blocks.add(blockName);
            blockDef.basePoint = [0, 0];
            
            // 创建块的图形部分：矩形边框
            const line1 = new LineEnt([0, 0], [60, 0]);
            const line2 = new LineEnt([60, 0], [60, 20]);
            const line3 = new LineEnt([60, 20], [0, 20]);
            const line4 = new LineEnt([0, 20], [0, 0]);
            line1.setDefaults();
            line2.setDefaults();
            line3.setDefaults();
            line4.setDefaults();
            
            // 创建属性定义1：名称标签
            const attrName = new TextEnt([5, 12], "名称", 4, 0, TextAlignmentEnum.Left);
            attrName.tag = "NAME";           // 属性标签（唯一标识）
            attrName.prompt = "请输入名称";   // 插入时的提示文字
            attrName.setDefaults();
            
            // 创建属性定义2：编号标签
            const attrCode = new TextEnt([5, 4], "编号", 4, 0, TextAlignmentEnum.Left);
            attrCode.tag = "CODE";           // 属性标签
            attrCode.prompt = "请输入编号";   // 提示文字
            attrCode.setDefaults();
            
            // 添加所有实体到块定义
            blockDef.addEntity(line1);
            blockDef.addEntity(line2);
            blockDef.addEntity(line3);
            blockDef.addEntity(line4);
            blockDef.addEntity(attrName);
            blockDef.addEntity(attrCode);
        }
        
        // 插入块引用1：设置属性值
        const insert1 = new InsertEnt();
        insert1.blockId = blockDef.blockId;
        insert1.insertionPoint = [10, 50];
        insert1.scaleFactor = 1;
        insert1.rotation = 0;
        insert1.setDefaults();
        
        // 使用 addAttribute 设置属性值
        // 不传 height 时，自动使用块定义中属性文字的原始高度
        insert1.addAttribute({ tag: "NAME", textString: "零件A" });
        insert1.addAttribute({ tag: "CODE", textString: "P-001" });
        
        // 插入块引用2：不同的属性值
        const insert2 = new InsertEnt();
        insert2.blockId = blockDef.blockId;
        insert2.insertionPoint = [100, 50];
        insert2.scaleFactor = 1;
        insert2.rotation = 0;
        insert2.setDefaults();
        
        insert2.addAttribute({ tag: "NAME", textString: "零件B" });
        insert2.addAttribute({ tag: "CODE", textString: "P-002" });
        
        // 插入块引用3：旋转并设置属性
        const insert3 = new InsertEnt();
        insert3.blockId = blockDef.blockId;
        insert3.insertionPoint = [10, -30];
        insert3.scaleFactor = 1.2;
        insert3.rotation = Math.PI / 12;  // 旋转15度
        insert3.setDefaults();
        
        // 缩放后高度也会相应缩放（scaleFactor=1.2 时显示高度为 4*1.2=4.8）
        insert3.addAttribute({ tag: "NAME", textString: "组件C" });
        insert3.addAttribute({ tag: "CODE", textString: "A-003" });
        
        Engine.addEntities([insert1, insert2, insert3]);
        Engine.zoomExtents();
        
        message.info("块属性文字示例已创建");
        message.info("块名:", blockName);
        message.info("属性标签: NAME, CODE");
        message.info("插入了 3 个带属性的块引用");
        
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
