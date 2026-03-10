window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --执行脚本--EXECUTESTR执行CAD命令脚本示例
        const { MainView, initCadContainer, Engine, writeMessage , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 执行脚本示例 ===");
        
        // ========== 脚本语法说明 ==========
        message.info("\n脚本语法说明：");
        message.info("- 每行一条命令或参数");
        message.info("- 空行表示回车确认（结束当前命令）");
        message.info("- 注释: ; 或 // 开头的行");
        message.info("- 变量: SET VAR=value");
        message.info("- 引用: $(VAR) 或 %VAR%");
        message.info("- 表达式: $(100+50*2)");
        message.info("- 循环: REPEAT n ... ENDREPEAT");
        
        // ========== 方法1：使用 Engine.editor.automate ==========
        message.info("\n=== 方法1：使用 automate 执行脚本 ===");
        
        // 简单脚本示例：绘制一个矩形
        const rectScript = `LINE
        0,0
        100,0
        
        LINE
        100,0
        100,50
        
        LINE
        100,50
        0,50
        
        LINE
        0,50
        0,0
        
        `;
        
        message.info("执行脚本绘制矩形...");
        await Engine.editor.automate(rectScript);
        message.info("矩形绘制完成");
        
        // ========== 方法2：绘制同心圆 ==========
        message.info("\n=== 绘制同心圆 ===");
        
        const circleScript = `CIRCLE
        150,100
        20
        
        CIRCLE
        150,100
        40
        
        CIRCLE
        150,100
        60
        
        `;
        
        await Engine.editor.automate(circleScript);
        message.info("同心圆绘制完成");
        
        // ========== 方法3：使用变量和循环（需要 ScriptParser）==========
        message.info("\n=== 使用变量脚本 ===");
        
        // 创建带变量的脚本（手动展开循环）
        const gridScript = `CIRCLE
        0,150
        5
        
        CIRCLE
        50,150
        5
        
        CIRCLE
        100,150
        5
        
        CIRCLE
        0,200
        5
        
        CIRCLE
        50,200
        5
        
        CIRCLE
        100,200
        5
        
        `;
        
        await Engine.editor.automate(gridScript);
        message.info("网格点阵绘制完成");
        
        Engine.zoomExtents();
        
        // ========== 命令说明 ==========
        message.info("\n=== 脚本执行命令 ===");
        message.info("EXECUTESTR - 弹出脚本输入对话框执行脚本");
        message.info("使用命令: Engine.editor.executerWithOp('EXECUTESTR')");
        
        message.info("\n=== 常用 API ===");
        message.info("Engine.editor.automate(script) - 直接执行脚本字符串");
        message.info("脚本格式：命令名、参数分行，空行结束当前命令");
        
        // ========== 复杂脚本示例 ==========
        message.info("\n=== 脚本示例模板 ===");
        const exampleTemplate = `
        ; 绘制圆的脚本示例
        CIRCLE
        圆心X,圆心Y
        半径
        
        ; 绘制直线的脚本示例
        LINE
        起点X,起点Y
        终点X,终点Y
        
        ; 支持连续绘制
        LINE
        0,0
        10,10
        20,0
        30,10
        
        `;
        message.info("脚本模板已输出到控制台");
        console.log("脚本示例模板:", exampleTemplate);
        
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
