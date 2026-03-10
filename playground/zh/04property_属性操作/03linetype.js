window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --线型设置--lineType和lineTypeScale用法
        const { MainView, initCadContainer, LineEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 常用线型：
        // CONTINUOUS - 实线
        // HIDDEN - 虚线
        // CENTER - 中心线
        // PHANTOM - 幻影线
        // ByLayer - 随层
        
        const lineTypes = ["CONTINUOUS", "HIDDEN", "CENTER", "PHANTOM"];
        const lineTypeNames = ["实线", "虚线", "中心线", "幻影线"];
        
        // 使用简化写法创建不同线型的图形
        lineTypes.forEach((lt, index) => {
            const line = new LineEnt([0, index * 20], [150, index * 20]);
            line.setDefaults();
            line.lineType = lt;       // 设置线型
            line.lineTypeScale = 1.0; // 线型比例
            Engine.addEntities(line);
            
            message.info(`${lineTypeNames[index]}: lineType="${lt}"`);
        });
        
        // 演示线型比例（使用简化写法）
        const line1 = new LineEnt([0, -20], [150, -20]);
        line1.setDefaults();
        line1.lineType = "HIDDEN";
        line1.lineTypeScale = 0.5;  // 缩小线型比例
        Engine.addEntities(line1);
        
        const line2 = new LineEnt([0, -40], [150, -40]);
        line2.setDefaults();
        line2.lineType = "HIDDEN";
        line2.lineTypeScale = 2.0;  // 放大线型比例
        Engine.addEntities(line2);
        
        Engine.zoomExtents();
        
        message.info("lineTypeScale=0.5: 线型更密");
        message.info("lineTypeScale=2.0: 线型更稀");
        
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
