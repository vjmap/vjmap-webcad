window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --关联标注反应器--标注自动跟随源实体更新
        const { 
            MainView, 
            initCadContainer, 
            LinearDimensionEnt, 
            AlignedDimensionEnt,
            LineEnt, 
            Point2D, 
            Engine 
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
        
        message.info("=== 关联标注反应器示例 ===");
        message.info("标注实体内置了反应器机制，可自动响应源实体变化");
        
        // ============================================================
        // 示例1：线性标注关联到线段
        // ============================================================
        
        // 创建被标注的线段
        const line1 = new LineEnt([0, 0], [100, 0]);
        line1.setDefaults();
        line1.color = 7;
        Engine.addEntities(line1);
        
        // 创建线性标注
        const linearDim = new LinearDimensionEnt(
            new Point2D(0, 0),      // startPoint: 标注起点
            new Point2D(100, 0),    // endPoint: 标注终点
            new Point2D(50, 25),    // thirdPoint: 标注线位置点
            0                       // dimAngle: 标注角度（0=水平）
        );
        linearDim.setDefaults();
        linearDim.color = 1;
        Engine.addEntities(linearDim);
        
        // 建立关联关系（添加到引擎后设置）
        // setSourceEntities 参数：
        //   startLineId, startSegIdx - 起点关联实体和线段索引
        //   endLineId, endSegIdx - 终点关联实体和线段索引
        //   startPointType, endPointType - 端点类型 ('start'/'end'/'center'/'midpoint')
        linearDim.setSourceEntities(
            line1.id, -1,           // 起点关联到 line1（-1表示整条线）
            line1.id, -1,           // 终点关联到 line1
            'start',                // 起点取 line1 的起点
            'end'                   // 终点取 line1 的终点
        );
        
        // ============================================================
        // 示例2：对齐标注关联到斜线
        // ============================================================
        
        const line2 = new LineEnt([0, -60], [80, -100]);
        line2.setDefaults();
        line2.color = 7;
        Engine.addEntities(line2);
        
        const alignedDim = new AlignedDimensionEnt(
            new Point2D(0, -60),
            new Point2D(80, -100),
            new Point2D(50, -65)
        );
        alignedDim.setDefaults();
        alignedDim.color = 3;
        Engine.addEntities(alignedDim);
        
        // 建立关联
        alignedDim.setSourceEntities(
            line2.id, -1,
            line2.id, -1,
            'start',
            'end'
        );
        
        // ============================================================
        // 示例3：标注跨越两条线段
        // ============================================================
        
        const line3 = new LineEnt([150, 0], [200, 40]);
        line3.setDefaults();
        line3.color = 7;
        Engine.addEntities(line3);
        
        const line4 = new LineEnt([200, 40], [260, 0]);
        line4.setDefaults();
        line4.color = 7;
        Engine.addEntities(line4);
        
        // 标注测量两条线的跨度
        const spanDim = new LinearDimensionEnt(
            new Point2D(150, 0),
            new Point2D(260, 0),
            new Point2D(205, -25),
            0
        );
        spanDim.setDefaults();
        spanDim.color = 5;
        Engine.addEntities(spanDim);
        
        // 起点关联到 line3 起点，终点关联到 line4 终点
        spanDim.setSourceEntities(
            line3.id, -1,
            line4.id, -1,
            'start',
            'end'
        );
        
        // ============================================================
        // 示例4：使用参数 t 精确定位
        // ============================================================
        
        const line5 = new LineEnt([0, -150], [120, -150]);
        line5.setDefaults();
        line5.color = 7;
        Engine.addEntities(line5);
        
        // 标注线段 1/4 到 3/4 处的距离
        const partialDim = new LinearDimensionEnt(
            new Point2D(30, -150),   // 1/4 处
            new Point2D(90, -150),   // 3/4 处
            new Point2D(60, -130),
            0
        );
        partialDim.setDefaults();
        partialDim.color = 6;
        Engine.addEntities(partialDim);
        
        // 使用 parameterT 精确定位（0~1 表示在线段上的比例位置）
        partialDim.setSourceEntities(
            line5.id, -1,
            line5.id, -1,
            undefined,              // 不使用 pointType
            undefined,
            0.25,                   // startParameterT: 1/4 处
            0.75                    // endParameterT: 3/4 处
        );
        
        Engine.zoomExtents();
        
        // 输出关联状态
        console.log("关联标注状态：");
        console.log("  linearDim.isAssociative =", linearDim.isAssociative);
        console.log("  alignedDim.isAssociative =", alignedDim.isAssociative);
        console.log("  spanDim.isAssociative =", spanDim.isAssociative);
        console.log("  partialDim.isAssociative =", partialDim.isAssociative);
        
        message.info("提示：选择并移动线段，观察标注自动更新");
        message.info("红色=普通标注，绿色=斜线标注，蓝色=跨线标注，紫色=比例标注");
        
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
