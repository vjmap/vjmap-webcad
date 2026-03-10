window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --云线生成--generateRevcloudBulgePoints 用法
        const { MainView, initCadContainer, Point2D, PolylineEnt, Engine, generateRevcloudBulgePoints, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        console.log("=== 云线生成 (Revision Cloud) ===");
        console.log("使用 generateRevcloudBulgePoints 从路径点生成云线\n");
        
        // ========================================
        // 1. 基本矩形云线（闭合）
        // ========================================
        console.log("--- 1. 矩形闭合云线 ---");
        
        const rectPath = [
            [0, 0], [200, 0], [200, 100], [0, 100]
        ];
        
        const rectBp = generateRevcloudBulgePoints(rectPath, {
            arcLength: 20,
            isClosed: true,
        });
        
        const rectCloud = new PolylineEnt(rectBp);
        rectCloud.isClosed = true;
        rectCloud.setDefaults();
        rectCloud.color = 1;
        Engine.addEntities(rectCloud);
        
        console.log(`路径点: ${rectPath.length} 个`);
        console.log(`弧长: 20`);
        console.log(`生成顶点数: ${rectBp.length}`);
        
        // ========================================
        // 2. 三角形云线
        // ========================================
        console.log("\n--- 2. 三角形闭合云线 ---");
        
        const triPath = [
            [250, 0], [350, 100], [150, 100]
        ];
        
        const triBp = generateRevcloudBulgePoints(triPath, {
            arcLength: 15,
            isClosed: true,
        });
        
        const triCloud = new PolylineEnt(triBp);
        triCloud.isClosed = true;
        triCloud.setDefaults();
        triCloud.color = 3;
        Engine.addEntities(triCloud);
        
        console.log(`弧长: 15, 生成顶点数: ${triBp.length}`);
        
        // ========================================
        // 3. 开放路径云线
        // ========================================
        console.log("\n--- 3. 开放路径云线 ---");
        
        const openPath = [
            [0, 150], [80, 180], [160, 150], [240, 180], [320, 150]
        ];
        
        const openBp = generateRevcloudBulgePoints(openPath, {
            arcLength: 18,
            isClosed: false,
        });
        
        const openCloud = new PolylineEnt(openBp);
        openCloud.isClosed = false;
        openCloud.setDefaults();
        openCloud.color = 5;
        Engine.addEntities(openCloud);
        
        console.log(`路径点: ${openPath.length} 个, 开放路径`);
        console.log(`生成顶点数: ${openBp.length}`);
        
        // ========================================
        // 4. 不同弧长对比
        // ========================================
        console.log("\n--- 4. 不同弧长对比 ---");
        
        const arcLengths = [10, 25, 50];
        const colors = [6, 2, 4];
        
        arcLengths.forEach((al, idx) => {
            const y = 220 + idx * 40;
            const path = [[0, y], [300, y]];
        
            const bp = generateRevcloudBulgePoints(path, { arcLength: al });
            const pline = new PolylineEnt(bp);
            pline.setDefaults();
            pline.color = colors[idx];
            Engine.addEntities(pline);
        
            console.log(`弧长 ${al}: 生成 ${bp.length} 个顶点 (颜色 ${colors[idx]})`);
        });
        
        // ========================================
        // 5. 自定义 bulge 值
        // ========================================
        console.log("\n--- 5. 自定义 bulge 值 ---");
        
        const bulgeValues = [0.5, 1, -1];
        const labels = ["bulge=0.5 (90°弧)", "bulge=1 (半圆)", "bulge=-1 (反向半圆)"];
        
        bulgeValues.forEach((b, idx) => {
            const y = 360 + idx * 40;
            const path = [[0, y], [300, y]];
        
            const bp = generateRevcloudBulgePoints(path, {
                arcLength: 25,
                bulge: b,
            });
            const pline = new PolylineEnt(bp);
            pline.setDefaults();
            pline.color = colors[idx];
            Engine.addEntities(pline);
        
            console.log(`${labels[idx]}: 生成 ${bp.length} 个顶点`);
        });
        
        // ========================================
        // 6. 算法说明
        // ========================================
        console.log("\n=== 算法说明 ===");
        console.log("generateRevcloudBulgePoints(pathPoints, options)");
        console.log("  pathPoints: 路径坐标数组 (Point2D 或 [x,y])");
        console.log("  options.arcLength: 每段弧的弦长 (默认 50)");
        console.log("  options.bulge: 凸度值 (默认 1 = 半圆弧)");
        console.log("  options.isClosed: 是否闭合 (默认 false)");
        console.log("\n返回 BulgePoints，可直接传给 new PolylineEnt(bp)");
        
        Engine.zoomExtents();
        
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
