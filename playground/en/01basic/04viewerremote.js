window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --Viewer查看远程图纸--只读模式打开后端图纸
        const { MainView, initCadContainer, Engine, DrawingManagerService, CadEventManager, CadEvents, message, Point2D } = vjcad;
        
        message.info("=== Viewer 查看远程图纸 ===");
        message.info("使用 viewer 模式打开后端图纸，只显示绘图区域");
        message.info("适用于嵌入第三方系统的图纸查看场景");
        
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
            const canvasPt = new Point2D(e.offsetX, e.offsetY);
            const wcsPt = canvas.trans.CanvasToWcs(canvasPt);
            coordsDiv.innerHTML = `X: ${wcsPt.x.toFixed(2)}, Y: ${wcsPt.y.toFixed(2)}`;
        });
        
        // 从服务端打开图纸
        message.info("");
        message.info("正在从服务端加载图纸...");
        
        const drawingManager = new DrawingManagerService();
        
        const openResult = await drawingManager.openDrawing({
            type: 'imports',
            mapid: env.exampleMapId,
            version: 'v1',
            branch: 'main',
            patchId: 'base',
            readOnly: true  // viewer模式使用只读
        });
        
        if (!openResult.success) throw new Error(`打开图纸失败: ${openResult.error}`);
        
        // 加载到编辑器
        const webcadData = openResult.webcadData;
        const jsonString = openResult.webcadJson;
        const docName = `${env.exampleMapId}_v1_main`;
        const virtualFile = new File([jsonString], docName, { type: 'application/json' });
        await Engine.view.openDbDoc(virtualFile, webcadData);
        
        // 保存来源信息（viewer模式不支持保存来源信息）
        // Engine.currentDoc.serverSource = {
        //     type: 'imports',
        //     mapid: env.exampleMapId,
        //     version: 'v1',
        //     branchName: 'main',
        //     lastPatchId: openResult.latestPatchId || 'base'
        // };
        
        Engine.zoomExtents();
        
        message.info("图纸加载完成!");
        message.info(`图纸ID: ${env.exampleMapId}`);
        message.info(`版本: v1, 分支: main`);
        
        // 监听选择变化事件
        const events = CadEventManager.getInstance();
        events.on(CadEvents.SelectionChanged, (args) => {
            const entities = args.currentSelection;
            
            if (entities.length === 0) {
                message.info("选择已清空");
                return;
            }
            
            message.info(`选中 ${entities.length} 个实体:`);
            entities.forEach((ent, index) => {
                message.info(`  [${index + 1}] 类型: ${ent.type}, objectId: ${ent.objectId}`);
            });
        });
        
        message.info("");
        message.info("=== 使用说明 ===");
        message.info("1. 点击实体可选中，ESC 取消选择");
        message.info("2. 框选可多选实体");
        message.info("3. 右下角显示鼠标 WCS 坐标");
        message.info("4. 滚轮缩放，拖拽平移");
        
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
