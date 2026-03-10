window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建点实体--DotEnt基本创建示例
        const { MainView, initCadContainer, DotEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建不同大小的点
        const dots = [];
        
        // 小点
        const dot1 = new DotEnt([0, 0], 1);
        dot1.setDefaults();
        dot1.color = 1;
        dots.push(dot1);
        
        // 中等点
        const dot2 = new DotEnt([30, 0], 3);
        dot2.setDefaults();
        dot2.color = 3;
        dots.push(dot2);
        
        // 大点
        const dot3 = new DotEnt([70, 0], 5);
        dot3.setDefaults();
        dot3.color = 5;
        dots.push(dot3);
        
        // 更大的点
        const dot4 = new DotEnt([120, 0], 8);
        dot4.setDefaults();
        dot4.color = 4;
        dots.push(dot4);
        
        Engine.addEntities(dots);
        Engine.zoomExtents();
        
        console.log("点实体已创建");
        dots.forEach((dot, i) => {
            console.log(`点${i + 1} - 位置:`, dot.base, "大小:", dot.size);
        });
        
        message.info("4个不同大小的点实体（size: 1, 3, 5, 8）");
        
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
