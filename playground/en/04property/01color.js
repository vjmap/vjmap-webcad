window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --颜色设置--color属性、颜色索引和RGB真彩色
        const { MainView, initCadContainer, LineEnt, Engine, message, ColorConverter } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // ========== 1. 使用颜色索引（ACI颜色） ==========
        // WebCAD 使用 AutoCAD 颜色索引 (ACI)
        // 常用颜色索引：
        // 1 = 红色    4 = 青色    7 = 白色
        // 2 = 黄色    5 = 蓝色    256 = 随层 (ByLayer)
        // 3 = 绿色    6 = 洋红    0 = 随块 (ByBlock)
        
        // 注意：必须先调用 setDefaults()，再设置颜色，否则颜色会被默认值覆盖
        
        // 创建不同颜色的图形
        const colors = [1, 2, 3, 4, 5, 6, 7];
        const colorNames = ["红", "黄", "绿", "青", "蓝", "洋红", "白"];
        
        colors.forEach((color, index) => {
            const line = new LineEnt([0, index * 15], [100, index * 15]);
            line.setDefaults();  // 先应用默认属性
            line.color = color;  // 再设置颜色索引
            Engine.addEntities(line);
            
            message.info(`第${index + 1}条线: 颜色${color} (${colorNames[index]})`);
        });
        
        // 演示随层颜色
        const byLayerLine = new LineEnt([0, -15], [100, -15]);
        byLayerLine.setDefaults();
        byLayerLine.color = 256;  // 随层颜色
        Engine.addEntities(byLayerLine);
        message.info("随层颜色线: 颜色256 (ByLayer)");
        
        // ========== 2. 使用 RGB 真彩色 ==========
        // RGB 颜色需要加上标记位 0x1000000 (16777216)
        // RGB颜色 = 0x1000000 + 0xRRGGBB
        // 可以使用 ColorConverter 工具类简化操作
        
        message.info("--- RGB 真彩色示例 ---");
        
        // 方式1：直接计算 RGB 颜色值
        const orangeLine = new LineEnt([120, 0], [220, 0]);
        orangeLine.setDefaults();
        orangeLine.color = 0x1000000 + 0xFF8000;  // 橙色
        Engine.addEntities(orangeLine);
        message.info("橙色线: 0x1000000 + 0xFF8000");
        
        // 方式2：使用 ColorConverter.createRgbColorIndex
        const purpleLine = new LineEnt([120, 15], [220, 15]);
        purpleLine.setDefaults();
        purpleLine.color = ColorConverter.createRgbColorIndex(0x800080);  // 紫色
        Engine.addEntities(purpleLine);
        message.info("紫色线: ColorConverter.createRgbColorIndex(0x800080)");
        
        // 方式3：使用 ColorConverter.createRgbColorIndexFromComponents (R, G, B)
        const pinkLine = new LineEnt([120, 30], [220, 30]);
        pinkLine.setDefaults();
        pinkLine.color = ColorConverter.createRgbColorIndexFromComponents(255, 192, 203);  // 粉色
        Engine.addEntities(pinkLine);
        message.info("粉色线: createRgbColorIndexFromComponents(255, 192, 203)");
        
        // 方式4：使用 ColorConverter.createRgbColorIndexFromHexStr
        const goldLine = new LineEnt([120, 45], [220, 45]);
        goldLine.setDefaults();
        goldLine.color = ColorConverter.createRgbColorIndexFromHexStr("#FFD700");  // 金色
        Engine.addEntities(goldLine);
        message.info("金色线: createRgbColorIndexFromHexStr('#FFD700')");
        
        // 不带#前缀也可以
        const tealLine = new LineEnt([120, 60], [220, 60]);
        tealLine.setDefaults();
        tealLine.color = ColorConverter.createRgbColorIndexFromHexStr("008080");  // 青绿色
        Engine.addEntities(tealLine);
        message.info("青绿线: createRgbColorIndexFromHexStr('008080')");
        
        // ========== 3. 颜色工具函数 ==========
        message.info("--- 颜色工具函数 ---");
        
        // 判断是否为 RGB 颜色
        message.info(`orangeLine 是RGB颜色: ${ColorConverter.isRgbColor(orangeLine.color)}`);  // true
        message.info(`redLine 是RGB颜色: ${ColorConverter.isRgbColor(1)}`);  // false
        
        // 获取 RGB 分量
        const { r, g, b } = ColorConverter.getRgbComponents(pinkLine.color);
        message.info(`粉色 RGB 分量: R=${r}, G=${g}, B=${b}`);
        
        // 获取十六进制字符串
        message.info(`金色十六进制: #${ColorConverter.GetColorHexStr(goldLine.color)}`);
        
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
