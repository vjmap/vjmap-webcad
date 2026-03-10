window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --圆变换--移动、缩放、镜像操作
        const { MainView, initCadContainer, CircleEnt, LineEnt, Engine , message } = vjcad;
        
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
        
        // 创建原始圆
        function createCircle() {
            const c = new CircleEnt([0, 0], 20);
            c.setDefaults();
            return c;
        }
        
        // 1. 原始
        const original = createCircle();
        original.color = 7;
        entities.push(original);
        console.log("原始圆 - 圆心:", original.center, "半径:", original.radius);
        
        // 2. 移动
        const moved = createCircle();
        moved.move([0, 0], [60, 0]);
        moved.color = 1;
        entities.push(moved);
        console.log("移动后圆心:", moved.center);
        
        // 3. 缩放
        const scaled = createCircle();
        scaled.move([0, 0], [120, 0]);
        scaled.scale([120, 0], 1.5);
        scaled.color = 3;
        entities.push(scaled);
        console.log("缩放后半径:", scaled.radius);
        
        // 4. 缩小
        const scaledDown = createCircle();
        scaledDown.move([0, 0], [180, 0]);
        scaledDown.scale([180, 0], 0.6);
        scaledDown.color = 4;
        entities.push(scaledDown);
        console.log("缩小后半径:", scaledDown.radius);
        
        // 5. 镜像（圆镜像后位置变化）
        const mirrored = createCircle();
        mirrored.move([0, 0], [240, 20]);
        mirrored.mirror([280, -30], [280, 50]);
        mirrored.color = 5;
        entities.push(mirrored);
        
        // 原位置参考
        const mirrorRef = createCircle();
        mirrorRef.move([0, 0], [240, 20]);
        mirrorRef.color = 8;
        entities.push(mirrorRef);
        
        // 镜像轴
        const mirrorAxis = new LineEnt([280, -40], [280, 60]);
        mirrorAxis.setDefaults();
        mirrorAxis.color = 8;
        entities.push(mirrorAxis);
        console.log("镜像后圆心:", mirrored.center);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        message.info("圆变换：白=原始, 红=移动, 绿=放大, 青=缩小, 蓝=镜像");
        
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
