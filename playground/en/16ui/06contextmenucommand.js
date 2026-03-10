window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --右键菜单(命令状态定制菜单)--根据命令状态定制菜单
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
        
        message.info("=== 根据命令状态定制菜单 ===");
        
        const events = CadEventManager.getInstance();
        
        events.on(CadEvents.ContextMenuOpening, (args) => {
            // 判断是否有命令正在执行
            if (args.isCommandActive) {
                writeMessage(`<br/>当前命令: ${args.activeCommandName}`);
                
                // 在命令执行中添加特定菜单项
                args.appendItems.push({ isSeparator: true });
                args.appendItems.push({
                    label: `命令: ${args.activeCommandName}`,
                    disabled: true // 仅显示，不可点击
                });
                
                // 示例：在画线命令中添加特定选项
                if (args.activeCommandName === 'LINE') {
                    args.appendItems.push({
                        label: "闭合",
                        callback: () => writeMessage("<br/>闭合")
                    });
                }
            } else {
                writeMessage("<br/>空闲状态 - 无命令执行");
                
                // 空闲状态添加快捷命令
                args.prependItems.push({
                    label: "快捷命令",
                    submenu: [
                        { label: "画线", command: "LINE" },
                        { label: "画圆", command: "CIRCLE" },
                        { label: "移动", command: "MOVE" }
                    ]
                });
                args.prependItems.push({ isSeparator: true });
            }
        });
        
        message.info("在命令行输入 LINE 开始画线命令");
        message.info("然后右键查看菜单变化");
        message.info("");
        message.info("=== 事件参数 ===");
        message.info("args.isCommandActive - 是否有命令执行");
        message.info("args.activeCommandName - 当前命令名称");
        message.info("args.screenX/Y - 屏幕坐标");
        message.info("args.canvasX/Y - 画布坐标");
        
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
