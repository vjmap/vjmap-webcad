window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --输入对话框--showInputDialog、showSelectDialog、showPrompt用法
        const { MainView, initCadContainer, LineEnt, CircleEnt, TextEnt, Engine, showInputDialog, showSelectDialog, showPrompt, writeMessage , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        Engine.zoomExtents();
        
        message.info("=== 输入对话框 ===");
        
        // 示例1：简单输入框
        const demo1 = async () => {
            message.info("\n--- 示例1: 简单输入 ---");
            
            const name = await showPrompt("请输入图层名称:", "图层0", "新建图层");
            
            if (name) {
                writeMessage(`<br/>输入的图层名称: ${name}`);
                
                // 创建一个文本显示输入内容
                const text = new TextEnt();
                text.position = [50, 50];
                text.text = `图层: ${name}`;
                text.height = 10;
                text.setDefaults();
                Engine.addEntities(text);
                Engine.zoomExtents();
            } else {
                writeMessage("<br/>用户取消了输入");
            }
        };
        
        // 示例2：带验证的输入框
        const demo2 = async () => {
            message.info("\n--- 示例2: 带验证输入 ---");
            
            const result = await showInputDialog({
                title: "设置圆半径",
                label: "请输入半径值 (1-100):",
                placeholder: "输入数字...",
                defaultValue: "25",
                required: true,
                validator: (value) => {
                    const num = parseFloat(value);
                    if (isNaN(num)) return "请输入有效数字";
                    if (num < 1 || num > 100) return "半径必须在 1-100 之间";
                    return null;
                },
                description: "输入的半径将用于创建新圆形"
            });
            
            if (result.confirmed) {
                const radius = parseFloat(result.value);
                writeMessage(`<br/>输入的半径: ${radius}`);
                
                // 创建圆形
                const circle = new CircleEnt([50, 80], radius);
                circle.setDefaults();
                circle.color = 3;
                Engine.addEntities(circle);
                Engine.zoomExtents();
            } else {
                writeMessage("<br/>用户取消了输入");
            }
        };
        
        // 示例3：下拉选择对话框
        const demo3 = async () => {
            message.info("\n--- 示例3: 下拉选择 ---");
            
            const result = await showSelectDialog({
                title: "选择线型",
                label: "请选择线型:",
                options: [
                    { value: "Continuous", label: "Continuous (实线)" },
                    { value: "DASHED", label: "DASHED (虚线)" },
                    { value: "DASHDOT", label: "DASHDOT (点划线)" },
                    { value: "CENTER", label: "CENTER (中心线)" },
                    { value: "HIDDEN", label: "HIDDEN (隐藏线)" }
                ],
                defaultValue: "Continuous",
                description: "选择的线型将应用于新创建的直线"
            });
            
            if (result.confirmed) {
                writeMessage(`<br/>选择的线型: ${result.value}`);
                
                // 创建直线
                const line = new LineEnt([0, 30], [100, 30]);
                line.setDefaults();
                line.lineType = result.value;
                line.lineTypeScale = 5;
                line.color = 1;
                Engine.addEntities(line);
                Engine.zoomExtents();
            } else {
                writeMessage("<br/>用户取消了选择");
            }
        };
        
        // 示例4：密码输入
        const demo4 = async () => {
            message.info("\n--- 示例4: 密码输入 ---");
            
            const result = await showInputDialog({
                title: "设置密码",
                label: "请输入文件密码:",
                placeholder: "至少6个字符",
                type: "password",
                required: true,
                validator: (value) => {
                    if (value.length < 6) return "密码至少需要6个字符";
                    return null;
                }
            });
            
            if (result.confirmed) {
                writeMessage(`<br/>已设置密码 (长度: ${result.value.length})`);
            } else {
                writeMessage("<br/>用户取消了设置");
            }
        };
        
        // 依次执行演示
        setTimeout(demo1, 500);
        setTimeout(demo2, 4000);
        setTimeout(demo3, 8000);
        setTimeout(demo4, 12000);
        
        message.info("\n=== 便捷函数 ===");
        message.info("showPrompt(message, defaultValue?, title?)");
        message.info("showInputDialog(config) - 高级输入框");
        message.info("showSelectDialog(config) - 下拉选择框");
        
        message.info("\n=== InputDialogConfig ===");
        message.info("title, label, placeholder, defaultValue");
        message.info("type - 输入类型: text/password");
        message.info("required - 是否必填");
        message.info("validator - 验证函数");
        message.info("description - 描述文本");
        
        message.info("\n=== SelectDialogConfig ===");
        message.info("options - 选项数组 [{value, label, disabled?}]");
        
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
