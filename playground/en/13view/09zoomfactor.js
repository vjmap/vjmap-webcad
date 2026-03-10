window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --缩放因子--ZOOMFACTOR和currentSpace.zoom用法
        const { MainView, initCadContainer, LineEnt, CircleEnt, Engine, writeMessage , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建参考实体
        const entities = [];
        
        // 创建网格参考
        for (let i = 0; i <= 10; i++) {
            // 水平线
            const hLine = new LineEnt([0, i * 10], [100, i * 10]);
            hLine.setDefaults();
            hLine.color = 8;
            entities.push(hLine);
            
            // 垂直线
            const vLine = new LineEnt([i * 10, 0], [i * 10, 100]);
            vLine.setDefaults();
            vLine.color = 8;
            entities.push(vLine);
        }
        
        // 中心圆
        const circle = new CircleEnt([50, 50], 20);
        circle.setDefaults();
        circle.color = 1;
        entities.push(circle);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        message.info("=== 缩放因子设置 ===");
        
        // 显示当前缩放信息
        const showZoomInfo = () => {
            const currentSpace = Engine.currentSpace;
            const zoomFactor = Engine.ZOOMFACTOR;
            
            writeMessage("<br/>=== 当前缩放信息 ===");
            writeMessage(`<br/>currentSpace.zoom: ${currentSpace.zoom.toFixed(4)}`);
            writeMessage(`<br/>Engine.ZOOMFACTOR: ${zoomFactor}`);
            writeMessage(`<br/>缩放比例: 1 像素 = ${(1 / currentSpace.zoom).toFixed(4)} 图形单位`);
        };
        
        showZoomInfo();
        
        message.info("\ncurrentSpace.zoom - 当前缩放比例");
        message.info("值越大显示越大，值越小显示越小");
        
        message.info("\nEngine.ZOOMFACTOR - 滚轮缩放因子");
        message.info("控制滚轮缩放的灵敏度（默认75）");
        
        // 演示：修改缩放因子
        setTimeout(() => {
            message.info("\n3秒后设置 ZOOMFACTOR = 50（缩放更慢）...");
            Engine.ZOOMFACTOR = 50;
            writeMessage("<br/><span style='color:green'>已设置 ZOOMFACTOR = 50</span>");
            writeMessage("<br/>现在滚轮缩放会更慢");
        }, 3000);
        
        setTimeout(() => {
            message.info("\n6秒后设置 ZOOMFACTOR = 100（缩放更快）...");
            Engine.ZOOMFACTOR = 100;
            writeMessage("<br/><span style='color:green'>已设置 ZOOMFACTOR = 100</span>");
            writeMessage("<br/>现在滚轮缩放会更快");
        }, 6000);
        
        setTimeout(() => {
            message.info("\n9秒后恢复默认 ZOOMFACTOR = 75...");
            Engine.ZOOMFACTOR = 75;
            writeMessage("<br/><span style='color:green'>已恢复 ZOOMFACTOR = 75</span>");
        }, 9000);
        
        // 监听缩放变化
        const canvas = document.getElementById('map');
        canvas.addEventListener('wheel', () => {
            setTimeout(showZoomInfo, 100);
        });
        
        message.info("\n=== API 说明 ===");
        message.info("Engine.ZOOMFACTOR - 滚轮缩放因子（1-100）");
        message.info("Engine.currentSpace.zoom - 当前视图缩放比例");
        message.info("Engine.zoomExtents() - 缩放全图");
        message.info("Engine.zoomToEntities() - 缩放到实体");
        
        message.info("\n提示：使用滚轮缩放观察 zoom 值变化");
        
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
