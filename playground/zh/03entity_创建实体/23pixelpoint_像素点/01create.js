window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建像素点--PixelPointEnt像素点示例
        const { MainView, initCadContainer, PixelPointEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        const entities = [];
        
        // 像素点始终显示为1个屏幕像素大小，不随缩放变化
        // 适用于需要精确标记位置但不希望点占用太大空间的场景
        
        // 创建一系列像素点组成图案
        // 网格点
        for (let x = 0; x <= 100; x += 10) {
            for (let y = 0; y <= 100; y += 10) {
                const pixelPoint = new PixelPointEnt([x, y]);
                pixelPoint.setDefaults();
                pixelPoint.color = 3; // 绿色
                entities.push(pixelPoint);
            }
        }
        
        // 对角线点
        for (let i = 0; i <= 100; i += 5) {
            const pixelPoint1 = new PixelPointEnt([i, i]);
            pixelPoint1.setDefaults();
            pixelPoint1.color = 1; // 红色
            entities.push(pixelPoint1);
            
            const pixelPoint2 = new PixelPointEnt([i, 100 - i]);
            pixelPoint2.setDefaults();
            pixelPoint2.color = 5; // 蓝色
            entities.push(pixelPoint2);
        }
        
        // 圆形分布的点
        const centerX = 150;
        const centerY = 50;
        const radius = 40;
        for (let angle = 0; angle < 360; angle += 15) {
            const rad = angle * Math.PI / 180;
            const x = centerX + radius * Math.cos(rad);
            const y = centerY + radius * Math.sin(rad);
            const pixelPoint = new PixelPointEnt([x, y]);
            pixelPoint.setDefaults();
            pixelPoint.color = 4; // 青色
            entities.push(pixelPoint);
        }
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("像素点已创建");
        console.log("总共创建了", entities.length, "个像素点");
        console.log("像素点特点：始终显示为1个屏幕像素，不随缩放变化");
        
        message.info("像素点：网格(绿) + 对角线(红/蓝) + 圆形(青)");
        
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
