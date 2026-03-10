window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --带基点获取点--橡皮筋线示例
        const { 
            MainView, 
            initCadContainer, 
            LineEnt, 
            CircleEnt,
            Engine, 
            PointInputOptions, 
            InputStatusEnum,
            CommandDefinition,
            CommandRegistry,
            getPoint
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
        
        // 带基点点拾取示例命令
        class GetPointWithBaseDemoCommand {
            async main() {
                message.info("先指定起点，移动鼠标显示橡皮筋线");
                
                // 1. 使用默认橡皮筋线
                await this.drawLineWithRubberBand();
                
                // 2. 使用自定义回调函数绘制预览
                await this.drawLineWithCustomPreview();
                
                // 3. 连续绘制
                await this.drawPolylineInteractive();
                
                Engine.zoomExtents();
            }
            
            // 方式1：使用默认橡皮筋线
            async drawLineWithRubberBand() {
                console.log("=== 方式1：默认橡皮筋线 ===");
                
                const opt1 = new PointInputOptions("指定起点:");
                const result1 = await getPoint(opt1);
                
                if (result1.status !== InputStatusEnum.OK) {
                    console.log("用户取消");
                    return;
                }
                
                const startPoint = result1.value;
                console.log(`起点: (${startPoint.x.toFixed(2)}, ${startPoint.y.toFixed(2)})`);
                
                // 使用默认橡皮筋线
                const opt2 = new PointInputOptions("指定终点:");
                opt2.useBasePoint = true;      // 启用橡皮筋线
                opt2.basePoint = startPoint;   // 设置基点
                
                const result2 = await getPoint(opt2);
                
                if (result2.status !== InputStatusEnum.OK) {
                    console.log("用户取消");
                    return;
                }
                
                const endPoint = result2.value;
                
                const line = new LineEnt([startPoint.x, startPoint.y], [endPoint.x, endPoint.y]);
                line.setDefaults();
                Engine.addEntities(line);
                
                console.log(`直线长度: ${line.Length.toFixed(2)}`);
            }
            
            // 方式2：使用自定义回调函数绘制预览（隐藏默认橡皮筋线）
            async drawLineWithCustomPreview() {
                console.log("\n=== 方式2：自定义回调预览 ===");
                message.info("自定义预览：直线 + 端点圆");
                
                const opt1 = new PointInputOptions("指定起点:");
                const result1 = await getPoint(opt1);
                
                if (result1.status !== InputStatusEnum.OK) {
                    console.log("用户取消");
                    return;
                }
                
                const startPoint = result1.value;
                console.log(`起点: (${startPoint.x.toFixed(2)}, ${startPoint.y.toFixed(2)})`);
                
                // 使用自定义回调，隐藏默认橡皮筋线
                const opt2 = new PointInputOptions("指定终点:");
                opt2.useBasePoint = true;
                opt2.basePoint = startPoint;
                opt2.hideRubberBand = true;    // 隐藏默认橡皮筋线
                
                // 自定义回调函数：鼠标移动时绘制预览
                opt2.callback = (canvasPt) => {
                    // 将画布坐标转换为世界坐标
                    const worldPt = Engine.canvasToWcs(canvasPt);
                    
                    // 创建预览直线
                    const previewLine = new LineEnt(
                        [startPoint.x, startPoint.y], 
                        [worldPt.x, worldPt.y]
                    );
                    previewLine.setDefaults();
                    previewLine.color = 1;  // 红色
                    
                    // 创建端点标记圆
                    const endCircle = new CircleEnt([worldPt.x, worldPt.y], 3);
                    endCircle.setDefaults();
                    endCircle.color = 3;  // 绿色
                    
                    // 清除之前的预览，绘制新预览
                    Engine.clearPreview();
                    Engine.drawPreviewEntities([previewLine, endCircle]);
                };
                
                const result2 = await getPoint(opt2);
                
                // 清除预览
                Engine.clearPreview();
                
                if (result2.status !== InputStatusEnum.OK) {
                    console.log("用户取消");
                    return;
                }
                
                const endPoint = result2.value;
                
                // 创建正式实体
                const line = new LineEnt([startPoint.x, startPoint.y], [endPoint.x, endPoint.y]);
                line.setDefaults();
                line.color = 5;  // 蓝色
                Engine.addEntities(line);
                
                console.log(`直线长度: ${line.Length.toFixed(2)}`);
            }
            
            // 方式3：连续绘制多条连接的线段
            async drawPolylineInteractive() {
                console.log("\n=== 方式3：连续绘制线段 ===");
                message.info("点击添加顶点，按 ESC 结束");
                
                const points = [];
                
                const opt1 = new PointInputOptions("指定第一点:");
                const result1 = await getPoint(opt1);
                
                if (result1.status !== InputStatusEnum.OK) return;
                points.push(result1.value);
                
                while (true) {
                    const lastPoint = points[points.length - 1];
                    
                    const opt = new PointInputOptions("指定下一点 (ESC 结束):");
                    opt.useBasePoint = true;
                    opt.basePoint = lastPoint;
                    
                    const result = await getPoint(opt);
                    
                    if (result.status === InputStatusEnum.OK) {
                        const newPoint = result.value;
                        
                        const line = new LineEnt([lastPoint.x, lastPoint.y], [newPoint.x, newPoint.y]);
                        line.setDefaults();
                        line.color = 3;
                        Engine.addEntities(line);
                        
                        points.push(newPoint);
                        console.log(`添加点 ${points.length}: (${newPoint.x.toFixed(2)}, ${newPoint.y.toFixed(2)})`);
                    } else {
                        break;
                    }
                }
                
                console.log(`共绘制了 ${points.length - 1} 条线段`);
            }
        }
        
        // 注册并执行命令
        const cmdDef = new CommandDefinition("GETPOINTWITHBASEDEMO", "带基点点拾取示例", GetPointWithBaseDemoCommand);
        CommandRegistry.regist(cmdDef);
        await Engine.editor.executerWithOp("GETPOINTWITHBASEDEMO");
        
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
