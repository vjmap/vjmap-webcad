window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --设置视图中心--setCenter用法
        const { MainView, initCadContainer, Point2D, LineEnt, CircleEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建参考实体（使用简化写法）
        const line1 = new LineEnt([0, 0], [200, 0]);
        line1.setDefaults();
        line1.color = 7;
        
        const circle1 = new CircleEnt([50, 50], 20);
        circle1.setDefaults();
        circle1.color = 1;
        
        const circle2 = new CircleEnt([150, 50], 20);
        circle2.setDefaults();
        circle2.color = 3;
        
        const circle3 = new CircleEnt([100, 100], 20);
        circle3.setDefaults();
        circle3.color = 5;
        
        Engine.addEntities([line1, circle1, circle2, circle3]);
        Engine.zoomExtents();
        
        message.info("=== 设置视图中心 ===");
        message.info("Engine.setCenter(point, redraw?, padding?)");
        
        // 演示：依次将视图中心移动到不同实体位置
        setTimeout(() => {
            message.info("\n2秒后将视图中心移到红色圆...");
            Engine.setCenter(new Point2D(50, 50));
        }, 2000);
        
        setTimeout(() => {
            message.info("\n4秒后将视图中心移到绿色圆...");
            Engine.setCenter(new Point2D(150, 50));
        }, 4000);
        
        setTimeout(() => {
            message.info("\n6秒后将视图中心移到蓝色圆...");
            Engine.setCenter(new Point2D(100, 100));
        }, 6000);
        
        setTimeout(() => {
            message.info("\n8秒后带边距设置中心...");
            // 带边距的设置（在屏幕边缘留出空间）
            Engine.setCenter(new Point2D(50, 50), true, {
                top: 100,
                bottom: 100,
                left: 100,
                right: 100
            });
        }, 8000);
        
        setTimeout(() => {
            message.info("\n10秒后恢复全图...");
            Engine.zoomExtents();
        }, 10000);
        
        message.info("\nsetCenter 参数:");
        message.info("- wcsCenter: Point2D 世界坐标系中心点");
        message.info("- shouldRedraw: boolean 是否重绘，默认 true");
        message.info("- padding: object 可选边距 {top,bottom,left,right}");
        
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
