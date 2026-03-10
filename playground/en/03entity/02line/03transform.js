window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --直线变换--移动、旋转、缩放、镜像、拉伸操作
        const { MainView, initCadContainer, LineEnt, DotEnt, Engine , message } = vjcad;
        
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
        
        // 创建原始直线
        function createLine() {
            const l = new LineEnt([0, 0], [50, 30]);
            l.setDefaults();
            return l;
        }
        
        // 添加端点标记
        function markEndpoints(line, color) {
            const d1 = new DotEnt([line.startPoint.x, line.startPoint.y], 2);
            d1.setDefaults();
            d1.color = color;
            entities.push(d1);
            
            const d2 = new DotEnt([line.endPoint.x, line.endPoint.y], 2);
            d2.setDefaults();
            d2.color = color;
            entities.push(d2);
        }
        
        // 1. 原始
        const original = createLine();
        original.color = 7;
        entities.push(original);
        markEndpoints(original, 7);
        console.log("原始直线 - 长度:", original.Length.toFixed(2), "角度:", (original.angle * 180 / Math.PI).toFixed(1) + "度");
        
        // 2. 移动
        const moved = createLine();
        moved.move([0, 0], [70, 0]);
        moved.color = 1;
        entities.push(moved);
        markEndpoints(moved, 1);
        console.log("移动后起点:", moved.startPoint);
        
        // 3. 旋转
        const rotated = createLine();
        rotated.move([0, 0], [140, 0]);
        rotated.rotate([140, 0], Math.PI / 4); // 旋转45度
        rotated.color = 3;
        entities.push(rotated);
        markEndpoints(rotated, 3);
        console.log("旋转后角度:", (rotated.angle * 180 / Math.PI).toFixed(1) + "度");
        
        // 4. 缩放
        const scaled = createLine();
        scaled.move([0, 0], [210, 0]);
        scaled.scale([210, 0], 0.7);
        scaled.color = 4;
        entities.push(scaled);
        markEndpoints(scaled, 4);
        console.log("缩放后长度:", scaled.Length.toFixed(2));
        
        // 5. 镜像
        const mirrored = createLine();
        mirrored.move([0, 0], [280, 0]);
        mirrored.mirror([310, -20], [310, 50]);
        mirrored.color = 5;
        entities.push(mirrored);
        markEndpoints(mirrored, 5);
        
        // 镜像轴
        const mirrorAxis = new LineEnt([310, -30], [310, 60]);
        mirrorAxis.setDefaults();
        mirrorAxis.color = 8;
        entities.push(mirrorAxis);
        console.log("镜像后端点:", mirrored.startPoint, mirrored.endPoint);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        message.info("直线变换：白=原始, 红=移动, 绿=旋转, 青=缩放, 蓝=镜像");
        
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
