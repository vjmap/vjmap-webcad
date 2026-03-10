window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --默认线型--显示系统内置的所有线型样式
        const { MainView, initCadContainer, LineEnt, PolylineEnt, Engine , message } = vjcad;
        
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
        // 内置线型说明
        // ============================================================
        // 
        // 系统默认提供以下线型：
        // 
        // | 线型名称    | 说明         | 模式                    |
        // |-------------|-------------|------------------------|
        // | Continuous  | 连续线/实线  | 无间断                 |
        // | Hidden      | 虚线         | __ __ __ __ __ __      |
        // | Center      | 中心线       | ____ _ ____ _ ____     |
        // | Phantom     | 幻影线       | ______ __ __ ______    |
        // | ByLayer     | 随层线型     | 使用图层定义的线型      |
        //
        // ============================================================
        
        // 获取线型管理器中所有线型
        const ltManager = Engine.linetypeManager;
        const allLinetypes = ltManager.getAllLinetypes();
        
        message.info(`系统共有 ${allLinetypes.length} 种线型`);
        
        // 显示每种线型的详细信息
        const linetypeInfo = [
            { name: "CONTINUOUS", desc: "连续线（实线）", pattern: "────────────" },
            { name: "HIDDEN", desc: "虚线", pattern: "── ── ── ──" },
            { name: "CENTER", desc: "中心线", pattern: "──── ─ ──── ─" },
            { name: "PHANTOM", desc: "幻影线", pattern: "────── ── ── ──────" },
        ];
        
        // 绘制每种线型的示例
        linetypeInfo.forEach((info, index) => {
            const y = index * 30;
            
            // 绘制线条
            const line = new LineEnt([0, y], [200, y]);
            line.setDefaults();
            line.lineType = info.name;
            line.lineTypeScale = 1.0;
            Engine.addEntities(line);
            
            // 输出信息
            console.log(`${info.name}: ${info.desc} ${info.pattern}`);
        });
        
        // 从线型管理器获取线型定义并显示详细参数
        console.log("--- 线型定义详情 ---");
        for (const def of allLinetypes) {
            const pattern = def.getSimplePattern();
            const patternStr = pattern.map(p => {
                if (p > 0) return `实线(${p})`;
                if (p < 0) return `间隙(${Math.abs(p)})`;
                return `点(0)`;
            }).join(", ");
            
            console.log(`${def.name}: ${def.description}`);
            console.log(`  模式: [${patternStr}]`);
            console.log(`  总长度: ${def.patternLength}`);
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
