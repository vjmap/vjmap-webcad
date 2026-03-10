window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --组操作--GROUP/UNGROUP创建组和取消组示例
        const { MainView, initCadContainer, LineEnt, CircleEnt, GroupEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // ========== 创建组示例 ==========
        message.info("=== 组操作示例 ===");
        
        // 创建几个实体作为组的成员
        const line1 = new LineEnt([-20, 0], [20, 0]);
        line1.setDefaults();
        line1.color = 1;
        
        const line2 = new LineEnt([0, -20], [0, 20]);
        line2.setDefaults();
        line2.color = 1;
        
        const circle = new CircleEnt([0, 0], 15);
        circle.setDefaults();
        circle.color = 3;
        
        // 方法1：使用 GroupEnt 直接创建组
        message.info("\n方法1：直接创建 GroupEnt");
        
        // 创建组实体
        const group1 = new GroupEnt("MyGroup1", [line1, line2, circle]);
        group1.setDefaults();
        
        // 添加组到当前空间
        Engine.addEntities(group1);
        
        message.info("已创建组 'MyGroup1'，包含3个实体");
        message.info("组类型: " + group1.type);
        message.info("组名称: " + group1.name);
        message.info("子实体数: " + group1.items.length);
        
        // 创建第二个组（用于演示取消组）
        const line3 = new LineEnt([50, -20], [90, -20]);
        line3.setDefaults();
        line3.color = 5;
        
        const line4 = new LineEnt([50, 20], [90, 20]);
        line4.setDefaults();
        line4.color = 5;
        
        const circle2 = new CircleEnt([70, 0], 15);
        circle2.setDefaults();
        circle2.color = 6;
        
        const group2 = new GroupEnt("MyGroup2", [line3, line4, circle2]);
        group2.setDefaults();
        Engine.addEntities(group2);
        
        message.info("已创建组 'MyGroup2'，包含3个实体");
        
        Engine.zoomExtents();
        
        // ========== 组相关命令 ==========
        message.info("\n=== 组操作命令 ===");
        message.info("GROUP   - 创建组（选择实体后输入组名）");
        message.info("UNGROUP - 取消组（选择组后解散为独立实体）");
        
        // ========== 方法2：通过命令创建组 ==========
        message.info("\n方法2：通过命令执行");
        message.info("  Engine.editor.executerWithOp('GROUP')");
        message.info("  Engine.editor.executerWithOp('UNGROUP')");
        
        // ========== 取消组示例 ==========
        message.info("\n=== 取消组示例 ===");
        
        // 取消组：使用 explode 方法获取子实体
        function ungroupEntity(groupEntity) {
            if (groupEntity.type !== "GROUP") {
                message.info("不是组实体，无法取消组");
                return;
            }
            
            // 获取炸开后的子实体
            const explodedEntities = groupEntity.explode();
            
            // 添加子实体到当前空间
            explodedEntities.forEach((subEntity) => {
                Engine.addEntities(subEntity);
            });
            
            // 删除原始组实体
            Engine.eraseEntities([groupEntity]);
            Engine.pcanvas.regen(true);
            
            message.info(`组 "${groupEntity.name}" 已解散，释放了 ${explodedEntities.length} 个实体`);
        }
        
        // 5秒后取消第二个组
        setTimeout(() => {
            message.info("\n正在取消组 'MyGroup2'...");
            ungroupEntity(group2);
        }, 5000);
        
        message.info("\n5秒后将自动取消组 'MyGroup2'");
        
        // ========== 遍历组内实体 ==========
        message.info("\n=== 遍历组内实体 ===");
        message.info("group.items - 获取组内所有子实体");
        
        group1.items.forEach((item, index) => {
            message.info(`  [${index}] 类型: ${item.type}, 颜色: ${item.color}`);
        });
        
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
