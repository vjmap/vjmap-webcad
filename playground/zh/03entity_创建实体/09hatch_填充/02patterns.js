window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --填充图案表--展示所有内置填充图案
        const { MainView, initCadContainer, HatchEnt, PolylineEnt, TextEnt, Engine, Edge, Edges, EdgeType , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 从 PatternManager 获取所有内置图案名称
        const patternManager = Engine.patternManager;
        const allPatternNames = patternManager.getAllPatternNames();
        message.info(`共有 ${allPatternNames.length} 个填充图案`);
        
        // 表格参数
        const COLS = 9;                    // 每行列数
        const CELL_WIDTH = 80;            // 单元格宽度
        const CELL_HEIGHT = 60;           // 单元格高度
        const PADDING = 10;               // 内边距
        
        /**
         * 获取图案单元大小（用于计算合适的比例）
         */
        function getPatternUnitSize(patternName) {
            const patternDef = patternManager.getPattern(patternName);
            if (patternDef && patternDef.lines && patternDef.lines.length > 0) {
                let maxDelta = 0;
                for (const line of patternDef.lines) {
                    const deltaY = Math.abs(line.deltaY || 0);
                    const deltaX = Math.abs(line.deltaX || 0);
                    if (deltaY > maxDelta) maxDelta = deltaY;
                    if (maxDelta === 0 && deltaX > 0) maxDelta = deltaX;
                }
                return maxDelta > 0 ? maxDelta : 1;
            }
            return 1;
        }
        
        /**
         * 自动计算填充比例（与 HatchCommand 中的算法一致）
         */
        function calculatePatternScale(patternName, boundsSize) {
            if (patternName === "SOLID") return 1.0;
            
            const patternUnitSize = getPatternUnitSize(patternName) * 10;
            if (patternUnitSize <= 0) return 1.0;
            
            const ratio = boundsSize / patternUnitSize;
            if (ratio <= 0) return 1.0;
            
            // 计算数量级取整
            const magnitude = Math.pow(10, Math.floor(Math.log10(ratio)));
            const scale = Math.floor(ratio / magnitude) * magnitude;
            
            return Math.max(magnitude, scale);
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
         * 创建填充单元格
         */
        function createPatternCell(patternName, col, row) {
            const entities = [];
            
            // 计算单元格位置（预留文字空间在下方）
            const x = col * (CELL_WIDTH + PADDING);
            const y = -row * (CELL_HEIGHT + PADDING + 20);
            
            // 创建边界矩形
            const boundary = new PolylineEnt();
            boundary.addVertex([x, y]);
            boundary.addVertex([x + CELL_WIDTH, y]);
            boundary.addVertex([x + CELL_WIDTH, y + CELL_HEIGHT]);
            boundary.addVertex([x, y + CELL_HEIGHT]);
            boundary.isClosed = true;
            boundary.setDefaults();
            boundary.color = 7;  // 白色边框
            entities.push(boundary);
            
            // 自动计算填充比例
            const boundsSize = Math.max(CELL_WIDTH, CELL_HEIGHT);
            const patternScale = calculatePatternScale(patternName, boundsSize);
            
            // 创建填充
            const hatch = new HatchEnt();
            hatch.patternName = patternName;
            hatch.patternScale = patternScale;
            
            // 设置边界
            const edges = createEdgesFromPolyline(boundary);
            hatch.setLoops(edges);
            
            hatch.setDefaults();
            hatch.color = patternName === "SOLID" ? 3 : 2;  // SOLID绿色，其他黄色
            entities.push(hatch);
            
            // 图案名称文字
            const nameText = new TextEnt();
            nameText.insertionPoint = [x, y - 5];
            nameText.text = patternName;
            nameText.height = 5;
            nameText.setDefaults();
            nameText.color = 7;
            entities.push(nameText);
            
            // 比例信息文字
            const scaleText = new TextEnt();
            scaleText.insertionPoint = [x, y - 12];
            scaleText.text = `Scale: ${patternScale.toFixed(2)}`;
            scaleText.height = 4;
            scaleText.setDefaults();
            scaleText.color = 8;
            entities.push(scaleText);
            
            return entities;
        }
        
        // 创建所有图案单元格
        const allEntities = [];
        let successCount = 0;
        let failedPatterns = [];
        
        for (let i = 0; i < allPatternNames.length; i++) {
            const patternName = allPatternNames[i];
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            
            try {
                const cellEntities = createPatternCell(patternName, col, row);
                allEntities.push(...cellEntities);
                successCount++;
            } catch (error) {
                console.warn(`创建图案 ${patternName} 失败:`, error);
                failedPatterns.push(patternName);
            }
        }
        
        // 添加标题
        const titleText = new TextEnt();
        titleText.insertionPoint = [0, CELL_HEIGHT + 20];
        titleText.text = `WebCAD 填充图案表 (共 ${allPatternNames.length} 种)`;
        titleText.height = 10;
        titleText.setDefaults();
        titleText.color = 2;
        allEntities.push(titleText);
        
        // 添加所有实体
        Engine.addEntities(allEntities);
        Engine.zoomExtents();
        
        // 显示信息
        message.info(`填充图案表已创建`);
        message.info(`成功: ${successCount} 个图案`);
        if (failedPatterns.length > 0) {
            message.warn(`失败: ${failedPatterns.join(", ")}`);
        }
        message.info(`表格布局: ${Math.ceil(allPatternNames.length / COLS)} 行 x ${COLS} 列`);
        
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
