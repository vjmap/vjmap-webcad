window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --显示顺序--DrawOrder调整绘制顺序示例
        const { MainView, initCadContainer, CircleEnt, RectangEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建三个重叠的圆，演示显示顺序
        const circle1 = new CircleEnt([50, 50], 40);
        circle1.setDefaults();
        circle1.color = 1;  // 红色
        Engine.addEntities(circle1);
        
        const circle2 = new CircleEnt([70, 50], 40);
        circle2.setDefaults();
        circle2.color = 3;  // 绿色
        Engine.addEntities(circle2);
        
        const circle3 = new CircleEnt([60, 70], 40);
        circle3.setDefaults();
        circle3.color = 5;  // 蓝色
        Engine.addEntities(circle3);
        
        Engine.zoomExtents();
        
        message.info("已创建三个重叠的圆（红、绿、蓝）");
        message.info("当前显示顺序：红色在最底层，蓝色在最顶层");
        
        // ========== 显示顺序相关命令 ==========
        message.info("\n=== 显示顺序命令 ===");
        message.info("ENTDRAWFRONT - 将选中图形置于最前面");
        message.info("ENTDRAWBACK  - 将选中图形置于最后面");
        message.info("LAYDRAWFRONT - 将选中图形的图层整体置于最前面");
        message.info("LAYDRAWBACK  - 将选中图形的图层整体置于最后面");
        
        // ========== 方法1：通过命令执行 ==========
        message.info("\n=== 方法1：通过命令执行 ===");
        message.info("选择图形后执行命令：");
        message.info("  Engine.editor.executerWithOp('ENTDRAWFRONT')");
        message.info("  Engine.editor.executerWithOp('ENTDRAWBACK')");
        
        // ========== 方法2：直接操作显示顺序 ==========
        message.info("\n=== 方法2：直接操作 items 数组 ===");
        
        // 获取当前空间的实体列表
        const items = Engine.currentSpace.items;
        message.info("当前实体数量: " + items.length);
        
        // 将红色圆移到最前面（数组末尾）
        function moveToFront(entity) {
            const idx = items.indexOf(entity);
            if (idx > -1) {
                items.splice(idx, 1);
                items.push(entity);
                Engine.pcanvas.regen(true);
            }
        }
        
        // 将实体移到最后面（数组开头）
        function moveToBack(entity) {
            const idx = items.indexOf(entity);
            if (idx > -1) {
                items.splice(idx, 1);
                items.unshift(entity);
                Engine.pcanvas.regen(true);
            }
        }
        
        // 演示：5秒后将红色圆移到最前面
        setTimeout(() => {
            message.info("\n将红色圆移到最前面...");
            moveToFront(circle1);
            message.info("红色圆已移到最前面");
        }, 5000);
        
        // 演示：8秒后将蓝色圆移到最后面
        setTimeout(() => {
            message.info("\n将蓝色圆移到最后面...");
            moveToBack(circle3);
            message.info("蓝色圆已移到最后面");
        }, 8000);
        
        message.info("\n5秒后红色圆将移到最前面");
        message.info("8秒后蓝色圆将移到最后面");
        
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
