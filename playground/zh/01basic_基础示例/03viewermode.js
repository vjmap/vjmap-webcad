window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --Viewer查看模式--只显示绘图区域,隐藏菜单工具栏命令行
        const { MainView, initCadContainer, LineEnt, CircleEnt, ArcEnt, Engine, CadEventManager, CadEvents, message, Point2D } = vjcad;
        
        message.info("=== Viewer 查看模式 ===");
        message.info("只显示绘图区域，隐藏菜单、工具栏、命令行等");
        message.info("适用于只需要查看和选择实体的场景");
        
        // 使用 viewMode: "viewer" 创建只显示绘图区域的视图
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            
            // 设置 viewer 模式，只显示绘图区域
            viewMode: "viewer",
            
            // 隐藏坐标轴
            showUcsIcon: false,
            showAxis: false,
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建右下角坐标显示 div
        const coordsDiv = document.createElement('div');
        coordsDiv.id = 'viewer-coords';
        coordsDiv.style.cssText = `
            position: absolute;
            right: 10px;
            bottom: 10px;
            padding: 6px 12px;
            background-color: rgba(30, 42, 54, 0.9);
            border: 1px solid #3d4a5c;
            border-radius: 4px;
            color: #e8eaed;
            font-family: sans-serif, Arial;
            font-size: 13px;
            z-index: 1000;
            pointer-events: none;
        `;
        coordsDiv.innerHTML = 'X: 0.00, Y: 0.00';
        document.getElementById('map').appendChild(coordsDiv);
        
        // 监听鼠标移动，更新 WCS 坐标显示
        const canvas = Engine.pcanvas;
        canvas.div.addEventListener('mousemove', (e) => {
            // 获取画布坐标
            const canvasPt = new Point2D(e.offsetX, e.offsetY);
            // 转换为 WCS 坐标
            const wcsPt = canvas.trans.CanvasToWcs(canvasPt);
            // 更新显示
            coordsDiv.innerHTML = `X: ${wcsPt.x.toFixed(2)}, Y: ${wcsPt.y.toFixed(2)}`;
        });
        
        // 创建示例实体
        const line1 = new LineEnt([0, 0], [100, 0]);
        line1.setDefaults();
        line1.color = 1;
        
        const line2 = new LineEnt([100, 0], [100, 80]);
        line2.setDefaults();
        line2.color = 2;
        
        const circle = new CircleEnt([50, 40], 30);
        circle.setDefaults();
        circle.color = 3;
        
        const arc = new ArcEnt([50, 40], 50, 0, Math.PI / 2);
        arc.setDefaults();
        arc.color = 4;
        
        Engine.addEntities([line1, line2, circle, arc]);
        Engine.zoomExtents();
        
        // 监听选择变化事件，获取选中实体信息
        const events = CadEventManager.getInstance();
        events.on(CadEvents.SelectionChanged, (args) => {
            const entities = args.currentSelection;
            
            if (entities.length === 0) {
                message.info("选择已清空");
                return;
            }
            
            message.info(`选中 ${entities.length} 个实体:`);
            entities.forEach((ent, index) => {
                message.info(`  [${index + 1}] 类型: ${ent.type}, objectId: ${ent.objectId}, 颜色: ${ent.color}`);
            });
        });
        
        message.info("\n=== 使用说明 ===");
        message.info("1. 点击实体可选中，ESC 取消选择");
        message.info("2. 框选可多选实体");
        message.info("3. 右下角显示鼠标 WCS 坐标");
        message.info("4. 选择事件会输出实体信息");
        
        message.info("\n=== 配置选项 ===");
        message.info("viewMode: 'viewer' - 查看模式");
        message.info("showUcsIcon: false - 隐藏左下角坐标轴");
        message.info("showAxis: false - 隐藏图中坐标轴");
        message.info("enableContextMenu: false - 禁用右键菜单（默认）");
        message.info("showGrips: false - 禁用夹点（默认）");
        
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
