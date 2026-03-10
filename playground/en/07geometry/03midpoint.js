window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --中点计算--getMidPoint用法
        const { MainView, initCadContainer, Point2D, LineEnt, CircleEnt, Engine, getMidPoint , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 定义两个端点（getMidPoint 需要 Point2D 对象）
        const p1 = new Point2D(20, 20);
        const p2 = new Point2D(120, 80);
        
        // 计算中点
        const mid = getMidPoint(p1, p2);
        
        console.log("=== 中点计算 ===");
        console.log(`点1: (${p1.x}, ${p1.y})`);
        console.log(`点2: (${p2.x}, ${p2.y})`);
        console.log(`中点: (${mid.x}, ${mid.y})`);
        
        // 绘制线段（使用简化写法）
        const line = new LineEnt([20, 20], [120, 80]);
        line.setDefaults();
        line.color = 1;
        Engine.addEntities(line);
        
        // 在中点处绘制小圆标记（使用简化写法）
        const marker = new CircleEnt([mid.x, mid.y], 3);
        marker.setDefaults();
        marker.color = 3;
        Engine.addEntities(marker);
        
        // 手动计算中点的方法
        function calculateMidPoint(pt1, pt2) {
            return new Point2D(
                (pt1.x + pt2.x) / 2,
                (pt1.y + pt2.y) / 2
            );
        }
        
        // 验证
        const manualMid = calculateMidPoint(p1, p2);
        console.log(`手动计算中点: (${manualMid.x}, ${manualMid.y})`);
        
        // 多点中点示例
        console.log("\n=== 多段线中点 ===");
        const points = [
            new Point2D(0, 0),
            new Point2D(40, 60),
            new Point2D(80, 40),
            new Point2D(120, 80)
        ];
        
        for (let i = 0; i < points.length - 1; i++) {
            const segMid = getMidPoint(points[i], points[i + 1]);
            console.log(`段${i + 1}中点: (${segMid.x}, ${segMid.y})`);
            
            // 绘制线段（使用简化写法）
            const seg = new LineEnt([points[i].x, points[i].y], [points[i + 1].x, points[i + 1].y]);
            seg.setDefaults();
            seg.color = 5;
            seg.move([0, 0], [0, -50]);
            Engine.addEntities(seg);
            
            // 中点标记（使用简化写法）
            const midMarker = new CircleEnt([segMid.x, segMid.y - 50], 2);
            midMarker.setDefaults();
            midMarker.color = 2;
            Engine.addEntities(midMarker);
        }
        
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
