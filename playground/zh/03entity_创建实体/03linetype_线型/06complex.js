window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --复杂线型--创建带文字和形状符号的复杂线型
        const { 
            MainView, initCadContainer, LineEnt, PolylineEnt, Engine,
            LinetypeDefinition, SimpleLinetypeElement, TextLinetypeElement, 
            ShapeLinetypeElement, TextRotationMode
        , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // ============================================================
        // 复杂线型说明
        // ============================================================
        //
        // 复杂线型可以包含三种元素：
        // 1. SimpleLinetypeElement - 简单元素（实线、间隙、点）
        // 2. TextLinetypeElement - 文字元素
        // 3. ShapeLinetypeElement - 形状符号元素
        //
        // TextLinetypeElement 参数：
        // - text: 显示的文字内容
        // - style: 文字样式名（如 "STANDARD"）
        // - options: {
        //     scale: 缩放比例（默认1.0）
        //     rotation: 旋转角度（度）
        //     rotationMode: 旋转模式
        //       - TextRotationMode.UPRIGHT ("U"): 正立，文字始终易读
        //       - TextRotationMode.RELATIVE ("R"): 相对，随线段角度旋转
        //       - TextRotationMode.ABSOLUTE ("A"): 绝对，相对于原点旋转
        //     xOffset: X方向偏移（正值沿线段方向）
        //     yOffset: Y方向偏移（负值向下，约 -scale*0.3 可使文字居中）
        //   }
        //
        // ShapeLinetypeElement 参数：
        // - shapeName: SHX形状名称
        // - shapeFile: SHX形状文件名
        // - options: 同TextLinetypeElement
        //
        // ============================================================
        
        const ltManager = Engine.linetypeManager;
        
        // -----------------------------
        // 示例1：带"HW"文字的热水管线型
        // -----------------------------
        const hotWater = new LinetypeDefinition("HOT_WATER", "热水管 ----HW----HW----");
        hotWater.addElement(new SimpleLinetypeElement(15));   // 15单位实线
        hotWater.addElement(new SimpleLinetypeElement(-2));   // 文字前间隙
        hotWater.addElement(new TextLinetypeElement("HW", "STANDARD", {
            scale: 2.0,
            rotationMode: TextRotationMode.UPRIGHT,
            yOffset: -0.6
        }));
        hotWater.addElement(new SimpleLinetypeElement(-8));   // 文字后间隙（需容纳文字宽度）
        ltManager.registerLinetype(hotWater, "complex");
        
        // -----------------------------
        // 示例2：带"GAS"文字的燃气管线型
        // -----------------------------
        const gasLine = new LinetypeDefinition("GAS_LINE", "燃气管 ----GAS----GAS----");
        gasLine.addElement(new SimpleLinetypeElement(12));
        gasLine.addElement(new SimpleLinetypeElement(-2));   // 文字前间隙
        gasLine.addElement(new TextLinetypeElement("GAS", "STANDARD", {
            scale: 1.5,
            rotationMode: TextRotationMode.UPRIGHT,
            yOffset: -0.45
        }));
        gasLine.addElement(new SimpleLinetypeElement(-8));   // 文字后间隙（需容纳文字宽度）
        ltManager.registerLinetype(gasLine, "complex");
        
        // -----------------------------
        // 示例3：带"S"文字的污水管线型
        // -----------------------------
        const sewage = new LinetypeDefinition("SEWAGE", "污水管 --S--S--S--");
        sewage.addElement(new SimpleLinetypeElement(8));
        sewage.addElement(new SimpleLinetypeElement(-2));
        sewage.addElement(new TextLinetypeElement("S", "STANDARD", {
            scale: 2.5,
            rotationMode: TextRotationMode.UPRIGHT,
            yOffset: -0.75
        }));
        sewage.addElement(new SimpleLinetypeElement(-2));
        ltManager.registerLinetype(sewage, "complex");
        
        // -----------------------------
        // 示例4：带"W"文字的给水管线型
        // -----------------------------
        const waterSupply = new LinetypeDefinition("WATER_SUPPLY", "给水管 --W--W--W--");
        waterSupply.addElement(new SimpleLinetypeElement(10));
        waterSupply.addElement(new SimpleLinetypeElement(-2));
        waterSupply.addElement(new TextLinetypeElement("W", "STANDARD", {
            scale: 2.5,
            rotationMode: TextRotationMode.UPRIGHT,
            yOffset: -0.75
        }));
        waterSupply.addElement(new SimpleLinetypeElement(-2));
        ltManager.registerLinetype(waterSupply, "complex");
        
        // -----------------------------
        // 示例5：带形状符号的围栏线型
        // -----------------------------
        const fencing = new LinetypeDefinition("FENCING", "围栏线 --X--X--X--");
        fencing.addElement(new SimpleLinetypeElement(8));
        fencing.addElement(new SimpleLinetypeElement(-2));
        fencing.addElement(new ShapeLinetypeElement("X", "ltypeshp.shx", {
            scale: 1.0,
            rotationMode: TextRotationMode.RELATIVE
        }));
        fencing.addElement(new SimpleLinetypeElement(-2));
        ltManager.registerLinetype(fencing, "complex");
        
        // -----------------------------
        // 示例6：带箭头的流向线
        // -----------------------------
        const flowArrow = new LinetypeDefinition("FLOW_ARROW", "流向线 -->-->-->");
        flowArrow.addElement(new SimpleLinetypeElement(12));
        flowArrow.addElement(new SimpleLinetypeElement(-1));
        flowArrow.addElement(new ShapeLinetypeElement("ARROW", "ltypeshp.shx", {
            scale: 0.8,
            rotation: 0,
            rotationMode: TextRotationMode.RELATIVE
        }));
        flowArrow.addElement(new SimpleLinetypeElement(-1));
        ltManager.registerLinetype(flowArrow, "complex");
        
        // -----------------------------
        // 示例7：带方块的轨道线
        // -----------------------------
        const track = new LinetypeDefinition("TRACK", "轨道线 --□--□--□--");
        track.addElement(new SimpleLinetypeElement(10));
        track.addElement(new SimpleLinetypeElement(-2));
        track.addElement(new ShapeLinetypeElement("BOX", "ltypeshp.shx", {
            scale: 1.2,
            rotationMode: TextRotationMode.UPRIGHT
        }));
        track.addElement(new SimpleLinetypeElement(-2));
        ltManager.registerLinetype(track, "complex");
        
        // -----------------------------
        // 示例8：带文字和点的综合线型
        // -----------------------------
        const mixedLine = new LinetypeDefinition("MIXED", "综合线 --●--TEXT--●--");
        mixedLine.addElement(new SimpleLinetypeElement(8));
        mixedLine.addElement(new SimpleLinetypeElement(-2));
        mixedLine.addElement(new SimpleLinetypeElement(0));   // 点
        mixedLine.addElement(new SimpleLinetypeElement(-2));
        mixedLine.addElement(new TextLinetypeElement("CAD", "STANDARD", {
            scale: 1.8,
            rotationMode: TextRotationMode.UPRIGHT,
            yOffset: -0.55
        }));
        mixedLine.addElement(new SimpleLinetypeElement(-2));
        mixedLine.addElement(new SimpleLinetypeElement(0));   // 点
        mixedLine.addElement(new SimpleLinetypeElement(-2));
        ltManager.registerLinetype(mixedLine, "complex");
        
        // 绘制所有复杂线型
        message.info("=== 复杂线型示例 ===");
        
        const complexLinetypes = [
            "HOT_WATER", "GAS_LINE", "SEWAGE", "WATER_SUPPLY",
            "FENCING", "FLOW_ARROW", "TRACK", "MIXED"
        ];
        
        complexLinetypes.forEach((ltName, index) => {
            const y = index * 35;
            
            // 绘制水平线
            const line = new LineEnt([0, y], [250, y]);
            line.setDefaults();
            line.lineType = ltName;
            line.lineTypeScale = 1.0;
            Engine.addEntities(line);
            
            const def = ltManager.getLinetype(ltName);
            console.log(`${ltName}: ${def.description} (复杂线型: ${def.isComplex})`);
        });
        
        // 绘制斜线展示旋转模式效果
        message.info("=== 斜线展示（观察文字旋转） ===");
        const diagonalY = -50;
        const diagonal = new LineEnt([0, diagonalY], [200, diagonalY + 80]);
        diagonal.setDefaults();
        diagonal.lineType = "HOT_WATER";
        diagonal.lineTypeScale = 1.0;
        Engine.addEntities(diagonal);
        console.log("斜线使用HOT_WATER线型，观察UPRIGHT模式下文字保持正立");
        
        // 统计信息
        console.log("=== 统计信息 ===");
        const stats = ltManager.getStatistics();
        console.log(`总线型数: ${stats.total}`);
        const complexCount = ltManager.getAllLinetypeNames("complex").length;
        console.log(`complex分类: ${complexCount} 个`);
        
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
