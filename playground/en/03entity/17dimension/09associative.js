window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --相联标注--Associative Dimension关联标注示例
        // 演示标注与源实体的关联关系：当源实体移动时，标注自动更新
        const { 
            MainView, 
            initCadContainer, 
            LinearDimensionEnt, 
            AlignedDimensionEnt,
            LineEnt, 
            PolylineEnt,
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
        
        const entities = [];
        
        // ============================================================
        // 示例1：线性标注关联到线段端点
        // ============================================================
        
        // 创建被标注的线段
        const line1 = new LineEnt([0, 0], [100, 0]);
        line1.setDefaults();
        line1.color = 7;
        entities.push(line1);
        
        // 创建线性标注
        const linearDim1 = new LinearDimensionEnt(
            new Point2D(0, 0),      // startPoint: 标注起点
            new Point2D(100, 0),    // endPoint: 标注终点
            new Point2D(50, 20),    // thirdPoint: 标注线位置点
            0                        // dimAngle: 标注角度（0=水平）
        );
        linearDim1.setDefaults();
        linearDim1.color = 1;
        entities.push(linearDim1);
        
        // 添加实体到引擎
        Engine.addEntities(entities);
        
        // 建立标注与线段的关联关系（需要在添加到引擎后设置）
        // 参数说明：
        // - startLineId: 起点关联的实体ID
        // - startSegIdx: 起点关联的线段索引（-1表示整条线）
        // - endLineId: 终点关联的实体ID
        // - endSegIdx: 终点关联的线段索引
        // - startPointType: 起点在源实体上的点类型
        // - endPointType: 终点在源实体上的点类型
        linearDim1.setSourceEntities(
            line1.id, -1,           // 起点关联到 line1
            line1.id, -1,           // 终点关联到 line1
            'start',                // 起点取 line1 的起点
            'end'                   // 终点取 line1 的终点
        );
        
        // ============================================================
        // 示例2：标注关联到多段线的特定线段
        // ============================================================
        
        // 创建多段线
        const polyline = new PolylineEnt();
        polyline.setPoints([
            [0, -50],
            [60, -50],
            [60, -100],
            [120, -100]
        ]);
        polyline.setDefaults();
        polyline.color = 7;
        entities.push(polyline);
        Engine.addEntities([polyline]);
        
        // 为多段线的第一段创建对齐标注
        const alignedDim1 = new AlignedDimensionEnt(
            new Point2D(0, -50),
            new Point2D(60, -50),
            new Point2D(30, -35)
        );
        alignedDim1.setDefaults();
        alignedDim1.color = 3;
        entities.push(alignedDim1);
        Engine.addEntities([alignedDim1]);
        
        // 关联到多段线的第一段（segmentIndex = 0）
        alignedDim1.setSourceEntities(
            polyline.id, 0,         // 起点关联到 polyline 的第0段
            polyline.id, 0,         // 终点关联到 polyline 的第0段
            'start',                // 起点取线段的起点
            'end'                   // 终点取线段的终点
        );
        
        // 为多段线的第三段创建对齐标注
        const alignedDim2 = new AlignedDimensionEnt(
            new Point2D(60, -100),
            new Point2D(120, -100),
            new Point2D(90, -115)
        );
        alignedDim2.setDefaults();
        alignedDim2.color = 5;
        entities.push(alignedDim2);
        Engine.addEntities([alignedDim2]);
        
        // 关联到多段线的第三段（segmentIndex = 2）
        alignedDim2.setSourceEntities(
            polyline.id, 2,         // 起点关联到 polyline 的第2段
            polyline.id, 2,         // 终点关联到 polyline 的第2段
            'start',                // 起点取线段的起点
            'end'                   // 终点取线段的终点
        );
        
        // ============================================================
        // 示例3：标注关联到两条不同线段的端点
        // ============================================================
        
        // 创建两条线段
        const line2 = new LineEnt([150, 0], [200, 30]);
        line2.setDefaults();
        line2.color = 7;
        Engine.addEntities([line2]);
        
        const line3 = new LineEnt([200, 30], [250, 0]);
        line3.setDefaults();
        line3.color = 7;
        Engine.addEntities([line3]);
        
        // 创建标注，测量两条线的跨度
        const linearDim2 = new LinearDimensionEnt(
            new Point2D(150, 0),
            new Point2D(250, 0),
            new Point2D(200, -20),
            0
        );
        linearDim2.setDefaults();
        linearDim2.color = 4;
        Engine.addEntities([linearDim2]);
        
        // 起点关联到 line2 的起点，终点关联到 line3 的终点
        linearDim2.setSourceEntities(
            line2.id, -1,
            line3.id, -1,
            'start',                // line2 的起点
            'end'                   // line3 的终点
        );
        
        // ============================================================
        // 示例4：使用参数 t 精确定位关联点
        // ============================================================
        
        const line4 = new LineEnt([0, -150], [120, -150]);
        line4.setDefaults();
        line4.color = 7;
        Engine.addEntities([line4]);
        
        // 创建标注，测量线段 1/4 到 3/4 处的距离
        const linearDim3 = new LinearDimensionEnt(
            new Point2D(30, -150),   // 1/4 处
            new Point2D(90, -150),   // 3/4 处
            new Point2D(60, -135),
            0
        );
        linearDim3.setDefaults();
        linearDim3.color = 6;
        Engine.addEntities([linearDim3]);
        
        // 使用 parameterT 精确定位
        // t=0.25 表示从起点算起 25% 的位置
        // t=0.75 表示从起点算起 75% 的位置
        linearDim3.setSourceEntities(
            line4.id, -1,
            line4.id, -1,
            undefined,              // 不使用 pointType
            undefined,
            0.25,                   // startParameterT: 1/4 处
            0.75                    // endParameterT: 3/4 处
        );
        
        Engine.zoomExtents();
        
        // ============================================================
        // 控制台输出
        // ============================================================
        console.log("相联标注示例已创建");
        console.log("示例1: 线性标注关联到线段两端（红色）");
        console.log("示例2: 对齐标注关联到多段线线段（绿色、蓝色）");
        console.log("示例3: 标注跨越两条线段（青色）");
        console.log("示例4: 使用参数t精确定位（紫色）");
        console.log("");
        console.log("💡 提示：选择并移动线段，观察标注自动更新");
        console.log("💡 相联标注属性：linearDim1.isAssociative =", linearDim1.isAssociative);
        
        message.info("相联标注：移动源实体时标注会自动更新");
        
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
