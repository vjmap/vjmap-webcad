window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --单行文字--TextEnt 基础与属性示例
        const { MainView, initCadContainer, TextEnt, TextAlignmentEnum, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // ========== 1. 基础文字创建 ==========
        const basicText = new TextEnt();
        basicText.insertionPoint = [0, 100];
        basicText.text = "基础单行文字";
        basicText.height = 10;
        basicText.setDefaults();
        Engine.addEntities(basicText);
        
        // ========== 2. 不同高度的文字 ==========
        const heights = [5, 8, 12, 16];
        heights.forEach((h, i) => {
            const text = new TextEnt();
            text.insertionPoint = [0, 80 - i * 20];
            text.text = `高度 ${h} 的文字`;
            text.height = h;
            text.setDefaults();
            Engine.addEntities(text);
        });
        
        // ========== 3. 文字旋转示例 ==========
        const rotations = [0, Math.PI / 6, Math.PI / 4, Math.PI / 3];  // 0°, 30°, 45°, 60°
        rotations.forEach((r, i) => {
            const text = new TextEnt();
            text.insertionPoint = [120 + i * 30, 100];
            text.text = `旋转${Math.round(r * 180 / Math.PI)}°`;
            text.height = 8;
            text.rotation = r;
            text.setDefaults();
            Engine.addEntities(text);
        });
        
        // ========== 4. 文字对齐方式 ==========
        // 基线对齐: Left(1), Center(2), Right(3)
        // 中位对齐: MidLeft(4), MidCenter(5), MidRight(6)
        // 顶部对齐: TopLeft(7), TopCenter(8), TopRight(9)
        const alignments = [
            { align: TextAlignmentEnum.Left, name: "Left(1)", y: 50 },
            { align: TextAlignmentEnum.Center, name: "Center(2)", y: 40 },
            { align: TextAlignmentEnum.Right, name: "Right(3)", y: 30 },
            { align: TextAlignmentEnum.MidLeft, name: "MidLeft(4)", y: 20 },
            { align: TextAlignmentEnum.MidCenter, name: "MidCenter(5)", y: 10 },
            { align: TextAlignmentEnum.MidRight, name: "MidRight(6)", y: 0 },
        ];
        
        alignments.forEach(({ align, name, y }) => {
            const text = new TextEnt();
            text.insertionPoint = [200, y];
            text.text = name;
            text.height = 6;
            text.textAlignment = align;
            text.setDefaults();
            Engine.addEntities(text);
        });
        
        // ========== 5. 颜色文字 ==========
        const colors = [1, 2, 3, 4, 5, 6];  // AutoCAD 颜色索引
        colors.forEach((c, i) => {
            const text = new TextEnt();
            text.insertionPoint = [0, -10 - i * 12];
            text.text = `颜色索引 ${c}`;
            text.height = 8;
            text.setDefaults();
            text.color = c;  // 颜色必须在 setDefaults() 之后设置，否则会被覆盖
            Engine.addEntities(text);
        });
        
        // ========== 6. 特殊字符 ==========
        const specialText = new TextEnt();
        specialText.insertionPoint = [120, 50];
        specialText.text = "特殊符号: %%d=度    %%p=正负";  // %%d→° %%c→Ø %%p→±
        specialText.height = 8;
        specialText.setDefaults();
        Engine.addEntities(specialText);
        
        Engine.zoomExtents();
        
        message.info("单行文字示例创建完成");
        message.info("包含: 基础文字、不同高度、旋转、对齐方式、颜色、特殊字符");
        
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
