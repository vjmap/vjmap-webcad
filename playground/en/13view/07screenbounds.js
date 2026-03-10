window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --屏幕范围--getScreenBoundsWcs和getScreenEntities用法
        const { MainView, initCadContainer, LineEnt, CircleEnt, PolylineEnt, Engine, writeMessage , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建分布在不同位置的实体
        const entities = [];
        
        // 左区域 - 红色
        for (let i = 0; i < 3; i++) {
            const circle = new CircleEnt([-100 + i * 30, i * 20], 10);
            circle.setDefaults();
            circle.color = 1;
            entities.push(circle);
        }
        
        // 中心区域 - 绿色
        for (let i = 0; i < 5; i++) {
            const circle = new CircleEnt([50 + i * 20, 50 + (i % 2) * 20], 8);
            circle.setDefaults();
            circle.color = 3;
            entities.push(circle);
        }
        
        // 右区域 - 蓝色
        for (let i = 0; i < 3; i++) {
            const line = new LineEnt([200, i * 30], [250, i * 30 + 20]);
            line.setDefaults();
            line.color = 5;
            entities.push(line);
        }
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        message.info("=== 屏幕范围查询 ===");
        
        // 显示当前屏幕范围
        const showScreenInfo = () => {
            // 获取屏幕边界（世界坐标系）
            const bounds = Engine.getScreenBoundsWcs();
            writeMessage("<br/>=== 当前屏幕范围 (WCS) ===");
            writeMessage(`<br/>最小点: (${bounds.minX.toFixed(2)}, ${bounds.minY.toFixed(2)})`);
            writeMessage(`<br/>最大点: (${bounds.maxX.toFixed(2)}, ${bounds.maxY.toFixed(2)})`);
            writeMessage(`<br/>宽度: ${(bounds.maxX - bounds.minX).toFixed(2)}`);
            writeMessage(`<br/>高度: ${(bounds.maxY - bounds.minY).toFixed(2)}`);
            
            // 获取屏幕内实体
            const screenEntities = Engine.getScreenEntities();
            writeMessage(`<br/><br/>屏幕内实体数量: ${screenEntities.length}`);
            
            // 统计不同颜色的实体
            const colorCounts = {};
            screenEntities.forEach(e => {
                const c = e.color || 7;
                colorCounts[c] = (colorCounts[c] || 0) + 1;
            });
            
            writeMessage("<br/>按颜色统计:");
            Object.entries(colorCounts).forEach(([color, count]) => {
                const colorName = { 1: "红", 3: "绿", 5: "蓝", 7: "白" }[color] || color;
                writeMessage(`<br/>  ${colorName}色: ${count}个`);
            });
        };
        
        // 初始显示
        showScreenInfo();
        
        // 演示：缩放到不同区域并查询
        setTimeout(() => {
            message.info("\n2秒后缩放到左侧区域...");
            Engine.zoomToEntities(entities.slice(0, 3));
            setTimeout(showScreenInfo, 500);
        }, 2000);
        
        setTimeout(() => {
            message.info("\n5秒后缩放到中心区域...");
            Engine.zoomToEntities(entities.slice(3, 8));
            setTimeout(showScreenInfo, 500);
        }, 5000);
        
        setTimeout(() => {
            message.info("\n8秒后恢复全图...");
            Engine.zoomExtents();
            setTimeout(showScreenInfo, 500);
        }, 8000);
        
        // 演示扩展因子
        setTimeout(() => {
            message.info("\n11秒后演示扩展因子...");
            
            // 扩展因子 1.0（默认）
            const ents1 = Engine.getScreenEntities(1.0);
            writeMessage(`<br/><br/>扩展因子 1.0: ${ents1.length} 个实体`);
            
            // 扩展因子 1.5（包含稍微超出屏幕的实体）
            const ents15 = Engine.getScreenEntities(1.5);
            writeMessage(`<br/>扩展因子 1.5: ${ents15.length} 个实体`);
            
            // 扩展因子 2.0
            const ents2 = Engine.getScreenEntities(2.0);
            writeMessage(`<br/>扩展因子 2.0: ${ents2.length} 个实体`);
        }, 11000);
        
        message.info("\n=== API 说明 ===");
        message.info("getScreenBoundsWcs(expandFactor?) - 获取屏幕边界");
        message.info("getScreenEntities(expandFactor?) - 获取屏幕内实体");
        message.info("expandFactor: 扩展因子，默认1.0");
        
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
