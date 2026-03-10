window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --中心线提取--从双线（平行线）中提取中心线
        const { MainView, initCadContainer, Point2D, LineEnt, PolylineEnt, BulgePoints, BulgePoint, Engine, Layer, getWebCadCoreService, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        console.log("=== 中心线提取算法 ===");
        console.log("从双线要素（如道路轮廓、巷道）提取中心线\n");
        
        // ========================================
        // 1. 绘制示例双线（两条平行线，间距 5）
        // ========================================
        console.log("--- 1. 创建示例双线 ---");
        
        const gap = 5; // parallel line spacing
        
        // Line pair 1 - horizontal
        const line1a = new LineEnt([0, gap / 2], [100, gap / 2]);
        line1a.setDefaults();
        line1a.color = 3;
        Engine.addEntities(line1a);
        
        const line1b = new LineEnt([0, -gap / 2], [100, -gap / 2]);
        line1b.setDefaults();
        line1b.color = 3;
        Engine.addEntities(line1b);
        
        console.log("绘制了一组水平平行线 (绿色)");
        console.log(`  上线: (0, ${gap / 2}) → (100, ${gap / 2})`);
        console.log(`  下线: (0, ${-gap / 2}) → (100, ${-gap / 2})`);
        console.log(`  间距: ${gap}`);
        
        // Line pair 2 - angled
        const angle = Math.PI / 6; // 30 degrees
        const cos30 = Math.cos(angle), sin30 = Math.sin(angle);
        const offsetX = -gap / 2 * sin30, offsetY = gap / 2 * cos30;
        const startX = 120, startY = -20, endX = 200, endY = -20 + 80 * sin30 / cos30;
        
        const line2a = new LineEnt(
            [startX + offsetX, startY + offsetY],
            [endX + offsetX, endY + offsetY]
        );
        line2a.setDefaults();
        line2a.color = 5;
        Engine.addEntities(line2a);
        
        const line2b = new LineEnt(
            [startX - offsetX, startY - offsetY],
            [endX - offsetX, endY - offsetY]
        );
        line2b.setDefaults();
        line2b.color = 5;
        Engine.addEntities(line2b);
        
        console.log("\n绘制了一组 30° 倾斜平行线 (蓝色)");
        
        // Line pair 3 - polyline corridor (L-shape)
        const pline1 = new PolylineEnt();
        pline1.addVertex([0, 40]);
        pline1.addVertex([60, 40]);
        pline1.addVertex([60, 80]);
        pline1.setDefaults();
        pline1.color = 6;
        Engine.addEntities(pline1);
        
        const pline2 = new PolylineEnt();
        pline2.addVertex([0, 40 + gap]);
        pline2.addVertex([60 - gap, 40 + gap]);
        pline2.addVertex([60 - gap, 80]);
        pline2.setDefaults();
        pline2.color = 6;
        Engine.addEntities(pline2);
        
        console.log("\n绘制了一组 L 形多段线巷道 (紫色)");
        
        // ========================================
        // 2. 收集线段数据
        // ========================================
        console.log("\n--- 2. 收集线段数据 ---");
        
        function collectAllLines() {
            const currentSpace = Engine.currentDoc.getCurrentSpace();
            const lines = [];
        
            for (const entity of currentSpace.items) {
                if (!entity || !entity.isAlive) continue;
        
                if (entity.type === 'LINE') {
                    const sp = entity.startPoint;
                    const ep = entity.endPoint;
                    lines.push([[sp.x, sp.y], [ep.x, ep.y]]);
                } else if (entity.type === 'PLINE') {
                    const pts = entity.getPoints();
                    if (pts && pts.length >= 2) {
                        lines.push(pts);
                    }
                }
            }
        
            return lines;
        }
        
        const lineData = collectAllLines();
        console.log(`收集到 ${lineData.length} 条线段数据`);
        
        // ========================================
        // 3. 调用 WASM 提取中心线
        // ========================================
        console.log("\n--- 3. 调用 WASM 提取中心线 ---");
        
        const wasmService = getWebCadCoreService();
        
        const input = {
            lines: lineData,
            config: {
                collinearTolerance: 1.0,
                duplicateTolerance: 0.2,
                minSpaceDistance: [gap - 1],     // min parallel distance
                maxSpaceDistance: [gap + 1],     // max parallel distance
                maxGapDistance: 15,
                numDecimalDigits: 3,
                minDlMinRatio: 0.01,
                paralleSlopeAngleTolerance: 1.5,
                mergeSlopeAngleTolerance: 20,
                maxCenterMergeDistance: 15,
                minCenterDistance: 3,
                connectGapLine: true,
                mergeNode: true,
                filterShortLine: true,
                mergeLine: true,
            }
        };
        
        const result = wasmService.extractCenterlineSync(input);
        
        if (result.error) {
            console.error("提取失败:", result.error);
        } else {
            console.log(`成功提取 ${result.centerlines.length} 条中心线`);
        
            // ========================================
            // 4. 创建中心线实体
            // ========================================
            console.log("\n--- 4. 创建中心线实体 ---");
        
            // Create target layer
            const layerName = "Centerline";
            let layer = Engine.currentDoc.layers.itemByName(layerName);
            if (!layer) {
                layer = new Layer(layerName);
                layer.color = 1; // red
                Engine.currentDoc.layers.add(layer);
            }
        
            const addedEntities = [];
        
            for (const polyline of result.centerlines) {
                if (!polyline || polyline.length < 2) continue;
        
                const bp = new BulgePoints();
                for (const pt of polyline) {
                    bp.add(new BulgePoint([pt[0], pt[1]], 0));
                }
        
                const plineEnt = new PolylineEnt(bp, false);
                plineEnt.setDefaults();
                plineEnt.layer = layerName;
                // color is ByLayer (256), so it follows layer color (red)
        
                const added = Engine.pcanvas.addEntity(plineEnt);
                if (added) addedEntities.push(added);
            }
        
            console.log(`创建了 ${addedEntities.length} 条中心线实体至图层 "${layerName}" (红色)`);
        
            // Select the new centerlines
            Engine.editor.ssSetFirst(addedEntities);
        }
        
        // ========================================
        // 5. 算法说明
        // ========================================
        console.log("\n=== 中心线提取算法要点 ===");
        console.log("1. 将所有线/多段线分解为线段");
        console.log("2. 合并共线且断开距离在允许范围内的线段");
        console.log("3. 识别平行线对（斜率相似+垂直距离在范围内）");
        console.log("4. 计算平行线对的中心线（取两侧垂足中点）");
        console.log("5. 合并断开的中心线段");
        console.log("6. 合并端点到附近线段");
        console.log("7. 最终合并相连的中心线");
        console.log("\n关键参数:");
        console.log("  minSpaceDistance / maxSpaceDistance: 双线间距范围");
        console.log("  collinearTolerance: 共线判断容差");
        console.log("  paralleSlopeAngleTolerance: 平行线角度容差(度)");
        console.log("  maxGapDistance: 允许的线段断开距离");
        
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
