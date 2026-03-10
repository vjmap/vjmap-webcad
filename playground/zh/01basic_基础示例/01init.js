window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --初始化引擎--MainView初始化与配置选项
        const { MainView, initCadContainer , message } = vjcad;
        
        // 创建 MainView 实例，完整配置选项如下：
        const cadView = new MainView({
            // 基础配置
            appname: "唯杰CAD",           // 应用名称
            version: "v1.0.0",               // 版本号
            
            // 服务配置
            serviceUrl: env.serviceUrl,       // 后端服务地址
            accessToken: env.accessToken,     // 访问令牌
            accessKey: "",                    // 访问密钥（加密图纸用）
            
            // 界面配置
            // sidebarStyle: "both" | "left" | "right" | "none"
            sidebarStyle: "right",            // 侧边栏样式
            
            // 插件配置
            pluginMarketUrl: "",              // 插件市场配置文件地址
            
            // 字体配置
            fonts: [
                // { path: "./fonts/simkai.woff", name: "simkai", kind: "woff" },
                // { path: "./fonts/_default.shx", name: "_default", kind: "shx" }
            ]
        });
        
        // initCadContainer 将 CAD 视图挂载到指定的 DOM 容器
        // 参数1: 容器元素的 ID
        // 参数2: MainView 实例
        initCadContainer("map", cadView);
        
        // 等待初始化完成
        await cadView.onLoad();
        
        message.info("WebCAD 引擎初始化完成");
        
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
