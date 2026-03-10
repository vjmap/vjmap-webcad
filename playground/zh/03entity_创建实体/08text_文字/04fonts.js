window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --字体设置--TrueType字体(woff/ttf)与SHX字体示例
        const { MainView, initCadContainer, TextEnt, MTextEnt, TextStyle, Engine, message } = vjcad;
        
        // ========== MainView 配置字体 ==========
        // 字体需要在 MainView 初始化时配置加载
        // 支持两种字体类型：
        // 1. TrueType字体: ttf, woff, otf 格式
        // 2. SHX字体: AutoCAD形字体格式
        //
        // 重要：MainView 会自动为配置的字体创建同名的 TextStyle
        // 例如配置 name: "simkai" 的字体，会自动创建名为 "simkai" 的 TextStyle
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
            fonts: [
                // TrueType字体 - 楷体
                { 
                    path: "./fonts/simkai.woff",  // 字体文件路径
                    name: "simkai",               // 字体名称（同时也是自动创建的 TextStyle 名称）
                    kind: "woff"                  // 字体类型
                },
                // SHX字体 - 默认形字体
                { 
                    path: "./fonts/_default.shx", // SHX字体文件路径
                    name: "_default",             // 字体名称（同时也是自动创建的 TextStyle 名称）
                    kind: "shx"                   // 字体类型
                }
            ]
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        const entities = [];
        
        // ==========================================
        // 方式一：直接使用字体名作为 styleName（推荐，简单快捷）
        // ==========================================
        // MainView 会自动为配置的字体创建同名的 TextStyle
        // 因此可以直接使用字体名（如 "simkai"、"_default"）作为 styleName
        
        // 使用 TrueType 字体（直接用字体名）
        const simpleKaitiText = new TextEnt();
        simpleKaitiText.insertionPoint = [0, 130];
        simpleKaitiText.text = "方式一：直接使用字体名 styleName='simkai'";
        simpleKaitiText.height = 8;
        simpleKaitiText.styleName = "simkai";  // 直接使用字体名，无需手动创建 TextStyle
        simpleKaitiText.setDefaults();
        simpleKaitiText.color = 3;
        entities.push(simpleKaitiText);
        
        // 使用 SHX 字体（直接用字体名）
        const simpleShxText = new TextEnt();
        simpleShxText.insertionPoint = [0, 118];
        simpleShxText.text = "Method 1: Direct font name styleName='_default'";
        simpleShxText.height = 8;
        simpleShxText.styleName = "_default";  // 直接使用字体名，无需手动创建 TextStyle
        simpleShxText.setDefaults();
        simpleShxText.color = 5;
        entities.push(simpleShxText);
        
        // ==========================================
        // 方式二：手动创建自定义 TextStyle（适合需要设置宽度因子、倾斜角度等场景）
        // ==========================================
        // 当需要自定义样式属性（如 widthFactor、obliqueAngle）时，手动创建 TextStyle
        
        // 创建使用 TrueType 字体(woff)的自定义文字样式
        const kaitiStyle = new TextStyle();
        kaitiStyle.name = "楷体样式";           // 自定义样式名称
        kaitiStyle.fontFileName = "simkai";     // 对应 fonts 配置中的 name
        kaitiStyle.widthFactor = 1.0;
        kaitiStyle.obliqueAngle = 0;
        Engine.currentDoc.textStyles.add(kaitiStyle);
        
        // 创建使用楷体样式的单行文字
        const kaitiText1 = new TextEnt();
        kaitiText1.insertionPoint = [0, 100];
        kaitiText1.text = "方式二：自定义样式 styleName='楷体样式'";
        kaitiText1.height = 10;
        kaitiText1.styleName = "楷体样式";       // 使用自定义样式名称
        kaitiText1.setDefaults();
        entities.push(kaitiText1);
        
        // 不同高度的楷体文字
        const kaitiHeights = [6, 8, 10, 12];
        kaitiHeights.forEach((h, i) => {
            const text = new TextEnt();
            text.insertionPoint = [0, 80 - i * 15];
            text.text = `楷体 高度${h}`;
            text.height = h;
            text.styleName = "楷体样式";
            text.setDefaults();
            entities.push(text);
        });
        
        // 创建使用 SHX 字体的自定义文字样式
        const shxStyle = new TextStyle();
        shxStyle.name = "SHX样式";              // 自定义样式名称
        shxStyle.fontFileName = "_default";     // 对应 fonts 配置中的 name
        shxStyle.widthFactor = 1.0;
        shxStyle.obliqueAngle = 0;
        Engine.currentDoc.textStyles.add(shxStyle);
        
        // 创建使用SHX字体的单行文字
        const shxText1 = new TextEnt();
        shxText1.insertionPoint = [0, 10];
        shxText1.text = "Method 2: Custom style styleName='SHX样式'";
        shxText1.height = 10;
        shxText1.styleName = "SHX样式";         // 使用自定义样式名称
        shxText1.setDefaults();
        entities.push(shxText1);
        
        // 不同高度的SHX字体文字
        const shxHeights = [6, 8, 10, 12];
        shxHeights.forEach((h, i) => {
            const text = new TextEnt();
            text.insertionPoint = [0, -10 - i * 15];
            text.text = `SHX Height ${h}`;
            text.height = h;
            text.styleName = "SHX样式";
            text.setDefaults();
            entities.push(text);
        });
        
        // ========== 3. 带宽度因子的样式 ==========
        const wideStyle = new TextStyle();
        wideStyle.name = "宽体样式";
        wideStyle.fontFileName = "simkai";
        wideStyle.widthFactor = 1.5;  // 宽度因子1.5
        Engine.currentDoc.textStyles.add(wideStyle);
        
        const wideText = new TextEnt();
        wideText.insertionPoint = [200, 100];
        wideText.text = "宽度因子1.5";
        wideText.height = 8;
        wideText.styleName = "宽体样式";
        wideText.setDefaults();
        entities.push(wideText);
        
        const narrowStyle = new TextStyle();
        narrowStyle.name = "窄体样式";
        narrowStyle.fontFileName = "simkai";
        narrowStyle.widthFactor = 0.7;  // 宽度因子0.7
        Engine.currentDoc.textStyles.add(narrowStyle);
        
        const narrowText = new TextEnt();
        narrowText.insertionPoint = [200, 85];
        narrowText.text = "宽度因子0.7";
        narrowText.height = 8;
        narrowText.styleName = "窄体样式";
        narrowText.setDefaults();
        entities.push(narrowText);
        
        // ========== 4. 带倾斜角度的样式 ==========
        const obliqueStyle = new TextStyle();
        obliqueStyle.name = "倾斜样式";
        obliqueStyle.fontFileName = "simkai";
        obliqueStyle.obliqueAngle = 15;  // 倾斜15度
        Engine.currentDoc.textStyles.add(obliqueStyle);
        
        const obliqueText = new TextEnt();
        obliqueText.insertionPoint = [200, 65];
        obliqueText.text = "倾斜角度15°";
        obliqueText.height = 8;
        obliqueText.styleName = "倾斜样式";
        obliqueText.setDefaults();
        entities.push(obliqueText);
        
        // ========== 5. 多行文字使用字体 ==========
        const mtextKaiti = new MTextEnt();
        mtextKaiti.insertionPoint = [200, 40];
        mtextKaiti.text = "多行文字\n使用楷体字体\n支持自动换行";
        mtextKaiti.height = 6;
        mtextKaiti.styleName = "楷体样式";
        mtextKaiti.setDefaults();
        entities.push(mtextKaiti);
        
        const mtextShx = new MTextEnt();
        mtextShx.insertionPoint = [200, 0];
        mtextShx.text = "MText with SHX\nMultiple lines\nAutoCAD compatible";
        mtextShx.height = 6;
        mtextShx.styleName = "SHX样式";
        mtextShx.setDefaults();
        entities.push(mtextShx);
        
        // ========== 6. 对比展示 - 同文字不同字体 ==========
        const comparisonY = -80;
        
        // 标题
        const titleText = new TextEnt();
        titleText.insertionPoint = [0, comparisonY];
        titleText.text = "字体对比:";
        titleText.height = 8;
        titleText.setDefaults();
        titleText.color = 3;
        entities.push(titleText);
        
        // 楷体
        const compareKaiti = new TextEnt();
        compareKaiti.insertionPoint = [0, comparisonY - 15];
        compareKaiti.text = "唯杰CAD WebCAD - 楷体(TrueType)";
        compareKaiti.height = 8;
        compareKaiti.styleName = "楷体样式";
        compareKaiti.setDefaults();
        compareKaiti.color = 1;
        entities.push(compareKaiti);
        
        // SHX
        const compareShx = new TextEnt();
        compareShx.insertionPoint = [0, comparisonY - 30];
        compareShx.text = "VJCAD WEBCAD - SHX Font";
        compareShx.height = 8;
        compareShx.styleName = "SHX样式";
        compareShx.setDefaults();
        compareShx.color = 5;
        entities.push(compareShx);
        
        // 默认样式
        const compareDefault = new TextEnt();
        compareDefault.insertionPoint = [0, comparisonY - 45];
        compareDefault.text = "Default Style - 默认样式";
        compareDefault.height = 8;
        compareDefault.setDefaults();
        compareDefault.color = 2;
        entities.push(compareDefault);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        // 输出已创建的样式列表
        console.log("已创建的文字样式:");
        Engine.currentDoc.textStyles.items.forEach(style => {
            console.log(`  ${style.name}: fontFile=${style.fontFileName}, width=${style.widthFactor}, oblique=${style.obliqueAngle}`);
        });
        
        message.info("字体示例创建完成");
        message.info("方式一：直接使用字体名作为 styleName（简单快捷）");
        message.info("方式二：手动创建 TextStyle（可设置宽度因子、倾斜角度）");
        
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
