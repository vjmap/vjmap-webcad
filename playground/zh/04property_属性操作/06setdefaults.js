window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --应用默认值--setDefaults方法用法
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
        
        // setDefaults() 方法会将系统当前的默认属性应用到实体
        // 包括：图层、颜色、线型、线型比例等
        
        // 先设置系统默认属性
        Engine.CECOLOR = 1;        // 当前颜色为红色
        Engine.CELTYPE = "HIDDEN"; // 当前线型为虚线
        Engine.CELTSCALE = 1.5;    // 当前线型比例
        
        // 创建实体并应用默认值（使用简化写法）
        const line1 = new LineEnt([0, 0], [100, 0]);
        line1.setDefaults();  // 应用系统默认值
        Engine.addEntities(line1);
        
        message.info("line1 应用默认值后:");
        message.info("  颜色:", line1.color);
        message.info("  线型:", line1.lineType);
        message.info("  线型比例:", line1.lineTypeScale);
        
        // 修改系统默认属性
        Engine.CECOLOR = 3;        // 改为绿色
        Engine.CELTYPE = "CENTER"; // 改为中心线
        
        // 创建另一个实体（使用简化写法）
        const line2 = new LineEnt([0, 30], [100, 30]);
        line2.setDefaults();  // 应用新的默认值
        Engine.addEntities(line2);
        
        message.info("line2 应用默认值后:");
        message.info("  颜色:", line2.color);
        message.info("  线型:", line2.lineType);
        
        // 不调用 setDefaults() 的情况（使用简化写法）
        const line3 = new LineEnt([0, 60], [100, 60]);
        // 不调用 setDefaults()，属性为默认值
        Engine.addEntities(line3);
        
        message.info("line3 未调用 setDefaults:");
        message.info("  颜色:", line3.color);
        message.info("  线型:", line3.lineType);
        
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
