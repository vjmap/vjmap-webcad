window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --快速保存下载--QSAVE命令下载webcad文件
        const { MainView, initCadContainer, Engine, LineEnt, CircleEnt, PolylineEnt, writeMessage, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 快速保存(下载)示例 ===");
        message.info("将图纸下载为 .webcad 文件");
        
        // 创建一些图形
        const circle = new CircleEnt([50, 50], 30);
        circle.setDefaults();
        circle.color = 1;
        Engine.addEntities(circle);
        
        // 创建矩形
        const rect = new PolylineEnt();
        rect.addVertex([0, 0]);
        rect.addVertex([100, 0]);
        rect.addVertex([100, 100]);
        rect.addVertex([0, 100]);
        rect.closed = true;
        rect.setDefaults();
        rect.color = 3;
        Engine.addEntities(rect);
        
        const line = new LineEnt([0, 0], [100, 100]);
        line.setDefaults();
        line.color = 5;
        Engine.addEntities(line);
        
        Engine.zoomExtents();
        message.info("已创建示例图形");
        
        // 方式1：通过命令行执行
        /*
        await Engine.editor.executerWithOp('QSAVE');
        */
        
        // 方式2：通过API下载
        const currentDoc = Engine.currentDoc;
        const data = currentDoc.toDb();
        const jsonString = JSON.stringify(data, null, 2);
        
        // 创建下载链接
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // 触发下载
        const a = document.createElement('a');
        a.href = url;
        a.download = (currentDoc.name || 'untitled') + '.webcad';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        message.info("文件已开始下载!");
        message.info("");
        message.info(".webcad 文件格式：");
        message.info("  - JSON 格式，易于解析");
        message.info("  - 包含完整的图纸数据");
        message.info("  - 可以通过 OPEN 命令打开");
        message.info("  - 可以拖拽到编辑器打开");
        
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
