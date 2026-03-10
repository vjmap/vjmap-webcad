window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --点与直线位置关系--GeometryCalculator.witchSidePointToLine用法
        const { MainView, initCadContainer, Point2D, LineEnt, CircleEnt, Engine, GeometryCalculator , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        console.log("=== 点与直线位置关系 ===");
        console.log("使用叉积判断点在直线的哪一侧");
        
        // 创建一条基准直线
        const lineStart = new Point2D(20, 50);
        const lineEnd = new Point2D(180, 50);
        const baseLine = new LineEnt(lineStart, lineEnd);
        baseLine.setDefaults();
        baseLine.color = 7; // 白色
        Engine.addEntities(baseLine);
        
        // 测试点数组
        const testPoints = [
            { pt: new Point2D(50, 80), name: "点A" },
            { pt: new Point2D(100, 50), name: "点B" },
            { pt: new Point2D(150, 20), name: "点C" },
            { pt: new Point2D(80, 90), name: "点D" },
            { pt: new Point2D(120, 10), name: "点E" },
        ];
        
        console.log(`\n基准直线: (${lineStart.x}, ${lineStart.y}) → (${lineEnd.x}, ${lineEnd.y})`);
        console.log("叉积判断: -1=左侧, 0=线上, 1=右侧\n");
        
        testPoints.forEach((item, index) => {
            const { pt, name } = item;
            
            // 使用 GeometryCalculator 判断位置
            const side = GeometryCalculator.witchSidePointToLine(lineStart, lineEnd, pt);
            
            let sideText = "";
            let markerColor = 0;
            
            if (side === -1) {
                sideText = "左侧（上方）";
                markerColor = 1; // 红色
            } else if (side === 0) {
                sideText = "在直线上";
                markerColor = 2; // 黄色
            } else {
                sideText = "右侧（下方）";
                markerColor = 3; // 绿色
            }
            
            console.log(`${name} (${pt.x}, ${pt.y}): ${sideText} [返回值: ${side}]`);
            
            // 绘制测试点
            const marker = new CircleEnt([pt.x, pt.y], 3);
            marker.setDefaults();
            marker.color = markerColor;
            Engine.addEntities(marker);
            
            // 绘制点到直线的垂线（辅助理解）
            const perpLine = new LineEnt([pt.x, pt.y], [pt.x, 50]);
            perpLine.setDefaults();
            perpLine.color = 8; // 灰色
            perpLine.lineType = "HIDDEN";
            Engine.addEntities(perpLine);
        });
        
        // 说明叉积原理
        console.log("\n=== 叉积原理 ===");
        console.log("向量AB = (Bx-Ax, By-Ay)");
        console.log("向量AP = (Px-Ax, Py-Ay)");
        console.log("叉积 = ABx*(Py-Ay) - ABy*(Px-Ax)");
        console.log("叉积>0: P在AB左侧");
        console.log("叉积<0: P在AB右侧");
        console.log("叉积=0: P在AB上");
        
        // 动态演示：绕直线旋转的点
        console.log("\n=== 绕直线中点的圆形点阵 ===");
        const center = new Point2D(100, 50);
        const radius = 30;
        const numPoints = 12;
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const x = center.x + radius * Math.cos(angle);
            const y = center.y + radius * Math.sin(angle);
            const circlePoint = new Point2D(x, y);
            
            const side = GeometryCalculator.witchSidePointToLine(lineStart, lineEnd, circlePoint);
            
            const smallMarker = new CircleEnt([x, y], 2);
            smallMarker.setDefaults();
            smallMarker.color = side === -1 ? 1 : (side === 1 ? 3 : 2);
            Engine.addEntities(smallMarker);
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
