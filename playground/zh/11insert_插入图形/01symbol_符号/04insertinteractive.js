window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --交互式插入符号--通过getPoint交互式指定插入点、缩放、旋转
        const { 
            MainView, initCadContainer, Engine, message, 
            getLocalStorageService, insertSymbolInteractive,
            CommandRegistry, CommandDefinition, CommandOptions
        } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 交互式插入符号命令
        class InsertSymbolCommand {
            async main() {
                // 1. 获取本地符号
                const localService = getLocalStorageService();
                const categories = await localService.getLocalSymbolCategories();
        
                if (categories.length === 0) {
                    message.error("没有本地符号，请先运行 01createlocal.js 创建符号");
                    return;
                }
        
                // 获取第一个符号
                let symbolData = null;
                let symbolMeta = null;
        
                for (const cat of categories) {
                    const symbols = await localService.getLocalSymbolList(cat.id);
                    if (symbols.length > 0) {
                        symbolMeta = symbols[0];
                        const data = await localService.getLocalSymbol(symbolMeta.id);
                        if (data) {
                            symbolData = data.vcadData;
                            break;
                        }
                    }
                }
        
                if (!symbolData) {
                    message.error("无法获取符号数据");
                    return;
                }
        
                message.info("已加载符号:", symbolMeta.name);
                message.info("符号基点:", symbolMeta.basePoint);
        
                // 2. 交互式插入符号
                // insertSymbolInteractive 会依次提示用户指定：插入点、缩放比例、旋转角度
                const entities = await insertSymbolInteractive(symbolData, symbolMeta.basePoint, {
                    allowScale: true,      // 允许指定缩放
                    allowRotation: true,   // 允许指定旋转
                    clearSourceInfo: false // 保留来源图信息
                });
        
                if (entities) {
                    message.info("符号插入成功，实体数量:", entities.length);
                    Engine.zoomExtents();
                } else {
                    message.info("符号插入已取消");
                }
            }
        }
        
        // 注册命令
        const options = new CommandOptions();
        const cmdDef = new CommandDefinition('MYINSERTSYMBOL', '交互式插入符号', InsertSymbolCommand, options);
        CommandRegistry.regist(cmdDef);
        
        message.info("命令 MYINSERTSYMBOL 已注册");
        message.info("在命令行输入 MYINSERTSYMBOL 并回车执行");
        
        // 自动执行命令
        await Engine.editor.executerWithOp('MYINSERTSYMBOL');
        
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
