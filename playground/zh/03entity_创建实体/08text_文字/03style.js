window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --文字样式--设置文字的各种样式属性
        const { MainView, initCadContainer, TextEnt, Engine , message } = vjcad;
        
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
        let y = 100;
        const lineHeight = 20;
        
        // 1. 不同大小的文字
        const sizes = [3, 5, 8, 12];
        sizes.forEach((size, i) => {
            const text = new TextEnt();
            text.insertionPoint = [0, y];
            text.text = `字高 ${size}`;
            text.height = size;
            text.setDefaults();
            text.color = i + 1;
            entities.push(text);
            y -= lineHeight + size;
        });
        
        console.log("不同字高的文字已创建");
        
        // 2. 不同颜色的文字
        y = 100;
        const colors = [1, 2, 3, 4, 5, 6];
        colors.forEach((color, i) => {
            const text = new TextEnt();
            text.insertionPoint = [100, y - i * 15];
            text.text = `颜色 ${color}`;
            text.height = 6;
            text.setDefaults();
            text.color = color;
            entities.push(text);
        });
        
        console.log("不同颜色的文字已创建");
        
        // 3. 旋转的文字
        y = 100;
        const angles = [0, 15, 30, 45, 90];
        angles.forEach((angle, i) => {
            const text = new TextEnt();
            text.insertionPoint = [200 + i * 30, 50];
            text.text = `${angle}°`;
            text.height = 5;
            text.rotation = angle * Math.PI / 180;
            text.setDefaults();
            text.color = 3;
            entities.push(text);
        });
        
        console.log("旋转文字已创建");
        
        // 4. 宽度因子
        y = -20;
        const widthFactors = [0.5, 0.8, 1.0, 1.2, 1.5];
        widthFactors.forEach((wf, i) => {
            const text = new TextEnt();
            text.insertionPoint = [0, y - i * 12];
            text.text = `宽度因子 ${wf}`;
            text.height = 5;
            text.widthFactor = wf;
            text.setDefaults();
            text.color = 5;
            entities.push(text);
        });
        
        console.log("不同宽度因子的文字已创建");
        
        // 5. 倾斜角度
        y = -20;
        const obliqueAngles = [-15, 0, 15, 30];
        obliqueAngles.forEach((angle, i) => {
            const text = new TextEnt();
            text.insertionPoint = [150, y - i * 12];
            text.text = `倾斜 ${angle}°`;
            text.height = 5;
            text.obliqueAngle = angle * Math.PI / 180;
            text.setDefaults();
            text.color = 4;
            entities.push(text);
        });
        
        console.log("倾斜文字已创建");
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        message.info("文字样式展示：字高、颜色、旋转、宽度因子、倾斜角");
        
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
