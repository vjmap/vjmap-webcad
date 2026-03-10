window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --版本历史--查看和回溯版本
        const { MainView, initCadContainer, Engine, DrawingManagerService, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 版本历史示例 ===");
        message.info("查看图纸的完整版本历史并可回溯到任意版本");
        
        message.info("");
        message.info("版本结构：");
        message.info("  图纸 (mapid/version)");
        message.info("    └── main 分支");
        message.info("        ├── base (初始版本)");
        message.info("        ├── patch-001");
        message.info("        ├── patch-002");
        message.info("        └── patch-003 (当前)");
        message.info("    └── feature-xxx 分支");
        message.info("        ├── base (从main分叉)");
        message.info("        └── patch-001");
        
        message.info("");
        message.info("版本信息包含：");
        message.info("  - Patch ID: 唯一标识");
        message.info("  - 父版本ID: 版本链关系");
        message.info("  - 作者: 提交人");
        message.info("  - 时间: 提交时间");
        message.info("  - 备注: 修改说明");
        message.info("  - 变更统计: 增/删/改数量");
        
        // 命令方式：打开图纸浏览器查看版本历史
        /*
        message.info("");
        message.info("操作：");
        message.info("  - 查看历史: 图纸浏览器中展开版本树");
        message.info("  - 打开特定版本: 双击版本节点");
        message.info("  - 创建分支: 从任意版本创建");
        message.info("  - 删除版本: 右键删除(不影响子版本)");
        
        setTimeout(async () => {
            message.info("");
            message.info("3秒后打开图纸浏览器，可查看版本历史...");
            await Engine.editor.executerWithOp('OPENFROMSERVER');
        }, 3000);
        */
        
        // API 方式获取版本历史
        message.info("");
        message.info("通过API方式演示获取版本历史...");
        
        const drawingManager = new DrawingManagerService();
        
        // 获取分支列表（包含各分支的patch信息）
        const branches = await drawingManager.listBranches({
            type: 'imports',
            mapid: env.exampleMapId,
            version: 'v1'
        });
        
        message.info(`分支列表: ${JSON.stringify(branches.map(b => b.name))}`);
        console.log('分支列表:', branches);
        
        // 从分支信息中获取Patch列表
        const mainBranch = branches.find(b => b.name === 'main');
        const patches = mainBranch ? mainBranch.patches : [];
        
        message.info(`Patch列表: ${patches.length} 个版本`);
        console.log('Patch列表:', patches);
        
        // 显示版本详情
        for (const patch of patches.slice(0, 5)) {
            message.info(`  - ${patch.id}: ${patch.remark || '(无备注)'} by ${patch.author || 'unknown'}`);
        }
        
        // 打开特定版本(示例)
        /*
        const result = await drawingManager.openDrawing({
            type: 'imports',
            mapid: env.exampleMapId,
            version: 'v1',
            branch: 'main',
            patchId: 'patch-001'
        });
        
        // 删除特定Patch
        const deleteResult = await drawingManager.deletePatch({
            type: 'imports',
            mapid: env.exampleMapId,
            version: 'v1',
            branch: 'main',
            patchId: 'patch-003'
        });
        */
        
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
