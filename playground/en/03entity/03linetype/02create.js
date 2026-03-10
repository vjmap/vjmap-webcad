window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建线型--使用LinetypeDefinition创建自定义线型
        const { 
            MainView, initCadContainer, LineEnt, PolylineEnt, Engine,
            LinetypeDefinition, SimpleLinetypeElement
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
        // 线型元素说明
        // ============================================================
        //
        // SimpleLinetypeElement 参数说明：
        // - 正数：实线段长度（单位与图纸单位一致）
        // - 负数：间隙长度（绝对值为间隙大小）
        // - 零：点（在该位置绘制一个点）
        //
        // 例如：[12, -6, 3, -6] 表示：
        // - 12单位实线，6单位间隙，3单位实线，6单位间隙，循环...
        // 
        // ============================================================
        
        const ltManager = Engine.linetypeManager;
        
        // -----------------------------
        // 示例1：创建简单虚线
        // -----------------------------
        const dashed = new LinetypeDefinition("DASHED", "简单虚线 ---- ---- ----");
        dashed.addElement(new SimpleLinetypeElement(12));    // 12单位实线
        dashed.addElement(new SimpleLinetypeElement(-6));    // 6单位间隙
        ltManager.registerLinetype(dashed, "custom");
        
        // -----------------------------
        // 示例2：创建点划线
        // -----------------------------
        const dashdot = new LinetypeDefinition("DASHDOT", "点划线 ____ . ____ .");
        dashdot.addElement(new SimpleLinetypeElement(12));   // 实线
        dashdot.addElement(new SimpleLinetypeElement(-3));   // 间隙
        dashdot.addElement(new SimpleLinetypeElement(0));    // 点
        dashdot.addElement(new SimpleLinetypeElement(-3));   // 间隙
        ltManager.registerLinetype(dashdot, "custom");
        
        // -----------------------------
        // 示例3：创建双点划线
        // -----------------------------
        const dashdotdot = new LinetypeDefinition("DASHDOTDOT", "双点划线 ____ . . ____ . .");
        dashdotdot.addElement(new SimpleLinetypeElement(12));  // 实线
        dashdotdot.addElement(new SimpleLinetypeElement(-3));  // 间隙
        dashdotdot.addElement(new SimpleLinetypeElement(0));   // 点
        dashdotdot.addElement(new SimpleLinetypeElement(-3));  // 间隙
        dashdotdot.addElement(new SimpleLinetypeElement(0));   // 点
        dashdotdot.addElement(new SimpleLinetypeElement(-3));  // 间隙
        ltManager.registerLinetype(dashdotdot, "custom");
        
        // -----------------------------
        // 示例4：创建长短虚线
        // -----------------------------
        const longdash = new LinetypeDefinition("LONGDASH", "长短虚线 ________ __ ________ __");
        longdash.addElement(new SimpleLinetypeElement(20));  // 长实线
        longdash.addElement(new SimpleLinetypeElement(-4));  // 间隙
        longdash.addElement(new SimpleLinetypeElement(6));   // 短实线
        longdash.addElement(new SimpleLinetypeElement(-4));  // 间隙
        ltManager.registerLinetype(longdash, "custom");
        
        // -----------------------------
        // 示例5：创建边界线
        // -----------------------------
        const border = new LinetypeDefinition("BORDER", "边界线 __ __ . __ __ .");
        border.addElement(new SimpleLinetypeElement(10));    // 实线
        border.addElement(new SimpleLinetypeElement(-4));    // 间隙
        border.addElement(new SimpleLinetypeElement(10));    // 实线
        border.addElement(new SimpleLinetypeElement(-4));    // 间隙
        border.addElement(new SimpleLinetypeElement(0));     // 点
        border.addElement(new SimpleLinetypeElement(-4));    // 间隙
        ltManager.registerLinetype(border, "custom");
        
        // 绘制所有自定义线型
        const customLinetypes = ["DASHED", "DASHDOT", "DASHDOTDOT", "LONGDASH", "BORDER"];
        
        customLinetypes.forEach((ltName, index) => {
            const y = index * 30;
            
            const line = new LineEnt([0, y], [200, y]);
            line.setDefaults();
            line.lineType = ltName;
            line.lineTypeScale = 1.0;
            Engine.addEntities(line);
            
            const def = ltManager.getLinetype(ltName);
            console.log(`${ltName}: ${def.description}`);
        });
        
        // 显示创建的线型统计
        message.info("--- 线型统计 ---");
        const stats = ltManager.getStatistics();
        message.info(`总线型数: ${stats.total}`);
        for (const [category, count] of Object.entries(stats.categories)) {
            console.log(`  ${category}: ${count} 个`);
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
