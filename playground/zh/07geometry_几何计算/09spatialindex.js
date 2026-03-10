window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --空间索引--SpatialIndex  用法
        const { MainView, initCadContainer, Point2D, LineEnt, CircleEnt, PolylineEnt, Engine, BoundingBox, SpatialIndex , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        console.log("=== 空间索引  ===");
        console.log("使用 SpatialIndex  实现高效的空间查询\n");
        
        // === 创建空间索引实例 ===
        const spatialIndex = new SpatialIndex();
        
        console.log("--- 空间索引基础操作 ---");
        
        // === 插入数据项 ===
        // RBush 要求数据项必须包含 minX, minY, maxX, maxY 属性
        const items = [
            { minX: 10, minY: 10, maxX: 40, maxY: 40, name: "区域A", color: 1 },
            { minX: 30, minY: 30, maxX: 70, maxY: 70, name: "区域B", color: 3 },
            { minX: 60, minY: 10, maxX: 100, maxY: 50, name: "区域C", color: 4 },
            { minX: 80, minY: 40, maxX: 120, maxY: 80, name: "区域D", color: 5 },
            { minX: 20, minY: 60, maxX: 55, maxY: 95, name: "区域E", color: 6 },
        ];
        
        // 方式1：逐个插入
        items.forEach(item => spatialIndex.insert(item));
        console.log(`已插入 ${items.length} 个数据项`);
        
        // 绘制所有区域（使用矩形）
        function drawRect(item) {
            const rect = new PolylineEnt();
            rect.addVertex([item.minX, item.minY]);
            rect.addVertex([item.maxX, item.minY]);
            rect.addVertex([item.maxX, item.maxY]);
            rect.addVertex([item.minX, item.maxY]);
            rect.isClosed = true;
            rect.setDefaults();
            rect.color = item.color;
            Engine.addEntities(rect);
            return rect;
        }
        
        items.forEach(item => drawRect(item));
        
        // === 区域查询演示 ===
        console.log("\n--- 区域查询 ---");
        
        const queryBounds = { minX: 25, minY: 25, maxX: 75, maxY: 75 };
        
        // 绘制查询区域（红色虚线框）
        const queryRect = new PolylineEnt();
        queryRect.addVertex([queryBounds.minX, queryBounds.minY]);
        queryRect.addVertex([queryBounds.maxX, queryBounds.minY]);
        queryRect.addVertex([queryBounds.maxX, queryBounds.maxY]);
        queryRect.addVertex([queryBounds.minX, queryBounds.maxY]);
        queryRect.isClosed = true;
        queryRect.setDefaults();
        queryRect.color = 1; // 红色
        queryRect.lineType = "DASHED";
        queryRect.lineWeight = 2;
        Engine.addEntities(queryRect);
        
        console.log(`查询区域: (${queryBounds.minX}, ${queryBounds.minY}) - (${queryBounds.maxX}, ${queryBounds.maxY})`);
        
        // 执行空间查询
        const startTime = performance.now();
        const foundItems = spatialIndex.search(queryBounds);
        const endTime = performance.now();
        
        console.log(`查询结果: 找到 ${foundItems.length} 个数据项`);
        console.log(`查询耗时: ${(endTime - startTime).toFixed(3)} ms`);
        
        foundItems.forEach(item => {
            console.log(`  - ${item.name}`);
        });
        
        // === 碰撞检测演示 ===
        console.log("\n--- 碰撞检测 ---");
        
        const testBounds1 = { minX: 5, minY: 5, maxX: 15, maxY: 15 };
        const testBounds2 = { minX: 130, minY: 90, maxX: 150, maxY: 110 };
        
        const hasCollision1 = spatialIndex.collides(testBounds1);
        const hasCollision2 = spatialIndex.collides(testBounds2);
        
        console.log(`测试区域1 (5,5)-(15,15): ${hasCollision1 ? "有碰撞" : "无碰撞"}`);
        console.log(`测试区域2 (130,90)-(150,110): ${hasCollision2 ? "有碰撞" : "无碰撞"}`);
        
        // 绘制测试区域
        function drawTestRect(bounds, color) {
            const rect = new PolylineEnt();
            rect.addVertex([bounds.minX, bounds.minY]);
            rect.addVertex([bounds.maxX, bounds.minY]);
            rect.addVertex([bounds.maxX, bounds.maxY]);
            rect.addVertex([bounds.minX, bounds.maxY]);
            rect.isClosed = true;
            rect.setDefaults();
            rect.color = color;
            rect.lineType = "DOT";
            Engine.addEntities(rect);
        }
        
        drawTestRect(testBounds1, hasCollision1 ? 3 : 8);
        drawTestRect(testBounds2, hasCollision2 ? 3 : 8);
        
        // === 批量加载演示 ===
        console.log("\n--- 批量加载 (Bulk Loading) ---");
        
        // 创建新索引用于批量加载
        const bulkIndex = new SpatialIndex();
        
        // 生成大量随机数据
        const randomItems = [];
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 300;
            const y = Math.random() * 200;
            const w = 5 + Math.random() * 15;
            const h = 5 + Math.random() * 15;
            randomItems.push({
                minX: x,
                minY: y,
                maxX: x + w,
                maxY: y + h,
                id: i
            });
        }
        
        // 批量加载（使用 load 方法，性能更优）
        const bulkStart = performance.now();
        bulkIndex.load(randomItems);
        const bulkEnd = performance.now();
        
        console.log(`批量加载 ${randomItems.length} 个项目耗时: ${(bulkEnd - bulkStart).toFixed(2)} ms`);
        
        // === 删除操作演示 ===
        console.log("\n--- 删除操作 ---");
        
        const itemToRemove = items[0]; // 删除区域A
        spatialIndex.remove(itemToRemove, (a, b) => a.name === b.name);
        console.log(`已删除: ${itemToRemove.name}`);
        
        // 再次查询验证
        const afterRemove = spatialIndex.search(queryBounds);
        console.log(`删除后查询结果: ${afterRemove.length} 个数据项`);
        
        // === 性能对比：暴力搜索 vs 空间索引 ===
        console.log("\n--- 性能对比 ---");
        
        // 暴力搜索
        function bruteForceSearch(bounds, items) {
            return items.filter(item => 
                !(item.maxX < bounds.minX || 
                  item.minX > bounds.maxX ||
                  item.maxY < bounds.minY || 
                  item.minY > bounds.maxY)
            );
        }
        
        // 多次查询对比
        const iterations = 100;
        const randomBounds = [];
        
        for (let i = 0; i < iterations; i++) {
            const x = Math.random() * 200;
            const y = Math.random() * 150;
            randomBounds.push({
                minX: x,
                minY: y,
                maxX: x + 50,
                maxY: y + 40
            });
        }
        
        // 暴力搜索计时
        const bruteStart = performance.now();
        for (const bounds of randomBounds) {
            bruteForceSearch(bounds, randomItems);
        }
        const bruteEnd = performance.now();
        
        // 空间索引搜索计时
        const indexStart = performance.now();
        for (const bounds of randomBounds) {
            bulkIndex.search(bounds);
        }
        const indexEnd = performance.now();
        
        console.log(`${iterations} 次查询性能对比 (${randomItems.length} 个数据项):`);
        console.log(`暴力搜索总耗时: ${(bruteEnd - bruteStart).toFixed(2)} ms`);
        console.log(`空间索引总耗时: ${(indexEnd - indexStart).toFixed(2)} ms`);
        console.log(`性能提升: ${((bruteEnd - bruteStart) / (indexEnd - indexStart)).toFixed(1)}x`);
        
        // === API 说明 ===
        console.log("\n=== SpatialIndex  API ===");
        console.log("创建索引: new SpatialIndex()");
        console.log("插入单项: tree.insert(item)");
        console.log("批量加载: tree.load(items)  // 性能最优");
        console.log("区域查询: tree.search(bounds)");
        console.log("碰撞检测: tree.collides(bounds)");
        console.log("删除项目: tree.remove(item, equalsFn)");
        console.log("清空索引: tree.clear()");
        console.log("获取所有: tree.all()");
        
        console.log("\n数据项格式要求:");
        console.log("{ minX, minY, maxX, maxY, ...其他属性 }");
        
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
