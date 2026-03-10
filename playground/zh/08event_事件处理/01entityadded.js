window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --实体添加事件--EntityAdded事件监听
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
        
        // 监听实体添加事件
        Engine.eventManager.on(CadEvents.EntityAdded, (args) => {
            const entity = args.entity;
            message.info("=== 实体已添加 ===");
            message.info("实体类型:", entity.type);
            message.info("实体ID:", entity.id);
            message.info("图层:", entity.layer);
            message.info("颜色:", entity.color);
        });
        
        // 监听批量添加事件
        Engine.eventManager.on(CadEvents.EntitiesAdded, (args) => {
            message.info("=== 批量实体已添加 ===");
            message.info("添加数量:", args.entities.length);
        });
        
        // 监听添加前事件（可取消）
        Engine.eventManager.on(CadEvents.EntityAdding, (args) => {
            message.info("=== 即将添加实体 ===");
            message.info("实体类型:", args.entity.type);
            
            // 可以取消添加操作
            // if (someCondition) {
            //     args.cancel = true;
            //     message.info("添加操作已取消");
            // }
        });
        
        message.info("事件监听器已注册，现在添加实体...\n");
        
        // 添加实体触发事件（使用简化写法）
        const line = new LineEnt([0, 0], [100, 50]);
        line.setDefaults();
        Engine.addEntities(line);
        
        const circle = new CircleEnt([50, 80], 20);
        circle.setDefaults();
        Engine.addEntities(circle);
        
        Engine.zoomExtents();
        
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
