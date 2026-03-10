window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --主视图配置--MainViewConfig用法
        const { MainView, initCadContainer, LineEnt, CircleEnt, Engine, writeMessage , message } = vjcad;
        
        message.info("=== MainView 配置选项 ===");
        message.info("MainView 是 WebCAD 的主视图组件");
        message.info("通过配置对象可以自定义各种初始化选项");
        
        // 展示完整的配置选项
        const fullConfig = {
            // 基本信息
            appname: "唯杰CAD",           // 应用名称
            version: "v1.0.0",            // 版本号
            
            // 后端服务配置
            serviceUrl: env.serviceUrl,   // 后端服务地址
            accessToken: env.accessToken, // 访问令牌
            workspace: "",                // 工作区间
            accessKey: "",                // 图纸访问密钥
            
            // WASM 服务配置
            wasmServiceUrl: "",           // WebAssembly 服务地址
            
            // 字体配置
            fonts: [
                { path: "/fonts/simsun.ttf", name: "宋体", kind: "ttf" },
                { path: "/fonts/hztxt.shx", name: "hztxt", kind: "shx" }
            ],
            
            // 文档行为配置
            closeDocOnOpen: true,         // 打开新图时关闭当前文档（单文档模式）
            
            // 插件配置
            plugins: [
                // { url: '/plugins/my-plugin/plugin.js' }
            ],
            pluginMarketUrl: "",          // 插件市场地址
            
            // UI 配置
            sidebarStyle: "none",         // 侧边栏样式: both/left/right/none
            docUrl: "https://www.vjmap.com" // 文档链接
        };
        
        // 使用简单配置创建视图
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建示例实体
        const line = new LineEnt([0, 0], [100, 50]);
        line.setDefaults();
        const circle = new CircleEnt([50, 50], 25);
        circle.setDefaults();
        circle.color = 3;
        
        Engine.addEntities([line, circle]);
        Engine.zoomExtents();
        
        writeMessage("<br/>=== MainViewConfig 配置说明 ===");
        
        writeMessage("<br/><br/><b>基本配置</b>");
        writeMessage("<br/>appname - 应用名称，显示在标题栏");
        writeMessage("<br/>version - 版本号");
        
        writeMessage("<br/><br/><b>服务配置</b>");
        writeMessage("<br/>serviceUrl - 后端服务地址（必需）");
        writeMessage("<br/>accessToken - 访问令牌（身份验证）");
        writeMessage("<br/>workspace - CAD图后端工作区间");
        writeMessage("<br/>accessKey - 加密图纸的访问密钥");
        writeMessage("<br/>wasmServiceUrl - WebAssembly服务地址");
        
        writeMessage("<br/><br/><b>字体配置</b>");
        writeMessage("<br/>fonts - 字体文件列表");
        writeMessage("<br/>  path: 字体文件路径");
        writeMessage("<br/>  name: 字体名称");
        writeMessage("<br/>  kind: 字体类型 (ttf/woff/otf/shx)");
        
        writeMessage("<br/><br/><b>文档配置</b>");
        writeMessage("<br/>closeDocOnOpen - 打开新图时关闭当前文档");
        writeMessage("<br/>  true: 单文档模式，节省内存");
        writeMessage("<br/>  false: 多文档模式");
        
        writeMessage("<br/><br/><b>插件配置</b>");
        writeMessage("<br/>plugins - 启动时自动加载的插件列表");
        writeMessage("<br/>pluginMarketUrl - 插件市场地址");
        
        writeMessage("<br/><br/><b>UI配置</b>");
        writeMessage("<br/>sidebarStyle - 侧边栏样式");
        writeMessage("<br/>  'both': 左右都显示");
        writeMessage("<br/>  'left': 只显示左侧");
        writeMessage("<br/>  'right': 只显示右侧（默认）");
        writeMessage("<br/>  'none': 不显示");
        writeMessage("<br/>docUrl - 文档按钮链接地址");
        
        message.info("\n=== 最小配置 ===");
        message.info("只需要 serviceUrl 和 accessToken 即可启动");
        message.info("其他选项都有默认值");
        
        message.info("\n=== 初始化流程 ===");
        message.info("1. new MainView(config) - 创建视图");
        message.info("2. initCadContainer(id, view) - 挂载到容器");
        message.info("3. await cadView.onLoad() - 等待加载完成");
        
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
