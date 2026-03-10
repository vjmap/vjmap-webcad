window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --多重引线--MLeaderEnt多重引线标注示例
        const { MainView, initCadContainer, MLeaderEnt, MLeaderContentType, LeaderType, Point2D, Engine , message } = vjcad;
        
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
        
        // 示例1：基本多重引线（带文字）
        const mleader1 = new MLeaderEnt();
        mleader1.contentType = MLeaderContentType.MText;
        mleader1.textContent = "标注文字";
        mleader1.textPosition = new Point2D(80, 30);
        mleader1.textHeight = 5;
        mleader1.addLeaderLine(new Point2D(0, 0));  // 箭头位置
        mleader1.setDefaults();
        mleader1.color = 1;
        entities.push(mleader1);
        
        // 示例2：带多个引线的标注
        const mleader2 = new MLeaderEnt();
        mleader2.contentType = MLeaderContentType.MText;
        mleader2.textContent = "多引线";
        mleader2.textPosition = new Point2D(180, 40);
        mleader2.textHeight = 5;
        // 添加多条引线
        const lineIdx1 = mleader2.addLeaderLine(new Point2D(100, 0));
        const lineIdx2 = mleader2.addLeaderLine(new Point2D(120, -20));
        mleader2.setDefaults();
        mleader2.color = 3;
        entities.push(mleader2);
        
        // 示例3：不同箭头位置
        const mleader3 = new MLeaderEnt();
        mleader3.contentType = MLeaderContentType.MText;
        mleader3.textContent = "注释说明";
        mleader3.textPosition = new Point2D(60, -60);
        mleader3.textHeight = 4;
        mleader3.addLeaderLine(new Point2D(0, -80));
        mleader3.landingLength = 10;  // 基线长度
        mleader3.setDefaults();
        mleader3.color = 5;
        entities.push(mleader3);
        
        // 示例4：带文本框的引线
        const mleader4 = new MLeaderEnt();
        mleader4.contentType = MLeaderContentType.MText;
        mleader4.textContent = "重要";
        mleader4.textPosition = new Point2D(180, -50);
        mleader4.textHeight = 6;
        mleader4.enableFrameText = true;  // 启用文本框
        mleader4.addLeaderLine(new Point2D(120, -80));
        mleader4.setDefaults();
        mleader4.color = 4;
        entities.push(mleader4);
        
        // 示例5：调整箭头大小
        const mleader5 = new MLeaderEnt();
        mleader5.contentType = MLeaderContentType.MText;
        mleader5.textContent = "大箭头";
        mleader5.textPosition = new Point2D(280, 20);
        mleader5.textHeight = 5;
        mleader5.arrowSize = 5;  // 较大的箭头
        mleader5.addLeaderLine(new Point2D(220, 0));
        mleader5.setDefaults();
        mleader5.color = 6;
        entities.push(mleader5);
        
        // 示例6：向左的引线
        const mleader6 = new MLeaderEnt();
        mleader6.contentType = MLeaderContentType.MText;
        mleader6.textContent = "左侧标注";
        mleader6.textPosition = new Point2D(200, -80);
        mleader6.textHeight = 4;
        mleader6.addLeaderLine(new Point2D(280, -60));
        mleader6.setDefaults();
        mleader6.color = 2;
        entities.push(mleader6);
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("多重引线已创建");
        console.log("MLeader支持：单引线、多引线、文本框、箭头大小调整等");
        
        message.info("多重引线：基本(红)、多引线(绿)、带框(青)、大箭头(紫)、左侧(黄)");
        
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
