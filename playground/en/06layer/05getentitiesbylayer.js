window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --根据图层获取实体--按图层名称筛选实体
        const { MainView, initCadContainer, LineEnt, CircleEnt, ArcEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建测试图层
        Engine.createLayer("建筑层", { color: 1 });
        Engine.createLayer("标注层", { color: 2 });
        Engine.createLayer("辅助层", { color: 3 });
        
        // 在"建筑层"创建多条直线
        for (let i = 0; i < 4; i++) {
            const line = new LineEnt([i * 40, 0], [i * 40, 50]);
            line.setDefaults();
            line.layer = "建筑层";
            Engine.addEntities(line);
        }
        
        // 在"标注层"创建圆
        for (let i = 0; i < 3; i++) {
            const circle = new CircleEnt([i * 50 + 20, 80], 15);
            circle.setDefaults();
            circle.layer = "标注层";
            Engine.addEntities(circle);
        }
        
        // 在"辅助层"创建圆弧
        for (let i = 0; i < 2; i++) {
            const arc = new ArcEnt([i * 60 + 30, 130], 20, 0, Math.PI);
            arc.setDefaults();
            arc.layer = "辅助层";
            Engine.addEntities(arc);
        }
        
        Engine.zoomExtents();
        
        // === 核心功能：根据图层名称获取实体 ===
        message.info("=== 根据图层名称获取实体 ===");
        
        // 方法1：使用 getEntities + 过滤函数
        const buildingEntities = Engine.getEntities(ent => ent.layer === "建筑层");
        message.info("建筑层实体:", buildingEntities.length, "个");
        
        const labelEntities = Engine.getEntities(ent => ent.layer === "标注层");
        message.info("标注层实体:", labelEntities.length, "个");
        
        const auxEntities = Engine.getEntities(ent => ent.layer === "辅助层");
        message.info("辅助层实体:", auxEntities.length, "个");
        
        // 显示实体详情
        message.info("\n--- 建筑层实体详情 ---");
        buildingEntities.forEach((ent, i) => {
            console.log(`${i + 1}. 类型: ${ent.type}, 颜色: ${ent.color}`);
        });
        
        // 封装为通用函数
        function getEntitiesByLayerName(layerName) {
            return Engine.getEntities(ent => ent.layer === layerName);
        }
        
        // 使用封装函数
        const result = getEntitiesByLayerName("标注层");
        message.info("\n通过封装函数获取标注层:", result.length, "个");
        
        // 高级用法：获取多个图层的实体
        const multiLayerEntities = Engine.getEntities(ent => 
            ent.layer === "建筑层" || ent.layer === "标注层"
        );
        message.info("建筑层+标注层共:", multiLayerEntities.length, "个");
        
        // 演示选中指定图层的实体
        setTimeout(() => {
            message.info("\n2秒后选中建筑层实体...");
            Engine.ssSetFirst(buildingEntities);
        }, 2000);
        
        setTimeout(() => {
            message.info("\n4秒后选中标注层实体...");
            Engine.ssSetFirst(labelEntities);
        }, 4000);
        
        setTimeout(() => {
            message.info("\n6秒后选中辅助层实体...");
            Engine.ssSetFirst(auxEntities);
        }, 6000);
        
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
