window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --注册命令--CommandRegistry用法
        const { MainView, initCadContainer, Engine, CommandRegistry, CommandDefinition, CommandOptions, writeMessage , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",           // 应用名称
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 命令1：显示信息
        class InfoCommand {
            async main() {
                const doc = Engine.currentDoc;
                const entities = Engine.getEntities();
                const layers = Engine.getLayers();
                
                writeMessage("<br/>=== 文档信息 ===");
                writeMessage(`<br/>文档名: ${doc.name || '未命名'}`);
                writeMessage(`<br/>实体数: ${entities.length}`);
                writeMessage(`<br/>图层数: ${layers.length}`);
            }
        }
        
        // 命令2：清空画布
        class ClearAllCommand {
            async main() {
                const entities = Engine.getEntities();
                if (entities.length > 0) {
                    Engine.eraseEntities(entities);
                    writeMessage(`<br/>已删除 ${entities.length} 个实体`);
                } else {
                    writeMessage("<br/>画布已经是空的");
                }
            }
        }
        
        // 命令3：缩放全图
        class ZoomAllCommand {
            async main() {
                Engine.zoomExtents();
                writeMessage("<br/>已缩放到全图");
            }
        }
        
        // 注册多个命令
        const commands = [
            { name: 'MYINFO', desc: '显示文档信息', cls: InfoCommand },
            { name: 'MYCLEAR', desc: '清空画布', cls: ClearAllCommand },
            { name: 'MYZOOM', desc: '缩放全图', cls: ZoomAllCommand },
        ];
        
        commands.forEach(cmd => {
            const options = new CommandOptions();
            options.useAutoComplete = true;
            
            CommandRegistry.regist(new CommandDefinition(
                cmd.name,
                cmd.desc,
                cmd.cls,
                options
            ));
            
            message.info(`命令 ${cmd.name} 已注册 - ${cmd.desc}`);
        });
        
        // 获取已注册的命令
        message.info("\n=== 获取命令 ===");
        const infoCmd = CommandRegistry.item('MYINFO');
        if (infoCmd) {
            message.info("找到命令:", infoCmd.name);
            message.info("描述:", infoCmd.description);
        }
        
        message.info("\n在命令行输入 MYINFO、MYCLEAR 或 MYZOOM 测试");
        
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
