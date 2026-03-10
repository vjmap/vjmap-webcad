window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --获取点--Engine.getPoint用法
        const { 
            MainView, 
            initCadContainer, 
            CircleEnt, 
            Engine, 
            PointInputOptions, 
            InputStatusEnum,
            CommandDefinition,
            CommandRegistry,
            getPoint
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
        
        // 点拾取示例命令
        class GetPointDemoCommand {
            async main() {
                console.log("=== 点拾取示例 ===");
                message.info("请在画布上点击指定位置");
                
                const point = await this.getOnePoint();
                if (point) {
                    message.info("继续获取多个点...");
                    await this.getMultiplePoints();
                }
                
                Engine.zoomExtents();
            }
            
            // 简单的点拾取
            async getOnePoint() {
                const options = new PointInputOptions("指定点位置:");
                const result = await getPoint(options);
                
                if (result.status === InputStatusEnum.OK) {
                    const point = result.value;
                    console.log(`获取到点: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`);
                    
                    // 在点击位置绘制一个小圆
                    const marker = new CircleEnt([point.x, point.y], 5);
                    marker.setDefaults();
                    marker.color = 1;
                    Engine.addEntities(marker);
                    
                    return point;
                } else if (result.status === InputStatusEnum.Cancel) {
                    console.log("用户取消了操作");
                    return null;
                }
                return null;
            }
            
            // 连续获取多个点
            async getMultiplePoints() {
                const points = [];
                
                for (let i = 0; i < 3; i++) {
                    const options = new PointInputOptions(`指定第${i + 1}个点 (共3个):`);
                    const result = await getPoint(options);
                    
                    if (result.status === InputStatusEnum.OK) {
                        points.push(result.value);
                        console.log(`点 ${i + 1}: (${result.value.x.toFixed(2)}, ${result.value.y.toFixed(2)})`);
                        
                        const marker = new CircleEnt([result.value.x, result.value.y], 3);
                        marker.setDefaults();
                        marker.color = i + 1;
                        Engine.addEntities(marker);
                    } else {
                        console.log("操作已取消");
                        break;
                    }
                }
                
                console.log(`共获取了 ${points.length} 个点`);
                return points;
            }
        }
        
        // 注册并执行命令
        const cmdDef = new CommandDefinition("GETPOINTDEMO", "点拾取示例", GetPointDemoCommand);
        CommandRegistry.regist(cmdDef);
        await Engine.editor.executerWithOp("GETPOINTDEMO");
        
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
