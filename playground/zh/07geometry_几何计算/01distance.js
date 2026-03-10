window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --距离计算--distance函数用法
        const { MainView, initCadContainer, Point2D, LineEnt, Engine, distance , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 定义两个点（distance 函数需要 Point2D 对象）
        const p1 = new Point2D(0, 0);
        const p2 = new Point2D(100, 100);
        
        // 计算两点间距离
        const dist = distance(p1, p2);
        console.log("=== 两点间距离 ===");
        console.log(`点1: (${p1.x}, ${p1.y})`);
        console.log(`点2: (${p2.x}, ${p2.y})`);
        console.log(`距离: ${dist.toFixed(4)}`);
        
        // 绘制两点和连线（使用简化写法）
        const line = new LineEnt([0, 0], [100, 100]);
        line.setDefaults();
        line.color = 1;
        Engine.addEntities(line);
        
        // 也可以手动计算
        function calculateDistance(pt1, pt2) {
            const dx = pt2.x - pt1.x;
            const dy = pt2.y - pt1.y;
            return Math.sqrt(dx * dx + dy * dy);
        }
        
        const manualDist = calculateDistance(p1, p2);
        console.log(`手动计算距离: ${manualDist.toFixed(4)}`);
        
        // 验证直线的 Length 属性
        console.log(`直线 Length 属性: ${line.Length.toFixed(4)}`);
        
        // 多点距离计算示例
        const points = [
            new Point2D(0, 0),
            new Point2D(30, 40),
            new Point2D(80, 60),
            new Point2D(100, 0)
        ];
        
        console.log("\n=== 多点累计距离 ===");
        let totalDist = 0;
        for (let i = 0; i < points.length - 1; i++) {
            const d = distance(points[i], points[i + 1]);
            totalDist += d;
            console.log(`段${i + 1}: ${d.toFixed(2)}`);
            
            // 使用简化写法创建线段
            const seg = new LineEnt([points[i].x, points[i].y], [points[i + 1].x, points[i + 1].y]);
            seg.setDefaults();
            seg.color = 3;
            Engine.addEntities(seg);
        }
        console.log(`总距离: ${totalDist.toFixed(2)}`);
        
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
