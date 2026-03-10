window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --状态栏--FuncButtons和CoordsBar用法
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
        const line = new LineEnt([0, 0], [100, 50]);
        line.setDefaults();
        const circle = new CircleEnt([50, 50], 30);
        circle.setDefaults();
        circle.color = 3;
        
        Engine.addEntities([line, circle]);
        Engine.zoomExtents();
        
        message.info("=== 状态栏功能 ===");
        
        // 获取状态栏组件
        const coordsBar = Engine.view.coordsBar;
        const funcButtons = coordsBar.funcButtons;
        
        message.info("状态栏位于窗口底部，包含以下功能按钮:");
        
        writeMessage("<br/>=== 状态栏功能按钮 ===");
        
        // 1. 对象捕捉 (OSNAP)
        writeMessage("<br/><br/><b>1. 对象捕捉 (F3)</b>");
        writeMessage("<br/>用于精确捕捉实体的特征点（端点、中点、圆心等）");
        
        // 2. 栅格显示 (GRID)
        writeMessage("<br/><br/><b>2. 栅格显示 (F7)</b>");
        writeMessage("<br/>显示/隐藏背景栅格");
        
        // 3. 正交模式 (ORTHO)
        writeMessage("<br/><br/><b>3. 正交模式 (F8)</b>");
        writeMessage("<br/>限制光标移动为水平或垂直方向");
        
        // 4. 极轴追踪 (POLAR)
        writeMessage("<br/><br/><b>4. 极轴追踪 (F10)</b>");
        writeMessage("<br/>按特定角度增量追踪光标");
        
        // 5. 主题切换
        writeMessage("<br/><br/><b>5. 主题切换</b>");
        writeMessage("<br/>切换深色/浅色主题");
        
        // 演示：程序化控制状态栏按钮（通过修改 Engine 属性自动更新按钮状态）
        message.info("\n--- 演示程序控制 ---");
        
        // 2秒后：开启正交模式
        setTimeout(() => {
            writeMessage(`<br/>2秒: 开启正交模式 (Engine.ORTHOMODE = 1)`);
            Engine.ORTHOMODE = 1;
            writeMessage(`<br/>按钮状态: ${funcButtons.orthomodeButton.isOn ? '开启' : '关闭'}`);
        }, 2000);
        
        // 4秒后：开启栅格显示
        setTimeout(() => {
            writeMessage(`<br/>4秒: 开启栅格显示 (Engine.GRIDMODE = 1)`);
            Engine.GRIDMODE = 1;
            writeMessage(`<br/>按钮状态: ${funcButtons.gridmodeButton.isOn ? '开启' : '关闭'}`);
        }, 4000);
        
        // 6秒后：关闭正交模式
        setTimeout(() => {
            writeMessage(`<br/>6秒: 关闭正交模式 (Engine.ORTHOMODE = 0)`);
            Engine.ORTHOMODE = 0;
            writeMessage(`<br/>按钮状态: ${funcButtons.orthomodeButton.isOn ? '开启' : '关闭'}`);
        }, 6000);
        
        message.info("\n=== 快捷键 ===");
        message.info("F3 - 切换对象捕捉");
        message.info("F7 - 切换栅格显示");
        message.info("F8 - 切换正交模式");
        message.info("F10 - 切换极轴追踪");
        
        message.info("\n=== 坐标显示 ===");
        message.info("状态栏左侧显示当前光标坐标");
        message.info("移动鼠标查看坐标实时更新");
        
        // 监听鼠标移动显示坐标
        const canvas = document.getElementById('map');
        canvas.addEventListener('mousemove', (e) => {
            // 坐标显示由状态栏自动更新
            // 这里只是说明功能
        });
        
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
