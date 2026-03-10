window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --消息输出--writeMessage用法
        const { MainView, initCadContainer, LineEnt, Engine, writeMessage , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 消息输出方法 ===");
        
        // writeMessage - 输出消息到命令行
        // 支持 HTML 格式
        
        // 基本消息
        writeMessage("普通消息");
        
        // 换行
        writeMessage("<br/>这是换行后的消息");
        
        // 多行消息
        writeMessage("<br/>第一行<br/>第二行<br/>第三行");
        
        // 带颜色的消息（使用 HTML）
        writeMessage("<br/><span style='color:red'>红色警告消息</span>");
        writeMessage("<br/><span style='color:green'>绿色成功消息</span>");
        writeMessage("<br/><span style='color:blue'>蓝色信息消息</span>");
        
        // 粗体消息
        writeMessage("<br/><b>粗体消息</b>");
        
        // 创建一些实体并输出信息（使用简化写法）
        const line = new LineEnt([0, 0], [100, 50]);
        line.setDefaults();
        Engine.addEntities(line);
        
        // 输出实体信息
        writeMessage("<br/>=== 实体信息 ===");
        writeMessage(`<br/>类型: ${line.type}`);
        writeMessage(`<br/>起点: (${line.startPoint.x}, ${line.startPoint.y})`);
        writeMessage(`<br/>终点: (${line.endPoint.x}, ${line.endPoint.y})`);
        writeMessage(`<br/>长度: ${line.Length.toFixed(2)}`);
        
        Engine.zoomExtents();
        
        // 模拟进度消息
        writeMessage("<br/><br/>=== 进度演示 ===");
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            writeMessage(`<br/>处理进度: ${progress}%`);
            
            if (progress >= 100) {
                clearInterval(interval);
                writeMessage("<br/><span style='color:green'>处理完成!</span>");
            }
        }, 1000);
        
        message.info("writeMessage(msg) - 输出消息到命令行");
        message.info("支持 HTML 格式，可以设置颜色、样式等");
        message.info("查看命令行窗口（底部）可以看到输出的消息");
        
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
