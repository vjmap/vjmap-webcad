window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --从服务端打开--OPENFROMSERVER命令与API调用
        const { MainView, initCadContainer, Engine, DrawingManagerService, writeMessage, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 从服务端打开图纸示例 ===");
        
        // 方式1：通过命令行执行（会弹出图纸浏览器对话框）
        /*
        message.info("方式1: 执行 OPENFROMSERVER 命令打开图纸浏览器");
        await Engine.editor.executerWithOp('OPENFROMSERVER');
        // 在浏览器中可以：
        //   - 浏览后台DWG图纸
        //   - 浏览已导入图纸
        //   - 浏览设计图
        //   - 选择普通打开或瓦片打开
        //   - 管理分支和版本
        */
        
        // 方式2：通过 DrawingManagerService API 直接打开
        message.info("通过API直接打开图纸...");
        
        const drawingManager = new DrawingManagerService();
        
        const openResult = await drawingManager.openDrawing({
            type: 'imports',           // 类型：'imports' | 'designs'
            mapid: env.exampleMapId,   // 图纸ID
            version: 'v1',             // 版本号
            branch: 'main',            // 分支名称
            patchId: 'base',           // Patch ID（可选，不传则使用最新）
            readOnly: false            // 是否只读模式
        });
        
        if (!openResult.success) {
            message.error(`打开图纸失败: ${openResult.error}`);
        } else {
            // 加载到编辑器
            const webcadData = openResult.webcadData;
            const jsonString = openResult.webcadJson;
            const docName = `${env.exampleMapId}_v1_main`;
            const virtualFile = new File([jsonString], docName, { type: 'application/json' });
            await Engine.view.openDbDoc(virtualFile, webcadData);
            
            // 保存来源信息（用于后续保存）
            Engine.currentDoc.serverSource = {
                type: 'imports',
                mapid: env.exampleMapId,
                version: 'v1',
                branchName: 'main',
                lastPatchId: openResult.latestPatchId || 'base'
            };
            
            // 保存原始数据（用于增量保存时的diff计算）
            await Engine.currentDoc.setOriginalJson(openResult.webcadJson);
            
            message.info("图纸加载完成!");
            message.info(`图纸ID: ${env.exampleMapId}`);
            message.info(`版本: v1, 分支: main`);
        }
        
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
