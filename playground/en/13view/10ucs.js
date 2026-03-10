window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --UCS用户坐标系--UCS坐标系设置示例
        const { MainView, initCadContainer, Engine, Point2D, LineEnt, CircleEnt , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== UCS 用户坐标系示例 ===");
        
        // ========== UCS 基本概念 ==========
        message.info("\nUCS（用户坐标系）说明：");
        message.info("- WCS: 世界坐标系（固定不变）");
        message.info("- UCS: 用户坐标系（可以移动和旋转）");
        message.info("- UCSORG: UCS 原点位置");
        message.info("- UCSXANG: UCS X轴旋转角度（弧度）");
        
        // ========== 获取当前 UCS 信息 ==========
        message.info("\n=== 当前 UCS 信息 ===");
        const currentOrigin = Engine.currentSpace.UCSORG;
        const currentAngle = Engine.currentSpace.UCSXANG;
        
        message.info("UCS原点: (" + currentOrigin.x + ", " + currentOrigin.y + ")");
        message.info("UCS角度: " + (currentAngle * 180 / Math.PI).toFixed(2) + "°");
        
        // 绘制参考图形（在 WCS 下）
        const refLine1 = new LineEnt([0, 0], [100, 0]);
        refLine1.setDefaults();
        refLine1.color = 8;  // 灰色
        Engine.addEntities(refLine1);
        
        const refLine2 = new LineEnt([0, 0], [0, 100]);
        refLine2.setDefaults();
        refLine2.color = 8;
        Engine.addEntities(refLine2);
        
        const refCircle = new CircleEnt([0, 0], 10);
        refCircle.setDefaults();
        refCircle.color = 8;
        Engine.addEntities(refCircle);
        
        message.info("\n已绘制 WCS 参考坐标轴（灰色）");
        
        // ========== 设置新的 UCS ==========
        message.info("\n=== 设置新的 UCS ===");
        
        // 方法1：直接设置 UCS 原点和角度
        function setUCS(origin, angleInDegrees) {
            const angleInRadians = angleInDegrees * Math.PI / 180;
            
            // 保存旧值用于撤销
            const oldOrigin = Engine.currentSpace.UCSORG;
            const oldAngle = Engine.currentSpace.UCSXANG;
            
            // 设置新的 UCS
            Engine.currentSpace.UCSORG = new Point2D(origin[0], origin[1]);
            Engine.currentSpace.UCSXANG = angleInRadians;
            
            // 记录撤销
            Engine.undoManager.ucs_undoMark(oldOrigin, oldAngle);
            
            // 更新 UCS 状态
            Engine.pcanvas.updateUcsIsWcs();
            
            // 更新坐标栏显示
            if (Engine.view.coordsBar) {
                Engine.view.coordsBar.updateCoordsTitle();
            }
            
            Engine.pcanvas.redraw();
            
            message.info(`UCS 已设置: 原点(${origin[0]}, ${origin[1]}), 角度 ${angleInDegrees}°`);
        }
        
        // 方法2：重置为 WCS
        function resetToWCS() {
            setUCS([0, 0], 0);
            message.info("UCS 已重置为 WCS");
        }
        
        // 5秒后设置新的 UCS（原点移到 50,50，旋转 30 度）
        setTimeout(() => {
            message.info("\n正在设置新的 UCS（原点: 50,50, 角度: 30°）...");
            setUCS([50, 50], 30);
            
            // 在新的 UCS 下绘制图形（红色）
            const line1 = new LineEnt([0, 0], [60, 0]);
            line1.setDefaults();
            line1.color = 1;
            Engine.addEntities(line1);
            
            const line2 = new LineEnt([0, 0], [0, 60]);
            line2.setDefaults();
            line2.color = 1;
            Engine.addEntities(line2);
            
            const circle = new CircleEnt([0, 0], 8);
            circle.setDefaults();
            circle.color = 1;
            Engine.addEntities(circle);
            
            message.info("已在新 UCS 下绘制坐标轴（红色）");
        }, 5000);
        
        // 10秒后重置为 WCS
        setTimeout(() => {
            message.info("\n正在重置为 WCS...");
            resetToWCS();
        }, 10000);
        
        Engine.zoomExtents();
        
        // ========== UCS 命令说明 ==========
        message.info("\n=== UCS 命令 ===");
        message.info("UCS 命令用法：");
        message.info("  1. 指定基准点（新 UCS 原点）");
        message.info("  2. 指定第二点（确定 X 轴方向）");
        message.info("  输入 W 重置为 WCS");
        message.info("\n执行命令: Engine.editor.executerWithOp('UCS')");
        
        message.info("\n5秒后将设置新的 UCS（原点: 50,50, 角度: 30°）");
        message.info("10秒后将重置为 WCS");
        
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
