window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --背景色设置--setBgc用法
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
        
        // 创建参考实体
        const line1 = new LineEnt([0, 0], [100, 0]);
        line1.setDefaults();
        line1.color = 1;
        
        const circle1 = new CircleEnt([50, 50], 30);
        circle1.setDefaults();
        circle1.color = 3;
        
        const line2 = new LineEnt([0, 100], [100, 100]);
        line2.setDefaults();
        line2.color = 5;
        
        Engine.addEntities([line1, circle1, line2]);
        Engine.zoomExtents();
        
        message.info("=== 背景色设置 ===");
        message.info("Engine.setBgc(grayValue) - 设置背景灰度值");
        message.info("grayValue: 0=纯黑, 255=纯白");
        
        // 演示不同背景色
        const backgrounds = [
            { value: 0, name: "纯黑 (0)" },
            { value: 33, name: "深灰 (33) - 默认深色主题" },
            { value: 128, name: "中灰 (128)" },
            { value: 200, name: "浅灰 (200)" },
            { value: 255, name: "纯白 (255)" },
        ];
        
        let index = 0;
        
        const showNext = () => {
            if (index >= backgrounds.length) {
                message.info("\n演示结束，恢复默认背景");
                Engine.setBgc(33);
                return;
            }
            
            const bg = backgrounds[index];
            message.info(`\n${index + 1}. 设置背景: ${bg.name}`);
            Engine.setBgc(bg.value);
            index++;
            
            setTimeout(showNext, 2000);
        };
        
        setTimeout(showNext, 1000);
        
        message.info("\n常用背景值:");
        message.info("0 - 纯黑（适合高对比度）");
        message.info("33 - 深灰（默认深色主题）");
        message.info("255 - 纯白（适合打印预览）");
        message.info("\n注意：背景色会影响实体颜色显示效果");
        
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
