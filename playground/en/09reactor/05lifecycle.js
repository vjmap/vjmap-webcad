window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --生命周期反应器--监控实体的完整生命周期
        const { 
            MainView, 
            initCadContainer, 
            LineEnt, 
            CircleEnt,
            TextEnt,
            Point2D,
            Engine, 
            CadEvents 
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
        
        message.info("=== 生命周期反应器示例 ===");
        message.info("演示如何监控实体的创建、修改、删除全过程");
        
        // 实体生命周期日志记录器
        class LifecycleLogger {
            constructor() {
                this.logs = [];
                this.maxLogs = 10;
                this.logText = null;
            }
            
            install() {
                // 监听实体添加
                Engine.eventManager.on(CadEvents.EntityAdded, (args) => {
                    this.addLog('创建', args.entity);
                });
                
                // 监听实体修改
                Engine.eventManager.on(CadEvents.EntityModified, (args) => {
                    this.addLog('修改', args.entity);
                });
                
                // 监听实体删除
                Engine.eventManager.on(CadEvents.EntitiesErased, (args) => {
                    args.entities.forEach(entity => {
                        this.addLog('删除', entity);
                    });
                });
                
                // 监听选择变化
                Engine.eventManager.on(CadEvents.SelectionChanged, (args) => {
                    const count = args.selections ? args.selections.length : 0;
                    if (count > 0) {
                        this.addLog(`选择 ${count} 个实体`, null);
                    }
                });
                
                // 创建日志显示区域
                this.createLogDisplay();
                message.info("生命周期反应器已安装");
            }
            
            createLogDisplay() {
                this.logText = new TextEnt();
                this.logText.setDefaults();
                this.logText.position = new Point2D(-100, 120);
                this.logText.height = 5;
                this.logText.color = 8;
                this.logText.text = "等待操作...";
                Engine.addEntities(this.logText);
            }
            
            addLog(action, entity) {
                const time = new Date().toLocaleTimeString();
                let logEntry;
                
                if (entity) {
                    const info = this.getEntityInfo(entity);
                    logEntry = `[${time}] ${action}: ${info}`;
                } else {
                    logEntry = `[${time}] ${action}`;
                }
                
                this.logs.unshift(logEntry);
                if (this.logs.length > this.maxLogs) {
                    this.logs.pop();
                }
                
                this.updateDisplay();
                console.log(logEntry);
            }
            
            getEntityInfo(entity) {
                const type = entity.type || '未知';
                const id = entity.id || '?';
                
                switch (type) {
                    case 'LINE':
                        const start = entity.startPoint;
                        const end = entity.endPoint;
                        return `线段#${id} (${start.x.toFixed(0)},${start.y.toFixed(0)})→(${end.x.toFixed(0)},${end.y.toFixed(0)})`;
                    case 'CIRCLE':
                        const c = entity.center;
                        return `圆#${id} 圆心(${c.x.toFixed(0)},${c.y.toFixed(0)}) 半径${entity.radius.toFixed(0)}`;
                    default:
                        return `${type}#${id}`;
                }
            }
            
            updateDisplay() {
                if (!this.logText) return;
                
                const header = "=== 操作日志 ===\n";
                this.logText.text = header + this.logs.join('\n');
                Engine.regen();
            }
        }
        
        // 实体追踪器：追踪特定实体的所有变化
        class EntityTracker {
            constructor() {
                this.trackedEntities = new Map();  // entityId -> { history: [], marker: TextEnt, index: number }
                this.trackIndex = 0;
            }
            
            install() {
                Engine.eventManager.on(CadEvents.EntityModified, (args) => {
                    const entity = args.entity;
                    if (this.trackedEntities.has(entity.id)) {
                        this.recordChange(entity);
                    }
                });
                
                message.info("实体追踪器已安装");
            }
            
            // 开始追踪实体
            track(entity) {
                if (this.trackedEntities.has(entity.id)) return;
                
                const index = this.trackIndex++;
                
                // 创建追踪标记
                const marker = new TextEnt();
                marker.setDefaults();
                marker.height = 4;
                marker.color = 6;
                this.updateMarker(marker, entity, 0, index);
                Engine.addEntities(marker);
                
                this.trackedEntities.set(entity.id, {
                    history: [this.captureState(entity)],
                    marker,
                    index
                });
                
                message.info(`开始追踪实体 #${entity.id}`);
            }
            
            recordChange(entity) {
                const tracked = this.trackedEntities.get(entity.id);
                if (!tracked) return;
                
                tracked.history.push(this.captureState(entity));
                this.updateMarker(tracked.marker, entity, tracked.history.length - 1, tracked.index);
                Engine.regen();
            }
            
            captureState(entity) {
                if (entity.type === 'LINE') {
                    return {
                        startPoint: { x: entity.startPoint.x, y: entity.startPoint.y },
                        endPoint: { x: entity.endPoint.x, y: entity.endPoint.y }
                    };
                } else if (entity.type === 'CIRCLE') {
                    return {
                        center: { x: entity.center.x, y: entity.center.y },
                        radius: entity.radius
                    };
                }
                return {};
            }
            
            updateMarker(marker, entity, changeCount, index) {
                let pos;
                if (entity.type === 'LINE') {
                    pos = entity.startPoint;
                } else if (entity.type === 'CIRCLE') {
                    pos = entity.center;
                } else {
                    pos = new Point2D(0, 0);
                }
                
                // 根据追踪序号设置不同的 y 偏移，避免重叠
                const yOffset = 10 + index * 15;
                marker.position = new Point2D(pos.x, pos.y + yOffset);
                marker.text = `追踪#${entity.id}\n修改${changeCount}次`;
            }
        }
        
        // 安装反应器
        const logger = new LifecycleLogger();
        logger.install();
        
        const tracker = new EntityTracker();
        tracker.install();
        
        // 创建测试实体
        const line1 = new LineEnt([0, 0], [80, 0]);
        line1.setDefaults();
        line1.color = 1;
        Engine.addEntities(line1);
        
        const circle1 = new CircleEnt([120, 0], 25);
        circle1.setDefaults();
        circle1.color = 3;
        Engine.addEntities(circle1);
        
        // 追踪这两个实体
        tracker.track(line1);
        tracker.track(circle1);
        
        Engine.regen();
        Engine.zoomExtents();
        
        message.info("提示：移动、修改或删除实体，查看日志记录");
        message.info("被追踪的实体上方会显示修改次数");
        
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
