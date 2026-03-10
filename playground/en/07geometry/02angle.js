window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --角度计算--getAngleBetweenPoints用法
        const { MainView, initCadContainer, Point2D, LineEnt, Engine, getAngleBetweenPoints , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 计算两点之间的角度（getAngleBetweenPoints 需要 Point2D 对象）
        const origin = new Point2D(50, 50);
        
        // 不同方向的点
        const directions = [
            { point: new Point2D(100, 50), coords: [100, 50], name: "0°（右）" },
            { point: new Point2D(100, 100), coords: [100, 100], name: "45°（右上）" },
            { point: new Point2D(50, 100), coords: [50, 100], name: "90°（上）" },
            { point: new Point2D(0, 100), coords: [0, 100], name: "135°（左上）" },
            { point: new Point2D(0, 50), coords: [0, 50], name: "180°（左）" },
            { point: new Point2D(0, 0), coords: [0, 0], name: "225°（左下）" },
            { point: new Point2D(50, 0), coords: [50, 0], name: "270°（下）" },
            { point: new Point2D(100, 0), coords: [100, 0], name: "315°（右下）" },
        ];
        
        console.log("=== 角度计算 ===");
        console.log(`原点: (${origin.x}, ${origin.y})`);
        
        directions.forEach((dir, index) => {
            // 计算角度（返回弧度）
            const angleRad = getAngleBetweenPoints(origin, dir.point);
            // 转换为角度
            const angleDeg = angleRad * 180 / Math.PI;
            
            console.log(`${dir.name}: ${angleDeg.toFixed(1)}°`);
            
            // 绘制方向线（使用简化写法）
            const line = new LineEnt([50, 50], dir.coords);
            line.setDefaults();
            line.color = (index % 7) + 1;
            Engine.addEntities(line);
        });
        
        // 弧度与角度转换函数
        function radToDeg(rad) {
            return rad * 180 / Math.PI;
        }
        
        function degToRad(deg) {
            return deg * Math.PI / 180;
        }
        
        console.log("\n=== 弧度角度转换 ===");
        console.log(`90° = ${degToRad(90).toFixed(4)} 弧度`);
        console.log(`π/2 弧度 = ${radToDeg(Math.PI / 2).toFixed(1)}°`);
        
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
