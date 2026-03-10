window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --圆弧变换--移动、旋转、缩放、镜像操作
        const { MainView, initCadContainer, ArcEnt, LineEnt, Engine , message } = vjcad;
        
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
        
        // 创建原始圆弧
        function createArc() {
            const a = new ArcEnt([0, 0], 25, Math.PI / 6, Math.PI * 2 / 3);
            a.setDefaults();
            return a;
        }
        
        // 1. 原始
        const original = createArc();
        original.color = 7;
        entities.push(original);
        console.log("原始圆弧 - 圆心:", original.center, "弧长:", original.length.toFixed(2));
        
        // 2. 移动
        const moved = createArc();
        moved.move([0, 0], [70, 0]);
        moved.color = 1;
        entities.push(moved);
        console.log("移动后圆心:", moved.center);
        
        // 3. 旋转
        const rotated = createArc();
        rotated.move([0, 0], [140, 0]);
        rotated.rotate([140, 0], Math.PI / 3); // 旋转60度
        rotated.color = 3;
        entities.push(rotated);
        console.log("旋转后起始角:", (rotated.startAngle * 180 / Math.PI).toFixed(1) + "度");
        
        // 4. 缩放
        const scaled = createArc();
        scaled.move([0, 0], [210, 0]);
        scaled.scale([210, 0], 1.5);
        scaled.color = 4;
        entities.push(scaled);
        console.log("缩放后半径:", scaled.radius);
        
        // 5. 镜像
        const mirrored = createArc();
        mirrored.move([0, 0], [280, 0]);
        mirrored.mirror([320, -30], [320, 30]);
        mirrored.color = 5;
        entities.push(mirrored);
        
        // 镜像轴
        const mirrorAxis = new LineEnt([320, -40], [320, 50]);
        mirrorAxis.setDefaults();
        mirrorAxis.color = 8;
        entities.push(mirrorAxis);
        console.log("镜像后圆心:", mirrored.center);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        message.info("圆弧变换：白=原始, 红=移动, 绿=旋转, 青=缩放, 蓝=镜像");
        
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
