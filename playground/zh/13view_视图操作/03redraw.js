window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --刷新显示--render、redraw和regen用法
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
        
        // 创建实体
        const circle = new CircleEnt([50, 50], 30);
        circle.setDefaults();
        Engine.addEntities(circle);
        
        Engine.zoomExtents();
        
        message.info("=== 刷新显示方法 ===");
        message.info("1. Engine.render() - 最底层渲染，只执行GPU绘制");
        message.info("2. Engine.redraw() - 更新视图变换后渲染（平移/缩放/旋转）");
        message.info("3. Engine.regen() - 局部更新，只重绘已修改的实体");
        message.info("4. Engine.regen(true) - 完全重绘所有图形");
        
        // 演示1：修改颜色后使用 regen() 局部更新
        setTimeout(() => {
            message.info("\n2秒后修改圆的颜色...");
            circle.color = 1;  // setter 自动调用 setModified()
            Engine.regen();    // 局部更新：只重绘已修改的实体
            message.info("使用 regen() 局部更新已修改的实体");
        }, 2000);
        
        // 演示2：修改半径后使用 regen(true) 完全重绘
        setTimeout(() => {
            message.info("\n4秒后修改圆的半径...");
            circle.radius = 45;  // setter 自动调用 setModified()
            Engine.regen(true);  // 完全重绘：清除并重新绘制所有图形
            message.info("使用 regen(true) 完全重绘所有图形");
        }, 4000);
        
        // 演示3：移动圆后使用 regen() 局部更新
        setTimeout(() => {
            message.info("\n6秒后移动圆...");
            circle.move([0, 0], [30, 20]);  // move() 内部自动调用 setModified()
            Engine.regen();  // 局部更新
            message.info("使用 regen() 局部更新");
        }, 6000);
        
        message.info("\n=== 方法区别 ===");
        message.info("- render(): 最底层，只调用GPU渲染当前帧，不更新任何数据");
        message.info("- redraw(): 更新视图变换（位置/缩放/旋转），然后调用render");
        message.info("- regen():  局部更新，只重新渲染已setModified的实体（快）");
        message.info("- regen(true): 完全重绘，清除并重新绘制所有图形（慢）");
        
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
