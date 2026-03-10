window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --样条曲线变换--移动、旋转、缩放、镜像操作
        const { MainView, initCadContainer, SplineEnt, LineEnt, Engine , message } = vjcad;
        
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
        
        // 创建原始样条曲线
        function createSpline() {
            const spline = new SplineEnt();
            spline.setControlPoints([
                [0, 0],
                [20, 30],
                [40, 10],
                [60, 40],
                [80, 20]
            ]);
            spline.setDefaults();
            return spline;
        }
        
        // 1. 原始样条
        const original = createSpline();
        original.color = 7; // 白色
        entities.push(original);
        console.log("原始样条边界框:", original.boundingBox());
        
        // 2. 移动后的样条
        const moved = createSpline();
        moved.move([0, 0], [100, 0]);
        moved.color = 1; // 红色
        entities.push(moved);
        console.log("移动后位置:", moved.startPoint);
        
        // 3. 旋转后的样条
        const rotated = createSpline();
        rotated.move([0, 0], [0, -80]);
        rotated.rotate([40, -60], Math.PI / 4); // 旋转45度
        rotated.color = 3; // 绿色
        entities.push(rotated);
        console.log("旋转角度: 45度");
        
        // 4. 缩放后的样条
        const scaled = createSpline();
        scaled.move([0, 0], [100, -80]);
        scaled.scale([140, -60], 0.5); // 缩小一半
        scaled.color = 4; // 青色
        entities.push(scaled);
        console.log("缩放比例: 0.5");
        
        // 5. 镜像后的样条
        const mirrored = createSpline();
        mirrored.move([0, 0], [200, 0]);
        mirrored.mirror([240, -20], [240, 60]); // 沿垂直线镜像
        mirrored.color = 5; // 蓝色
        entities.push(mirrored);
        
        // 添加镜像轴参考线
        const mirrorAxis = new LineEnt([240, -40], [240, 80]);
        mirrorAxis.color = 8; // 灰色
        mirrorAxis.setDefaults();
        entities.push(mirrorAxis);
        console.log("镜像轴: x=240");
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        message.info("样条曲线变换示例：白=原始,红=移动,绿=旋转,青=缩放,蓝=镜像");
        
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
