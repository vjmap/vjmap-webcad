window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建本地符号--通过API创建符号并保存到本地存储
        const { MainView, initCadContainer, LineEnt, CircleEnt, PolylineEnt, Engine, message, getLocalStorageService, buildSymbolVcadData, generateThumbnailFromEntities } = vjcad;
        
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
        // 创建一个十字形符号
        const line1 = new LineEnt([-10, 0], [10, 0]);
        const line2 = new LineEnt([0, -10], [0, 10]);
        const circle = new CircleEnt([0, 0], 8);
        
        line1.setDefaults();
        line2.setDefaults();
        circle.setDefaults();
        
        // 添加到图中（可选，用于预览）
        Engine.addEntities([line1, line2, circle]);
        Engine.zoomExtents();
        
        // 2. 获取本地存储服务
        const localService = getLocalStorageService();
        
        // 3. 创建本地符号分类（如果不存在）
        let categories = await localService.getLocalSymbolCategories();
        let categoryId;
        
        // 查找或创建"示例符号"分类
        let exampleCategory = categories.find(c => c.name === "示例符号");
        if (!exampleCategory) {
            exampleCategory = await localService.createLocalSymbolCategory("示例符号");
            message.info("已创建本地分类: 示例符号");
        }
        categoryId = exampleCategory.id;
        
        // 4. 构建符号的 vcad 数据
        const entities = [line1, line2, circle];
        const vcadData = await buildSymbolVcadData(entities, false);
        
        message.info("vcadData 长度:", vcadData.length);
        
        // 5. 生成缩略图
        const thumbnail = await generateThumbnailFromEntities(entities, 128, 128);
        message.info("缩略图生成完成，大小:", thumbnail.length);
        
        // 6. 保存符号到本地存储
        const symbol = await localService.saveLocalSymbol({
            categoryId: categoryId,
            name: "十字圆符号",
            basePoint: [0, 0],  // 符号基点
            thumbnail: thumbnail,
            vcadData: vcadData
        });
        
        if (symbol) {
            message.info("符号已保存到本地");
            message.info("符号ID:", symbol.id);
            message.info("符号名称:", symbol.name);
        } else {
            message.error("保存符号失败");
        }
        
        // 6. 验证：获取本地符号列表
        const symbolList = await localService.getLocalSymbolList(categoryId);
        message.info("分类下符号数量:", symbolList.length);
        
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
