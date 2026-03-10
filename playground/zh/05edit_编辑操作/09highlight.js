window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --高亮实体--highLightEntities和clearHighLight用法
        const { MainView, initCadContainer, LineEnt, CircleEnt, PolylineEnt, Engine, writeMessage , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建多组实体
        const group1 = [];
        for (let i = 0; i < 3; i++) {
            const line = new LineEnt([i * 40, 0], [i * 40 + 30, 30]);
            line.setDefaults();
            line.color = 1;
            group1.push(line);
        }
        
        const group2 = [];
        for (let i = 0; i < 3; i++) {
            const circle = new CircleEnt([150 + i * 40, 50], 12);
            circle.setDefaults();
            circle.color = 3;
            group2.push(circle);
        }
        
        const group3 = [];
        const rect = new PolylineEnt();
        rect.addVertex([0, 80]);
        rect.addVertex([100, 80]);
        rect.addVertex([100, 120]);
        rect.addVertex([0, 120]);
        rect.isClosed = true;
        rect.setDefaults();
        rect.color = 5;
        group3.push(rect);
        
        const allEntities = [...group1, ...group2, ...group3];
        Engine.addEntities(allEntities);
        Engine.zoomExtents();
        
        message.info("=== 高亮实体 ===");
        message.info("Engine.highLightEntities(entities) - 高亮指定实体");
        message.info("Engine.clearHighLight() - 清除高亮");
        
        writeMessage("<br/>=== 高亮演示 ===");
        
        // 演示：依次高亮不同组
        setTimeout(() => {
            message.info("\n2秒后高亮红色线条组...");
            Engine.highLightEntities(group1);
            writeMessage("<br/>已高亮: 红色线条组 (3个)");
        }, 2000);
        
        setTimeout(() => {
            message.info("\n4秒后清除高亮...");
            Engine.clearHighLight();
            writeMessage("<br/>已清除高亮");
        }, 4000);
        
        setTimeout(() => {
            message.info("\n6秒后高亮绿色圆形组...");
            Engine.highLightEntities(group2);
            writeMessage("<br/>已高亮: 绿色圆形组 (3个)");
        }, 6000);
        
        setTimeout(() => {
            message.info("\n8秒后高亮蓝色矩形...");
            Engine.highLightEntities(group3);
            writeMessage("<br/>已高亮: 蓝色矩形 (1个)");
        }, 8000);
        
        setTimeout(() => {
            message.info("\n10秒后高亮全部实体...");
            Engine.highLightEntities(allEntities);
            writeMessage("<br/>已高亮: 全部实体 (" + allEntities.length + "个)");
        }, 10000);
        
        setTimeout(() => {
            message.info("\n12秒后清除高亮...");
            Engine.clearHighLight();
            writeMessage("<br/>演示结束");
        }, 12000);
        
        // 演示：鼠标悬停高亮
        message.info("\n--- 交互演示 ---");
        message.info("点击实体进行高亮切换");
        
        const canvas = document.getElementById('map');
        canvas.addEventListener('click', (e) => {
            // 获取点击位置的实体
            const selected = Engine.ssGetFirst();
            
            if (selected.length > 0) {
                Engine.highLightEntities(selected);
                writeMessage(`<br/>高亮选中实体: ${selected.length}个`);
            } else {
                Engine.clearHighLight();
                writeMessage("<br/>清除高亮（未选中实体）");
            }
        });
        
        message.info("\n=== API 说明 ===");
        message.info("highLightEntities([entities]) - 高亮实体数组");
        message.info("clearHighLight() - 清除所有高亮效果");
        message.info("");
        message.info("高亮效果是临时的视觉反馈");
        message.info("不影响实体的实际属性");
        message.info("常用于：悬停预览、搜索结果、关联显示等");
        
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
