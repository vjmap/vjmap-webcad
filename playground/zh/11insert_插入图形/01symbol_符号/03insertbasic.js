window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --基础插入符号--通过API获取符号并插入到当前图（指定参数）
        const { MainView, initCadContainer, Engine, message, Point2D, getLocalStorageService, decompressSymbolData, parseSymbolVcadData, mergeSymbolToDocument, regen } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // ==================== 从本地存储插入符号 ====================
        
        // 1. 获取本地存储服务
        const localService = getLocalStorageService();
        
        // 2. 获取本地符号分类
        const localCategories = await localService.getLocalSymbolCategories();
        message.info("本地分类数量:", localCategories.length);
        
        if (localCategories.length === 0) {
            message.warn("本地没有符号分类，请先运行 01create_local.js 创建符号");
        }
        
        // 3. 获取第一个分类下的符号列表
        let localSymbol = null;
        for (const cat of localCategories) {
            const symbols = await localService.getLocalSymbolList(cat.id);
            if (symbols.length > 0) {
                // 获取第一个符号的详细数据
                const symbolData = await localService.getLocalSymbol(symbols[0].id);
                if (symbolData) {
                    localSymbol = {
                        ...symbols[0],
                        vcadData: symbolData.vcadData
                    };
                    message.info("找到本地符号:", localSymbol.name);
                    break;
                }
            }
        }
        
        // 4. 插入本地符号
        if (localSymbol) {
            // 解析 vcad 数据为 CadDocument
            const symbolDoc = await parseSymbolVcadData(localSymbol.vcadData);
            
            // 插入参数
            const insertPoint = new Point2D(50, 50);  // 插入点
            const basePoint = localSymbol.basePoint;  // 符号基点
            const scale = 1.5;                         // 缩放比例
            const rotation = 45;                       // 旋转角度（度）
            
            // 合并符号到当前文档
            const addedEntities = mergeSymbolToDocument(
                symbolDoc,
                insertPoint,
                basePoint,
                scale,
                rotation,
                false  // 不清空来源图信息
            );
            
            message.info("本地符号已插入，实体数:", addedEntities.length);
            message.info("插入点: (50, 50), 缩放: 1.5, 旋转: 45°");
        }
        
        // ==================== 从服务端插入符号 ====================
        
        const service = Engine.service;
        if (service) {
            // 5. 获取服务端符号分类
            const serverCategories = await service.getSymbolCategories();
            message.info("服务端分类数量:", serverCategories.length);
            
            // 6. 查找"用户自定义"分类
            const userCategory = serverCategories.find(c => c.name === "用户自定义");
            
            if (userCategory) {
                // 获取符号列表
                const result = await service.getSymbolList(userCategory.id);
                
                if (result.list.length > 0) {
                    // 获取第一个符号的详细数据
                    const fullSymbol = await service.getSymbol(result.list[0].id);
                    
                    if (fullSymbol && fullSymbol.data) {
                        // 解压数据
                        const vcadData = await decompressSymbolData(fullSymbol.data);
                        
                        if (vcadData) {
                            // 解析为 CadDocument
                            const symbolDoc = await parseSymbolVcadData(vcadData);
                            
                            // 在不同位置插入（不缩放不旋转）
                            const insertPoint2 = new Point2D(150, 50);
                            const addedEntities2 = mergeSymbolToDocument(
                                symbolDoc,
                                insertPoint2,
                                fullSymbol.basePoint,
                                1,   // 缩放 1:1
                                0,   // 不旋转
                                false
                            );
                            
                            message.info("服务端符号已插入，实体数:", addedEntities2.length);
                            message.info("插入点: (150, 50), 缩放: 1, 旋转: 0°");
                        }
                    }
                } else {
                    message.warn("用户自定义分类下没有符号，请先运行 02create_server.js");
                }
            } else {
                message.warn("未找到用户自定义分类");
            }
        }
        
        // 7. 刷新视图
        regen();
        Engine.zoomExtents();
        
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
