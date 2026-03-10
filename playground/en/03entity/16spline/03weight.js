window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --带权重样条曲线--控制点权重影响曲线形状
        const { MainView, initCadContainer, SplineEnt, Engine, TextEnt , message } = vjcad;
        
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
        
        // 创建三条样条曲线对比权重效果
        
        // 1. 普通样条（权重都为1）
        const spline1 = new SplineEnt();
        spline1.setControlPoints([
            [0, 0],
            [40, 60],
            [80, 60],
            [120, 0]
        ]);
        spline1.setDefaults();
        spline1.color = 1; // 红色
        entities.push(spline1);
        
        // 标签
        const label1 = new TextEnt();
        label1.insertionPoint = [0, -10];
        label1.text = "权重=1（默认）";
        label1.height = 5;
        label1.setDefaults();
        entities.push(label1);
        
        // 2. 中间点高权重样条（曲线更靠近高权重点）
        const spline2 = new SplineEnt();
        spline2.setControlPoints([
            [0, 100],
            [[40, 160], 3],  // 权重3，曲线会更靠近这个点
            [[80, 160], 3],
            [120, 100]
        ]);
        spline2.setDefaults();
        spline2.color = 3; // 绿色
        entities.push(spline2);
        
        const label2 = new TextEnt();
        label2.insertionPoint = [0, 90];
        label2.text = "中间点权重=3";
        label2.height = 5;
        label2.setDefaults();
        entities.push(label2);
        
        // 3. 低权重样条（曲线远离低权重点）
        const spline3 = new SplineEnt();
        spline3.setControlPoints([
            [0, 200],
            [[40, 260], 0.3],  // 低权重
            [[80, 260], 0.3],
            [120, 200]
        ]);
        spline3.setDefaults();
        spline3.color = 5; // 蓝色
        entities.push(spline3);
        
        const label3 = new TextEnt();
        label3.insertionPoint = [0, 190];
        label3.text = "中间点权重=0.3";
        label3.height = 5;
        label3.setDefaults();
        entities.push(label3);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("带权重样条曲线对比已创建");
        console.log("样条1控制点（含权重）:", spline1.getControlPointsWithWeight());
        console.log("样条2控制点（含权重）:", spline2.getControlPointsWithWeight());
        console.log("样条3控制点（含权重）:", spline3.getControlPointsWithWeight());
        
        message.info("权重越大，曲线越靠近该控制点");
        
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
