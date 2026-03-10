window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --标准插件--PluginManager标准写法（参考 @webcad-plugins/tools-plugin）
        const { MainView, initCadContainer, PluginManager , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        console.log("=== 标准插件结构（参考 tools-plugin）===");
        
        /**
         * 标准插件结构说明：
         * 
         * 插件需要实现 Plugin 接口，包含以下部分：
         * 1. manifest: 插件元信息（id, name, version, author, description, keywords）
         * 2. onLoad: 插件加载时调用
         * 3. onActivate: 插件激活时调用 - 注册命令、图标、菜单、Ribbon
         * 4. onDeactivate: 插件停用时调用 - 清理资源
         * 5. onUnload: 插件卸载时调用
         * 
         * PluginContext 提供的 API：
         * - registerIcon(name, svgContent): 注册图标
         * - registerCommand(name, description, CommandClass): 注册命令
         * - addMenuItem(menuId, { command }): 添加菜单项
         * - addRibbonGroup(tabId, groupConfig): 添加 Ribbon 组
         * 
         * PluginManager 加载方式：
         * - loadFromUrl(jsUrl, cssUrl?): 从 URL 加载
         * - loadFromPath(jsPath, cssPath?): 从本地路径加载
         * - loadFromContent(jsContent, cssContent?): 从代码内容加载
         */
        
        // ========== 插件代码定义 ==========
        // PluginManager 通过 loadFromContent 加载插件代码
        // 插件代码需要 export default 导出插件对象
        const pluginCode = `
        // ========== 1. 定义命令类 ==========
        // 命令类只需实现 main() 方法
        class DrawGridCommand {
            async main() {
                const { CircleEnt, Engine, writeMessage , message } = vjcad;
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
        
        class ClearAllCommand {
            async main() {
                const { Engine, writeMessage , message } = vjcad;
                const entities = Engine.getEntities();
                if (entities.length > 0) {
                    Engine.removeEntities(entities);
                    writeMessage(\`<br/>已清除 \${entities.length} 个图元\`);
                } else {
                    writeMessage("<br/>没有图元需要清除");
                }
            }
        }
        
        // ========== 2. 定义 SVG 图标 ==========
        const ICON_GRID = \`<svg viewBox="0 0 24 24" fill="none" stroke="#73C5FF" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
        </svg>\`;
        
        const ICON_CLEAR = \`<svg viewBox="0 0 24 24" fill="none" stroke="#73C5FF" stroke-width="2">
            <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
        </svg>\`;
        
        // ========== 3. 导出插件对象（实现 Plugin 接口）==========
        export default {
            // 插件元信息（必需）
            manifest: {
                id: 'my-demo-plugin',
                name: '示例插件',
                version: '1.0.0',
                author: 'vjmap.com',
                description: '演示标准插件结构',
                keywords: ['demo', 'grid', 'example']
            },
            
            // 插件加载时调用（可选）
            onLoad(context) {
                console.log(\`[\${context.manifest.name}] 插件已加载\`);
            },
            
            // 插件激活时调用 - 注册功能（可选）
            onActivate(context) {
                console.log(\`[\${context.manifest.name}] 插件已激活\`);
                
                // 注册图标
                context.registerIcon('MYGRID', ICON_GRID);
                context.registerIcon('MYCLEAR', ICON_CLEAR);
                
                // 注册命令
                context.registerCommand('MYGRID', '绘制网格', DrawGridCommand);
                context.registerCommand('MYCLEAR', '清除所有', ClearAllCommand);
                
                // 添加菜单项（添加到 tool 菜单）
                context.addMenuItem('tool', { command: 'MYGRID' });
                context.addMenuItem('tool', { command: 'MYCLEAR' });
                
                // 添加 Ribbon 组
                context.addRibbonGroup('plugins', {
                    id: 'my-demo',
                    label: '示例工具',
                    pinnable: true,
                    primaryButtons: [
                        { icon: 'mygrid', cmd: 'MYGRID', prompt: '绘制 5x5 网格', type: 'large' },
                        { icon: 'myclear', cmd: 'MYCLEAR', prompt: '清除所有图元', type: 'large' }
                    ]
                });
                
                vjcad.writeMessage(\`<br/><span style='color:green'>插件 \${context.manifest.name} 已激活</span>\`);
            },
            
            // 插件停用时调用 - 清理资源（可选）
            onDeactivate(context) {
                console.log(\`[\${context.manifest.name}] 插件已停用\`);
                vjcad.writeMessage(\`<br/><span style='color:orange'>插件 \${context.manifest.name} 已停用</span>\`);
            },
            
            // 插件卸载时调用（可选）
            onUnload(context) {
                console.log(\`[\${context.manifest.name}] 插件已卸载\`);
            }
        };
        `;
        
        // ========== 4. 使用 PluginManager 加载插件 ==========
        const pm = PluginManager.getInstance();
        
        // 从代码内容加载插件（自动激活）
        await pm.loadFromContent(pluginCode);
        
        console.log("\n已加载示例插件，可用命令：");
        console.log("  - MYGRID: 绘制 5x5 网格");
        console.log("  - MYCLEAR: 清除所有图元");
        
        // 查看已加载的插件
        console.log("\n已加载插件列表:", pm.getLoadedPlugins());
        
        // ========== 5. PluginManager 常用 API ==========
        console.log("\n=== PluginManager 常用 API ===");
        console.log("pm.getLoadedPlugins()  - 获取已加载插件列表");
        console.log("pm.getPluginInfo(id)   - 获取指定插件信息");
        console.log("pm.isLoaded(id)        - 检查插件是否已加载");
        console.log("pm.isActive(id)        - 检查插件是否已激活");
        console.log("pm.activate(id)        - 激活插件");
        console.log("pm.deactivate(id)      - 停用插件");
        console.log("pm.unload(id)          - 卸载插件");
        
        // 演示 API 使用
        console.log("\n插件是否已加载:", pm.isLoaded('my-demo-plugin'));
        console.log("插件是否已激活:", pm.isActive('my-demo-plugin'));
        console.log("插件信息:", pm.getPluginInfo('my-demo-plugin'));
        
        // ========== 6. 演示停用/激活/卸载 ==========
        setTimeout(async () => {
            console.log("\n--- 5秒后停用插件 ---");
            await pm.deactivate('my-demo-plugin');
            console.log("插件已停用, isActive:", pm.isActive('my-demo-plugin'));
        }, 5000);
        
        setTimeout(async () => {
            console.log("\n--- 8秒后重新激活插件 ---");
            await pm.activate('my-demo-plugin');
            console.log("插件已激活, isActive:", pm.isActive('my-demo-plugin'));
        }, 8000);
        
        setTimeout(async () => {
            console.log("\n--- 12秒后卸载插件 ---");
            await pm.unload('my-demo-plugin');
            console.log("插件已卸载, isLoaded:", pm.isLoaded('my-demo-plugin'));
        }, 12000);
        
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
