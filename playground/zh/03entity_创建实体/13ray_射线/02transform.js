window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --射线变换--移动、旋转、缩放、镜像操作
        const { MainView, initCadContainer, RayEnt, CircleEnt, Engine , message } = vjcad;
        
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
        
        // 创建参考圆（标记基点位置）
        function addBasePointMarker(x, y, color) {
            const circle = new CircleEnt([x, y], 2);
            circle.setDefaults();
            circle.color = color;
            entities.push(circle);
        }
        
        // 1. 原始射线
        const original = new RayEnt([0, 50], Math.PI / 6); // 30度
        original.setDefaults();
        original.color = 7; // 白色
        entities.push(original);
        addBasePointMarker(0, 50, 7);
        console.log("原始射线 - 基点:", original.basePoint, "角度:", (original.angle * 180 / Math.PI).toFixed(1) + "度");
        
        // 2. 移动后的射线
        const moved = new RayEnt([0, 50], Math.PI / 6);
        moved.setDefaults();
        moved.move([0, 0], [80, 0]); // 向右移动80
        moved.color = 1; // 红色
        entities.push(moved);
        addBasePointMarker(80, 50, 1);
        console.log("移动后 - 基点:", moved.basePoint);
        
        // 3. 旋转后的射线
        const rotated = new RayEnt([0, 50], Math.PI / 6);
        rotated.setDefaults();
        rotated.move([0, 0], [160, 0]);
        rotated.rotate([160, 50], Math.PI / 3); // 旋转60度
        rotated.color = 3; // 绿色
        entities.push(rotated);
        addBasePointMarker(160, 50, 3);
        console.log("旋转后 - 角度:", (rotated.angle * 180 / Math.PI).toFixed(1) + "度");
        
        // 4. 缩放射线（只影响基点位置，不影响方向）
        const scaled = new RayEnt([0, 50], Math.PI / 6);
        scaled.setDefaults();
        scaled.move([0, 0], [240, 0]);
        scaled.scale([280, 50], 2); // 以(280,50)为中心缩放2倍
        scaled.color = 4; // 青色
        entities.push(scaled);
        addBasePointMarker(scaled.basePoint.x, scaled.basePoint.y, 4);
        console.log("缩放后 - 基点:", scaled.basePoint);
        
        // 5. 镜像后的射线
        const mirrored = new RayEnt([320, 50], Math.PI / 6);
        mirrored.setDefaults();
        mirrored.mirror([320, 0], [320, 100]); // 沿垂直线镜像
        mirrored.color = 5; // 蓝色
        entities.push(mirrored);
        addBasePointMarker(mirrored.basePoint.x, mirrored.basePoint.y, 5);
        console.log("镜像后 - 角度:", (mirrored.angle * 180 / Math.PI).toFixed(1) + "度");
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        message.info("射线变换：白=原始, 红=移动, 绿=旋转, 青=缩放, 蓝=镜像");
        
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
