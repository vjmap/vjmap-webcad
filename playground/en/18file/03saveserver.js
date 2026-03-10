window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --保存到服务端--SAVESERVER命令与增量保存
        const { MainView, initCadContainer, Engine, LineEnt, CircleEnt, DrawingManagerService, writeMessage, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 保存到服务端示例 ===");
        message.info("先从服务端加载图纸，修改后保存");
        
        // 先从服务端打开图纸
        const drawingManager = new DrawingManagerService();
        const openResult = await drawingManager.openDrawing({
            type: 'imports',
            mapid: env.exampleMapId,
            version: 'v1',
            branch: 'main',
            patchId: 'base'
        });
        
        if (!openResult.success) {
            message.error(`打开图纸失败: ${openResult.error}`);
        } else {
            const webcadData = openResult.webcadData;
            const jsonString = openResult.webcadJson;
            const docName = `${env.exampleMapId}_v1_main`;
            const virtualFile = new File([jsonString], docName, { type: 'application/json' });
            await Engine.view.openDbDoc(virtualFile, webcadData);
            
            // 保存来源信息和原始数据
            Engine.currentDoc.serverSource = {
                type: 'imports',
                mapid: env.exampleMapId,
                version: 'v1',
                branchName: 'main',
                lastPatchId: openResult.latestPatchId || 'base'
            };
            await Engine.currentDoc.setOriginalJson(openResult.webcadJson);
            
            message.info("图纸加载完成，添加新图形...");
            
            // 根据图纸范围计算坐标
            const initBounds = Engine.currentDoc.currentSpace.initBounds;
            const centerX = initBounds ? (initBounds[0] + initBounds[2]) / 2 : 0;
            const centerY = initBounds ? (initBounds[1] + initBounds[3]) / 2 : 0;
            const size = initBounds ? Math.min(initBounds[2] - initBounds[0], initBounds[3] - initBounds[1]) * 0.1 : 100;
            
            // 添加一些新图形
            const circle = new CircleEnt([centerX - size, centerY], size * 0.5);
            circle.setDefaults();
            circle.color = 1;
            Engine.addEntities(circle);
            
            const line = new LineEnt([centerX, centerY], [centerX + size, centerY + size]);
            line.setDefaults();
            line.color = 3;
            Engine.addEntities(line);
            
            Engine.zoomExtents();
            message.info("已添加圆和直线");
            
            // 方式1：通过命令行执行
            /*
            await Engine.editor.executerWithOp('SAVESERVER');
            */
            
            // 方式2：通过API保存
            message.info("保存类型：imports - 已导入的DWG图纸，支持增量patch");
            message.info("增量保存特点：");
            message.info("  - 只保存修改的部分，节省存储空间");
            message.info("  - 支持版本历史回溯");
            message.info("  - 支持多人协作冲突检测");
            
            // 获取当前文档数据
            const currentDoc = Engine.currentDoc;
            const currentJson = JSON.stringify(currentDoc.toDb());
            const originalJson = await currentDoc.getOriginalJson();
            const serverSource = currentDoc.serverSource;
            
            // API方式保存（注释掉实际保存，避免修改服务器数据）
            message.info("");
            message.info("API保存示例代码（已注释，避免修改服务器数据）：");
            /*
            const saveResult = await drawingManager.saveDrawing({
                type: serverSource.type,
                mapid: serverSource.mapid,
                version: serverSource.version,
                branchName: serverSource.branchName,
                originalJson: originalJson,
                currentJson: currentJson,
                parentId: serverSource.lastPatchId,
                drawingName: '我的图纸',
                author: '作者',
                remark: '修改说明'
            });
            
            if (saveResult.status) {
                message.info(`保存成功! Patch ID: ${saveResult.patchId}`);
                await currentDoc.setOriginalJson(currentJson);
                currentDoc.serverSource.lastPatchId = saveResult.patchId;
            }
            */
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
