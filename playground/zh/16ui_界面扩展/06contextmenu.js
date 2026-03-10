window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --右键菜单(添加自定义项)--基础：在默认菜单中添加自定义项
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
        line.color = 1;
        
        const circle = new CircleEnt([60, 60], 25);
        circle.setDefaults();
        circle.color = 3;
        
        Engine.addEntities([line, circle]);
        Engine.zoomExtents();
        
        message.info("=== 在默认右键菜单中添加自定义项 ===");
        
        // 获取事件管理器
        const events = CadEventManager.getInstance();
        
        // 监听右键菜单打开事件
        events.on(CadEvents.ContextMenuOpening, (args) => {
            // 在默认菜单项之前添加自定义项
            args.prependItems.push({
                label: "我的工具",
                icon: "tool",
                submenu: [
                    {
                        label: "画圆",
                        icon: "circle",
                        callback: () => {
                            const c = new CircleEnt([Math.random() * 100, Math.random() * 100], 15);
                            c.setDefaults();
                            c.color = Math.floor(Math.random() * 7) + 1;
                            Engine.addEntities(c);
                            Engine.zoomExtents();
                            writeMessage("<br/>已添加圆");
                        }
                    },
                    {
                        label: "画线",
                        icon: "line",
                        callback: () => {
                            const l = new LineEnt(
                                [Math.random() * 50, Math.random() * 50],
                                [50 + Math.random() * 50, 50 + Math.random() * 50]
                            );
                            l.setDefaults();
                            l.color = Math.floor(Math.random() * 7) + 1;
                            Engine.addEntities(l);
                            Engine.zoomExtents();
                            writeMessage("<br/>已添加线");
                        }
                    }
                ]
            });
            
            // 分隔线
            args.prependItems.push({ isSeparator: true });
            
            // 在默认菜单项之后添加
            args.appendItems.push({ isSeparator: true });
            args.appendItems.push({
                label: "缩放全图",
                shortcut: "Z+E",
                callback: () => {
                    Engine.zoomExtents();
                    writeMessage("<br/>已缩放全图");
                }
            });
        });
        
        message.info("在画布上右键单击查看自定义菜单");
        message.info("");
        message.info("=== 菜单项属性 ===");
        message.info("label - 菜单文本");
        message.info("icon - 图标名称");
        message.info("shortcut - 快捷键文本");
        message.info("callback - 点击回调");
        message.info("submenu - 子菜单数组");
        message.info("isSeparator - 分隔线");
        
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
