window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --点实体变换--移动、旋转、缩放操作
        const { MainView, initCadContainer, DotEnt, CircleEnt, Engine , message } = vjcad;
        
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
        
        // 创建参考圆（标记旋转中心）
        function addCenterMarker(x, y) {
            const circle = new CircleEnt([x, y], 1);
            circle.setDefaults();
            circle.color = 8;
            entities.push(circle);
        }
        
        // 创建一组点
        function createDotGroup() {
            const dots = [];
            for (let i = 0; i < 5; i++) {
                const dot = new DotEnt([i * 10, 0], 2);
                dot.setDefaults();
                dots.push(dot);
            }
            return dots;
        }
        
        // 1. 原始点组
        const original = createDotGroup();
        original.forEach(d => d.color = 7);
        entities.push(...original);
        console.log("原始点组位置:", original.map(d => [d.base.x, d.base.y]));
        
        // 2. 移动后的点组
        const moved = createDotGroup();
        moved.forEach(d => {
            d.move([0, 0], [0, -30]);
            d.color = 1;
        });
        entities.push(...moved);
        console.log("移动距离: (0, -30)");
        
        // 3. 旋转后的点组
        const rotated = createDotGroup();
        const rotateCenter = [20, -60];
        rotated.forEach(d => {
            d.move([0, 0], [0, -60]);
            d.rotate(rotateCenter, Math.PI / 6); // 旋转30度
            d.color = 3;
        });
        entities.push(...rotated);
        addCenterMarker(rotateCenter[0], rotateCenter[1]);
        console.log("旋转中心:", rotateCenter, "角度: 30度");
        
        // 4. 缩放后的点组（位置和大小都会缩放）
        const scaled = createDotGroup();
        const scaleCenter = [20, -100];
        scaled.forEach(d => {
            d.move([0, 0], [0, -90]);
            d.scale(scaleCenter, 1.5); // 放大1.5倍
            d.color = 5;
        });
        entities.push(...scaled);
        addCenterMarker(scaleCenter[0], scaleCenter[1]);
        console.log("缩放中心:", scaleCenter, "比例: 1.5");
        console.log("缩放后点大小:", scaled[0].size);
        
        // 5. 镜像后的点组
        const mirrored = createDotGroup();
        mirrored.forEach(d => {
            d.move([0, 0], [80, 0]);
            d.mirror([100, -20], [100, 20]); // 沿垂直线镜像
            d.color = 4;
        });
        entities.push(...mirrored);
        console.log("镜像后位置:", mirrored.map(d => [d.base.x.toFixed(1), d.base.y.toFixed(1)]));
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        message.info("点实体变换：白=原始, 红=移动, 绿=旋转, 蓝=缩放, 青=镜像");
        
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
