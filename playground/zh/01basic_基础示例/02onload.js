window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --等待加载完成--onLoad异步等待示例
        const { MainView, initCadContainer, Engine, LineEnt , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
        });
        
        initCadContainer("map", cadView);
        
        // onLoad() 返回一个 Promise，在以下初始化完成后 resolve：
        // - PixiJS 画布创建
        // - WASM 模块加载
        // - 字体加载
        // - 插件系统初始化
        // - URL 参数处理（自动打开图纸等）
        await cadView.onLoad();
        
        // 此时可以安全地使用 Engine API
        message.info("初始化完成，开始绑定事件和创建实体...");
        
        // 示例：创建一条直线（使用简化写法）
        const line = new LineEnt([0, 0], [100, 100]);
        line.setDefaults();
        Engine.addEntities(line);
        
        // 缩放到全图
        Engine.zoomExtents();
        
        message.info("示例直线已创建");
        
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
