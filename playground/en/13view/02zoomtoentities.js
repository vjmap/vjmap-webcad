window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --缩放到实体--zoomToEntities用法
        const { MainView, initCadContainer, LineEnt, CircleEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建多个实体组（使用简化写法）
        const group1 = [];
        for (let i = 0; i < 3; i++) {
            const line = new LineEnt([i * 20, 0], [i * 20, 30]);
            line.setDefaults();
            line.color = 1;
            group1.push(line);
        }
        
        const group2 = [];
        for (let i = 0; i < 2; i++) {
            const circle = new CircleEnt([150 + i * 50, 100], 15);
            circle.setDefaults();
            circle.color = 3;
            group2.push(circle);
        }
        
        const group3 = [];
        const bigCircle = new CircleEnt([-100, -50], 40);
        bigCircle.setDefaults();
        bigCircle.color = 5;
        group3.push(bigCircle);
        
        Engine.addEntities([...group1, ...group2, ...group3]);
        
        message.info("已创建三组实体");
        Engine.zoomExtents();
        
        // 演示缩放到不同实体组
        setTimeout(() => {
            message.info("\n2秒后缩放到红色线条组...");
            Engine.zoomToEntities(group1);
        }, 2000);
        
        setTimeout(() => {
            message.info("\n4秒后缩放到绿色圆组...");
            Engine.zoomToEntities(group2);
        }, 4000);
        
        setTimeout(() => {
            message.info("\n6秒后缩放到蓝色大圆...");
            Engine.zoomToEntities(group3);
        }, 6000);
        
        setTimeout(() => {
            message.info("\n8秒后带边距缩放...");
            // 带边距的缩放
            Engine.zoomToEntities(group2, {
                padding: { top: 50, bottom: 50, left: 50, right: 50 }
            });
        }, 8000);
        
        setTimeout(() => {
            message.info("\n10秒后缩放回全图...");
            Engine.zoomExtents();
        }, 10000);
        
        message.info("zoomToEntities(entities) - 缩放到指定实体");
        message.info("可传入 padding 选项添加边距");
        
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
