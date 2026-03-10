window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --获取选择集--ssGetFirst用法
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
        
        // 创建实体（使用简化写法）
        const entities = [];
        for (let i = 0; i < 5; i++) {
            const line = new LineEnt([i * 25, 0], [i * 25, 40]);
            line.setDefaults();
            line.color = i + 1;
            entities.push(line);
        }
        
        const circle = new CircleEnt([60, 60], 20);
        circle.setDefaults();
        circle.color = 6;
        entities.push(circle);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        // 设置初始选择
        Engine.ssSetFirst([entities[0], entities[2], circle]);
        
        // 获取当前选择集
        const selected = Engine.ssGetFirst();
        
        message.info("=== 获取选择集 ===");
        message.info("选中数量:", selected.length);
        
        // 遍历选择集
        selected.forEach((entity, index) => {
            message.info(`${index + 1}. 类型: ${entity.type}, 颜色: ${entity.color}`);
        });
        
        // 对选择集进行操作
        message.info("\n=== 对选择集操作 ===");
        
        // 修改所有选中实体的颜色
        function changeSelectedColor(newColor) {
            const sel = Engine.ssGetFirst();
            sel.forEach(entity => {
                entity.color = newColor;
            });
            Engine.redraw();
            message.info(`已将 ${sel.length} 个实体的颜色改为 ${newColor}`);
        }
        
        // 获取选中实体的总长度
        function getSelectedTotalLength() {
            const sel = Engine.ssGetFirst();
            let total = 0;
            sel.forEach(entity => {
                if (entity.type === 'LINE') {
                    total += entity.Length;
                }
            });
            return total;
        }
        
        setTimeout(() => {
            message.info("\n3秒后将选中实体颜色改为红色...");
            changeSelectedColor(1);
        }, 3000);
        
        message.info("选中直线总长度:", getSelectedTotalLength().toFixed(2));
        message.info("\n点击实体可以测试选择功能");
        
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
