window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --状态机命令--多步骤命令示例
        const { MainView, initCadContainer, PolylineEnt, Engine, CommandRegistry, CommandDefinition, CommandOptions, PointInputOptions, InputStatusEnum, writeMessage , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 使用状态机模式的多段线命令
        class MyPlineCommand {
            constructor() {
                this.step = 1;
                this.points = [];
                this.isClosed = false;
            }
            
            async main() {
                writeMessage("<br/>绘制多段线（状态机模式）");
                Engine.undoManager.start_undoMark();
                
                try {
                    // 状态机循环
                    while (this.step > 0) {
                        switch (this.step) {
                            case 1:
                                await this.step1_getFirstPoint();
                                break;
                            case 2:
                                await this.step2_getNextPoints();
                                break;
                            case 3:
                                this.step3_finish();
                                break;
                        }
                    }
                } finally {
                    Engine.undoManager.end_undoMark();
                    Engine.clearPreview();
                }
            }
            
            async step1_getFirstPoint() {
                const options = new PointInputOptions("指定起点:");
                const result = await Engine.getPoint(options);
                
                if (result.status === InputStatusEnum.OK) {
                    this.points.push(result.value);
                    this.step = 2;
                } else {
                    this.step = 0;  // 退出
                }
            }
            
            async step2_getNextPoints() {
                const lastPoint = this.points[this.points.length - 1];
                
                const options = new PointInputOptions("指定下一点 [闭合(C)/撤销(U)] <完成>:");
                options.keywords = ["C", "U"];
                options.useBasePoint = true;
                options.basePoint = lastPoint;
                
                // 预览
                options.callback = (canvasPoint) => {
                    const worldPoint = Engine.canvasToWcs(canvasPoint);
                    this.drawPreview(worldPoint);
                };
                
                const result = await Engine.getPoint(options);
                
                if (result.status === InputStatusEnum.OK) {
                    this.points.push(result.value);
                } else if (result.stringResult === "C") {
                    if (this.points.length >= 3) {
                        this.isClosed = true;
                        this.step = 3;
                    } else {
                        writeMessage("<br/>至少需要3个点才能闭合");
                    }
                } else if (result.stringResult === "U") {
                    if (this.points.length > 1) {
                        this.points.pop();
                        writeMessage("<br/>已撤销上一点");
                    } else {
                        this.step = 1;
                    }
                } else if (result.status === InputStatusEnum.EnterOrSpace) {
                    this.step = 3;  // 完成
                } else {
                    this.step = 0;  // 取消
                }
            }
            
            step3_finish() {
                if (this.points.length >= 2) {
                    this.createPolyline();
                } else {
                    writeMessage("<br/>至少需要2个点");
                }
                this.step = 0;
            }
            
            drawPreview(currentPoint) {
                if (this.points.length === 0) return;
                
                // 使用简化写法创建预览多段线
                const previewPline = new PolylineEnt();
                for (const pt of this.points) {
                    previewPline.addVertex([pt.x, pt.y]);
                }
                previewPline.addVertex([currentPoint.x, currentPoint.y]);
                previewPline.setDefaults();
                
                Engine.clearPreview();
                Engine.drawPreviewEntity(previewPline);
            }
            
            createPolyline() {
                // 使用简化写法创建正式多段线
                const pline = new PolylineEnt();
                for (const pt of this.points) {
                    pline.addVertex([pt.x, pt.y]);
                }
                pline.isClosed = this.isClosed;
                pline.setDefaults();
                Engine.addEntities(pline);
                
                writeMessage(`<br/>已创建${this.isClosed ? '闭合' : ''}多段线，${this.points.length}个顶点`);
            }
        }
        
        // 注册命令
        const options = new CommandOptions();
        CommandRegistry.regist(new CommandDefinition('MYPLINE', '状态机多段线', MyPlineCommand, options));
        
        message.info("命令 MYPLINE 已注册");
        message.info("输入 MYPLINE，然后依次点击多个点，按回车完成，输入C闭合，输入U撤销");
        
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
