window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --移动实体--move方法示例
        const { MainView, initCadContainer, CircleEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建一个圆（支持 [x, y] 数组形式）
        const circle = new CircleEnt([30, 30], 20);
        circle.setDefaults();
        circle.color = 1;  // 红色
        Engine.addEntities(circle);
        
        message.info("移动前圆心:", circle.center.x, circle.center.y);
        
        // 移动实体（支持 [x, y] 数组形式）
        // move(from, to) - 从 from 点移动到 to 点
        // 实际偏移量 = to - from
        circle.move([0, 0], [50, 30]);
        
        // 【重要】move() 只修改数据并标记 isDirty，不会自动重绘
        // 必须调用 Engine.regen() 才能看到变化
        Engine.regen();
        
        message.info("移动后圆心:", circle.center.x, circle.center.y);
        
        // 创建另一个圆演示移动前后对比
        const circle2 = new CircleEnt([30, 30], 20);
        circle2.setDefaults();
        circle2.color = 3;  // 绿色（原位置参考）
        Engine.addEntities(circle2);
        
        Engine.zoomExtents();
        
        message.info("红色圆已移动 (50, 30)");
        message.info("绿色圆为原位置参考");
        
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
