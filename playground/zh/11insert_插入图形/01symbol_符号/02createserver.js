window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建服务端符号--通过API创建符号并保存到服务端
        const { MainView, initCadContainer, LineEnt, CircleEnt, ArcEnt, Engine, message, buildSymbolVcadData, compressSymbolData, uint8ArrayToBase64, generateThumbnailFromEntities } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 1. 创建几个实体作为符号内容
        // 创建一个箭头符号
        const line1 = new LineEnt([0, 0], [20, 0]);       // 箭头主体
        const line2 = new LineEnt([20, 0], [15, 3]);      // 箭头上翼
        const line3 = new LineEnt([20, 0], [15, -3]);     // 箭头下翼
        
        line1.setDefaults();
        line2.setDefaults();
        line3.setDefaults();
        
        // 添加到图中预览
        Engine.addEntities([line1, line2, line3]);
        Engine.zoomExtents();
        
        // 2. 检查服务是否可用
        const service = Engine.service;
        if (!service) {
            message.error("服务不可用，请确保已连接到服务端");
            throw new Error("服务不可用");
        }
        
        // 3. 获取服务端符号分类
        const categories = await service.getSymbolCategories();
        message.info("服务端分类数量:", categories.length);
        
        // 查找"用户自定义"分类（有写入权限）
        let targetCategory = categories.find(c => c.name === "用户自定义");
        if (!targetCategory) {
            // 尝试创建分类
            try {
                targetCategory = await service.createSymbolCategory("用户自定义");
                message.info("已创建服务端分类: 用户自定义");
            } catch (e) {
                message.error("无法创建分类，请确保有权限");
                throw e;
            }
        }
        
        // 4. 构建符号的 vcad 数据
        const entities = [line1, line2, line3];
        const vcadData = await buildSymbolVcadData(entities, false);
        
        // 5. 生成缩略图
        const thumbnail = await generateThumbnailFromEntities(entities, 128, 128);
        message.info("缩略图生成完成，大小:", thumbnail.length);
        
        // 6. 压缩数据（服务端存储需要压缩）
        const compressedData = await compressSymbolData(vcadData, 6);
        if (!compressedData) {
            throw new Error("数据压缩失败");
        }
        
        // 7. Base64 编码
        const base64Data = uint8ArrayToBase64(compressedData);
        message.info("压缩后大小:", base64Data.length, "字节");
        
        // 8. 保存符号到服务端
        try {
            const symbol = await service.createSymbol({
                categoryId: targetCategory.id,
                name: "箭头符号_" + Date.now(),  // 添加时间戳避免重名
                basePoint: [0, 0],
                thumbnail: thumbnail,
                data: base64Data
            });
            
            message.info("符号已保存到服务端");
            message.info("符号ID:", symbol.id);
            message.info("符号名称:", symbol.name);
        } catch (e) {
            message.error("保存失败:", e.message);
            throw e;
        }
        
        // 9. 验证：获取符号列表
        const result = await service.getSymbolList(targetCategory.id);
        message.info("分类下符号数量:", result.total);
        
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
