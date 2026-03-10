window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --预览绘制--drawPreviewEntity用法
        const { MainView, initCadContainer, Point2D, LineEnt, CircleEnt, PolylineEnt, Engine , message } = vjcad;
        // 注意: 此文件保留 Point2D 因为 setPreviewPosition 方法需要 Point2D 对象
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建背景参考实体（使用简化写法）
        const refLine = new LineEnt([0, 0], [100, 0]);
        refLine.setDefaults();
        refLine.color = 7;
        Engine.addEntities(refLine);
        
        Engine.zoomExtents();
        
        message.info("=== 预览绘制方法 ===");
        message.info("Engine.drawPreviewEntity(entity) - 绘制单个预览实体");
        message.info("Engine.drawPreviewEntities([entities]) - 绘制多个预览实体");
        message.info("Engine.clearPreview() - 清除所有预览");
        
        // 演示预览绘制
        let previewAngle = 0;
        
        // 动态预览圆（使用简化写法）
        const intervalId = setInterval(() => {
            previewAngle += 0.1;
            
            // 创建预览圆（位置随时间变化）
            const x = 50 + Math.cos(previewAngle) * 30;
            const y = 30 + Math.sin(previewAngle) * 30;
            
            const previewCircle = new CircleEnt([x, y], 15);
            previewCircle.setDefaults();
            previewCircle.color = 1;
            
            // 创建预览线
            const previewLine = new LineEnt([50, 30], [x, y]);
            previewLine.setDefaults();
            previewLine.color = 3;
            
            // 清除旧预览并绘制新预览
            Engine.clearPreview();
            Engine.drawPreviewEntities([previewCircle, previewLine]);
            
        }, 50);
        
        // 10秒后停止动画并清除预览
        setTimeout(() => {
            clearInterval(intervalId);
            Engine.clearPreview();
            message.info("\n动画结束，预览已清除");
            
            // 演示设置预览位置和旋转
            message.info("\n演示 setPreviewPosition 和 setPreviewRotation...");
            
            const staticPreview = new PolylineEnt();
            staticPreview.addVertex([-10, -10]);
            staticPreview.addVertex([10, -10]);
            staticPreview.addVertex([10, 10]);
            staticPreview.addVertex([-10, 10]);
            staticPreview.isClosed = true;
            staticPreview.setDefaults();
            staticPreview.color = 5;
            
            Engine.drawPreviewEntity(staticPreview);
            Engine.setPreviewPosition(new Point2D(50, 50));
            Engine.setPreviewRotation(Math.PI / 4);  // 旋转45度
            
        }, 10000);
        
        message.info("\n观察预览动画，10秒后停止");
        
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
