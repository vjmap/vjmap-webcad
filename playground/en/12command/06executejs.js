window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --执行JS代码--EXECUTEJS执行JavaScript代码示例
        const { MainView, initCadContainer, Engine, Point2D, LineEnt, CircleEnt, writeMessage , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 执行JS代码示例 ===");
        
        // ========== EXECUTEJS 命令说明 ==========
        message.info("\nEXECUTEJS 命令说明：");
        message.info("- 弹出代码输入对话框执行 JavaScript 代码");
        message.info("- 支持 async/await 异步语法");
        message.info("- 提供丰富的执行上下文 API");
        
        // ========== 执行上下文 API ==========
        message.info("\n=== 可用的执行上下文 API ===");
        message.info("Engine      - 核心引擎，访问文档、图层等");
        message.info("Point2D     - 二维点类");
        message.info("LineEnt     - 直线实体类");
        message.info("CircleEnt   - 圆实体类");
        message.info("ArcEnt      - 圆弧实体类");
        message.info("PolylineEnt - 多段线实体类");
        message.info("TextEnt     - 单行文字实体类");
        message.info("MTextEnt    - 多行文字实体类");
        message.info("doc         - 当前文档 (Engine.currentDoc)");
        message.info("writeMessage - 输出消息到命令行");
        message.info("log         - 简化的日志输出");
        message.info("executeCommand - 执行 CAD 命令");
        message.info("addEntity   - 添加实体到文档");
        message.info("regen       - 刷新显示");
        
        // ========== 示例1：使用实体类绘制图形 ==========
        message.info("\n=== 示例1：使用实体类绘制矩形 ===");
        
        const points = [
            [0, 0],
            [100, 0],
            [100, 50],
            [0, 50],
            [0, 0]
        ];
        
        for (let i = 0; i < points.length - 1; i++) {
            const line = new LineEnt(points[i], points[i+1]);
            line.setDefaults();
            line.color = 1;
            Engine.addEntities(line);
        }
        message.info("矩形绘制完成（红色）");
        
        // ========== 示例2：循环绘制同心圆 ==========
        message.info("\n=== 示例2：循环绘制同心圆 ===");
        
        const cx = 150, cy = 100;
        let radius = 20;
        
        for (let i = 0; i < 5; i++) {
            const circle = new CircleEnt([cx, cy], radius);
            circle.setDefaults();
            circle.color = 3;
            Engine.addEntities(circle);
            radius += 15;
        }
        message.info("同心圆绘制完成（绿色）");
        
        // ========== 示例3：绘制网格点阵 ==========
        message.info("\n=== 示例3：绘制网格点阵 ===");
        
        const rows = 3, cols = 4;
        const spacing = 30;
        const dotRadius = 5;
        
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                const circle = new CircleEnt([x * spacing, 150 + y * spacing], dotRadius);
                circle.setDefaults();
                circle.color = 5;
                Engine.addEntities(circle);
            }
        }
        message.info(`网格点阵绘制完成: ${rows}x${cols}（蓝色）`);
        
        Engine.zoomExtents();
        
        // ========== 示例4：查询实体信息 ==========
        message.info("\n=== 示例4：查询实体信息 ===");
        
        const entities = Engine.currentSpace.aliveItems;
        let lineCount = 0;
        let circleCount = 0;
        let otherCount = 0;
        
        for (const ent of entities) {
            if (ent.type === "LINE") {
                lineCount++;
            } else if (ent.type === "CIRCLE") {
                circleCount++;
            } else {
                otherCount++;
            }
        }
        
        message.info("实体统计:");
        message.info("  直线: " + lineCount);
        message.info("  圆: " + circleCount);
        message.info("  其他: " + otherCount);
        message.info("  总计: " + entities.length);
        
        // ========== 命令使用说明 ==========
        message.info("\n=== 命令使用 ===");
        message.info("执行命令: Engine.editor.executerWithOp('EXECUTEJS')");
        message.info("对话框中输入 JavaScript 代码后点击执行");
        
        // ========== 代码示例模板 ==========
        message.info("\n=== 代码示例模板 ===");
        const codeTemplate = `
        // 绘制实体示例
        const circle = new CircleEnt([50, 50], 30);
        circle.setDefaults();
        circle.color = 1;
        addEntity(circle);
        regen();
        
        // 执行命令示例
        await executeCommand(\`CIRCLE
        100,100
        20
        \`);
        
        // 查询当前图层
        log("当前图层: " + doc.currentLayer.name);
        `;
        
        console.log("JS代码示例模板:", codeTemplate);
        message.info("代码模板已输出到控制台");
        
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
