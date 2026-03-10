window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --加载LIN文件--从AutoCAD .lin格式字符串加载线型
        const { 
            MainView, initCadContainer, LineEnt, Engine,
            LinetypeParser
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
        // AutoCAD .LIN 文件格式说明
        // ============================================================
        //
        // .lin 文件是 AutoCAD 用来定义线型的标准格式。
        //
        // 格式结构：
        // *线型名称,描述
        // A,模式元素1,模式元素2,...
        //
        // 模式元素：
        // - 正数：实线段长度
        // - 负数：间隙长度
        // - 0：点
        //
        // 注释：以分号 ; 开头的行是注释
        //
        // ============================================================
        
        // AutoCAD 标准 .lin 格式定义字符串
        const linDefinitions = `
        ;; AutoCAD 线型定义文件示例
        ;; 这是注释行
        
        *ACAD_ISO02W100,ISO 虚线 ____ ____ ____ ____
        A,12,-3
        
        *ACAD_ISO03W100,ISO 短虚线 __ __ __ __ __
        A,6,-3
        
        *ACAD_ISO04W100,ISO 长短虚线 ____ _ ____ _ ____
        A,24,-3,6,-3
        
        *ACAD_ISO05W100,ISO 长双短虚线 ____ _ _ ____ _ _
        A,24,-3,6,-3,6,-3
        
        *ACAD_ISO07W100,ISO 点划线 ____ . ____ . ____
        A,24,-3,0,-3
        
        *ACAD_ISO08W100,ISO 长短短点划线 ____ _ _ . ____ _ _ .
        A,24,-3,6,-3,6,-3,0,-3
        
        *ACAD_ISO10W100,ISO 虚点划线 __ . __ . __ .
        A,6,-3,0,-3
        
        *ACAD_ISO11W100,ISO 双点划线 ____ .. ____ ..
        A,12,-3,0,-3,0,-3
        
        *DIVIDE,分隔线 ____  .  ____  .  ____
        A,12.7,-6.35,0,-6.35
        
        *DOT,点线 .  .  .  .  .  .  .
        A,0,-6.35
        
        *FENCE,栅栏线 ____X____X____X____
        A,6.35,-2.54,6.35,-2.54
        `;
        
        const ltManager = Engine.linetypeManager;
        
        // 使用 LinetypeParser 解析 .lin 格式
        const parser = new LinetypeParser();
        const definitions = parser.parse(linDefinitions);
        
        message.info(`解析出 ${definitions.length} 个线型定义`);
        
        // 注册解析出的线型
        for (const def of definitions) {
            if (parser.validateDefinition(def)) {
                ltManager.registerLinetype(def, "iso");
                console.log(`已注册: ${def.name}`);
            } else {
                message.info(`验证失败: ${def.name}`);
            }
        }
        
        // 也可以使用管理器的便捷方法一次性加载
        // const loadedCount = ltManager.loadFromLinDefinitions(linDefinitions, "iso");
        // message.info(`加载了 ${loadedCount} 个线型`);
        
        // 绘制所有加载的线型
        const loadedNames = ltManager.getAllLinetypeNames("iso");
        
        loadedNames.forEach((ltName, index) => {
            const y = index * 25;
            
            const line = new LineEnt([0, y], [200, y]);
            line.setDefaults();
            line.lineType = ltName;
            line.lineTypeScale = 0.5; // ISO线型通常需要调整比例
            Engine.addEntities(line);
            
            const def = ltManager.getLinetype(ltName);
            console.log(`${ltName}: ${def.description}`);
        });
        
        // 显示分类统计
        console.log("--- 线型分类 ---");
        const categories = ltManager.getCategories();
        for (const category of categories) {
            const names = ltManager.getAllLinetypeNames(category);
            console.log(`${category}: ${names.join(", ")}`);
        }
        
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
