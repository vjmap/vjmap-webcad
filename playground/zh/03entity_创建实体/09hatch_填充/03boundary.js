window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --填充边界--不同类型的填充边界创建方法
        const { MainView, initCadContainer, HatchEnt, PolylineEnt, CircleEnt, Edge, Edges, EdgeType, Engine , message } = vjcad;
        
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
        
        // 1. 多段线边界填充
        const polyline1 = new PolylineEnt();
        polyline1.setPoints([
            [0, 0],
            [60, 0],
            [60, 50],
            [30, 70],
            [0, 50]
        ]);
        polyline1.isClosed = true;
        polyline1.setDefaults();
        polyline1.color = 7;
        entities.push(polyline1);
        
        const hatch1 = new HatchEnt();
        hatch1.patternName = "ANSI31";
        hatch1.patternScale = 2;
        // 从多段线创建边界
        const edges1 = new Edges();
        const edge1 = new Edge();
        edge1.edgeType = EdgeType.Polyline;
        edge1.bulgePoints = polyline1.bulgePoints.clone();
        edges1.add(edge1);
        hatch1.setLoops(edges1);
        hatch1.setDefaults();
        hatch1.color = 1;
        entities.push(hatch1);
        
        console.log("多段线边界填充已创建");
        
        // 2. 圆形边界填充
        const circle = new CircleEnt([120, 35], 30);
        circle.setDefaults();
        circle.color = 7;
        entities.push(circle);
        
        const hatch2 = new HatchEnt();
        hatch2.patternName = "SOLID";
        // 从圆创建边界（setLoops 自动处理 regenBulgePoints 和 isClosed）
        const edges2 = new Edges();
        const edge2 = new Edge();
        edge2.edgeType = EdgeType.Circle;
        edge2.center = circle.center.clone();
        edge2.radius = circle.radius;
        edges2.add(edge2);
        hatch2.setLoops(edges2);
        hatch2.setDefaults();
        hatch2.color = 3;
        entities.push(hatch2);
        
        console.log("圆形边界填充已创建");
        
        // 3. 带孔填充（外边界 + 内边界）
        const outerRect = new PolylineEnt();
        outerRect.setPoints([
            [180, 0],
            [260, 0],
            [260, 70],
            [180, 70]
        ]);
        outerRect.isClosed = true;
        outerRect.setDefaults();
        outerRect.color = 7;
        entities.push(outerRect);
        
        const innerCircle = new CircleEnt([220, 35], 15);
        innerCircle.setDefaults();
        innerCircle.color = 7;
        entities.push(innerCircle);
        
        const hatch3 = new HatchEnt();
        hatch3.patternName = "ANSI32";
        hatch3.patternScale = 2;
        
        // 所有边界放入同一个 Edges 对象（setLoops 只接受一个参数）
        const allEdges = new Edges();
        
        // 外边界
        const outerEdge = new Edge();
        outerEdge.edgeType = EdgeType.Polyline;
        outerEdge.bulgePoints = outerRect.bulgePoints.clone();
        allEdges.add(outerEdge);
        
        // 内边界（孔）
        const innerEdge = new Edge();
        innerEdge.edgeType = EdgeType.Circle;
        innerEdge.center = innerCircle.center.clone();
        innerEdge.radius = innerCircle.radius;
        allEdges.add(innerEdge);
        
        hatch3.setLoops(allEdges);
        hatch3.setDefaults();
        hatch3.color = 5;
        entities.push(hatch3);
        
        console.log("带孔填充已创建");
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        message.info("填充边界类型：多段线边界、圆形边界、带孔填充");
        
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
