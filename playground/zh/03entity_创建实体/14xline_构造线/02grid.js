window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --构造线网格--使用构造线创建参考网格
        const { MainView, initCadContainer, XLineEnt, TextEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        const entities = [];
        const gridSpacing = 20;
        const gridCount = 5;
        
        // 创建水平构造线网格
        for (let i = -gridCount; i <= gridCount; i++) {
            const xline = new XLineEnt([0, i * gridSpacing], 0);
            xline.setDefaults();
            xline.color = i === 0 ? 1 : 8; // 中心线红色，其他灰色
            entities.push(xline);
            
            // 添加Y坐标标签
            if (i !== 0) {
                const label = new TextEnt();
                label.insertionPoint = [-gridCount * gridSpacing - 15, i * gridSpacing - 2];
                label.text = String(i * gridSpacing);
                label.height = 4;
                label.setDefaults();
                label.color = 7;
                entities.push(label);
            }
        }
        
        // 创建垂直构造线网格
        for (let i = -gridCount; i <= gridCount; i++) {
            const xline = new XLineEnt([i * gridSpacing, 0], Math.PI / 2);
            xline.setDefaults();
            xline.color = i === 0 ? 3 : 8; // 中心线绿色，其他灰色
            entities.push(xline);
            
            // 添加X坐标标签
            if (i !== 0) {
                const label = new TextEnt();
                label.insertionPoint = [i * gridSpacing - 5, -gridCount * gridSpacing - 10];
                label.text = String(i * gridSpacing);
                label.height = 4;
                label.setDefaults();
                label.color = 7;
                entities.push(label);
            }
        }
        
        // 原点标签
        const originLabel = new TextEnt();
        originLabel.insertionPoint = [2, 2];
        originLabel.text = "原点(0,0)";
        originLabel.height = 4;
        originLabel.setDefaults();
        originLabel.color = 2;
        entities.push(originLabel);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("构造线网格已创建");
        console.log("网格间距:", gridSpacing);
        console.log("网格线数量:", (gridCount * 2 + 1) * 2);
        
        message.info("构造线网格：红=X轴, 绿=Y轴, 灰=辅助线");
        
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
