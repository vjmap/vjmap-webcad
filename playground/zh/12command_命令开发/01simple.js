window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --简单命令--命令基本结构示例
        const { MainView, initCadContainer, CircleEnt, Engine, CommandRegistry, CommandDefinition, CommandOptions, writeMessage , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",           // 应用名称
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 定义一个简单命令类
        // 命令类必须有 main() 方法作为入口
        class HelloCommand {
            async main() {
                writeMessage("<br/>Hello WebCAD! 这是一个简单的自定义命令。");
                
                // 创建一个圆作为演示（使用简化写法）
                const circle = new CircleEnt([50, 50], 30);
                circle.setDefaults();
                circle.color = 1;
                Engine.addEntities(circle);
                Engine.zoomExtents();
                
                writeMessage("<br/>已在画布中心创建一个红色圆形。");
            }
        }
        
        // 注册命令
        const options = new CommandOptions();
        options.useAutoComplete = true;  // 启用自动补全
        
        const cmdDef = new CommandDefinition(
            'HELLO',              // 命令名（大写）
            '简单示例命令',        // 描述
            HelloCommand,         // 命令类
            options               // 选项
        );
        
        CommandRegistry.regist(cmdDef);
        
        message.info("命令 HELLO 已注册");
        message.info("在命令行输入 HELLO 并回车执行命令");
        
        // 也可以程序化执行命令
        setTimeout(async () => {
            message.info("\n3秒后自动执行 HELLO 命令...");
            await Engine.editor.executerWithOp('HELLO');
        }, 3000);
        
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
