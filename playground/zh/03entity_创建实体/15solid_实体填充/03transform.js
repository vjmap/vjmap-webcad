window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --实体填充变换--移动、旋转、缩放、镜像操作
        const { MainView, initCadContainer, SolidEnt, LineEnt, Engine , message } = vjcad;
        
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
        
        // 创建原始三角形
        function createTriangle() {
            const solid = new SolidEnt(
                [0, 0],
                [40, 0],
                [20, 35]
            );
            solid.setDefaults();
            return solid;
        }
        
        // 1. 原始
        const original = createTriangle();
        original.color = 7;
        entities.push(original);
        console.log("原始三角形顶点:", original.getPoints());
        
        // 2. 移动
        const moved = createTriangle();
        moved.move([0, 0], [60, 0]);
        moved.color = 1;
        entities.push(moved);
        console.log("移动后顶点:", moved.getPoints());
        
        // 3. 旋转
        const rotated = createTriangle();
        rotated.move([0, 0], [120, 0]);
        rotated.rotate([140, 17], Math.PI / 4); // 绕中心旋转45度
        rotated.color = 3;
        entities.push(rotated);
        console.log("旋转角度: 45度");
        
        // 4. 缩放
        const scaled = createTriangle();
        scaled.move([0, 0], [180, 0]);
        scaled.scale([200, 17], 0.6); // 缩小到0.6倍
        scaled.color = 4;
        entities.push(scaled);
        console.log("缩放比例: 0.6");
        
        // 5. 镜像
        const mirrored = createTriangle();
        mirrored.move([0, 0], [240, 0]);
        mirrored.mirror([280, 0], [280, 50]); // 沿垂直线镜像
        mirrored.color = 5;
        entities.push(mirrored);
        
        // 镜像轴参考线
        const mirrorAxis = new LineEnt([280, -10], [280, 60]);
        mirrorAxis.setDefaults();
        mirrorAxis.color = 8;
        entities.push(mirrorAxis);
        console.log("镜像后顶点:", mirrored.getPoints());
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        message.info("实体填充变换：白=原始, 红=移动, 绿=旋转, 青=缩放, 蓝=镜像");
        
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
