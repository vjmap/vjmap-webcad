window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --约束反应器--实现几何约束关系
        const { 
            MainView, 
            initCadContainer, 
            LineEnt, 
            CircleEnt,
            Point2D,
            Engine, 
            CadEvents, 
            writeMessage 
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
        
        message.info("=== 约束反应器示例 ===");
        message.info("演示如何用反应器实现几何约束");
        
        // 端点连接约束：保持线段端点连接
        class EndpointConstraintReactor {
            constructor() {
                this.constraints = [];  // { line1Id, point1, line2Id, point2 }
                this.updating = false;  // 防止递归更新
            }
            
            install() {
                Engine.eventManager.on(CadEvents.EntityModified, (args) => {
                    if (this.updating) return;
                    this.onEntityModified(args.entity);
                });
                
                message.info("端点约束反应器已安装");
            }
            
            // 添加约束：line1 的 point1 端连接到 line2 的 point2 端
            addConstraint(line1Id, point1, line2Id, point2) {
                this.constraints.push({ line1Id, point1, line2Id, point2 });
                writeMessage(`<br/>添加约束: 线${line1Id}的${point1}端 ↔ 线${line2Id}的${point2}端`);
            }
            
            onEntityModified(entity) {
                if (entity.type !== 'LINE') return;
                
                this.updating = true;
                
                this.constraints.forEach(c => {
                    if (c.line1Id === entity.id) {
                        // line1 移动了，更新 line2
                        const line2 = Engine.getEntities().find(e => e.id === c.line2Id);
                        if (line2) {
                            const targetPoint = c.point1 === 'start' 
                                ? entity.startPoint 
                                : entity.endPoint;
                            
                            if (c.point2 === 'start') {
                                line2.startPoint = [targetPoint.x, targetPoint.y];
                            } else {
                                line2.endPoint = [targetPoint.x, targetPoint.y];
                            }
                        }
                    } else if (c.line2Id === entity.id) {
                        // line2 移动了，更新 line1
                        const line1 = Engine.getEntities().find(e => e.id === c.line1Id);
                        if (line1) {
                            const targetPoint = c.point2 === 'start' 
                                ? entity.startPoint 
                                : entity.endPoint;
                            
                            if (c.point1 === 'start') {
                                line1.startPoint = [targetPoint.x, targetPoint.y];
                            } else {
                                line1.endPoint = [targetPoint.x, targetPoint.y];
                            }
                        }
                    }
                });
                
                Engine.regen();
                this.updating = false;
            }
        }
        
        // 圆心距离约束：保持两圆圆心距离恒定
        class DistanceConstraintReactor {
            constructor() {
                this.constraints = [];  // { circle1Id, circle2Id, distance }
                this.updating = false;
            }
            
            install() {
                Engine.eventManager.on(CadEvents.EntityModified, (args) => {
                    if (this.updating) return;
                    this.onEntityModified(args.entity);
                });
                
                message.info("距离约束反应器已安装");
            }
            
            // 添加距离约束
            addConstraint(circle1Id, circle2Id) {
                const circle1 = Engine.getEntities().find(e => e.id === circle1Id);
                const circle2 = Engine.getEntities().find(e => e.id === circle2Id);
                if (!circle1 || !circle2) return;
                
                const dx = circle2.center.x - circle1.center.x;
                const dy = circle2.center.y - circle1.center.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                this.constraints.push({ circle1Id, circle2Id, distance });
                writeMessage(`<br/>添加距离约束: 圆心距离固定为 ${distance.toFixed(2)}`);
            }
            
            onEntityModified(entity) {
                if (entity.type !== 'CIRCLE') return;
                
                this.updating = true;
                
                this.constraints.forEach(c => {
                    if (c.circle1Id === entity.id) {
                        // circle1 移动了，更新 circle2
                        const circle2 = Engine.getEntities().find(e => e.id === c.circle2Id);
                        if (circle2) {
                            const dx = circle2.center.x - entity.center.x;
                            const dy = circle2.center.y - entity.center.y;
                            const currentDist = Math.sqrt(dx * dx + dy * dy);
                            
                            if (currentDist > 0.001) {
                                const scale = c.distance / currentDist;
                                circle2.center = new Point2D(
                                    entity.center.x + dx * scale,
                                    entity.center.y + dy * scale
                                );
                            }
                        }
                    } else if (c.circle2Id === entity.id) {
                        // circle2 移动了，更新 circle1
                        const circle1 = Engine.getEntities().find(e => e.id === c.circle1Id);
                        if (circle1) {
                            const dx = circle1.center.x - entity.center.x;
                            const dy = circle1.center.y - entity.center.y;
                            const currentDist = Math.sqrt(dx * dx + dy * dy);
                            
                            if (currentDist > 0.001) {
                                const scale = c.distance / currentDist;
                                circle1.center = new Point2D(
                                    entity.center.x + dx * scale,
                                    entity.center.y + dy * scale
                                );
                            }
                        }
                    }
                });
                
                Engine.regen();
                this.updating = false;
            }
        }
        
        // 安装反应器
        const endpointReactor = new EndpointConstraintReactor();
        endpointReactor.install();
        
        const distanceReactor = new DistanceConstraintReactor();
        distanceReactor.install();
        
        // 创建连接的线段（形成折线）
        const line1 = new LineEnt([0, 0], [60, 40]);
        line1.setDefaults();
        line1.color = 1;
        Engine.addEntities(line1);
        
        const line2 = new LineEnt([60, 40], [120, 20]);
        line2.setDefaults();
        line2.color = 1;
        Engine.addEntities(line2);
        
        const line3 = new LineEnt([120, 20], [180, 60]);
        line3.setDefaults();
        line3.color = 1;
        Engine.addEntities(line3);
        
        // 添加端点连接约束
        endpointReactor.addConstraint(line1.id, 'end', line2.id, 'start');
        endpointReactor.addConstraint(line2.id, 'end', line3.id, 'start');
        
        // 创建距离约束的两个圆
        const circle1 = new CircleEnt([0, -80], 20);
        circle1.setDefaults();
        circle1.color = 3;
        Engine.addEntities(circle1);
        
        const circle2 = new CircleEnt([80, -80], 15);
        circle2.setDefaults();
        circle2.color = 5;
        Engine.addEntities(circle2);
        
        // 添加圆心距离约束
        distanceReactor.addConstraint(circle1.id, circle2.id);
        
        Engine.regen();
        Engine.zoomExtents();
        
        message.info("红色线段：端点连接约束（移动一条线，连接点会保持）");
        message.info("绿蓝色圆：距离约束（移动一个圆，另一个圆会保持距离）");
        
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
