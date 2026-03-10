window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --多段线属性--展示多段线的各种属性和计算值
        const { MainView, initCadContainer, PolylineEnt, DotEnt, TextEnt, Engine , message } = vjcad;
        
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
        
        // 创建闭合多段线（多边形）
        const polygon = new PolylineEnt();
        polygon.setPoints([
            [0, 0],
            [80, 0],
            [[100, 40], 0.3],  // 带圆弧
            [60, 80],
            [[20, 80], -0.3], // 带圆弧（反向）
            [-20, 40]
        ]);
        polygon.isClosed = true;
        polygon.setDefaults();
        polygon.color = 3;
        entities.push(polygon);
        
        // 标记所有顶点
        const points = polygon.getPoints();
        points.forEach((pt, i) => {
            const dot = new DotEnt(pt, 2);
            dot.setDefaults();
            dot.color = 1;
            entities.push(dot);
            
            // 顶点编号
            const label = new TextEnt();
            label.insertionPoint = [pt[0] + 3, pt[1] + 3];
            label.text = String(i);
            label.height = 4;
            label.setDefaults();
            label.color = 7;
            entities.push(label);
        });
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        // 输出多段线属性
        console.log("===== 多段线属性 =====");
        console.log("顶点数量:", polygon.bulgePoints.length);
        console.log("是否闭合:", polygon.isClosed);
        console.log("总长度:", polygon.length.toFixed(4));
        console.log("面积:", polygon.area.toFixed(4));
        console.log("是否逆时针:", polygon.isCCW);
        console.log("边界框:", polygon.boundingBox());
        
        console.log("\n===== 顶点信息 =====");
        const pointsWithBulge = polygon.getPointsWithBulge();
        pointsWithBulge.forEach((pt, i) => {
            if (Array.isArray(pt[0])) {
                console.log(`顶点${i}: [${pt[0][0]}, ${pt[0][1]}], 凸度: ${pt[1]}`);
            } else {
                console.log(`顶点${i}: [${pt[0]}, ${pt[1]}]`);
            }
        });
        
        console.log("\n===== 子实体 =====");
        const subEnts = polygon.getSubEnts();
        subEnts.forEach((ent, i) => {
            const len = ent.length !== undefined ? ent.length.toFixed(2) : "N/A";
            console.log(`段${i}: ${ent.type}, 长度: ${len}`);
        });
        
        message.info(`多段线：${polygon.bulgePoints.length}个顶点, 长度:${polygon.length.toFixed(2)}, 面积:${polygon.area.toFixed(2)}`);
        
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
