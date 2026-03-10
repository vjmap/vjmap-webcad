window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --线性标注--LinearDimensionEnt基本创建示例
        const { MainView, initCadContainer, LinearDimensionEnt, LineEnt, Point2D, Engine , message } = vjcad;
        
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
        
        // 创建被标注的线段
        const line = new LineEnt([0, 0], [100, 0]);
        line.setDefaults();
        line.color = 7;
        entities.push(line);
        
        // 创建水平线性标注
        // 参数：起点、终点、标注线位置点、标注角度
        const linearDim = new LinearDimensionEnt(
            new Point2D(0, 0),      // startPoint: 标注起点
            new Point2D(100, 0),    // endPoint: 标注终点
            new Point2D(50, 20),    // thirdPoint: 标注线位置点
            0                        // dimAngle: 标注角度（0=水平）
        );
        linearDim.setDefaults();
        linearDim.color = 3;
        entities.push(linearDim);
        
        // 创建倾斜线段和对应标注
        const line2 = new LineEnt([0, -50], [80, -20]);
        line2.setDefaults();
        line2.color = 7;
        entities.push(line2);
        
        // 对齐标注（沿着被标注线的方向）
        const angle = Math.atan2(-20 - (-50), 80 - 0); // 计算线段角度
        const alignedDim = new LinearDimensionEnt(
            new Point2D(0, -50),
            new Point2D(80, -20),
            new Point2D(40, -25),   // 标注线偏移位置
            angle                    // 使用线段角度
        );
        alignedDim.setDefaults();
        alignedDim.color = 5;
        entities.push(alignedDim);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("线性标注已创建");
        console.log("水平标注测量值:", linearDim.getMeasurement());
        console.log("对齐标注测量值:", alignedDim.getMeasurement());
        console.log("标注文本:", linearDim.getFormattedMeasurement());
        
        message.info("线性标注：水平标注(绿)和对齐标注(蓝)");
        
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
