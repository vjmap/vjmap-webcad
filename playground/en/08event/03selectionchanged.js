window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --选择变化事件--SelectionChanged事件监听
        const { MainView, initCadContainer, LineEnt, CircleEnt, Engine, CadEvents , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 监听选择集变化事件
        Engine.eventManager.on(CadEvents.SelectionChanged, (args) => {
            message.info("=== 选择集已变化 ===");
            const selected = Engine.ssGetFirst();
            message.info("当前选中数量:", selected.length);
            
            if (selected.length > 0) {
                selected.forEach((ent, i) => {
                    message.info(`  ${i + 1}. ${ent.type} (ID: ${ent.id})`);
                });
            }
        });
        
        // 监听选择集清空事件
        Engine.eventManager.on(CadEvents.SelectionCleared, (args) => {
            message.info("=== 选择集已清空 ===");
        });
        
        message.info("事件监听器已注册\n");
        
        // 创建多个实体供选择（使用简化写法）
        const entities = [];
        for (let i = 0; i < 5; i++) {
            const line = new LineEnt([i * 30, 0], [i * 30, 50]);
            line.setDefaults();
            line.color = i + 1;
            entities.push(line);
        }
        Engine.addEntities(entities);
        
        const circle = new CircleEnt([70, 80], 20);
        circle.setDefaults();
        Engine.addEntities(circle);
        
        // 演示程序化设置选择集
        setTimeout(() => {
            message.info("\n2秒后选择前两条线...");
            Engine.ssSetFirst([entities[0], entities[1]]);
        }, 2000);
        
        setTimeout(() => {
            message.info("\n4秒后添加圆到选择集...");
            Engine.ssSetFirst([entities[0], entities[1], circle]);
        }, 4000);
        
        setTimeout(() => {
            message.info("\n6秒后清空选择集...");
            Engine.ssSetFirst([]);
        }, 6000);
        
        Engine.zoomExtents();
        
        message.info("点击图形元素测试选择，或等待演示自动运行");
        
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
