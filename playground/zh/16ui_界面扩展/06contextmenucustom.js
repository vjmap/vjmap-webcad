window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --右键菜单(完全自定义菜单)--完全自定义菜单（不显示默认项）
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
        const circle = new CircleEnt([60, 60], 25);
        circle.setDefaults();
        Engine.addEntities([line, circle]);
        Engine.zoomExtents();
        
        message.info("=== 完全自定义右键菜单 ===");
        
        const events = CadEventManager.getInstance();
        
        events.on(CadEvents.ContextMenuOpening, (args) => {
            // 禁用默认菜单项
            args.useDefaultItems = false;
            
            // 添加完全自定义的菜单
            args.prependItems.push({
                label: "自定义菜单",
                disabled: true
            });
            args.prependItems.push({ isSeparator: true });
            args.prependItems.push({
                label: "添加圆",
                callback: () => {
                    const c = new CircleEnt([Math.random() * 100, Math.random() * 100], 15);
                    c.setDefaults();
                    Engine.addEntities(c);
                    Engine.zoomExtents();
                }
            });
            args.prependItems.push({
                label: "添加线",
                callback: () => {
                    const l = new LineEnt([0, 0], [Math.random() * 100, Math.random() * 100]);
                    l.setDefaults();
                    Engine.addEntities(l);
                    Engine.zoomExtents();
                }
            });
            args.prependItems.push({ isSeparator: true });
            args.prependItems.push({
                label: "清空全部",
                callback: () => {
                    Engine.eraseEntities(Engine.getEntities());
                    Engine.redraw();
                }
            });
            args.prependItems.push({
                label: "缩放全图",
                callback: () => Engine.zoomExtents()
            });
        });
        
        message.info("右键菜单已完全自定义");
        message.info("不显示系统默认的剪切/复制等菜单项");
        message.info("");
        message.info("=== 代码示例 ===");
        message.info("args.useDefaultItems = false; // 禁用默认项");
        message.info("args.prependItems.push({...}); // 添加自定义项");
        
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
