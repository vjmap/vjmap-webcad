window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --带预览命令--预览绘制示例
        const { MainView, initCadContainer, CircleEnt, Engine, CommandRegistry, CommandDefinition, CommandOptions, PointInputOptions, InputStatusEnum, writeMessage , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 带预览的圆绘制命令
        class CirclePreviewCommand {
            constructor() {
                this.center = null;
            }
            
            async main() {
                writeMessage("<br/>绘制圆（带预览）");
                
                // 开始撤销标记组
                Engine.undoManager.start_undoMark();
                
                try {
                    // 获取圆心
                    const centerResult = await this.getCenter();
                    if (!centerResult) return;
                    
                    // 获取半径（带预览）
                    const radiusResult = await this.getRadius();
                    if (!radiusResult) return;
                    
                    // 创建正式圆
                    this.createCircle(radiusResult);
                    
                } finally {
                    Engine.undoManager.end_undoMark();
                    Engine.clearPreview();
                }
            }
            
            async getCenter() {
                const options = new PointInputOptions("指定圆心:");
                const result = await Engine.getPoint(options);
                
                if (result.status === InputStatusEnum.OK) {
                    this.center = result.value;
                    return true;
                }
                return false;
            }
            
            async getRadius() {
                const options = new PointInputOptions("指定半径:");
                options.useBasePoint = true;
                options.basePoint = this.center;
                
                // 设置预览回调 - 鼠标移动时绘制预览圆
                options.callback = (canvasPoint) => {
                    const worldPoint = Engine.canvasToWcs(canvasPoint);
                    const radius = Math.sqrt(
                        Math.pow(worldPoint.x - this.center.x, 2) +
                        Math.pow(worldPoint.y - this.center.y, 2)
                    );
                    
                    if (radius > 0) {
                        // 使用简化写法创建预览圆
                        const previewCircle = new CircleEnt([this.center.x, this.center.y], radius);
                        previewCircle.setDefaults();
                        Engine.clearPreview();
                        Engine.drawPreviewEntity(previewCircle);
                    }
                };
                
                const result = await Engine.getPoint(options);
                
                if (result.status === InputStatusEnum.OK) {
                    const radiusPoint = result.value;
                    return Math.sqrt(
                        Math.pow(radiusPoint.x - this.center.x, 2) +
                        Math.pow(radiusPoint.y - this.center.y, 2)
                    );
                }
                return null;
            }
            
            createCircle(radius) {
                // 使用简化写法创建正式圆
                const circle = new CircleEnt([this.center.x, this.center.y], radius);
                circle.setDefaults();
                Engine.addEntities(circle);
                writeMessage(`<br/>圆已创建，半径: ${radius.toFixed(2)}`);
            }
        }
        
        // 注册命令
        const options = new CommandOptions();
        CommandRegistry.regist(new CommandDefinition('MYCIRCLE', '带预览的圆', CirclePreviewCommand, options));
        
        message.info("命令 MYCIRCLE 已注册");
        message.info("输入 MYCIRCLE 后，先点击指定圆心，再移动鼠标可以看到预览");
        
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
