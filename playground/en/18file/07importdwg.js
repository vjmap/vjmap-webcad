window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --从本地DWG导入--IMPORTDWG命令上传并转换DWG文件
        const { MainView, initCadContainer, Engine, DrawingManagerService, Service, MapOpenWay, openMapDarkStyle, writeMessage, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 从本地DWG导入示例 ===");
        message.info("上传本地 DWG/DXF 文件到服务器并打开");
        
        // 方式1：通过命令行执行
        /*
        await Engine.editor.executerWithOp('IMPORTDWG');
        */
        
        // 方式2：通过API导入
        message.info("");
        message.info("导入流程：");
        message.info("  1. 选择本地 DWG/DXF 文件");
        message.info("  2. 上传到服务器");
        message.info("  3. 配置导入选项（图名、打开方式等）");
        message.info("  4. 服务器解析并转换");
        message.info("  5. 加载到编辑器");
        
        // 创建文件输入
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.dwg,.dxf';
        input.style.display = 'none';
        document.body.appendChild(input);
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            message.info(`选择文件: ${file.name}`);
            message.info("正在上传...");
            
            const drawingManager = new DrawingManagerService();
            const service = drawingManager.getService();
            
            // 上传文件
            const uploadResult = await service.uploadMap(file);
            if (uploadResult.error) {
                message.error('上传失败: ' + uploadResult.error);
                return;
            }
            
            message.info("上传成功，正在解析...");
            
            // 生成图纸ID（使用文件名去掉扩展名）
            const mapid = file.name.replace(/\.(dwg|dxf)$/i, '') + '_' + Date.now();
            
            // 打开并解析
            const openResult = await service.openMap({
                mapid: mapid,
                fileid: uploadResult.fileid,
                uploadname: file.name,
                mapopenway: MapOpenWay.Memory,
                style: openMapDarkStyle()
            }, true);
            
            if (openResult.error) {
                message.error('解析失败: ' + openResult.error);
                return;
            }
            
            message.info("解析成功，正在加载...");
            
            // 获取 webcad 数据并加载
            const drawingResult = await drawingManager.openDrawing({
                type: 'imports',
                mapid: openResult.mapid,
                version: openResult.version,
                branch: 'main'
            });
            
            if (drawingResult.success) {
                const virtualFile = new File(
                    [drawingResult.webcadJson], 
                    'drawing.webcad', 
                    { type: 'application/json' }
                );
                await Engine.view.openDbDoc(virtualFile, drawingResult.webcadData);
                
                Engine.currentDoc.serverSource = {
                    type: 'imports',
                    mapid: openResult.mapid,
                    version: openResult.version,
                    branchName: 'main',
                    lastPatchId: drawingResult.latestPatchId || 'base'
                };
                await Engine.currentDoc.setOriginalJson(drawingResult.webcadJson);
                
                message.info("导入完成!");
                message.info(`图纸ID: ${openResult.mapid}`);
            } else {
                message.error('加载失败: ' + drawingResult.error);
            }
            
            document.body.removeChild(input);
            importBtn.remove();
        };
        
        message.info("");
        message.info("支持的文件格式：");
        message.info("  - DWG: AutoCAD 图纸格式");
        message.info("  - DXF: 图形交换格式");
        
        // 创建导入按钮（文件选择对话框必须由用户交互触发）
        const importBtn = document.createElement('button');
        importBtn.textContent = '选择 DWG/DXF 文件导入';
        importBtn.style.cssText = 'position:fixed;top:10px;right:10px;padding:10px 20px;font-size:14px;cursor:pointer;z-index:9999;background:#1890ff;color:#fff;border:none;border-radius:4px;';
        importBtn.onclick = () => input.click();
        document.body.appendChild(importBtn);
        
        message.info("");
        message.info("点击右上角按钮选择文件开始导入...");
        
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
