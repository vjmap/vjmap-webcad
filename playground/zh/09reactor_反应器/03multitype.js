window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --多类型监控反应器--同时监控多种实体类型的变化
        const { 
            MainView, 
            initCadContainer, 
            LineEnt, 
            CircleEnt, 
            ArcEnt, 
            TextEnt,
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
        
        message.info("=== 多类型监控反应器示例 ===");
        
        // 统计反应器：实时统计各类实体数量
        class EntityStatsReactor {
            constructor() {
                this.stats = {
                    LINE: 0,
                    CIRCLE: 0,
                    ARC: 0,
                    TEXT: 0,
                    total: 0
                };
                this.statsText = null;
            }
            
            install() {
                // 监听实体添加
                Engine.eventManager.on(CadEvents.EntityAdded, (args) => {
                    this.onEntityAdded(args.entity);
                });
                
                // 监听实体删除
                Engine.eventManager.on(CadEvents.EntitiesErased, (args) => {
                    args.entities.forEach(entity => this.onEntityErased(entity));
                });
                
                // 创建统计显示文字
                this.createStatsDisplay();
                message.info("实体统计反应器已安装");
            }
            
            createStatsDisplay() {
                this.statsText = new TextEnt();
                this.statsText.setDefaults();
                this.statsText.position = new Point2D(-50, 100);
                this.statsText.height = 8;
                this.statsText.color = 2;
                this.updateStatsText();
                Engine.addEntities(this.statsText);
            }
            
            onEntityAdded(entity) {
                const type = entity.type;
                if (type in this.stats) {
                    this.stats[type]++;
                    this.stats.total++;
                    this.updateStatsText();
                }
            }
            
            onEntityErased(entity) {
                const type = entity.type;
                if (type in this.stats && this.stats[type] > 0) {
                    this.stats[type]--;
                    this.stats.total--;
                    this.updateStatsText();
                }
            }
            
            updateStatsText() {
                if (!this.statsText) return;
                
                const text = [
                    `实体统计 (总计: ${this.stats.total})`,
                    `线段: ${this.stats.LINE}`,
                    `圆: ${this.stats.CIRCLE}`,
                    `圆弧: ${this.stats.ARC}`,
                    `文字: ${this.stats.TEXT}`
                ].join('\n');
                
                this.statsText.text = text;
                Engine.regen();
                
                writeMessage(`<br/>统计更新: 总计 ${this.stats.total} 个实体`);
            }
        }
        
        // 颜色同步反应器：使相同类型的实体颜色一致
        class ColorSyncReactor {
            constructor() {
                this.typeColors = new Map();  // 实体类型 -> 颜色
            }
            
            install() {
                Engine.eventManager.on(CadEvents.EntityModified, (args) => {
                    const entity = args.entity;
                    const previousColor = this.typeColors.get(entity.type);
                    
                    // 如果实体颜色发生变化，同步到同类型所有实体
                    if (previousColor !== undefined && entity.color !== previousColor) {
                        this.syncColorForType(entity.type, entity.color);
                    }
                    
                    this.typeColors.set(entity.type, entity.color);
                });
                
                message.info("颜色同步反应器已安装");
            }
            
            syncColorForType(type, color) {
                const entities = Engine.getEntities().filter(e => 
                    e.type === type && e.color !== color
                );
                
                entities.forEach(e => {
                    e.color = color;
                });
                
                if (entities.length > 0) {
                    Engine.regen();
                    writeMessage(`<br/>已同步 ${entities.length} 个 ${type} 的颜色为 ${color}`);
                }
            }
        }
        
        // 安装反应器
        const statsReactor = new EntityStatsReactor();
        statsReactor.install();
        
        const colorReactor = new ColorSyncReactor();
        colorReactor.install();
        
        // 创建一些测试实体
        const line1 = new LineEnt([0, 0], [50, 0]);
        line1.setDefaults();
        line1.color = 1;
        Engine.addEntities(line1);
        
        const line2 = new LineEnt([0, -20], [50, -20]);
        line2.setDefaults();
        line2.color = 1;
        Engine.addEntities(line2);
        
        const circle1 = new CircleEnt([80, 0], 15);
        circle1.setDefaults();
        circle1.color = 3;
        Engine.addEntities(circle1);
        
        const circle2 = new CircleEnt([120, 0], 10);
        circle2.setDefaults();
        circle2.color = 3;
        Engine.addEntities(circle2);
        
        const arc1 = new ArcEnt([160, 0], 15, 0, Math.PI);
        arc1.setDefaults();
        arc1.color = 5;
        Engine.addEntities(arc1);
        
        Engine.regen();
        Engine.zoomExtents();
        
        message.info("提示：添加/删除实体查看统计变化");
        message.info("提示：修改某个实体颜色，同类型实体会自动同步");
        
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
