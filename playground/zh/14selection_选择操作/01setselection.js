window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --设置选择集--ssSetFirst用法
        const { MainView, initCadContainer, LineEnt, CircleEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建多个实体（使用简化写法）
        const line1 = new LineEnt([0, 0], [50, 0]);
        line1.setDefaults();
        line1.color = 1;
        
        const line2 = new LineEnt([0, 20], [50, 20]);
        line2.setDefaults();
        line2.color = 2;
        
        const line3 = new LineEnt([0, 40], [50, 40]);
        line3.setDefaults();
        line3.color = 3;
        
        const circle = new CircleEnt([80, 20], 15);
        circle.setDefaults();
        circle.color = 4;
        
        Engine.addEntities([line1, line2, line3, circle]);
        Engine.zoomExtents();
        
        message.info("已创建 4 个实体");
        
        // 使用 ssSetFirst 设置选择集
        // ssSetFirst(entities) - 设置当前选择集
        
        // 演示1：选择单个实体
        setTimeout(() => {
            message.info("\n2秒后选择 line1...");
            Engine.ssSetFirst([line1]);
            message.info("当前选中:", Engine.ssGetFirst().length, "个实体");
        }, 2000);
        
        // 演示2：选择多个实体
        setTimeout(() => {
            message.info("\n4秒后选择 line1, line2, circle...");
            Engine.ssSetFirst([line1, line2, circle]);
            message.info("当前选中:", Engine.ssGetFirst().length, "个实体");
        }, 4000);
        
        // 演示3：清空选择集
        setTimeout(() => {
            message.info("\n6秒后清空选择集...");
            Engine.ssSetFirst([]);
            message.info("当前选中:", Engine.ssGetFirst().length, "个实体");
        }, 6000);
        
        // 演示4：选择所有实体
        setTimeout(() => {
            message.info("\n8秒后选择所有实体...");
            const allEntities = Engine.getEntities();
            Engine.ssSetFirst(allEntities);
            message.info("当前选中:", Engine.ssGetFirst().length, "个实体");
        }, 8000);
        
        message.info("\nEngine.ssSetFirst(entities) - 设置选择集");
        message.info("传入空数组可清空选择集");
        
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
