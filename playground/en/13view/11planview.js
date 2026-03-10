window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --平面视图--旋转显示图纸60度（用UCS设置，再切换为平面视图）
        const { MainView, initCadContainer, Engine, Point2D, LineEnt, CircleEnt, PolylineEnt, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 平面视图旋转显示示例 ===");
        
        // ========== 核心概念说明 ==========
        message.info("\n平面视图旋转原理：");
        message.info("1. 设置 UCS 的 X轴角度（UCSXANG）");
        message.info("2. 执行平面视图命令，视图会旋转到与 UCS 对齐");
        message.info("3. 视图旋转角度 twistAngle = -UCSXANG");
        
        // ========== 绘制参考图形 ==========
        // 绘制一个房屋形状，方便观察旋转效果
        const housePoints = [
            [0, 0],
            [100, 0],
            [100, 80],
            [50, 120],  // 屋顶尖
            [0, 80],
            [0, 0]  // 闭合
        ];
        const house = new PolylineEnt(housePoints);
        house.setDefaults();
        house.color = 3;  // 绿色
        Engine.addEntities(house);
        
        // 门
        const door = new PolylineEnt([
            [40, 0],
            [40, 40],
            [60, 40],
            [60, 0]
        ]);
        door.setDefaults();
        door.color = 5;  // 蓝色
        Engine.addEntities(door);
        
        // 窗户
        const window1 = new PolylineEnt([
            [15, 45],
            [15, 65],
            [35, 65],
            [35, 45],
            [15, 45]
        ]);
        window1.setDefaults();
        window1.color = 5;
        Engine.addEntities(window1);
        
        const window2 = new PolylineEnt([
            [65, 45],
            [65, 65],
            [85, 65],
            [85, 45],
            [65, 45]
        ]);
        window2.setDefaults();
        window2.color = 5;
        Engine.addEntities(window2);
        
        // 绘制WCS参考坐标轴（灰色虚线）
        const wcsAxisX = new LineEnt([-50, 0], [150, 0]);
        wcsAxisX.setDefaults();
        wcsAxisX.color = 8;  // 灰色
        Engine.addEntities(wcsAxisX);
        
        const wcsAxisY = new LineEnt([0, -50], [0, 150]);
        wcsAxisY.setDefaults();
        wcsAxisY.color = 8;
        Engine.addEntities(wcsAxisY);
        
        message.info("\n已绘制房屋图形和 WCS 参考坐标轴（灰色）");
        
        Engine.zoomExtents();
        
        // ========== 旋转视图60度的核心函数 ==========
        /**
         * 设置平面视图旋转角度
         * @param {number} angleInDegrees - 旋转角度（度）
         */
        function setPlanViewRotation(angleInDegrees) {
            const angleInRadians = angleInDegrees * Math.PI / 180;
            
            // 保存旧的 UCS 角度和视图旋转角度（用于撤销）
            const oldUcsAngle = Engine.currentSpace.UCSXANG;
            const oldTwistAngle = Engine.currentSpace.twistAngle;
            
            // 步骤1：设置 UCS X轴角度
            Engine.currentSpace.UCSXANG = angleInRadians;
            Engine.undoManager.ucs_undoMark(Engine.currentSpace.UCSORG, oldUcsAngle);
            Engine.pcanvas.updateUcsIsWcs();
            
            // 步骤2：设置平面视图为当前 UCS（核心：twistAngle = -UCSXANG）
            Engine.undoManager.plan_undoMark(oldTwistAngle);
            Engine.currentSpace.twistAngle = -Engine.currentSpace.UCSXANG;
            
            // 更新坐标栏显示
            if (Engine.view.coordsBar) {
                Engine.view.coordsBar.updateCoordsTitle();
            }
            
            // 重新生成夹点并重绘
            Engine.pcanvas.regenGrip();
            Engine.pcanvas.redraw();
            
            message.info(`视图已旋转 ${angleInDegrees}°`);
            message.info(`  UCSXANG = ${(Engine.currentSpace.UCSXANG * 180 / Math.PI).toFixed(2)}°`);
            message.info(`  twistAngle = ${(Engine.currentSpace.twistAngle * 180 / Math.PI).toFixed(2)}°`);
        }
        
        /**
         * 重置为 WCS 平面视图（不旋转）
         */
        function resetToWcsPlanView() {
            const oldUcsAngle = Engine.currentSpace.UCSXANG;
            const oldTwistAngle = Engine.currentSpace.twistAngle;
            
            // 重置 UCS
            Engine.currentSpace.UCSORG = new Point2D();
            Engine.currentSpace.UCSXANG = 0;
            Engine.undoManager.ucs_undoMark(Engine.currentSpace.UCSORG, oldUcsAngle);
            Engine.pcanvas.updateUcsIsWcs();
            
            // 重置平面视图
            Engine.undoManager.plan_undoMark(oldTwistAngle);
            Engine.currentSpace.twistAngle = 0;
            
            if (Engine.view.coordsBar) {
                Engine.view.coordsBar.updateCoordsTitle();
            }
            
            Engine.pcanvas.regenGrip();
            Engine.pcanvas.redraw();
            
            message.info("已重置为 WCS 平面视图（无旋转）");
        }
        
        // ========== 演示 ==========
        message.info("\n=== 开始演示 ===");
        message.info("当前视图：WCS 平面视图（无旋转）");
        
        // 3秒后旋转视图60度
        setTimeout(() => {
            message.info("\n>>> 3秒后：设置视图旋转 60°");
            setPlanViewRotation(60);
        }, 3000);
        
        // 6秒后旋转视图45度
        setTimeout(() => {
            message.info("\n>>> 6秒后：设置视图旋转 45°");
            setPlanViewRotation(45);
        }, 6000);
        
        // 9秒后旋转视图90度
        setTimeout(() => {
            message.info("\n>>> 9秒后：设置视图旋转 90°");
            setPlanViewRotation(90);
        }, 9000);
        
        // 12秒后重置为 WCS
        setTimeout(() => {
            message.info("\n>>> 12秒后：重置为 WCS 平面视图");
            resetToWcsPlanView();
        }, 12000);
        
        message.info("\n提示：也可以使用命令 PLAN 来设置平面视图");
        message.info("  PLAN C - 设置为当前 UCS 的平面视图");
        message.info("  PLAN W - 设置为 WCS 的平面视图");
        
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
