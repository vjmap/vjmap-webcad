window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --右键菜单(禁止系统右键菜单)--禁止系统右键菜单
        const { 
            MainView, initCadContainer, LineEnt, CircleEnt, Engine, 
            CadEventManager, CadEvents, writeMessage, message 
        } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建一些实体
        const line = new LineEnt([0, 0], [100, 50]);
        line.setDefaults();
        Engine.addEntities([line]);
        Engine.zoomExtents();
        
        message.info("=== 禁止系统右键菜单 ===");
        
        const events = CadEventManager.getInstance();
        
        // 方式1：完全禁止右键菜单
        events.on(CadEvents.ContextMenuOpening, (args) => {
            args.cancel = true; // 设置 cancel = true 禁止显示菜单
            writeMessage("<br/>右键菜单已被禁止");
        });
        
        message.info("已禁止右键菜单");
        message.info("在画布上右键单击测试");
        message.info("");
        message.info("=== 代码示例 ===");
        message.info("events.on(CadEvents.ContextMenuOpening, (args) => {");
        message.info("    args.cancel = true;");
        message.info("});");
        
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
