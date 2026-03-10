window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --另存为--SAVEAS命令自定义文件名下载
        const { MainView, initCadContainer, Engine, LineEnt, CircleEnt, writeMessage, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 另存为示例 ===");
        message.info("自定义文件名下载");
        
        // 创建一些图形
        const circle = new CircleEnt([50, 50], 25);
        circle.setDefaults();
        circle.color = 1;
        Engine.addEntities(circle);
        
        const line1 = new LineEnt([0, 0], [100, 0]);
        line1.setDefaults();
        line1.color = 3;
        Engine.addEntities(line1);
        
        const line2 = new LineEnt([0, 0], [0, 100]);
        line2.setDefaults();
        line2.color = 5;
        Engine.addEntities(line2);
        
        Engine.zoomExtents();
        message.info("已创建示例图形");
        
        // 方式1：通过命令行执行（会弹出对话框）
        /*
        await Engine.editor.executerWithOp('SAVEAS');
        */
        
        // 方式2：通过API下载（自定义文件名）
        const customFileName = 'my_custom_drawing';
        
        const currentDoc = Engine.currentDoc;
        const data = currentDoc.toDb();
        const jsonString = JSON.stringify(data, null, 2);
        
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = customFileName + '.webcad';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        message.info(`文件 "${customFileName}.webcad" 已开始下载!`);
        message.info("");
        message.info("SAVEAS vs QSAVE 区别：");
        message.info("  - QSAVE: 直接使用当前文件名下载");
        message.info("  - SAVEAS: 弹出对话框，可自定义文件名");
        message.info("");
        message.info("支持的保存格式：");
        message.info("  - .webcad: WebCAD 原生格式(JSON)");
        
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
