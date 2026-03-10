window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --圆弧属性--展示圆弧的各种属性和计算值
        const { MainView, initCadContainer, ArcEnt, DotEnt, TextEnt, Engine , message } = vjcad;
        
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
        
        // 创建圆弧
        const arc = new ArcEnt([100, 100], 50, Math.PI / 6, Math.PI * 5 / 6);
        arc.setDefaults();
        arc.color = 3;
        entities.push(arc);
        
        // 标记圆心
        const centerDot = new DotEnt([arc.center.x, arc.center.y], 3);
        centerDot.setDefaults();
        centerDot.color = 1;
        entities.push(centerDot);
        
        // 标记起点
        const startDot = new DotEnt([arc.startPoint.x, arc.startPoint.y], 3);
        startDot.setDefaults();
        startDot.color = 5;
        entities.push(startDot);
        
        // 标记终点
        const endDot = new DotEnt([arc.endPoint.x, arc.endPoint.y], 3);
        endDot.setDefaults();
        endDot.color = 4;
        entities.push(endDot);
        
        // 标记中点
        const midPt = arc.midPoint;
        const midDot = new DotEnt([midPt.x, midPt.y], 3);
        midDot.setDefaults();
        midDot.color = 6;
        entities.push(midDot);
        
        // 添加标签
        function addLabel(x, y, text, color) {
            const label = new TextEnt();
            label.insertionPoint = [x, y];
            label.text = text;
            label.height = 5;
            label.setDefaults();
            label.color = color;
            entities.push(label);
        }
        
        addLabel(arc.center.x + 5, arc.center.y - 10, "圆心", 1);
        addLabel(arc.startPoint.x + 5, arc.startPoint.y, "起点", 5);
        addLabel(arc.endPoint.x - 20, arc.endPoint.y, "终点", 4);
        addLabel(midPt.x - 5, midPt.y + 8, "中点", 6);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        // 输出圆弧属性
        console.log("===== 圆弧属性 =====");
        console.log("圆心:", arc.center);
        console.log("半径:", arc.radius);
        console.log("起始角度:", (arc.startAngle * 180 / Math.PI).toFixed(2) + "度");
        console.log("终止角度:", (arc.endAngle * 180 / Math.PI).toFixed(2) + "度");
        console.log("弧长:", arc.length.toFixed(4));
        console.log("起点:", arc.startPoint);
        console.log("终点:", arc.endPoint);
        console.log("中点:", arc.midPoint);
        console.log("是否顺时针:", arc.isClockwise);
        console.log("圆心角:", (arc.totalAngle * 180 / Math.PI).toFixed(2) + "度");
        
        message.info("圆弧属性展示：红=圆心, 蓝=起点, 青=终点, 紫=中点");
        
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
