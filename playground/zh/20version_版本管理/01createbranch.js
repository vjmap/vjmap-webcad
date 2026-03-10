window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建分支--从指定版本创建新分支
        const { MainView, initCadContainer, Engine, DrawingManagerService, BranchCreateDialog, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 创建分支示例 ===");
        message.info("分支允许从某个版本创建独立的编辑线");
        
        message.info("");
        message.info("分支概念：");
        message.info("  - main: 主分支，默认分支");
        message.info("  - feature-xxx: 功能分支");
        message.info("  - fix-xxx: 修复分支");
        message.info("  - 分支间独立演进，互不影响");
        
        message.info("");
        message.info("创建分支的场景：");
        message.info("  - 开发新功能，不影响主线");
        message.info("  - 多人协作，各自独立编辑");
        message.info("  - 尝试性修改，可随时放弃");
        
        // 命令方式：打开图纸浏览器
        /*
        message.info("");
        message.info("操作步骤：");
        message.info("  1. 执行 OPENFROMSERVER 打开图纸浏览器");
        message.info("  2. 选择要创建分支的图纸和版本");
        message.info("  3. 右键点击版本，选择「创建分支」");
        message.info("  4. 输入新分支名称");
        message.info("  5. 新分支创建成功");
        
        setTimeout(async () => {
            message.info("");
            message.info("3秒后打开图纸浏览器，请在版本上右键选择「创建分支」...");
            await Engine.editor.executerWithOp('OPENFROMSERVER');
        }, 3000);
        */
        
        // API 方式创建分支
        message.info("");
        message.info("通过API方式演示创建分支...");
        
        // 方式1: 通过对话框创建
        const dialog = new BranchCreateDialog();
        const result = await dialog.showDialog({
            type: 'imports',
            mapid: env.exampleMapId,
            version: 'v1',
            fromBranchName: 'main',
            fromPatchId: 'base'
        });
        
        if (result && result.action === 'create') {
            const drawingManager = new DrawingManagerService();
            // Dialog返回字段需要映射到API字段
            const createResult = await drawingManager.createBranch({
                type: result.type,
                mapid: result.mapid,
                version: result.version,
                sourceBranch: result.fromBranchName,      // fromBranchName -> sourceBranch
                sourcePatchId: result.fromPatchId,        // fromPatchId -> sourcePatchId
                branchName: result.newBranchName          // newBranchName -> branchName
            });
            
            if (createResult.status) {
                message.info(`分支 "${result.newBranchName}" 创建成功！`);
            } else {
                message.error(`创建失败: ${createResult.error}`);
            }
        }
        
        // 方式2: 直接调用API创建(示例)
        /*
        const drawingManager = new DrawingManagerService();
        const result = await drawingManager.createBranch({
            type: 'imports',
            mapid: env.exampleMapId,
            version: 'v1',
            sourceBranch: 'main',
            sourcePatchId: 'base',
            branchName: 'feature-new-layer'
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
