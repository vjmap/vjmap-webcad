window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --可见性设置--visible属性用法（DXF 60）
        const { MainView, initCadContainer, LineEnt, CircleEnt, Engine, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "right",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // ========== 1. 创建可见实体 ==========
        
        const visibleLine = new LineEnt([0, 0], [100, 0]);
        visibleLine.setDefaults();
        visibleLine.color = 3; // green
        Engine.addEntities(visibleLine);
        message.info("创建可见线段（默认 visible = true）");
        
        const visibleCircle = new CircleEnt([50, 50], 30);
        visibleCircle.setDefaults();
        visibleCircle.color = 1; // red
        Engine.addEntities(visibleCircle);
        message.info("创建可见圆");
        
        // ========== 2. 创建不可见实体 ==========
        // visible = false 对应 DXF Group Code 60 = 1
        // 不可见实体：不渲染、不可框选/点选、不提供捕捉点
        // 但 Ctrl+A 全选可以选中，数据序列化时会保留
        
        const hiddenLine = new LineEnt([0, -50], [100, -50]);
        hiddenLine.setDefaults();
        hiddenLine.color = 5; // blue
        hiddenLine.visible = false; // set invisible
        Engine.addEntities(hiddenLine);
        message.info("创建不可见线段（visible = false），看不到但数据存在");
        
        // ========== 3. 读取可见性 ==========
        
        message.info(`可见线段 visible = ${visibleLine.visible}`);   // true
        message.info(`不可见线段 visible = ${hiddenLine.visible}`);   // false
        
        Engine.zoomExtents();
        
        // ========== 4. 切换可见性（定时器演示） ==========
        
        setTimeout(() => {
            hiddenLine.visible = true;
            Engine.regen();
            message.info("2秒后：隐藏的蓝色线段已显示（visible = true）");
        }, 2000);
        
        setTimeout(() => {
            hiddenLine.visible = false;
            Engine.regen();
            message.info("4秒后：蓝色线段再次隐藏（visible = false）");
        }, 4000);
        
        setTimeout(() => {
            hiddenLine.visible = true;
            visibleCircle.visible = false;
            Engine.regen();
            message.info("6秒后：蓝色线段显示，红色圆隐藏");
        }, 6000);
        
        setTimeout(() => {
            visibleCircle.visible = true;
            Engine.regen();
            message.info("8秒后：全部恢复可见。试试 Ctrl+A 全选，属性面板可查看可见性");
        }, 8000);
        
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
