window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --椭圆变换--移动、旋转、缩放、镜像操作
        const { MainView, initCadContainer, EllipseEnt, LineEnt, Engine , message } = vjcad;
        
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
        
        // 创建原始椭圆
        function createEllipse() {
            const e = new EllipseEnt([0, 0], 30, 15, Math.PI / 6);
            e.setDefaults();
            return e;
        }
        
        // 1. 原始椭圆
        const original = createEllipse();
        original.color = 7;
        entities.push(original);
        console.log("原始椭圆 - 中心:", original.center, "角度:", (original.rotation * 180 / Math.PI).toFixed(1) + "度");
        
        // 2. 移动后
        const moved = createEllipse();
        moved.move([0, 0], [80, 0]);
        moved.color = 1;
        entities.push(moved);
        console.log("移动到:", moved.center);
        
        // 3. 旋转后
        const rotated = createEllipse();
        rotated.move([0, 0], [160, 0]);
        rotated.rotate([160, 0], Math.PI / 4); // 再旋转45度
        rotated.color = 3;
        entities.push(rotated);
        console.log("旋转后角度:", (rotated.rotation * 180 / Math.PI).toFixed(1) + "度");
        
        // 4. 缩放后
        const scaled = createEllipse();
        scaled.move([0, 0], [240, 0]);
        scaled.scale([240, 0], 0.6);
        scaled.color = 4;
        entities.push(scaled);
        console.log("缩放后 - 长半径:", scaled.majorRadius, "短半径:", scaled.minorRadius);
        
        // 5. 镜像后
        const mirrored = createEllipse();
        mirrored.move([0, 0], [320, 0]);
        mirrored.mirror([360, -30], [360, 30]);
        mirrored.color = 5;
        entities.push(mirrored);
        
        // 镜像轴
        const mirrorAxis = new LineEnt([360, -40], [360, 50]);
        mirrorAxis.setDefaults();
        mirrorAxis.color = 8;
        entities.push(mirrorAxis);
        console.log("镜像后角度:", (mirrored.rotation * 180 / Math.PI).toFixed(1) + "度");
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        message.info("椭圆变换：白=原始, 红=移动, 绿=旋转, 青=缩放, 蓝=镜像");
        
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
