window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --基础反应器--使用事件监听实现实体响应
        const { MainView, initCadContainer, LineEnt, CircleEnt, Engine, CadEvents, writeMessage , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 基础反应器示例 ===");
        message.info("反应器是一种特殊机制，能够实时响应图形变化");
        
        // 反应器：自动为每个圆创建外接正方形
        class CircleBoundingBoxReactor {
            constructor() {
                this.enabled = true;
                this.boundingLines = new Map();  // 存储每个圆对应的边界线
            }
            
            install() {
                // 监听实体添加
                Engine.eventManager.on(CadEvents.EntityAdded, (args) => {
                    if (this.enabled && args.entity.type === 'CIRCLE') {
                        this.createBoundingBox(args.entity);
                    }
                });
                
                // 监听实体修改
                Engine.eventManager.on(CadEvents.EntityModified, (args) => {
                    if (this.enabled && args.entity.type === 'CIRCLE') {
                        this.updateBoundingBox(args.entity);
                    }
                });
                
                // 监听实体删除（批量事件）
                Engine.eventManager.on(CadEvents.EntitiesErased, (args) => {
                    args.entities.forEach(entity => {
                        if (entity.type === 'CIRCLE') {
                            this.removeBoundingBox(entity);
                        }
                    });
                });
                
                message.info("反应器已安装：自动为圆创建外接框");
            }
            
            createBoundingBox(circle) {
                const c = circle.center;
                const r = circle.radius;
                
                // 创建4条线组成外接正方形（使用简化写法）
                const lines = [
                    new LineEnt([c.x - r, c.y - r], [c.x + r, c.y - r]),  // 下
                    new LineEnt([c.x + r, c.y - r], [c.x + r, c.y + r]),  // 右
                    new LineEnt([c.x + r, c.y + r], [c.x - r, c.y + r]),  // 上
                    new LineEnt([c.x - r, c.y + r], [c.x - r, c.y - r]),  // 左
                ];
                
                lines.forEach(line => {
                    line.setDefaults();
                    line.color = 8;  // 灰色
                    Engine.addEntities(line);
                });
                
                this.boundingLines.set(circle.id, lines);
                Engine.regen();
                
                writeMessage(`<br/>已为圆 ${circle.id} 创建外接框`);
            }
            
            updateBoundingBox(circle) {
                const lines = this.boundingLines.get(circle.id);
                if (!lines) return;
                
                const c = circle.center;
                const r = circle.radius;
                
                // 更新4条线的坐标：下、右、上、左
                lines[0].startPoint = [c.x - r, c.y - r]; lines[0].endPoint = [c.x + r, c.y - r];
                lines[1].startPoint = [c.x + r, c.y - r]; lines[1].endPoint = [c.x + r, c.y + r];
                lines[2].startPoint = [c.x + r, c.y + r]; lines[2].endPoint = [c.x - r, c.y + r];
                lines[3].startPoint = [c.x - r, c.y + r]; lines[3].endPoint = [c.x - r, c.y - r];
                
                Engine.regen();
            }
            
            removeBoundingBox(circle) {
                const lines = this.boundingLines.get(circle.id);
                if (lines) {
                    lines.forEach(line => {
                        Engine.eraseEntities(line);
                    });
                    this.boundingLines.delete(circle.id);
                    Engine.regen();
                }
            }
            
            toggle() {
                this.enabled = !this.enabled;
                message.info(`反应器已${this.enabled ? '启用' : '禁用'}`);
            }
        }
        
        // 安装反应器
        const reactor = new CircleBoundingBoxReactor();
        reactor.install();
        
        const circle1 = new CircleEnt([50, 50], 20);
        circle1.setDefaults();
        circle1.color = 1;
        Engine.addEntities(circle1);
        
        
        const circle2 = new CircleEnt([120, 50], 30);
        circle2.setDefaults();
        circle2.color = 3;
        Engine.addEntities(circle2);
        
        Engine.regen();
        Engine.zoomExtents();
        
        message.info("绘制圆时会自动添加外接正方形边框");
        
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
