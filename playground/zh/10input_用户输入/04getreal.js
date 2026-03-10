window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --获取实数--Engine.getReal用法
        const { 
            MainView, 
            initCadContainer, 
            CircleEnt, 
            Engine, 
            RealInputOptions, 
            InputStatusEnum,
            CommandDefinition,
            CommandRegistry,
            getReal
        , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 获取实数输入示例命令
        class GetRealDemoCommand {
            async main() {
                console.log("=== 获取实数输入示例 ===");
                
                await this.createCircleWithInput();
                const scale = await this.getScaleFactor();
                if (scale) {
                    console.log(`获取到缩放比例: ${scale}`);
                }
            }
            
            // 获取半径输入
            async getRadius() {
                const options = new RealInputOptions("输入圆的半径:");
                options.defaultValue = 30;
                
                const result = await getReal(options);
                
                if (result.status === InputStatusEnum.OK) {
                    const radius = result.value;
                    console.log(`输入的半径: ${radius}`);
                    return radius;
                } else if (result.status === InputStatusEnum.EnterOrSpace) {
                    console.log(`使用默认半径: ${options.defaultValue}`);
                    return options.defaultValue;
                } else {
                    console.log("已取消");
                    return null;
                }
            }
            
            // 根据输入创建圆
            async createCircleWithInput() {
                const radius = await this.getRadius();
                
                if (radius !== null) {
                    const circle = new CircleEnt([50, 50], radius);
                    circle.setDefaults();
                    circle.color = 1;
                    Engine.addEntities(circle);
                    
                    message.info(`已创建半径为 ${radius} 的圆`);
                    Engine.zoomExtents();
                }
            }
            
            // 获取缩放比例
            async getScaleFactor() {
                console.log("\n=== 获取缩放比例 ===");
                
                const options = new RealInputOptions("输入缩放比例 <1.0>:");
                options.defaultValue = 1.0;
                
                const result = await getReal(options);
                
                if (result.status === InputStatusEnum.OK) {
                    console.log(`缩放比例: ${result.value}`);
                    return result.value;
                } else if (result.status === InputStatusEnum.EnterOrSpace) {
                    console.log("使用默认比例: 1.0");
                    return 1.0;
                }
                return null;
            }
        }
        
        // 注册并执行命令
        const cmdDef = new CommandDefinition("GETREALDEMO", "获取实数输入示例", GetRealDemoCommand);
        CommandRegistry.regist(cmdDef);
        await Engine.editor.executerWithOp("GETREALDEMO");
        
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
