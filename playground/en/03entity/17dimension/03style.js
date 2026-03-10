window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --标注样式--设置标注文字、箭头等样式
        const { MainView, initCadContainer, LinearDimensionEnt, LineEnt, Point2D, Engine , message } = vjcad;
        
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
        
        // 创建多个标注展示不同样式
        const baseY = 0;
        const lineLength = 80;
        const dimOffset = 15;
        
        // 1. 默认样式
        const line1 = new LineEnt([0, baseY], [lineLength, baseY]);
        line1.setDefaults();
        entities.push(line1);
        
        const dim1 = new LinearDimensionEnt(
            new Point2D(0, baseY),
            new Point2D(lineLength, baseY),
            new Point2D(lineLength / 2, baseY + dimOffset),
            0
        );
        dim1.setDefaults();
        dim1.color = 1;
        entities.push(dim1);
        console.log("默认样式 - 文字高度:", dim1.textHeight, "箭头大小:", dim1.arrowSize);
        
        // 2. 大文字样式
        const y2 = baseY - 50;
        const line2 = new LineEnt([0, y2], [lineLength, y2]);
        line2.setDefaults();
        entities.push(line2);
        
        const dim2 = new LinearDimensionEnt(
            new Point2D(0, y2),
            new Point2D(lineLength, y2),
            new Point2D(lineLength / 2, y2 + dimOffset + 5),
            0
        );
        dim2.setDefaults();
        dim2.textHeight = 5;      // 更大的文字
        dim2.arrowSize = 3;       // 更大的箭头
        dim2.color = 3;
        entities.push(dim2);
        console.log("大文字样式 - 文字高度:", dim2.textHeight, "箭头大小:", dim2.arrowSize);
        
        // 3. 带文字覆盖
        const y3 = baseY - 100;
        const line3 = new LineEnt([0, y3], [lineLength, y3]);
        line3.setDefaults();
        entities.push(line3);
        
        const dim3 = new LinearDimensionEnt(
            new Point2D(0, y3),
            new Point2D(lineLength, y3),
            new Point2D(lineLength / 2, y3 + dimOffset),
            0
        );
        dim3.setDefaults();
        dim3.textOverride = "L=<>";  // <>会被替换为实际测量值
        dim3.color = 5;
        entities.push(dim3);
        console.log("文字覆盖:", dim3.textOverride, "显示:", dim3.getFormattedMeasurement());
        
        // 4. 带缩放因子
        const y4 = baseY - 150;
        const line4 = new LineEnt([0, y4], [lineLength, y4]);
        line4.setDefaults();
        entities.push(line4);
        
        const dim4 = new LinearDimensionEnt(
            new Point2D(0, y4),
            new Point2D(lineLength, y4),
            new Point2D(lineLength / 2, y4 + dimOffset),
            0
        );
        dim4.setDefaults();
        dim4.scaleFactor = 2;     // 标注整体放大2倍
        dim4.color = 4;
        entities.push(dim4);
        console.log("缩放因子:", dim4.scaleFactor);
        
        // 5. 自定义小数位数
        const y5 = baseY - 200;
        const line5 = new LineEnt([0, y5], [lineLength, y5]);
        line5.setDefaults();
        entities.push(line5);
        
        const dim5 = new LinearDimensionEnt(
            new Point2D(0, y5),
            new Point2D(lineLength, y5),
            new Point2D(lineLength / 2, y5 + dimOffset),
            0
        );
        dim5.setDefaults();
        dim5.decimalPlaces = 4;   // 显示4位小数
        dim5.color = 6;
        entities.push(dim5);
        console.log("小数位数:", dim5.decimalPlaces);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        message.info("标注样式：默认/大文字/文字覆盖/缩放/小数位数");
        
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
