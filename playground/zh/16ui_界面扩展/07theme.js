window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --主题切换--THEME_MODE用法
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
        
        // 创建一些彩色实体
        const line1 = new LineEnt([0, 0], [100, 0]);
        line1.setDefaults();
        line1.color = 1;  // 红
        
        const line2 = new LineEnt([0, 20], [100, 20]);
        line2.setDefaults();
        line2.color = 2;  // 黄
        
        const line3 = new LineEnt([0, 40], [100, 40]);
        line3.setDefaults();
        line3.color = 3;  // 绿
        
        const line4 = new LineEnt([0, 60], [100, 60]);
        line4.setDefaults();
        line4.color = 4;  // 青
        
        const line5 = new LineEnt([0, 80], [100, 80]);
        line5.setDefaults();
        line5.color = 5;  // 蓝
        
        const circle = new CircleEnt([50, 40], 35);
        circle.setDefaults();
        circle.color = 7;  // 白/黑（随主题变化）
        
        Engine.addEntities([line1, line2, line3, line4, line5, circle]);
        Engine.zoomExtents();
        
        message.info("=== 主题切换 ===");
        message.info("Engine.THEME_MODE - 主题模式");
        message.info("0 = 深色主题，1 = 浅色主题");
        
        // 显示当前主题
        const showThemeInfo = () => {
            const mode = Engine.THEME_MODE;
            const isDark = Engine.isDarkTheme();
            const bgColor = Engine.getThemeBackground();
            
            writeMessage("<br/>=== 当前主题信息 ===");
            writeMessage(`<br/>THEME_MODE: ${mode}`);
            writeMessage(`<br/>isDarkTheme(): ${isDark}`);
            writeMessage(`<br/>背景色: ${bgColor}`);
        };
        
        showThemeInfo();
        
        // 演示：切换主题
        setTimeout(() => {
            message.info("\n3秒后切换到浅色主题...");
            Engine.THEME_MODE = 1;
            Engine.setBgc(255);  // 白色背景
            Engine.redraw();
            showThemeInfo();
            writeMessage("<br/><span style='color:green'>已切换到浅色主题</span>");
        }, 3000);
        
        setTimeout(() => {
            message.info("\n6秒后切换回深色主题...");
            Engine.THEME_MODE = 0;
            Engine.setBgc(33);  // 深灰背景
            Engine.redraw();
            showThemeInfo();
            writeMessage("<br/><span style='color:green'>已切换到深色主题</span>");
        }, 6000);
        
        message.info("\n=== API 说明 ===");
        message.info("Engine.THEME_MODE - 设置/获取主题模式");
        message.info("Engine.isDarkTheme() - 是否深色主题");
        message.info("Engine.getThemeBackground() - 获取主题背景色");
        message.info("Engine.setBgc(value) - 设置背景灰度值");
        
        message.info("\n=== 主题值 ===");
        message.info("0 - 深色主题（默认，背景深灰）");
        message.info("1 - 浅色主题（背景白色）");
        
        message.info("\n注意：颜色 7（白色）会根据主题自动调整显示");
        message.info("深色主题下显示为白色，浅色主题下显示为黑色");
        
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
