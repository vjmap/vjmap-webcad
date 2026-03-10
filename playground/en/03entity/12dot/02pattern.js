window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --点阵图案--使用点实体创建图案
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
        
        const entities = [];
        
        // 1. 网格点阵
        const gridSize = 5;
        const gridSpacing = 10;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const dot = new DotEnt([i * gridSpacing, j * gridSpacing], 2);
                dot.setDefaults();
                dot.color = 7;
                entities.push(dot);
            }
        }
        console.log("网格点阵:", gridSize, "x", gridSize);
        
        // 2. 圆形点阵
        const centerX = 80, centerY = 20;
        const radius = 20;
        const pointCount = 12;
        for (let i = 0; i < pointCount; i++) {
            const angle = (i / pointCount) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const dot = new DotEnt([x, y], 2);
            dot.setDefaults();
            dot.color = 3;
            entities.push(dot);
        }
        // 中心点
        const centerDot = new DotEnt([centerX, centerY], 3);
        centerDot.setDefaults();
        centerDot.color = 1;
        entities.push(centerDot);
        console.log("圆形点阵: 半径", radius, "点数", pointCount);
        
        // 3. 螺旋点阵
        const spiralCenterX = 150, spiralCenterY = 20;
        const spiralPoints = 30;
        const spiralTurns = 2;
        for (let i = 0; i < spiralPoints; i++) {
            const t = i / spiralPoints;
            const angle = t * spiralTurns * Math.PI * 2;
            const r = t * 25;
            const x = spiralCenterX + Math.cos(angle) * r;
            const y = spiralCenterY + Math.sin(angle) * r;
            const dotSize = 1 + t * 2; // 大小渐变
            const dot = new DotEnt([x, y], dotSize);
            dot.setDefaults();
            dot.color = 5;
            entities.push(dot);
        }
        console.log("螺旋点阵: 圈数", spiralTurns, "点数", spiralPoints);
        
        // 4. 渐变大小点阵
        const gradientY = -30;
        for (let i = 0; i < 15; i++) {
            const dot = new DotEnt([i * 12, gradientY], 1 + i * 0.4);
            dot.setDefaults();
            dot.color = 4;
            entities.push(dot);
        }
        console.log("渐变点阵: 15个点，大小从1到7");
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        message.info("点阵图案：网格、圆形、螺旋、渐变");
        
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
