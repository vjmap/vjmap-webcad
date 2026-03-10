window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --线型比例--lineTypeScale参数对线型显示的影响
        const { MainView, initCadContainer, LineEnt, PolylineEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // ============================================================
        // 线型比例 (lineTypeScale) 说明
        // ============================================================
        //
        // lineTypeScale 属性控制线型模式的缩放比例：
        // - 值 < 1.0：线型模式变小，看起来更密集
        // - 值 = 1.0：线型模式为标准大小
        // - 值 > 1.0：线型模式放大，看起来更稀疏
        //
        // 使用场景：
        // - 根据图纸比例调整线型显示
        // - 使线型在不同缩放级别下保持合适的视觉效果
        // - 自定义线型的外观
        //
        // ============================================================
        
        // 1. 同一线型，不同比例
        console.log("=== 同一线型不同比例对比 ===");
        
        const scales = [0.25, 0.5, 1.0, 2.0, 4.0];
        const baseY = 0;
        
        scales.forEach((scale, index) => {
            const y = baseY + index * 20;
            
            const line = new LineEnt([0, y], [200, y]);
            line.setDefaults();
            line.lineType = "HIDDEN";
            line.lineTypeScale = scale;
            Engine.addEntities(line);
            
            console.log(`HIDDEN, lineTypeScale=${scale}`);
        });
        
        // 2. 不同线型，相同比例
        console.log("=== 不同线型相同比例 ===");
        
        const linetypes = ["CONTINUOUS", "HIDDEN", "CENTER", "PHANTOM"];
        const baseY2 = -80;
        
        linetypes.forEach((lt, index) => {
            const y = baseY2 + index * 20;
            
            const line = new LineEnt([0, y], [200, y]);
            line.setDefaults();
            line.lineType = lt;
            line.lineTypeScale = 1.0;
            Engine.addEntities(line);
            
            console.log(`${lt}, lineTypeScale=1.0`);
        });
        
        // 3. 在多段线上应用线型
        console.log("=== 多段线应用线型 ===");
        
        const polyline = new PolylineEnt([
            [0, -150],
            [50, -130],
            [100, -150],
            [150, -130],
            [200, -150]
        ]);
        polyline.setDefaults();
        polyline.lineType = "CENTER";
        polyline.lineTypeScale = 0.5;
        Engine.addEntities(polyline);
        
        console.log("多段线使用CENTER线型, lineTypeScale=0.5");
        
        // 4. 矩形应用线型
        console.log("=== 矩形应用线型 ===");
        
        const rect = new PolylineEnt([
            [0, -200],
            [100, -200],
            [100, -240],
            [0, -240],
            [0, -200] // 闭合
        ]);
        rect.setDefaults();
        rect.lineType = "PHANTOM";
        rect.lineTypeScale = 0.3;
        Engine.addEntities(rect);
        
        console.log("矩形使用PHANTOM线型, lineTypeScale=0.3");
        
        // 5. 线型比例建议
        console.log("=== 线型比例使用建议 ===");
        console.log("图纸比例1:1时，lineTypeScale=1.0");
        console.log("图纸比例1:100时，lineTypeScale=50~100");
        console.log("细节图放大时，lineTypeScale=0.1~0.5");
        console.log("根据实际显示效果调整");
        
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
