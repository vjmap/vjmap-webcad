window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --获取整数--Engine.getInteger用法
        const { 
            MainView, 
            initCadContainer, 
            Point2D, 
            PolylineEnt, 
            Engine, 
            IntegerInputOptions, 
            InputStatusEnum,
            CommandDefinition,
            CommandRegistry,
            getInteger
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
        
        // 获取整数输入示例命令
        class GetIntegerDemoCommand {
            async main() {
                console.log("=== 获取整数输入示例 ===");
                
                await this.createPolygonWithInput();
                const count = await this.getCopyCount();
                if (count) {
                    console.log(`将复制 ${count} 份`);
                }
            }
            
            // 获取多边形边数
            async getPolygonSides() {
                const options = new IntegerInputOptions("输入多边形边数:");
                options.defaultValue = 6;
                
                const result = await getInteger(options);
                
                if (result.status === InputStatusEnum.OK) {
                    const sides = result.value;
                    console.log(`输入的边数: ${sides}`);
                    return sides;
                } else if (result.status === InputStatusEnum.EnterOrSpace) {
                    console.log(`使用默认边数: ${options.defaultValue}`);
                    return options.defaultValue;
                } else {
                    console.log("已取消");
                    return null;
                }
            }
            
            // 创建正多边形
            createPolygon(center, radius, sides) {
                const pline = new PolylineEnt();
                
                for (let i = 0; i < sides; i++) {
                    const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
                    const x = center.x + radius * Math.cos(angle);
                    const y = center.y + radius * Math.sin(angle);
                    pline.addVertex([x, y]);
                }
                
                pline.isClosed = true;
                pline.setDefaults();
                return pline;
            }
            
            // 根据输入创建多边形
            async createPolygonWithInput() {
                const sides = await this.getPolygonSides();
                
                if (sides !== null && sides >= 3) {
                    const polygon = this.createPolygon(new Point2D(50, 50), 40, sides);
                    polygon.color = 1;
                    Engine.addEntities(polygon);
                    
                    message.info(`已创建 ${sides} 边形`);
                    Engine.zoomExtents();
                } else if (sides !== null && sides < 3) {
                    console.log("边数必须大于等于 3");
                }
            }
            
            // 获取复制数量
            async getCopyCount() {
                console.log("\n=== 获取复制数量 ===");
                
                const options = new IntegerInputOptions("输入复制数量 <1>:");
                options.defaultValue = 1;
                
                const result = await getInteger(options);
                
                if (result.status === InputStatusEnum.OK) {
                    console.log(`复制数量: ${result.value}`);
                    return result.value;
                } else if (result.status === InputStatusEnum.EnterOrSpace) {
                    console.log("使用默认数量: 1");
                    return 1;
                }
                return null;
            }
        }
        
        // 注册并执行命令
        const cmdDef = new CommandDefinition("GETINTEGERDEMO", "获取整数输入示例", GetIntegerDemoCommand);
        CommandRegistry.regist(cmdDef);
        await Engine.editor.executerWithOp("GETINTEGERDEMO");
        
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
