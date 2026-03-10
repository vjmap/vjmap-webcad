window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --几何变换--平移、旋转、缩放、镜像
        const { MainView, initCadContainer, Point2D, LineEnt, CircleEnt, PolylineEnt, Engine, getAngleBetweenPoints , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        console.log("=== 几何变换 ===");
        console.log("使用实体的 move/rotate/scale/mirror 方法进行变换\n");
        
        // 创建原始图形（L形）
        function createLShape(basePoint) {
            const pline = new PolylineEnt();
            pline.addVertex([basePoint.x, basePoint.y]);
            pline.addVertex([basePoint.x + 30, basePoint.y]);
            pline.addVertex([basePoint.x + 30, basePoint.y + 10]);
            pline.addVertex([basePoint.x + 10, basePoint.y + 10]);
            pline.addVertex([basePoint.x + 10, basePoint.y + 30]);
            pline.addVertex([basePoint.x, basePoint.y + 30]);
            pline.isClosed = true;
            pline.setDefaults();
            return pline;
        }
        
        // === 原始图形 ===
        const original = createLShape(new Point2D(20, 20));
        original.color = 7;
        Engine.addEntities(original);
        console.log("原始图形 (白色): 位于 (20, 20)");
        
        // === 平移变换 ===
        console.log("\n--- 平移变换 ---");
        
        const translated = createLShape(new Point2D(20, 20));
        translated.move(new Point2D(0, 0), new Point2D(80, 0)); // 向右平移80
        translated.color = 1;
        Engine.addEntities(translated);
        
        console.log("平移 (红色): 向右移动 80 单位");
        console.log("平移公式: P' = P + T");
        
        // 绘制平移向量
        const moveArrow = new LineEnt([35, 35], [115, 35]);
        moveArrow.setDefaults();
        moveArrow.color = 8;
        moveArrow.lineType = "DOT";
        Engine.addEntities(moveArrow);
        
        // === 旋转变换 ===
        console.log("\n--- 旋转变换 ---");
        
        const rotated = createLShape(new Point2D(20, 80));
        const rotateCenter = new Point2D(35, 95); // 旋转中心
        rotated.rotate(rotateCenter, Math.PI / 4); // 旋转45度
        rotated.color = 3;
        Engine.addEntities(rotated);
        
        // 标记旋转中心
        const rotCenterMarker = new CircleEnt([rotateCenter.x, rotateCenter.y], 2);
        rotCenterMarker.setDefaults();
        rotCenterMarker.color = 2;
        Engine.addEntities(rotCenterMarker);
        
        // 原始位置参考
        const rotOriginal = createLShape(new Point2D(20, 80));
        rotOriginal.color = 8;
        rotOriginal.lineType = "HIDDEN";
        Engine.addEntities(rotOriginal);
        
        console.log("旋转 (绿色): 绕点 (35, 95) 旋转 45°");
        console.log("旋转公式:");
        console.log("  x' = (x-cx)·cos(θ) - (y-cy)·sin(θ) + cx");
        console.log("  y' = (x-cx)·sin(θ) + (y-cy)·cos(θ) + cy");
        
        // === 缩放变换 ===
        console.log("\n--- 缩放变换 ---");
        
        const scaled = createLShape(new Point2D(100, 80));
        const scaleCenter = new Point2D(115, 95); // 缩放中心
        scaled.scale(scaleCenter, 1.5); // 放大1.5倍
        scaled.color = 4;
        Engine.addEntities(scaled);
        
        // 标记缩放中心
        const scaleCenterMarker = new CircleEnt([scaleCenter.x, scaleCenter.y], 2);
        scaleCenterMarker.setDefaults();
        scaleCenterMarker.color = 2;
        Engine.addEntities(scaleCenterMarker);
        
        // 原始位置参考
        const scaleOriginal = createLShape(new Point2D(100, 80));
        scaleOriginal.color = 8;
        scaleOriginal.lineType = "HIDDEN";
        Engine.addEntities(scaleOriginal);
        
        console.log("缩放 (青色): 以点 (115, 95) 为中心放大 1.5 倍");
        console.log("缩放公式: P' = C + s·(P - C)");
        
        // === 镜像变换 ===
        console.log("\n--- 镜像变换 ---");
        
        const mirrored = createLShape(new Point2D(180, 20));
        
        // 镜像轴
        const mirrorAxisStart = new Point2D(230, 10);
        const mirrorAxisEnd = new Point2D(230, 70);
        
        // 使用实体的 mirror 方法
        const mirroredPline = createLShape(new Point2D(180, 20));
        mirroredPline.mirror(mirrorAxisStart, mirrorAxisEnd);
        mirroredPline.color = 5;
        Engine.addEntities(mirroredPline);
        
        // 绘制镜像轴
        const mirrorAxis = new LineEnt(mirrorAxisStart, mirrorAxisEnd);
        mirrorAxis.setDefaults();
        mirrorAxis.color = 2;
        mirrorAxis.lineType = "DASHDOT";
        Engine.addEntities(mirrorAxis);
        
        // 原始
        mirrored.color = 8;
        mirrored.lineType = "HIDDEN";
        Engine.addEntities(mirrored);
        
        console.log("镜像 (紫色): 使用实体的 mirror() 方法，沿垂直轴 x=230 镜像");
        console.log("镜像公式: P' = 2·foot - P");
        
        // === 组合变换 ===
        console.log("\n--- 组合变换 ---");
        
        const combined = createLShape(new Point2D(280, 80));
        combined.color = 6;
        
        // 先缩放
        combined.scale(new Point2D(295, 95), 0.8);
        // 再旋转
        combined.rotate(new Point2D(295, 95), Math.PI / 6);
        // 最后平移
        combined.move(new Point2D(0, 0), new Point2D(20, 20));
        
        Engine.addEntities(combined);
        
        // 原始参考
        const combOriginal = createLShape(new Point2D(280, 80));
        combOriginal.color = 8;
        combOriginal.lineType = "HIDDEN";
        Engine.addEntities(combOriginal);
        
        console.log("组合变换 (黄色): 缩放0.8 → 旋转30° → 平移(20,20)");
        console.log("注意: 变换顺序影响结果！");
        
        // === 变换矩阵说明 ===
        console.log("\n=== 变换矩阵（齐次坐标）===");
        console.log("平移: [1 0 tx; 0 1 ty; 0 0 1]");
        console.log("旋转: [cos -sin 0; sin cos 0; 0 0 1]");
        console.log("缩放: [sx 0 0; 0 sy 0; 0 0 1]");
        console.log("组合: M = M3 · M2 · M1 (从右到左)");
        
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
