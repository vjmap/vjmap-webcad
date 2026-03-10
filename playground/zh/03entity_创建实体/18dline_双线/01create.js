window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建双线--DLine双线绘制示例
        const { 
            MainView, initCadContainer, LineEnt, Engine, Point2D,
            createDoubleLineSegment, createDoubleButtCap, createDoubleRoundCap
        , message } = vjcad;
        
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
        const width = 10; // 双线宽度
        
        // 定义多段双线的点序列
        const points = [
            new Point2D(0, 0),
            new Point2D(100, 0),
            new Point2D(150, 50),
            new Point2D(150, 100),
        ];
        
        // 存储各段偏移线，用于连接处理
        const segments = [];
        
        // 创建第一段双线
        const seg1 = createDoubleLineSegment(points[0], points[1], width);
        seg1.line1.setDefaults();
        seg1.line2.setDefaults();
        seg1.line1.color = 3;
        seg1.line2.color = 3;
        segments.push(seg1);
        entities.push(seg1.line1, seg1.line2);
        
        // 创建后续段，并与前一段连接
        for (let i = 1; i < points.length - 1; i++) {
            const prevSeg = segments[segments.length - 1];
            const seg = createDoubleLineSegment(
                points[i], points[i + 1], width,
                prevSeg.line1, prevSeg.line2
            );
            seg.line1.setDefaults();
            seg.line2.setDefaults();
            seg.line1.color = 5;
            seg.line2.color = 5;
            segments.push(seg);
            entities.push(seg.line1, seg.line2);
            
            // 如果有斜接线（bevel）则添加
            if (seg.bevelLine) {
                seg.bevelLine.setDefaults();
                seg.bevelLine.color = 4;
                entities.push(seg.bevelLine);
            }
        }
        
        // 创建端头封口（Butt Cap）
        const firstSeg = segments[0];
        const lastSeg = segments[segments.length - 1];
        const [startCap, endCap] = createDoubleButtCap(
            firstSeg.line1, firstSeg.line2,
            lastSeg.line1, lastSeg.line2
        );
        startCap.setDefaults();
        endCap.setDefaults();
        startCap.color = 1;
        endCap.color = 1;
        entities.push(startCap, endCap);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("双线已创建");
        console.log("双线宽度:", width);
        console.log("使用 createDoubleLineSegment 函数自动处理拐角连接");
        
        message.info("双线示例：使用GeometryUtils函数绘制多段双线");
        
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
