window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --分类管理--通过API管理符号分类（创建、查询、更新、删除）
        const { MainView, initCadContainer, Engine, message, getLocalStorageService } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // ==================== 本地分类管理 ====================
        console.log("=== 本地分类管理 ===");
        
        const localService = getLocalStorageService();
        
        // 1. 获取所有本地分类
        let localCategories = await localService.getLocalSymbolCategories();
        console.log("当前本地分类数量:", localCategories.length);
        for (const cat of localCategories) {
            console.log("  - " + cat.name + " (ID: " + cat.id + ")");
        }
        
        // 2. 创建新分类
        const newCategoryName = "测试分类_" + Date.now();
        const newCategory = await localService.createLocalSymbolCategory(newCategoryName);
        if (newCategory) {
            console.log("已创建本地分类:", newCategory.name);
            console.log("分类ID:", newCategory.id);
        }
        
        // 3. 更新分类名称
        if (newCategory) {
            const updatedName = newCategoryName + "_已修改";
            await localService.updateLocalSymbolCategory(newCategory.id, updatedName);
            console.log("已更新分类名称为:", updatedName);
        }
        
        // 4. 再次获取分类列表验证
        localCategories = await localService.getLocalSymbolCategories();
        console.log("更新后本地分类数量:", localCategories.length);
        
        // 5. 删除测试分类
        if (newCategory) {
            await localService.deleteLocalSymbolCategory(newCategory.id);
            console.log("已删除测试分类");
        }
        
        // 6. 最终验证
        localCategories = await localService.getLocalSymbolCategories();
        console.log("删除后本地分类数量:", localCategories.length);
        
        // ==================== 服务端分类管理 ====================
        console.log("");
        console.log("=== 服务端分类管理 ===");
        
        const service = Engine.service;
        if (!service) {
            message.warn("服务不可用，跳过服务端分类管理");
        } else {
            // 1. 获取所有服务端分类
            let serverCategories = await service.getSymbolCategories();
            console.log("当前服务端分类数量:", serverCategories.length);
            for (const cat of serverCategories) {
                console.log("  - " + cat.name + " (ID: " + cat.id + ")");
            }
        
            // 2. 创建新分类（需要权限）
            const serverCategoryName = "API测试分类_" + Date.now();
            let serverNewCategory = null;
            
            try {
                serverNewCategory = await service.createSymbolCategory(serverCategoryName);
                console.log("已创建服务端分类:", serverNewCategory.name);
                console.log("分类ID:", serverNewCategory.id);
            } catch (e) {
                message.warn("创建服务端分类失败（可能无权限）:", e.message);
            }
        
            // 3. 更新分类名称
            if (serverNewCategory) {
                try {
                    const updatedName = serverCategoryName + "_已修改";
                    await service.updateSymbolCategory(serverNewCategory.id, updatedName);
                    console.log("已更新服务端分类名称为:", updatedName);
                } catch (e) {
                    message.warn("更新服务端分类失败:", e.message);
                }
            }
        
            // 4. 删除测试分类
            if (serverNewCategory) {
                try {
                    await service.deleteSymbolCategory(serverNewCategory.id);
                    console.log("已删除服务端测试分类");
                } catch (e) {
                    message.warn("删除服务端分类失败:", e.message);
                }
            }
        
            // 5. 最终验证
            serverCategories = await service.getSymbolCategories();
            console.log("最终服务端分类数量:", serverCategories.length);
        }
        
        message.info("=== 分类管理示例完成,请打开控制台查看输出信息 ===");
        
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
