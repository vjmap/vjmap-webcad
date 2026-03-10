window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --线型管理器--LinetypeManager的完整API用法
        const { 
            MainView, initCadContainer, LineEnt, Engine,
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
        // LinetypeManager API 说明
        // ============================================================
        //
        // Engine.linetypeManager 是全局线型管理器，提供以下功能：
        //
        // 注册与获取：
        // - registerLinetype(definition, category) - 注册线型
        // - getLinetype(name) - 获取线型定义
        // - hasLinetype(name) - 检查线型是否存在
        // - removeLinetype(name) - 删除线型（不能删除内置线型）
        //
        // 批量操作：
        // - getAllLinetypeNames(category?) - 获取所有线型名称
        // - getAllLinetypes(category?) - 获取所有线型定义
        // - loadFromLinDefinitions(str, category) - 从.lin格式加载
        // - exportToLinFormat(names?, category) - 导出为.lin格式
        //
        // 分类管理：
        // - getCategories() - 获取所有分类
        // - isBuiltinLinetype(name) - 检查是否为内置线型
        //
        // 维护：
        // - clearCustomLinetypes() - 清除所有自定义线型
        // - reset() - 重置为默认状态
        // - getStatistics() - 获取统计信息
        //
        // ============================================================
        
        const ltManager = Engine.linetypeManager;
        
        // 1. 注册新线型
        console.log("=== 1. 注册线型 ===");
        
        const myLine = new LinetypeDefinition("MYLINE", "我的自定义线型");
        myLine.addElement(new SimpleLinetypeElement(8));
        myLine.addElement(new SimpleLinetypeElement(-4));
        myLine.addElement(new SimpleLinetypeElement(2));
        myLine.addElement(new SimpleLinetypeElement(-4));
        
        ltManager.registerLinetype(myLine, "demo");
        console.log(`已注册线型: MYLINE`);
        
        // 2. 检查线型是否存在
        console.log("=== 2. 检查线型 ===");
        console.log(`CONTINUOUS 存在: ${ltManager.hasLinetype("CONTINUOUS")}`);
        console.log(`MYLINE 存在: ${ltManager.hasLinetype("MYLINE")}`);
        console.log(`NOTEXIST 存在: ${ltManager.hasLinetype("NOTEXIST")}`);
        
        // 3. 获取线型定义
        console.log("=== 3. 获取线型定义 ===");
        const hiddenDef = ltManager.getLinetype("HIDDEN");
        if (hiddenDef) {
            console.log(`线型名: ${hiddenDef.name}`);
            console.log(`描述: ${hiddenDef.description}`);
            console.log(`元素数: ${hiddenDef.elements.length}`);
            console.log(`模式长度: ${hiddenDef.patternLength}`);
            console.log(`是否复杂线型: ${hiddenDef.isComplex}`);
        }
        
        // 4. 检查内置线型
        console.log("=== 4. 内置线型检查 ===");
        console.log(`CONTINUOUS 是内置线型: ${ltManager.isBuiltinLinetype("CONTINUOUS")}`);
        console.log(`MYLINE 是内置线型: ${ltManager.isBuiltinLinetype("MYLINE")}`);
        
        // 5. 获取所有分类
        console.log("=== 5. 线型分类 ===");
        const categories = ltManager.getCategories();
        console.log(`分类: ${categories.join(", ")}`);
        
        // 6. 按分类获取线型
        console.log("=== 6. 按分类获取 ===");
        for (const category of categories) {
            const names = ltManager.getAllLinetypeNames(category);
            console.log(`${category}: ${names.join(", ")}`);
        }
        
        // 7. 导出为.lin格式
        console.log("=== 7. 导出为LIN格式 ===");
        const exportedLin = ltManager.exportToLinFormat(["MYLINE"], "demo");
        console.log("导出结果:");
        console.log(exportedLin);
        
        // 8. 获取统计信息
        console.log("=== 8. 统计信息 ===");
        const stats = ltManager.getStatistics();
        console.log(`总线型数: ${stats.total}`);
        for (const [cat, count] of Object.entries(stats.categories)) {
            console.log(`  ${cat}: ${count} 个`);
        }
        
        // 9. 线型定义的JSON序列化
        console.log("=== 9. JSON序列化 ===");
        const jsonDef = hiddenDef.toJSON();
        console.log(`JSON: ${JSON.stringify(jsonDef, null, 2)}`);
        
        // 从JSON恢复
        const restoredDef = LinetypeDefinition.fromJSON(jsonDef);
        console.log(`从JSON恢复: ${restoredDef.name}`);
        
        // 10. 绘制示例
        console.log("=== 10. 绘制示例 ===");
        const allNames = ltManager.getAllLinetypeNames();
        
        // 只绘制前10个
        const namesToDraw = allNames.slice(0, 10);
        namesToDraw.forEach((ltName, index) => {
            const y = index * 25;
            const line = new LineEnt([0, y], [150, y]);
            line.setDefaults();
            line.lineType = ltName;
            line.lineTypeScale = 0.5;
            Engine.addEntities(line);
        });
        
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
