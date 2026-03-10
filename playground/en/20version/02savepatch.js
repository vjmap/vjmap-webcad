window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --保存版本--创建新的Patch版本
        const { MainView, initCadContainer, Engine, LineEnt, CircleEnt, DrawingManagerService, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 保存版本(Patch)示例 ===");
        message.info("每次保存都会创建一个新的Patch版本");
        
        message.info("");
        message.info("Patch版本链：");
        message.info("  base → patch-001 → patch-002 → ...");
        message.info("  每个patch记录相对于父版本的增量变更");
        
        message.info("");
        message.info("Patch内容包含：");
        message.info("  - 新增的实体");
        message.info("  - 修改的实体");
        message.info("  - 删除的实体ID");
        message.info("  - 图层变更");
        message.info("  - 编辑区域信息(瓦片模式)");
        message.info("  - 元数据(作者、时间、备注等)");
        
        // 命令方式：执行保存
        /*
        message.info("");
        message.info("工作流程：");
        message.info("  1. 从服务端打开图纸(获取原始数据)");
        message.info("  2. 编辑图纸(增删改实体)");
        message.info("  3. 执行 SAVESERVER 保存");
        message.info("  4. 系统计算diff，生成patch");
        message.info("  5. 上传patch到服务器");
        
        setTimeout(async () => {
            message.info("");
            message.info("3秒后打开保存对话框...");
            await Engine.editor.executerWithOp('SAVESERVER');
        }, 3000);
        */
        
        // API 方式保存版本
        message.info("");
        message.info("通过API方式演示保存流程...");
        message.info("注意: 保存Patch需要先从服务器打开图纸获取原始数据");
        
        const drawingManager = new DrawingManagerService();
        
        // 第一步：从服务器打开图纸（获取原始数据用于diff计算）
        message.info("正在从服务器加载图纸...");
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
            // 加载图纸数据到编辑器
            const webcadData = openResult.webcadData;
            const jsonString = openResult.webcadJson;
            const docName = `${env.exampleMapId}_v1_main`;
            const virtualFile = new File([jsonString], docName, { type: 'application/json' });
            
            // 使用 openDbDoc 正确加载文档
            await Engine.view.openDbDoc(virtualFile, webcadData);
            
            // 保存原始数据（用于后续diff计算）
            const originalJson = openResult.webcadJson;
            await Engine.currentDoc.setOriginalJson(originalJson);
            
            message.info("图纸加载完成，开始编辑...");
         
            // 第二步：编辑图纸（添加新图形）
            // 获取图纸范围，在范围内添加图形
            const initBounds = Engine.currentDoc.currentSpace.initBounds;  // [minX, minY, maxX, maxY]
            const centerX = initBounds ? (initBounds[0] + initBounds[2]) / 2 : 0;
            const centerY = initBounds ? (initBounds[1] + initBounds[3]) / 2 : 0;
            const size = initBounds ? Math.min(initBounds[2] - initBounds[0], initBounds[3] - initBounds[1]) * 0.1 : 100;
            
            const circle = new CircleEnt([centerX, centerY], size);
            circle.setDefaults();
            circle.color = 1;
            Engine.addEntities(circle);
            
            const line = new LineEnt([centerX - size, centerY - size], [centerX + size, centerY + size]);
            line.setDefaults();
            line.color = 3;
            Engine.addEntities(line);
            
            Engine.zoomExtents();
            message.info("已添加示例图形");
            
            // 第三步：保存（计算diff生成patch）
            const currentDoc = Engine.currentDoc;
            const currentJson = JSON.stringify(currentDoc.toDb());
            
            const saveParams = {
                type: 'imports',
                mapid: env.exampleMapId,
                version: 'v1',
                branchName: 'main',
                originalJson: originalJson,
                currentJson: currentJson,
                parentId: openResult.latestPatchId || 'base',  // 使用打开时的版本作为父版本
                drawingName: '保存版本示例',
                author: '示例用户',
                remark: '通过API保存的示例版本'
            };
            
            const result = await drawingManager.saveDrawing(saveParams);
            
            if (result.status) {
                if (result.patchId === 'no_change') {
                    message.info('没有需要保存的修改');
                } else {
                    message.info(`保存成功! Patch ID: ${result.patchId}`);
                    // 更新本地原始数据
                    await currentDoc.setOriginalJson(currentJson);
                    
                    // 3秒后删除此patch
                    message.info('3秒后将删除此patch...');
                    setTimeout(async () => {
                        const deleteResult = await drawingManager.deletePatch({
                            type: 'imports',
                            mapid: env.exampleMapId,
                            version: 'v1',
                            branch: 'main',
                            patchId: result.patchId
                        });
                        if (deleteResult.status) {
                            message.info(`Patch ${result.patchId} 已删除`);
                        } else {
                            message.error(`删除失败: ${deleteResult.error}`);
                        }
                    }, 3000);
                }
            } else if (result.conflict && result.conflict.hasConflict) {
                message.warn('检测到与其他用户的修改冲突');
            } else {
                message.error(`保存失败: ${result.error}`);
            }
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
