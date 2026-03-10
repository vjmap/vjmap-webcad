window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --线宽设置--lineWeight属性、标准线宽值、图层线宽、LWDISPLAY显示开关
        const { MainView, initCadContainer, LineEnt, CircleEnt, Engine, message, SystemConstants } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // ========== 1. 标准线宽值展示 ==========
        // 线宽单位：0.01mm（如 25 = 0.25mm，100 = 1.00mm）
        // 特殊值：-1 = 随层(ByLayer)，-2 = 随块(ByBlock)，-3 = 默认(Default → 0.25mm)
        
        message.info("--- 标准线宽值 ---");
        
        const standardWeights = [
            { value: 0,   label: "0.00mm（细线）" },
            { value: 5,   label: "0.05mm" },
            { value: 9,   label: "0.09mm" },
            { value: 13,  label: "0.13mm" },
            { value: 15,  label: "0.15mm" },
            { value: 20,  label: "0.20mm" },
            { value: 25,  label: "0.25mm（系统默认）" },
            { value: 30,  label: "0.30mm" },
            { value: 40,  label: "0.40mm" },
            { value: 50,  label: "0.50mm" },
            { value: 70,  label: "0.70mm" },
            { value: 100, label: "1.00mm" },
            { value: 140, label: "1.40mm" },
            { value: 200, label: "2.00mm" },
            { value: 211, label: "2.11mm（最粗）" },
        ];
        
        standardWeights.forEach((item, index) => {
            const y = -index * 12;
            const line = new LineEnt([0, y], [120, y]);
            line.setDefaults();
            line.color = 7; // white
            line.lineWeight = item.value;
            Engine.addEntities(line);
        });
        
        message.info(`已创建 ${standardWeights.length} 条不同线宽的线段`);
        
        // ========== 2. 特殊线宽值 ==========
        
        message.info("--- 特殊线宽值 ---");
        
        // 创建一个带线宽的图层
        const doc = Engine.currentDoc;
        if (!doc.layers.has("粗线层")) {
            doc.layers.add("粗线层", {
                color: 1,       // red
                lineWeight: 100  // 1.00mm
            });
        }
        
        // -1 = ByLayer：继承图层线宽
        const byLayerLine = new LineEnt([150, 0], [270, 0]);
        byLayerLine.setDefaults();
        byLayerLine.layer = "粗线层";
        byLayerLine.lineWeight = -1;  // ByLayer → 继承"粗线层"的1.00mm
        Engine.addEntities(byLayerLine);
        message.info("ByLayer(-1): 继承图层'粗线层'的线宽 1.00mm");
        
        // -2 = ByBlock：在块引用中继承块的线宽，独立使用时为0.25mm
        const byBlockLine = new LineEnt([150, -20], [270, -20]);
        byBlockLine.setDefaults();
        byBlockLine.color = 2; // yellow
        byBlockLine.lineWeight = -2;  // ByBlock
        Engine.addEntities(byBlockLine);
        message.info("ByBlock(-2): 在块引用中继承块的线宽，独立使用时为 0.25mm");
        
        // -3 = Default：使用系统默认值（LWDEFAULT = 0.25mm）
        const defaultLine = new LineEnt([150, -40], [270, -40]);
        defaultLine.setDefaults();
        defaultLine.color = 3; // green
        defaultLine.lineWeight = -3;  // Default
        Engine.addEntities(defaultLine);
        message.info("Default(-3): 使用 LWDEFAULT 系统变量值 (0.25mm)");
        
        // ========== 3. 图层线宽 ==========
        
        message.info("--- 图层线宽 ---");
        
        const layerWeights = [
            { name: "细线层", color: 4, weight: 13 },
            { name: "中线层", color: 5, weight: 50 },
            { name: "粗线层-2", color: 6, weight: 140 },
        ];
        
        layerWeights.forEach((cfg, index) => {
            if (!doc.layers.has(cfg.name)) {
                doc.layers.add(cfg.name, {
                    color: cfg.color,
                    lineWeight: cfg.weight
                });
            }
            const y = -80 - index * 20;
            const line = new LineEnt([150, y], [270, y]);
            line.setDefaults();
            line.layer = cfg.name;
            line.lineWeight = -1; // ByLayer
            Engine.addEntities(line);
            message.info(`${cfg.name}: lineWeight=${cfg.weight} (${cfg.weight / 100}mm)`);
        });
        
        // ========== 4. 线宽与颜色组合 ==========
        
        message.info("--- 线宽与颜色组合 ---");
        
        const colorWeightPairs = [
            { color: 1, weight: 25,  y: -160 },
            { color: 2, weight: 50,  y: -175 },
            { color: 3, weight: 100, y: -190 },
            { color: 4, weight: 140, y: -210 },
            { color: 5, weight: 200, y: -230 },
        ];
        
        colorWeightPairs.forEach((item) => {
            const circle = new CircleEnt([60, item.y], 20);
            circle.setDefaults();
            circle.color = item.color;
            circle.lineWeight = item.weight;
            Engine.addEntities(circle);
        
            const line = new LineEnt([90, item.y], [270, item.y]);
            line.setDefaults();
            line.color = item.color;
            line.lineWeight = item.weight;
            Engine.addEntities(line);
        });
        
        // ========== 5. 线宽显示开关 ==========
        
        message.info("--- 线宽显示开关 ---");
        message.info("需要 LWDISPLAY=true 且 SHOW_LINEWEIGHT=true 才显示线宽");
        
        // 确保线宽显示已开启
        Engine.currentDoc.docEnv.LWDISPLAY = true;
        SystemConstants.SHOW_LINEWEIGHT = true;
        Engine.regen(true);
        
        Engine.zoomExtents();
        
        message.info("当前线宽显示状态: 已开启");
        message.info("LWDISPLAY=" + Engine.currentDoc.docEnv.LWDISPLAY);
        message.info("SHOW_LINEWEIGHT=" + SystemConstants.SHOW_LINEWEIGHT);
        
        // 定时切换演示
        setTimeout(() => {
            Engine.currentDoc.docEnv.LWDISPLAY = false;
            Engine.regen(true);
            message.info("3秒后: 关闭线宽显示（LWDISPLAY=false）→ 所有线条变为1像素细线");
        }, 3000);
        
        setTimeout(() => {
            Engine.currentDoc.docEnv.LWDISPLAY = true;
            Engine.regen(true);
            message.info("6秒后: 重新开启线宽显示（LWDISPLAY=true）→ 线宽恢复");
        }, 6000);
        
        setTimeout(() => {
            SystemConstants.SHOW_LINEWEIGHT = false;
            Engine.regen(true);
            message.info("9秒后: 关闭前端线宽渲染（SHOW_LINEWEIGHT=false）→ 所有线条变为1像素细线");
        }, 9000);
        
        setTimeout(() => {
            SystemConstants.SHOW_LINEWEIGHT = true;
            Engine.regen(true);
            Engine.zoomExtents();
            message.info("12秒后: 全部恢复开启，线宽正常显示");
            message.info("提示: LWDISPLAY 保存到DWG，SHOW_LINEWEIGHT 仅影响前端渲染");
        }, 12000);
        
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
