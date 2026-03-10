window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --坐标系转换--canvasToWcs、wcsToUcs、wcsToDcs用法
        const { MainView, initCadContainer, Point2D, LineEnt, CircleEnt, Engine, writeMessage , message } = vjcad;
        
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
        const origin = new CircleEnt([0, 0], 5);
        origin.setDefaults();
        origin.color = 1;
        
        const xAxis = new LineEnt([0, 0], [100, 0]);
        xAxis.setDefaults();
        xAxis.color = 1;
        
        const yAxis = new LineEnt([0, 0], [0, 100]);
        yAxis.setDefaults();
        yAxis.color = 3;
        
        const testPoint = new CircleEnt([50, 50], 8);
        testPoint.setDefaults();
        testPoint.color = 5;
        
        Engine.addEntities([origin, xAxis, yAxis, testPoint]);
        Engine.zoomExtents();
        
        message.info("=== 坐标系转换 ===");
        message.info("CAD 使用多种坐标系统:");
        message.info("- WCS: 世界坐标系（绝对坐标）");
        message.info("- UCS: 用户坐标系（可自定义原点和旋转）");
        message.info("- DCS: 显示坐标系（屏幕像素坐标）");
        message.info("- Canvas: 画布坐标（HTML Canvas 像素）");
        
        writeMessage("<br/>=== 坐标系转换示例 ===");
        
        // 获取测试点的各种坐标
        const wcsPoint = new Point2D(50, 50);
        writeMessage(`<br/><br/>测试点 WCS: (${wcsPoint.x}, ${wcsPoint.y})`);
        
        // WCS 到 UCS
        const ucsPoint = Engine.wcsToUcs(wcsPoint);
        writeMessage(`<br/>转换到 UCS: (${ucsPoint.x.toFixed(2)}, ${ucsPoint.y.toFixed(2)})`);
        
        // UCS 到 WCS（反向转换）
        const backToWcs = Engine.ucsToWcs(ucsPoint);
        writeMessage(`<br/>UCS 转回 WCS: (${backToWcs.x.toFixed(2)}, ${backToWcs.y.toFixed(2)})`);
        
        // WCS 到 DCS（屏幕坐标）
        const dcsPoint = Engine.wcsToDcs(wcsPoint);
        writeMessage(`<br/>转换到 DCS: (${dcsPoint.x.toFixed(2)}, ${dcsPoint.y.toFixed(2)})`);
        
        // 演示鼠标位置转换
        message.info("\n将鼠标移到画布上查看坐标转换...");
        
        // 添加鼠标移动事件监听
        const canvas = document.getElementById('map');
        let lastLogTime = 0;
        
        canvas.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastLogTime < 500) return; // 限制更新频率
            lastLogTime = now;
            
            // 获取画布相对坐标
            const rect = canvas.getBoundingClientRect();
            const canvasX = e.clientX - rect.left;
            const canvasY = e.clientY - rect.top;
            
            // Canvas 坐标转 WCS
            const canvasPoint = new Point2D(canvasX, canvasY);
            const wcs = Engine.canvasToWcs(canvasPoint);
            
            // WCS 转其他坐标系
            const ucs = Engine.wcsToUcs(wcs);
            const dcs = Engine.wcsToDcs(wcs);
            
            writeMessage(`<br/>Canvas: (${canvasX.toFixed(0)}, ${canvasY.toFixed(0)}) → WCS: (${wcs.x.toFixed(2)}, ${wcs.y.toFixed(2)})`);
        });
        
        message.info("\n=== 转换方法 ===");
        message.info("canvasToWcs(point) - 画布坐标 → 世界坐标");
        message.info("wcsToUcs(point) - 世界坐标 → 用户坐标");
        message.info("ucsToWcs(point) - 用户坐标 → 世界坐标");
        message.info("wcsToDcs(point) - 世界坐标 → 显示坐标");
        
        message.info("\n=== 坐标系用途 ===");
        message.info("WCS - 存储实体几何数据");
        message.info("UCS - 用户自定义坐标系绘图");
        message.info("DCS - 屏幕显示和拾取计算");
        
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
