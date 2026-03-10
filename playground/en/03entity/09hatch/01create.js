window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建填充--HatchEnt基本用法
        const { MainView, initCadContainer, HatchEnt, PolylineEnt, Engine, Edge, Edges, EdgeType , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 首先创建一个闭合边界（矩形）
        // 使用 addVertex 简化写法
        const boundary = new PolylineEnt();
        boundary.addVertex([0, 0]);
        boundary.addVertex([100, 0]);
        boundary.addVertex([100, 60]);
        boundary.addVertex([0, 60]);
        boundary.isClosed = true;
        boundary.setDefaults();
        
        // 创建填充实体
        const hatch = new HatchEnt();
        hatch.patternName = "SOLID";  // 使用实心填充
        // 或者使用图案填充: "ANSI31", "ANSI32", "ANSI33" 等
        
        // 从多段线创建边界
        // 1. 创建 Edge 对象，设置类型为多段线
        const edge = new Edge();
        edge.edgeType = EdgeType.Polyline;
        edge.bulgePoints = boundary.bulgePoints.clone();
        
        // 2. 创建 Edges 集合并添加边界
        const edges = new Edges();
        edges.add(edge);
        
        // 3. 将边界设置到填充实体
        hatch.setLoops(edges);
        
        hatch.setDefaults();
        hatch.color = 3;  // 设置为绿色
        
        Engine.addEntities([boundary, hatch]);
        Engine.zoomExtents();
        
        message.info("填充已创建");
        message.info("图案名:", hatch.patternName);
        
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
