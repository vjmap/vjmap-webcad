window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --修改后插入符号--解析符号文档后修改实体属性，设置固定缩放和旋转再插入
        const { 
            MainView, initCadContainer, Engine, message, 
            getLocalStorageService, parseSymbolVcadData, SymbolInteractiveInserter,
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
        
        // 修改符号颜色并固定缩放旋转后插入命令
        class InsertModifiedSymbolCommand {
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
        
                // 2. 解析符号文档
                const symbolDoc = await parseSymbolVcadData(symbolData);
                
                // 3. 修改符号中所有实体的颜色为红色
                const modelBlock = symbolDoc.blocks.itemByName("*Model");
                if (modelBlock) {
                    let modifiedCount = 0;
                    for (const entity of modelBlock.items) {
                        entity.color = 1; // 1 = 红色
                        modifiedCount++;
                    }
                    message.info(`已将 ${modifiedCount} 个实体颜色修改为红色`);
                }
        
                // 4. 使用 SymbolInteractiveInserter 交互式插入
                // 设置固定缩放2倍、旋转30度，不允许用户修改
                const inserter = new SymbolInteractiveInserter(
                    symbolDoc,
                    symbolMeta.basePoint,
                    false,  // allowScale: 不允许用户修改缩放
                    false,  // allowRotation: 不允许用户修改旋转
                    false,  // clearSourceInfo: 保留来源图信息
                    2,      // initialScale: 固定缩放2倍
                    30      // initialRotation: 固定旋转30度
                );
        
                message.info("符号将以 2倍缩放、30度旋转 插入（不可修改）");
                message.info("请指定插入点...");
        
                const entities = await inserter.execute();
        
                if (entities) {
                    message.info("符号插入成功，实体数量:", entities.length);
                    // 验证颜色是否为红色
                    const redCount = entities.filter(e => e.color === 1).length;
                    message.info(`其中红色实体数量: ${redCount}`);
                    Engine.zoomExtents();
                } else {
                    message.info("符号插入已取消");
                }
            }
        }
        
        // 注册命令
        const options = new CommandOptions();
        const cmdDef = new CommandDefinition('INSERTMODIFIED', '修改后固定参数插入符号', InsertModifiedSymbolCommand, options);
        CommandRegistry.regist(cmdDef);
        
        message.info("命令 INSERTMODIFIED 已注册");
        message.info("在命令行输入 INSERTMODIFIED 并回车执行");
        message.info("该示例会将符号颜色改为红色，并以2倍缩放、30度旋转插入");
        
        // 自动执行命令
        await Engine.editor.executerWithOp('INSERTMODIFIED');
        
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
