window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --获取选择集--Engine.getSelections用法
        const { 
            MainView, 
            initCadContainer, 
            LineEnt, 
            CircleEnt, 
            Engine, 
            SelectionInputOptions, 
            InputStatusEnum,
            CommandDefinition,
            CommandRegistry,
            getSelections
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
        
        // 创建一些实体供选择
        for (let i = 0; i < 5; i++) {
            const line = new LineEnt([i * 30, 0], [i * 30 + 20, 40]);
            line.setDefaults();
            line.color = i + 1;
            Engine.addEntities(line);
        }
        
        const circle = new CircleEnt([80, 70], 20);
        circle.setDefaults();
        Engine.addEntities(circle);
        
        Engine.zoomExtents();
        
        // 获取选择集示例命令
        class GetSelectionsDemoCommand {
            async main() {
                message.info("框选或点选实体，回车确认");
                
                const selected = await this.selectEntities();
                if (selected.length > 0) {
                    await this.selectAndChangeColor();
                }
            }
            
            // 获取选择集
            async selectEntities() {
                const options = new SelectionInputOptions("选择对象:");
                const result = await getSelections(options);
                
                if (result.status === InputStatusEnum.OK) {
                    const entities = result.value;
                    
                    console.log(`选中了 ${entities.length} 个实体:`);
                    entities.forEach((ent, i) => {
                        console.log(`  ${i + 1}. ${ent.type} (ID: ${ent.id}, 颜色: ${ent.color})`);
                    });
                    
                    return entities;
                } else {
                    console.log("未选择任何实体或已取消");
                    return [];
                }
            }
            
            // 选择实体并修改颜色
            async selectAndChangeColor() {
                console.log("\n=== 选择并修改颜色 ===");
                
                const options = new SelectionInputOptions("选择要修改颜色的实体:");
                const result = await getSelections(options);
                
                if (result.status === InputStatusEnum.OK && result.value.length > 0) {
                    const entities = result.value;
                    
                    // 修改所有选中实体的颜色为红色
                    entities.forEach(ent => {
                        ent.color = 1;  // 红色
                    });
                    
                    Engine.regen();
                    console.log(`已将 ${entities.length} 个实体颜色改为红色`);
                }
            }
        }
        
        // 注册并执行命令
        const cmdDef = new CommandDefinition("GETSELECTIONSDEMO", "获取选择集示例", GetSelectionsDemoCommand);
        CommandRegistry.regist(cmdDef);
        await Engine.editor.executerWithOp("GETSELECTIONSDEMO");
        
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
