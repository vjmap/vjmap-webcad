window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --关键字输入--keywords选项用法，绘制不同图形
        const { 
            MainView, 
            initCadContainer, 
            CircleEnt,
            LineEnt,
            ArcEnt,
            Engine, 
            PointInputOptions, 
            InputStatusEnum,
            CommandDefinition,
            CommandRegistry,
            getPoint,
            distance,
            Point2D
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
        
        // 关键字输入示例命令
        class GetKeywordDemoCommand {
            async main() {
                message.info("点击指定点，或输入关键字 L/C/A/E");
                
                await this.mainLoop();
                Engine.zoomExtents();
            }
            
            // 带关键字选项的点拾取
            async getPointWithOptions() {
                const options = new PointInputOptions("指定点 [直线(L)/圆(C)/圆弧(A)/退出(E)]:");
                options.keywords = ["L", "C", "A", "E"];
                
                const result = await getPoint(options);
                
                switch (result.status) {
                    case InputStatusEnum.OK:
                        console.log(`点击坐标: (${result.value.x.toFixed(2)}, ${result.value.y.toFixed(2)})`);
                        return { type: "point", value: result.value };
                        
                    case InputStatusEnum.Keyword:
                        const keyword = result.stringResult.toUpperCase();
                        console.log(`输入关键字: ${keyword}`);
                        
                        switch (keyword) {
                            case "L": return { type: "keyword", value: "LINE" };
                            case "C": return { type: "keyword", value: "CIRCLE" };
                            case "A": return { type: "keyword", value: "ARC" };
                            case "E": return { type: "keyword", value: "EXIT" };
                        }
                        break;
                        
                    case InputStatusEnum.Cancel:
                        console.log("用户取消");
                        return { type: "cancel" };
                }
                
                return null;
            }
            
            // 绘制直线（两点，带预览）
            async drawLine() {
                const opt1 = new PointInputOptions("指定直线起点:");
                const r1 = await getPoint(opt1);
                if (r1.status !== InputStatusEnum.OK) return;
                const startPt = r1.value;
        
                const opt2 = new PointInputOptions("指定直线终点:");
                opt2.basePoint = startPt;
                opt2.callback = (canvasPt) => {
                    const worldPt = Engine.canvasToWcs(canvasPt);
                    const preview = new LineEnt([startPt.x, startPt.y], [worldPt.x, worldPt.y]);
                    preview.setDefaults();
                    Engine.clearPreview();
                    Engine.drawPreviewEntity(preview);
                };
                const r2 = await getPoint(opt2);
                Engine.clearPreview();
                if (r2.status !== InputStatusEnum.OK) return;
        
                const line = new LineEnt([startPt.x, startPt.y], [r2.value.x, r2.value.y]);
                line.setDefaults();
                line.color = 1;
                Engine.addEntities(line);
                console.log("绘制直线完成");
            }
        
            // 绘制圆（圆心+半径点，带预览）
            async drawCircle() {
                const opt1 = new PointInputOptions("指定圆心:");
                const r1 = await getPoint(opt1);
                if (r1.status !== InputStatusEnum.OK) return;
                const center = r1.value;
        
                const opt2 = new PointInputOptions("指定半径点:");
                opt2.basePoint = center;
                opt2.callback = (canvasPt) => {
                    const worldPt = Engine.canvasToWcs(canvasPt);
                    const r = distance(center, worldPt);
                    if (r > 0) {
                        const preview = new CircleEnt([center.x, center.y], r);
                        preview.setDefaults();
                        Engine.clearPreview();
                        Engine.drawPreviewEntity(preview);
                    }
                };
                const r2 = await getPoint(opt2);
                Engine.clearPreview();
                if (r2.status !== InputStatusEnum.OK) return;
        
                const radius = distance(center, r2.value);
                const circle = new CircleEnt([center.x, center.y], radius);
                circle.setDefaults();
                circle.color = 3;
                Engine.addEntities(circle);
                console.log("绘制圆完成，半径:", radius.toFixed(2));
            }
        
            // 绘制圆弧（三点，带预览）
            async drawArc() {
                const opt1 = new PointInputOptions("指定圆弧起点:");
                const r1 = await getPoint(opt1);
                if (r1.status !== InputStatusEnum.OK) return;
                const startPt = r1.value;
        
                const opt2 = new PointInputOptions("指定圆弧上的点:");
                opt2.basePoint = startPt;
                opt2.callback = (canvasPt) => {
                    const worldPt = Engine.canvasToWcs(canvasPt);
                    const preview = new LineEnt([startPt.x, startPt.y], [worldPt.x, worldPt.y]);
                    preview.setDefaults();
                    Engine.clearPreview();
                    Engine.drawPreviewEntity(preview);
                };
                const r2 = await getPoint(opt2);
                Engine.clearPreview();
                if (r2.status !== InputStatusEnum.OK) return;
                const midPt = r2.value;
        
                const opt3 = new PointInputOptions("指定圆弧终点:");
                opt3.basePoint = midPt;
                opt3.callback = (canvasPt) => {
                    const worldPt = Engine.canvasToWcs(canvasPt);
                    const preview = new ArcEnt();
                    preview.initBy3Pt(
                        new Point2D(startPt.x, startPt.y),
                        new Point2D(midPt.x, midPt.y),
                        new Point2D(worldPt.x, worldPt.y)
                    );
                    preview.setDefaults();
                    Engine.clearPreview();
                    Engine.drawPreviewEntity(preview);
                };
                const r3 = await getPoint(opt3);
                Engine.clearPreview();
                if (r3.status !== InputStatusEnum.OK) return;
                const endPt = r3.value;
        
                const arc = new ArcEnt();
                arc.initBy3Pt(
                    new Point2D(startPt.x, startPt.y),
                    new Point2D(midPt.x, midPt.y),
                    new Point2D(endPt.x, endPt.y)
                );
                arc.setDefaults();
                arc.color = 5;
                Engine.addEntities(arc);
                console.log("绘制圆弧完成");
            }
        
            // 主循环
            async mainLoop() {
                let running = true;
                
                while (running) {
                    const result = await this.getPointWithOptions();
                    
                    if (!result || result.type === "cancel") {
                        running = false;
                        continue;
                    }
                    
                    if (result.type === "point") {
                        // 在点击位置创建标记
                        const marker = new CircleEnt([result.value.x, result.value.y], 3);
                        marker.setDefaults();
                        marker.color = 2;
                        Engine.addEntities(marker);
                    } else if (result.type === "keyword") {
                        switch (result.value) {
                            case "LINE":
                                await this.drawLine();
                                break;
                            case "CIRCLE":
                                await this.drawCircle();
                                break;
                            case "ARC":
                                await this.drawArc();
                                break;
                            case "EXIT":
                                console.log("退出");
                                running = false;
                                break;
                        }
                    }
                }
                
                console.log("程序结束");
            }
        }
        
        // 注册并执行命令
        const cmdDef = new CommandDefinition("GETKEYWORDDEMO", "关键字输入示例", GetKeywordDemoCommand);
        CommandRegistry.regist(cmdDef);
        await Engine.editor.executerWithOp("GETKEYWORDDEMO");
        
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
