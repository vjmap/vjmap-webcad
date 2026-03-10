window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --Ribbon菜单--addRibbonButton用法
        const { MainView, initCadContainer, CircleEnt, Engine, CommandRegistry, CommandDefinition, CommandOptions, RibbonConfigManager, writeMessage, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== Ribbon 菜单扩展 ===");
        
        // 首先注册自定义命令
        class MyToolCommand {
            async main() {
                const circle = new CircleEnt([50, 50], 30);
                circle.setDefaults();
                circle.color = 1;
                Engine.addEntities(circle);
                Engine.zoomExtents();
                writeMessage("<br/>已创建圆形");
            }
        }
        
        const options = new CommandOptions();
        CommandRegistry.regist(new CommandDefinition('MYTOOL', '我的工具', MyToolCommand, options));
        
        message.info("\n添加按钮到 Ribbon:");
        
        // 方式：添加整个新标签页
        const newTab = {
            id: 'my-tab',
            label: '自定义',
            groups: [
                {
                    id: 'my-tools',
                    label: '我的工具',
                    primaryButtons: [
                        { cmd: 'MYTOOL', icon: 'circle', label: '创建圆', tooltip: '创建一个圆' },
                        { cmd: 'REGEN', icon: 'regen', label: '重绘', tooltip: '重新生成' },
                    ],
                    moreButtons: [
                        { cmd: 'ZOOM', icon: 'zoom', label: '缩放' },
                    ]
                }
            ]
        };
        
        // 获取当前配置（RibbonConfigManager 使用静态方法）
        const currentConfig = RibbonConfigManager.getConfig();
        message.info("当前标签页数:", currentConfig.tabs.length);
        
        // 添加新标签页（直接修改配置对象）
        currentConfig.tabs.push(newTab);
        
        // 刷新 Ribbon UI
        RibbonConfigManager.refresh();
        
        message.info("已添加自定义标签页 '自定义'");
        message.info("查看 Ribbon 菜单可以看到新的标签页");
        
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
