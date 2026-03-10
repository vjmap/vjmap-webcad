window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --自定义填充图案--注册自定义图案并自动计算比例
        const { MainView, initCadContainer, HatchEnt, PolylineEnt, TextEnt, Engine, Edge, Edges, EdgeType, message, calculateHatchPatternScale, getPatternUnitSize } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        /**
         * ========================================
         * PAT 填充图案格式说明
         * ========================================
         * 
         * PAT 格式是 AutoCAD 标准的填充图案定义格式，每个图案由多行定义组成：
         * 
         * 1. 头部行：*图案名称,图案描述
         *    - 以 * 开头
         *    - 图案名称和描述用逗号分隔
         * 
         * 2. 线定义行：角度,X原点,Y原点,deltaX,deltaY[,线型定义...]
         *    - 角度: 线条绘制方向(度)，0=水平向右，90=垂直向上
         *    - X原点: 第一条线的X起点坐标
         *    - Y原点: 第一条线的Y起点坐标
         *    - deltaX: 沿线条方向的偏移量(用于虚线等线型)
         *    - deltaY: 垂直于线条方向的偏移量(行间距)
         *    - 线型定义: 可选的虚线模式
         *      - 正数: 实线段长度
         *      - 负数: 空隙长度
         *      - 0: 点
         * 
         * 示例解析 - 简单45度斜线：
         *   45,0,0,0,1
         *   - 角度45度
         *   - 起点(0,0)
         *   - deltaX=0, deltaY=1 (行间距为1)
         *   - 无线型定义(连续实线)
         * 
         * 示例解析 - 虚线：
         *   0,0,0,4,4,2,-1,0.5,-0.5
         *   - 水平线
         *   - 起点(0,0)
         *   - deltaX=4, deltaY=4
         *   - 线型: 实线2，空1，点，空0.5
         */
        
        // 自定义图案定义（PAT格式字符串）
        const CUSTOM_PATTERNS = {
            // 草坪或沼泽图案 - 复杂的植被图案
            "草坪或沼泽": `*草坪或沼泽,草坪或沼泽
        0,1.2,0.08,4,4,0.6,-0.12,0.16,-0.12,0.6,-2.4
        0,1,0.2,4,4,0.4,-0.3,0.6,-0.3,0.4,-2
        0,2.4,1.8,4,4,0.5,-0.2,0.5,-2.8
        0,0.4,2.6,4,4,0.2,-0.4,0.2,-3.2
        90,0.8,2.6,4,4,0.36,-3.64
        90,2,0.2,4,4,0.4,-3.6
        90,3,1.8,4,4,0.4,-3.6
        45,2.52,0.16,2.828427,2.828427,0.4,-5.256854
        135,1.48,0.16,2.828427,2.828427,0.4,-5.256854
        63.434949,2.4,0.18,3.577709,1.788854,0.4,-8.544272
        75.963757,2.2,0.2,3.88057,0.970142,0.4,-16.092423
        75.963757,3.2,1.8,3.88057,0.970142,0.32,-16.172423
        75.963757,0.88,2.6,3.88057,0.970142,0.28,-16.212423
        104.036243,1.8,0.2,3.88057,-0.970142,0.4,-16.092423
        104.036243,2.8,1.8,3.88057,-0.970142,0.32,-16.172423
        104.036243,0.72,2.6,3.88057,-0.970142,0.28,-16.212423
        116.565051,1.6,0.18,3.577709,-1.788854,0.4,-8.544267`,
        
            // 虚线方格图案 - 简单的网格图案
            "虚线方格": `*虚线方格,虚线方格
        0,50.985865,43.256043,0,1,0.18,-0.15,0.18,-0.15,0.18,-0.16
        90,51.905865,43.336043,0,1,0.18,-0.15,0.18,-0.15,0.18,-0.16`
        };
        
        /**
         * 解析 PAT 格式字符串为图案定义对象
         * @param {string} patString - PAT格式字符串
         * @returns {object} 图案定义对象
         */
        function parsePatternString(patString) {
            const lines = patString.trim().split('\n');
            const headerLine = lines[0];
            
            // 解析头部: *名称,描述
            const headerMatch = headerLine.match(/^\*([^,]+),(.*)$/);
            if (!headerMatch) throw new Error(`无效的图案头部: ${headerLine}`);
            
            const name = headerMatch[1].trim();
            const description = headerMatch[2].trim();
            
            // 解析线定义
            const patternLines = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line || line.startsWith(';')) continue; // 跳过空行和注释
                
                const parts = line.split(',').map(p => parseFloat(p.trim()));
                if (parts.length < 5) throw new Error(`无效的线定义: ${line}`);
                
                const lineDef = {
                    angle: parts[0],
                    xOrigin: parts[1],
                    yOrigin: parts[2],
                    deltaX: parts[3],
                    deltaY: parts[4],
                    dashes: parts.slice(5) // 线型定义（可选）
                };
                patternLines.push(lineDef);
            }
            
            return { name, description, lines: patternLines };
        }
        
        /**
         * 注册自定义图案到 PatternManager
         */
        function registerCustomPatterns() {
            const patternManager = Engine.patternManager;
            
            for (const [name, patString] of Object.entries(CUSTOM_PATTERNS)) {
                const patternDef = parsePatternString(patString);
                patternManager.registerPattern(patternDef, "custom");
                console.log(`注册图案: ${name}, 包含 ${patternDef.lines.length} 条线定义`);
            }
        }
        
        /**
         * 从多段线创建填充边界
         */
        function createEdgesFromPolyline(polyline) {
            const edges = new Edges();
            const edge = new Edge();
            edge.edgeType = EdgeType.Polyline;
            edge.bulgePoints = polyline.bulgePoints.clone();
            edges.add(edge);
            return edges;
        }
        
        /**
         * 创建带自动比例的填充
         * @param {string} patternName - 图案名称
         * @param {PolylineEnt} boundary - 边界多段线
         * @param {number} color - 填充颜色
         */
        function createHatchWithAutoScale(patternName, boundary, color) {
            // 计算边界大小
            const bbox = boundary.boundingBox();
            const boundsSize = Math.max(bbox.maxX - bbox.minX, bbox.maxY - bbox.minY);
            
            // 使用 calculateHatchPatternScale 自动计算合适的比例
            const patternDef = Engine.patternManager.getPattern(patternName);
            const autoScale = calculateHatchPatternScale(boundsSize, patternName, patternDef);
            
            // 创建填充
            const hatch = new HatchEnt();
            hatch.patternName = patternName;
            hatch.patternScale = autoScale;
            hatch.setLoops(createEdgesFromPolyline(boundary));
            hatch.setDefaults();
            hatch.color = color;
            
            console.log(`图案: ${patternName}, 边界大小: ${boundsSize.toFixed(1)}, 自动比例: ${autoScale.toFixed(2)}`);
            
            return { hatch, autoScale };
        }
        
        // 注册自定义图案
        registerCustomPatterns();
        
        const entities = [];
        
        // ========== 第一行: 草坪或沼泽 ==========
        
        // 示例1: 草坪或沼泽 - 小区域
        const boundary1 = new PolylineEnt();
        boundary1.setPoints([
            [0, 0], [80, 0], [80, 60], [0, 60]
        ]);
        boundary1.isClosed = true;
        boundary1.setDefaults();
        boundary1.color = 7;
        entities.push(boundary1);
        
        const { hatch: hatch1, autoScale: scale1 } = createHatchWithAutoScale("草坪或沼泽", boundary1, 3);
        entities.push(hatch1);
        
        const label1 = new TextEnt();
        label1.insertionPoint = [0, -15];
        label1.text = `草坪或沼泽 (80x60, scale=${scale1.toFixed(1)})`;
        label1.height = 6;
        label1.setDefaults();
        label1.color = 7;
        entities.push(label1);
        
        // 示例2: 草坪或沼泽 - 大区域
        const boundary2 = new PolylineEnt();
        boundary2.setPoints([
            [100, 0], [350, 0], [350, 180], [100, 180]
        ]);
        boundary2.isClosed = true;
        boundary2.setDefaults();
        boundary2.color = 7;
        entities.push(boundary2);
        
        const { hatch: hatch2, autoScale: scale2 } = createHatchWithAutoScale("草坪或沼泽", boundary2, 3);
        entities.push(hatch2);
        
        const label2 = new TextEnt();
        label2.insertionPoint = [100, -15];
        label2.text = `草坪或沼泽 (250x180, scale=${scale2.toFixed(1)})`;
        label2.height = 6;
        label2.setDefaults();
        label2.color = 7;
        entities.push(label2);
        
        // ========== 第二行: 虚线方格 ==========
        
        // 示例3: 虚线方格 - 小区域
        const boundary3 = new PolylineEnt();
        boundary3.setPoints([
            [0, 220], [60, 220], [60, 280], [0, 280]
        ]);
        boundary3.isClosed = true;
        boundary3.setDefaults();
        boundary3.color = 7;
        entities.push(boundary3);
        
        const { hatch: hatch3, autoScale: scale3 } = createHatchWithAutoScale("虚线方格", boundary3, 5);
        entities.push(hatch3);
        
        const label3 = new TextEnt();
        label3.insertionPoint = [0, 205];
        label3.text = `虚线方格 (60x60, scale=${scale3.toFixed(1)})`;
        label3.height = 6;
        label3.setDefaults();
        label3.color = 7;
        entities.push(label3);
        
        // 示例4: 虚线方格 - 大区域
        const boundary4 = new PolylineEnt();
        boundary4.setPoints([
            [100, 220], [300, 220], [300, 400], [100, 400]
        ]);
        boundary4.isClosed = true;
        boundary4.setDefaults();
        boundary4.color = 7;
        entities.push(boundary4);
        
        const { hatch: hatch4, autoScale: scale4 } = createHatchWithAutoScale("虚线方格", boundary4, 5);
        entities.push(hatch4);
        
        const label4 = new TextEnt();
        label4.insertionPoint = [100, 205];
        label4.text = `虚线方格 (200x180, scale=${scale4.toFixed(1)})`;
        label4.height = 6;
        label4.setDefaults();
        label4.color = 7;
        entities.push(label4);
        
        // ========== 标题 ==========
        const title = new TextEnt();
        title.insertionPoint = [0, 420];
        title.text = "自定义填充图案示例 - 自动计算比例";
        title.height = 12;
        title.setDefaults();
        title.color = 2;
        entities.push(title);
        
        // 添加所有实体
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        message.info("自定义图案已注册: 草坪或沼泽, 虚线方格");
        message.info("同一图案在不同大小区域自动计算不同比例");
        
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
