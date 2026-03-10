window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --基本插件--插件结构示例
        const { MainView, initCadContainer, CircleEnt, Engine, CommandRegistry, CommandDefinition, CommandOptions, CadEvents, writeMessage, IconRegistry, IconCategory, MenuRegistry , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        console.log("=== 基本插件结构 ===");
        
        // 插件基本结构
        // 插件是一组功能的集合，通常包含：命令、事件监听、UI扩展
        class MyPlugin {
            constructor() {
                this.name = "MyPlugin";
                this.version = "1.0.0";
                this.description = "示例插件";
                this.commands = [];
                this.eventHandlers = [];
            }
            
            // 安装插件
            install() {
                console.log(`安装插件: ${this.name} v${this.version}`);
                
                // 1. 注册命令
                this.registerCommands();
                
                // 2. 添加事件监听
                this.addEventListeners();
                
                // 3. 初始化UI（如果需要）
                this.initUI();
                
                writeMessage(`<br/><span style='color:green'>插件 ${this.name} 已安装</span>`);
            }
            
            // 卸载插件
            uninstall() {
                console.log(`卸载插件: ${this.name}`);
                
                // 1. 移除事件监听
                this.eventHandlers.forEach(handler => {
                    Engine.eventManager.off(handler.event, handler.callback);
                });
                this.eventHandlers = [];
                
                // 2. 注销命令
                this.commands.forEach(cmdName => {
                    CommandRegistry.unregist(cmdName);
                    console.log(`已注销命令: ${cmdName}`);
                });
                this.commands = [];
                
                // 3. 移除菜单项
                const menuRegistry = MenuRegistry.getInstance();
                menuRegistry.removeMenuItem('tool', 'MYGRID');
                console.log("已移除菜单项");
                
                // 4. 移除 Ribbon 组
                const ribbonBar = Engine.view.ribbonBar;
                if (ribbonBar) {
                    ribbonBar.removeGroup('plugins', 'my-plugin-group');
                    console.log("已移除 Ribbon 组");
                }
                
                // 5. 移除图标
                IconRegistry.removeIcon('mygrid', IconCategory.Commands);
                console.log("已移除图标");
                
                writeMessage(`<br/><span style='color:orange'>插件 ${this.name} 已卸载</span>`);
            }
            
            registerCommands() {
                // 插件命令1（使用简化写法）
                class DrawGridCommand {
                    async main() {
                        for (let i = 0; i < 5; i++) {
                            for (let j = 0; j < 5; j++) {
                                const circle = new CircleEnt([i * 30, j * 30], 10);
                                circle.setDefaults();
                                circle.color = (i + j) % 7 + 1;
                                Engine.addEntities(circle);
                            }
                        }
                        Engine.zoomExtents();
                        writeMessage("<br/>已绘制 5x5 网格");
                    }
                }
                
                const opt = new CommandOptions();
                CommandRegistry.regist(new CommandDefinition('MYGRID', '绘制网格', DrawGridCommand, opt));
                this.commands.push('MYGRID');
                
                message.info("已注册命令: MYGRID");
            }
            
            addEventListeners() {
                // 监听实体添加事件
                const onEntityAdded = (args) => {
                    console.log(`[${this.name}] 实体已添加:`, args.entity.type);
                };
                
                Engine.eventManager.on(CadEvents.EntityAdded, onEntityAdded);
                this.eventHandlers.push({ event: CadEvents.EntityAdded, callback: onEntityAdded });
                
                console.log("已添加事件监听器");
            }
            
            initUI() {
                // ========== 1. 注册命令 SVG 图标 ==========
                const ICON_GRID = `<svg viewBox="0 0 24 24" fill="none" stroke="#73C5FF" stroke-width="1.5">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                </svg>`;
                
                // 使用 IconRegistry 注册命令图标
                IconRegistry.registerCommandIcon('MYGRID', ICON_GRID);
                console.log("已注册命令图标: MYGRID");
                
                // ========== 2. 添加菜单项 ==========
                // 使用 MenuRegistry 添加菜单项到 "工具" 菜单
                const menuRegistry = MenuRegistry.getInstance();
                menuRegistry.addMenuItem('tool', { command: 'MYGRID' });
                console.log("已添加菜单项到工具菜单");
                
                // ========== 3. 添加 Ribbon 组 ==========
                // 获取 RibbonBar 并添加按钮组
                const ribbonBar = Engine.view.ribbonBar;
                if (ribbonBar) {
                    ribbonBar.addGroup('plugins', {
                        id: 'my-plugin-group',
                        label: '我的插件',
                        pinnable: true,
                        primaryButtons: [
                            { 
                                icon: 'mygrid',  // 图标名称（小写）
                                cmd: 'MYGRID',   // 命令名称
                                prompt: '绘制 5x5 网格', 
                                type: 'large'    // large | small
                            }
                        ]
                    });
                    console.log("已添加 Ribbon 组");
                }
                
                console.log("UI已初始化");
            }
        }
        
        // 创建并安装插件
        const myPlugin = new MyPlugin();
        myPlugin.install();
        
        console.log("\n输入 MYGRID 测试插件命令");
        
        // 5秒后卸载插件演示
        setTimeout(() => {
            console.log("\n10秒后将卸载插件...");
        }, 9000);
        
        setTimeout(() => {
            myPlugin.uninstall();
        }, 10000);
        
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
