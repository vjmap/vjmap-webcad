window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --颜色设置--使用索引颜色和RGB真彩色创建直线
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
        // WebCAD 支持 AutoCAD 标准的 256 色索引
        // 注意：必须先调用 setDefaults()，再设置颜色，否则颜色会被默认值覆盖
        
        // 基本颜色（1-7）
        const redLine = new LineEnt([0, 0], [100, 0]);
        redLine.setDefaults();
        redLine.color = 1;  // 红色
        
        const yellowLine = new LineEnt([0, -20], [100, -20]);
        yellowLine.setDefaults();
        yellowLine.color = 2;  // 黄色
        
        const greenLine = new LineEnt([0, -40], [100, -40]);
        greenLine.setDefaults();
        greenLine.color = 3;  // 绿色
        
        const cyanLine = new LineEnt([0, -60], [100, -60]);
        cyanLine.setDefaults();
        cyanLine.color = 4;  // 青色
        
        const blueLine = new LineEnt([0, -80], [100, -80]);
        blueLine.setDefaults();
        blueLine.color = 5;  // 蓝色
        
        const magentaLine = new LineEnt([0, -100], [100, -100]);
        magentaLine.setDefaults();
        magentaLine.color = 6;  // 洋红色
        
        const whiteLine = new LineEnt([0, -120], [100, -120]);
        whiteLine.setDefaults();
        whiteLine.color = 7;  // 白色（深色背景）
        
        // 特殊颜色值
        const byLayerLine = new LineEnt([0, -140], [100, -140]);
        byLayerLine.setDefaults();
        byLayerLine.color = 256;  // 随层 ByLayer
        
        const byBlockLine = new LineEnt([0, -160], [100, -160]);
        byBlockLine.setDefaults();
        byBlockLine.color = 0;  // 随块 ByBlock
        
        // ========== 2. 使用 RGB 真彩色 ==========
        // RGB 颜色需要加上标记位 0x1000000 (16777216)
        // 可以使用 ColorConverter 工具类简化操作
        
        // 方式1：直接计算 RGB 颜色值
        // RGB颜色 = 0x1000000 + 0xRRGGBB
        const orangeLine = new LineEnt([150, 0], [250, 0]);
        orangeLine.setDefaults();
        orangeLine.color = 0x1000000 + 0xFF8000;  // 橙色
        
        // 方式2：使用 ColorConverter.createRgbColorIndex
        const purpleLine = new LineEnt([150, -20], [250, -20]);
        purpleLine.setDefaults();
        purpleLine.color = ColorConverter.createRgbColorIndex(0x800080);  // 紫色
        
        // 方式3：使用 ColorConverter.createRgbColorIndexFromComponents (R, G, B)
        const pinkLine = new LineEnt([150, -40], [250, -40]);
        pinkLine.setDefaults();
        pinkLine.color = ColorConverter.createRgbColorIndexFromComponents(255, 192, 203);  // 粉色
        
        // 方式4：使用 ColorConverter.createRgbColorIndexFromHexStr
        const tealLine = new LineEnt([150, -60], [250, -60]);
        tealLine.setDefaults();
        tealLine.color = ColorConverter.createRgbColorIndexFromHexStr("#008080");  // 青绿色
        
        const goldLine = new LineEnt([150, -80], [250, -80]);
        goldLine.setDefaults();
        goldLine.color = ColorConverter.createRgbColorIndexFromHexStr("FFD700");  // 金色（无#前缀也可以）
        
        // ========== 3. 颜色工具函数 ==========
        
        // 判断是否为 RGB 颜色
        const isRgb = ColorConverter.isRgbColor(orangeLine.color);
        message.info(`橙色线是RGB颜色: ${isRgb}`);  // true
        
        // 从颜色值提取 RGB
        const rgbValue = ColorConverter.extractRgbValue(orangeLine.color);
        message.info(`橙色RGB值: 0x${rgbValue.toString(16).toUpperCase()}`);  // 0xFF8000
        
        // 获取 RGB 分量
        const { r, g, b } = ColorConverter.getRgbComponents(pinkLine.color);
        message.info(`粉色RGB分量: R=${r}, G=${g}, B=${b}`);  // R=255, G=192, B=203
        
        // 获取颜色的十六进制字符串
        const hexStr = ColorConverter.GetColorHexStr(goldLine.color);
        message.info(`金色十六进制: #${hexStr}`);  // #FFD700
        
        // 获取 CSS 颜色格式
        const cssColor = ColorConverter.GetColorCssStr(tealLine.color);
        message.info(`青绿色CSS格式: ${cssColor}`);  // #008080
        
        // ========== 添加所有直线到画布 ==========
        Engine.addEntities([
            redLine, yellowLine, greenLine, cyanLine, blueLine, magentaLine, whiteLine,
            byLayerLine, byBlockLine,
            orangeLine, purpleLine, pinkLine, tealLine, goldLine
        ]);
        
        Engine.zoomExtents();
        
        message.info("颜色示例创建完成");
        message.info("左侧: 索引颜色 (1-7, 0, 256)");
        message.info("右侧: RGB真彩色");
        
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
