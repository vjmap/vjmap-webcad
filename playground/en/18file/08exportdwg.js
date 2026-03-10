window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --导出为DWG--EXPORTDWG命令导出DWG格式
        const { MainView, initCadContainer, Engine, LineEnt, CircleEnt, TextEnt, DrawingManagerService, writeMessage, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 导出为DWG示例 ===");
        message.info("先从服务端加载图纸，然后导出为DWG格式");
        
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
            
            Engine.currentDoc.serverSource = {
                type: 'imports',
                mapid: env.exampleMapId,
                version: 'v1',
                branchName: 'main',
                lastPatchId: openResult.latestPatchId || 'base'
            };
            
            message.info("图纸加载完成");
            
            // 方式1：通过命令行执行
            /*
            await Engine.editor.executerWithOp('EXPORTDWG');
            */
            
            // 方式2：通过API导出
            message.info("");
            message.info("导出选项说明：");
            message.info("  - CAD版本: 目标DWG版本(2000-2018)");
            message.info("  - 缩放到全图: 导出后自动缩放");
            message.info("  - 使用缓存: 加速重复导出");
            message.info("  - 解散组: 将组分解为独立实体");
            message.info("  - 原生标注: 导出为AutoCAD原生标注");
            message.info("  - 更新原图: 基于原DWG增量修改(仅限imports)");
            
            const currentDoc = Engine.currentDoc;
            const currentJson = JSON.stringify(currentDoc.toDb());
            const serverSource = currentDoc.serverSource;
            
            // 导出参数
            const exportParams = {
                type: serverSource.type,
                webcadJson: currentJson,
                mapid: serverSource.mapid,
                version: serverSource.version,
                branch: serverSource.branchName,
                cadVersion: '',              // CAD版本，空为自动
                isZoomExtents: false,        // 是否缩放到全图
                useCache: true,              // 是否使用缓存
                unGroup: false,              // 是否解散组
                exportDimAsNative: false     // 是否导出原生标注
            };
            
            message.info("");
            message.info("正在导出DWG...");
            
            const result = await drawingManager.exportToDwg(exportParams);
            
            if (result.status) {
                message.info(`导出成功! 文件名: ${result.filename}`);
                message.info("导出模式：imports类型 - 基于原DWG增量导出");
                
                // 如果有下载链接，可以打开
                if (result.downloadUrl) {
                    window.open(result.downloadUrl, '_blank');
                }
            } else {
                message.error(`导出失败: ${result.error}`);
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
