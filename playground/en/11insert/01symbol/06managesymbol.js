window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --符号管理--通过API管理符号（查询、获取详情、删除）
        const { MainView, initCadContainer, Engine, message, getLocalStorageService, decompressSymbolData } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // ==================== 本地符号管理 ====================
        console.log("=== 本地符号管理 ===");
        
        const localService = getLocalStorageService();
        
        // 1. 获取所有本地分类
        const localCategories = await localService.getLocalSymbolCategories();
        console.log("本地分类数量:", localCategories.length);
        
        // 2. 遍历分类获取符号列表
        for (const category of localCategories) {
            console.log("");
            console.log("分类: " + category.name);
            
            // 获取符号列表
            const symbols = await localService.getLocalSymbolList(category.id);
            console.log("  符号数量:", symbols.length);
            
            for (const symbol of symbols) {
                console.log("  - " + symbol.name);
                console.log("    基点: [" + symbol.basePoint[0] + ", " + symbol.basePoint[1] + "]");
                console.log("    创建时间:", symbol.createTime);
                
                // 获取符号详情（包含vcad数据）
                const detail = await localService.getLocalSymbol(symbol.id);
                if (detail) {
                    console.log("    数据大小:", detail.vcadData.length, "字节");
                }
            }
        }
        
        // 3. 获取本地符号统计信息
        const stats = await localService.getLocalSymbolStats();
        console.log("");
        console.log("本地符号统计:");
        console.log("  分类数:", stats.categoryCount);
        console.log("  符号数:", stats.symbolCount);
        console.log("  总大小:", (stats.totalSize / 1024).toFixed(2), "KB");
        
        // ==================== 服务端符号管理 ====================
        console.log("");
        console.log("=== 服务端符号管理 ===");
        
        const service = Engine.service;
        if (!service) {
            message.warn("服务不可用，跳过服务端符号管理");
        } else {
            // 1. 获取所有服务端分类
            const serverCategories = await service.getSymbolCategories();
            console.log("服务端分类数量:", serverCategories.length);
        
            // 2. 查找"用户自定义"分类
            const userCategory = serverCategories.find(c => c.name === "用户自定义");
            
            if (userCategory) {
                console.log("");
                console.log("分类: " + userCategory.name);
                
                // 获取符号列表（支持分页和搜索）
                const result = await service.getSymbolList(userCategory.id, {
                    page: 1,
                    pageSize: 10,
                    keyword: ""  // 可以输入关键字搜索
                });
                
                console.log("  符号总数:", result.total);
                console.log("  当前页:", result.page);
                console.log("  每页数量:", result.pageSize);
                
                for (const symbol of result.list) {
                    console.log("  - " + symbol.name);
                    console.log("    ID:", symbol.id);
                    console.log("    基点: [" + symbol.basePoint[0] + ", " + symbol.basePoint[1] + "]");
                    console.log("    创建时间:", symbol.createTime);
                    
                    // 获取符号详情（包含压缩的vcad数据）
                    const fullSymbol = await service.getSymbol(symbol.id);
                    if (fullSymbol && fullSymbol.data) {
                        console.log("    压缩数据大小:", fullSymbol.data.length, "字节");
                        
                        // 解压数据查看原始大小
                        const vcadData = await decompressSymbolData(fullSymbol.data);
                        if (vcadData) {
                            console.log("    解压后大小:", vcadData.length, "字节");
                        }
                    }
                }
                
                // 3. 演示删除符号（注释掉以避免误删）
                /*
                if (result.list.length > 0) {
                    const symbolToDelete = result.list[0];
                    try {
                        await service.deleteSymbol(symbolToDelete.id);
                        console.log("已删除符号:", symbolToDelete.name);
                    } catch (e) {
                        message.warn("删除符号失败:", e.message);
                    }
                }
                */
                console.log("");
                console.log("提示: 删除符号代码已注释，如需测试请取消注释");
                
            } else {
                message.warn("未找到'用户自定义'分类，请先运行 02create_server.js 创建符号");
            }
            
            // 4. 遍历其他分类
            for (const category of serverCategories) {
                if (category.name === "用户自定义") continue;
                
                const result = await service.getSymbolList(category.id, { page: 1, pageSize: 5 });
                if (result.total > 0) {
                    console.log("");
                    console.log("分类: " + category.name + " (共" + result.total + "个符号)");
                    for (const symbol of result.list) {
                        console.log("  - " + symbol.name);
                    }
                    if (result.total > 5) {
                        console.log("  ... 还有" + (result.total - 5) + "个符号");
                    }
                }
            }
        }
        
        message.info("=== 符号管理示例完成,请打开控制台查看输出信息 ===");
        
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
