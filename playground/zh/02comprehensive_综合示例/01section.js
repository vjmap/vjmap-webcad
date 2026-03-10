window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --工程剖面图--根据钻孔数据自动生成CAD工程剖面图
        const { 
            MainView, initCadContainer, Engine, message,
            HatchEnt, PolylineEnt, LineEnt, TextEnt, MTextEnt, InsertEnt,
            Edge, Edges, EdgeType, TextAlignmentEnum
        } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // ============================================================
        // 岩性填充图案定义（PAT格式）
        // ============================================================
        const ROCK_PATTERNS = {
            "泥岩": `*泥岩,泥岩
        0,0,7.796048,0,1
        0,0.582781,7.546048,0,1,0.332781,-0.665563
        0,0,7.296048,0,1
        0,0.082781,7.046048,0,1,0.332781,-0.665563`,
        
            "粘土": `*粘土,粘土
        90,-6.791794,7.24581,0,0.998344,0.5,-0.5
        0,-7.540139,6.99581,0,1
        0,-7.540139,7.24581,0,1
        0,-7.540139,7.49581,0,1
        0,-7.540139,7.74581,0,1
        90,-7.290139,6.74581,0,0.998344,0.5,-0.5`,
        
            "含砾中粗砂": `*含砾中粗砂,含砾中粗砂
        0,-7.540139,7.246639,0,0.998342
        90,-6.790553,7.246639,0,1,0.499171,-0.499171
        0,-7.540139,7.74581,0,0.998342
        90,-7.289724,6.747469,0,1,0.499171,-0.499171`,
        
            "表土": `*表土,表土
        90,-7.373472,6.74581,0,0.333333`,
        
            "细粒砂岩": `*细粒砂岩,细粒砂岩
        0,-7.456805,7.74581,0,0.930782,0.333333,-0.666667
        0,-6.956805,7.245053,0,0.930782,0.333333,-0.666667`,
        
            "砂质砾岩": `*砂质砾岩,砂质砾岩
        0,-6.956175,7.079396,0,1,0.332829,-0.667171
        0,-7.373724,6.912981,0,1,0.166415,-0.833585
        90,-7.290517,6.912981,0,1,0.332829,-0.667171
        0,-7.373724,7.24581,0,1,0.166415,-0.833585
        0,-7.456931,7.579396,0,1,0.332829,-0.667171`,
        
            "粉砂岩": `*粉砂岩,粉砂岩
        0,0.166667,7.171048,0,1,0.166667,-0.833333
        90,0.333333,7.004382,0,1,0.166667,-0.833333
        0,0.166667,7.004382,0,1,0.166667,-0.833333
        90,0.166667,7.004382,0,1,0.166667,-0.833333
        0,0.583333,7.087715,0,1,0.333333,-0.666667
        0,0.083333,7.587715,0,1,0.333333,-0.666667`,
        
            "中砂岩": `*中砂岩,中砂岩
        90,-3.567313,6.887027,0,1,0.25,-0.75
        90,-3.650647,6.887027,0,1,0.25,-0.75
        90,-3.73398,6.887027,0,1,0.25,-0.75
        90,-3.067313,7.387027,0,1,0.25,-0.75
        90,-3.150647,7.387027,0,1,0.25,-0.75
        90,-3.23398,7.387027,0,1,0.25,-0.75`
        };
        
        // 岩性颜色映射
        const ROCK_COLORS = {
            "泥岩": 1,
            "粘土": 30,
            "含砾中粗砂": 2,
            "表土": 52,
            "细粒砂岩": 3,
            "砂质砾岩": 4,
            "粉砂岩": 5,
            "中砂岩": 6
        };
        
        const ROCK_NAMES = Object.keys(ROCK_PATTERNS);
        
        // ============================================================
        // 绘制参数配置
        // ============================================================
        const CONFIG = {
            columnWidth: 30,
            scaleTickLength: 20,
            scaleInterval: 100,
            textHeight: 30,
            labelTextHeight: 25,
            titleTextHeight: 60,
            frameMargin: 100,
            legendCellWidth: 60,
            legendCellHeight: 40,
            posMinX: 100
        };
        
        // ============================================================
        // PAT图案解析与注册
        // ============================================================
        function parsePatternString(patString) {
            const lines = patString.trim().split('\n');
            const headerLine = lines[0];
            const headerMatch = headerLine.match(/^\*([^,]+),(.*)$/);
            if (!headerMatch) throw new Error(`无效的图案头部: ${headerLine}`);
            
            const name = headerMatch[1].trim();
            const description = headerMatch[2].trim();
            
            const patternLines = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line || line.startsWith(';')) continue;
                
                const parts = line.split(',').map(p => parseFloat(p.trim()));
                if (parts.length < 5) throw new Error(`无效的线定义: ${line}`);
                
                patternLines.push({
                    angle: parts[0],
                    xOrigin: parts[1],
                    yOrigin: parts[2],
                    deltaX: parts[3],
                    deltaY: parts[4],
                    dashes: parts.slice(5)
                });
            }
            
            return { name, description, lines: patternLines };
        }
        
        function registerRockPatterns() {
            const patternManager = Engine.patternManager;
            for (const [name, patString] of Object.entries(ROCK_PATTERNS)) {
                const patternDef = parsePatternString(patString);
                patternManager.registerPattern(patternDef, "rock");
            }
            message.info(`已注册 ${ROCK_NAMES.length} 个岩性填充图案`);
        }
        
        // ============================================================
        // 模拟钻孔数据生成（所有钻孔岩性顺序相同，只是层数和厚度不同）
        // ============================================================
        function mockBoreholeData(rockNames, minCount) {
            // 先打乱岩性顺序（所有钻孔使用相同的顺序）
            const shuffledRocks = [...rockNames].sort(() => Math.random() - 0.5);
            
            const boreholes = [];
            const boreholeCount = minCount + Math.floor(Math.random() * minCount);
            
            for (let i = 0; i < boreholeCount; i++) {
                const item = {
                    name: `孔${i + 1}`,
                    x: 150 * (i + 1) + Math.floor(Math.random() * 100) + 1000,
                    y: 1000 + Math.floor(Math.random() * 50),
                    stratums: []
                };
                
                // 层数随机（5到岩性数量-1）
                const stratumCount = 5 + Math.floor(Math.random() * (shuffledRocks.length - 5));
                let totalThickness = 0;
                
                for (let k = 0; k < stratumCount; k++) {
                    const thickness = 20 + Math.floor(Math.random() * 60);
                    item.stratums.push({
                        name: shuffledRocks[k],  // 所有钻孔第k层用同一岩性
                        thickness: thickness
                    });
                    totalThickness += thickness;
                }
                
                item.totalThickness = totalThickness;
                boreholes.push(item);
            }
            
            return boreholes;
        }
        
        // ============================================================
        // 计算每层底部的绘图Y坐标
        // ============================================================
        function calcLayerBottoms(bh, startPointY, scaleMaxY) {
            const bottoms = [];
            let y = startPointY + scaleMaxY - bh.y;
            for (let k = 0; k < bh.stratums.length; k++) {
                y = y - bh.stratums[k].thickness;
                bottoms.push(y);
            }
            return bottoms;
        }
        
        // ============================================================
        // 创建填充边界辅助函数
        // ============================================================
        function createEdgesFromPolyline(polyline) {
            const edges = new Edges();
            const edge = new Edge();
            edge.edgeType = EdgeType.Polyline;
            edge.bulgePoints = polyline.bulgePoints.clone();
            edges.add(edge);
            return edges;
        }
        
        function createRectBoundary(x, y, width, height) {
            const boundary = new PolylineEnt();
            boundary.setPoints([
                [x, y],
                [x + width, y],
                [x + width, y + height],
                [x, y + height]
            ]);
            boundary.isClosed = true;
            boundary.setDefaults();
            return boundary;
        }
        
        // ============================================================
        // 创建孔口标签块定义（名称 + 横线 + 高程）
        // ============================================================
        function createBoreholeBlock() {
            const doc = Engine.currentDoc;
            const blockName = "BoreholeLabel";
            
            let blockDef = doc.blocks.itemByName(blockName);
            if (blockDef) return blockDef;
            
            blockDef = doc.blocks.add(blockName);
            blockDef.basePoint = [0, 0];
            
            // 名称（上方）- 高度30，基线中心对齐（Center=2，底边中心）
            const attrName = new TextEnt([0, 5], "孔", 30, 0, TextAlignmentEnum.Center);
            attrName.tag = "NAME";
            attrName.prompt = "钻孔编号";
            attrName.setDefaults();
            
            // 分隔横线（和柱状图宽度一致）
            const separatorLine = new LineEnt([-30, 0], [30, 0]);
            separatorLine.setDefaults();
            
            // 高程（下方）- 高度25，顶部中心对齐
            const attrElev = new TextEnt([0, -5], "0", 25, 0, TextAlignmentEnum.TopCenter);
            attrElev.tag = "ELEV";
            attrElev.prompt = "孔口高程";
            attrElev.setDefaults();
            
            blockDef.addEntity(attrName);
            blockDef.addEntity(separatorLine);
            blockDef.addEntity(attrElev);
            
            return blockDef;
        }
        
        // ============================================================
        // 主绘制函数
        // ============================================================
        function drawSectionDiagram() {
            const entities = [];
            
            // 1. 注册岩性图案
            registerRockPatterns();
            
            // 2. 生成模拟数据
            const boreholes = mockBoreholeData(ROCK_NAMES, 5);
            message.info(`生成 ${boreholes.length} 个钻孔数据`);
            
            // 3. 计算范围
            const minX = Math.min(...boreholes.map(d => d.x));
            const maxX = Math.max(...boreholes.map(d => d.x));
            const minY = Math.min(...boreholes.map(d => d.y));
            const maxY = Math.max(...boreholes.map(d => d.y + d.totalThickness));
            
            const scaleMinY = Math.floor(minY / CONFIG.scaleInterval) * CONFIG.scaleInterval;
            const scaleMaxY = Math.ceil(maxY / CONFIG.scaleInterval) * CONFIG.scaleInterval + CONFIG.scaleInterval;
            
            const posMinX = CONFIG.posMinX;
            const posMaxX = posMinX + (maxX - minX) + CONFIG.columnWidth + 50;
            const drawHeight = scaleMaxY - scaleMinY;
            
            const startPointX = 0;
            const startPointY = 0;
            
            // 4. 创建孔口标签块
            const boreholeBlock = createBoreholeBlock();
            
            // 5. 绘制左侧标尺
            const leftScaleLine = new LineEnt([startPointX, startPointY], [startPointX, startPointY + drawHeight]);
            leftScaleLine.setDefaults();
            leftScaleLine.color = 7;
            entities.push(leftScaleLine);
            
            for (let elev = scaleMinY; elev <= scaleMaxY; elev += CONFIG.scaleInterval) {
                const drawY = startPointY + scaleMaxY - elev;
                const tickLine = new LineEnt([startPointX, drawY], [startPointX - CONFIG.scaleTickLength, drawY]);
                tickLine.setDefaults();
                tickLine.color = 7;
                entities.push(tickLine);
                
                const label = new TextEnt();
                label.insertionPoint = [startPointX - CONFIG.scaleTickLength - 10, drawY];
                label.text = elev.toString();
                label.height = CONFIG.textHeight;
                label.textAlignment = TextAlignmentEnum.MidRight;
                label.setDefaults();
                label.color = 7;
                entities.push(label);
            }
            
            // 6. 绘制右侧标尺
            const rightScaleX = startPointX + posMaxX;
            const rightScaleLine = new LineEnt([rightScaleX, startPointY], [rightScaleX, startPointY + drawHeight]);
            rightScaleLine.setDefaults();
            rightScaleLine.color = 7;
            entities.push(rightScaleLine);
            
            for (let elev = scaleMinY; elev <= scaleMaxY; elev += CONFIG.scaleInterval) {
                const drawY = startPointY + scaleMaxY - elev;
                const tickLine = new LineEnt([rightScaleX, drawY], [rightScaleX + CONFIG.scaleTickLength, drawY]);
                tickLine.setDefaults();
                tickLine.color = 7;
                entities.push(tickLine);
                
                const label = new TextEnt();
                label.insertionPoint = [rightScaleX + CONFIG.scaleTickLength + 10, drawY];
                label.text = elev.toString();
                label.height = CONFIG.textHeight;
                label.textAlignment = TextAlignmentEnum.MidLeft;
                label.setDefaults();
                label.color = 7;
                entities.push(label);
            }
            
            // 7. 绘制底部基线
            const baseLine = new LineEnt([startPointX, startPointY], [rightScaleX, startPointY]);
            baseLine.setDefaults();
            baseLine.color = 7;
            entities.push(baseLine);
            
            // 8. 预计算所有钻孔的各层底部Y坐标
            const allLayerBottoms = boreholes.map(bh => calcLayerBottoms(bh, startPointY, scaleMaxY));
            
            // 9. 绘制各钻孔柱状图
            for (let i = 0; i < boreholes.length; i++) {
                const bh = boreholes[i];
                const x = posMinX + (bh.x - minX);
                let y = startPointY + scaleMaxY - bh.y;
                
                // 孔口标签
                const label = new InsertEnt();
                label.blockId = boreholeBlock.blockId;
                label.insertionPoint = [x + CONFIG.columnWidth / 2, y + 50];
                label.scaleFactor = 1;
                label.rotation = 0;
                label.setDefaults();
                // 不传 height，自动使用块定义中属性文字的原始高度
                label.addAttribute({ tag: "NAME", textString: bh.name });
                label.addAttribute({ tag: "ELEV", textString: bh.y.toString() });
                entities.push(label);
                
                // 绘制各地层
                for (let k = 0; k < bh.stratums.length; k++) {
                    const stratum = bh.stratums[k];
                    const y2 = y - stratum.thickness;
                    
                    const boundary = createRectBoundary(x, y2, CONFIG.columnWidth, stratum.thickness);
                    boundary.color = 7;
                    entities.push(boundary);
                    
                    const hatch = new HatchEnt();
                    hatch.patternName = stratum.name;
                    hatch.patternScale = Math.max(1, stratum.thickness / 5);
                    hatch.setLoops(createEdgesFromPolyline(boundary));
                    hatch.setDefaults();
                    hatch.color = ROCK_COLORS[stratum.name] || 7;
                    entities.push(hatch);
                    
                    y = y2;
                }
                
                // 底部深度标注
                const depthLabel = new TextEnt();
                depthLabel.insertionPoint = [x + CONFIG.columnWidth / 2, y - 20];
                depthLabel.text = bh.totalThickness.toString();
                depthLabel.height = CONFIG.labelTextHeight;
                depthLabel.textAlignment = TextAlignmentEnum.TopCenter;
                depthLabel.setDefaults();
                depthLabel.color = 7;
                entities.push(depthLabel);
                
                // 水平间距标注
                if (i < boreholes.length - 1) {
                    const nextBh = boreholes[i + 1];
                    const nextX = posMinX + (nextBh.x - minX);
                    
                    const leftVLine = new LineEnt([x, startPointY], [x, startPointY - 30]);
                    leftVLine.setDefaults();
                    leftVLine.color = 7;
                    entities.push(leftVLine);
                    
                    const rightVLine = new LineEnt([nextX, startPointY], [nextX, startPointY - 30]);
                    rightVLine.setDefaults();
                    rightVLine.color = 7;
                    entities.push(rightVLine);
                    
                    const horizLine = new LineEnt([x, startPointY - 30], [nextX, startPointY - 30]);
                    horizLine.setDefaults();
                    horizLine.color = 7;
                    entities.push(horizLine);
                    
                    const distLabel = new TextEnt();
                    distLabel.insertionPoint = [(x + nextX) / 2, startPointY - 15];
                    distLabel.text = (nextBh.x - bh.x).toString();
                    distLabel.height = CONFIG.labelTextHeight;
                    distLabel.textAlignment = TextAlignmentEnum.MidCenter;
                    distLabel.setDefaults();
                    distLabel.color = 7;
                    entities.push(distLabel);
                }
            }
            
            // 10. 绘制地层连线（按层序号连接 + Y坐标单调性检查避免交叉）
            for (let i = 0; i < boreholes.length - 1; i++) {
                const bh = boreholes[i];
                const nextBh = boreholes[i + 1];
                const x = posMinX + (bh.x - minX);
                const nextX = posMinX + (nextBh.x - minX);
                
                const layerBottoms = allLayerBottoms[i];
                const nextLayerBottoms = allLayerBottoms[i + 1];
                
                // 记录上次连接的Y坐标（Y从上往下递减）
                let lastConnectedNextY = Infinity;
                
                // 遍历当前钻孔的每一层
                for (let k = 0; k < bh.stratums.length; k++) {
                    // 只有当下一个钻孔也有这个层序号时才考虑连线
                    if (k < nextBh.stratums.length) {
                        const y1 = layerBottoms[k];
                        const y2 = nextLayerBottoms[k];
                        
                        // 只有当Y坐标单调递减时才连线（避免交叉）
                        if (y2 < lastConnectedNextY) {
                            const connLine = new LineEnt(
                                [x + CONFIG.columnWidth, y1],
                                [nextX, y2]
                            );
                            connLine.setDefaults();
                            connLine.color = 7;
                            entities.push(connLine);
                            
                            lastConnectedNextY = y2;
                        }
                    }
                }
            }
            
            // ============================================================
            // 布局计算：先计算各区域尺寸，再确定图框范围
            // ============================================================
            
            // 标题栏尺寸
            const tbCellW = 120;
            const tbCellH = 35;
            const titleBlockWidth = tbCellW * 4;
            const titleBlockHeight = tbCellH * 7;
            
            // 图例区域尺寸计算（根据剩余空间调整列数）
            const cellW = CONFIG.legendCellWidth;
            const cellH = CONFIG.legendCellHeight;
            const cellSpacingX = 120; // 列间距（包含标签文字宽度）
            const cellSpacingY = 20; // 行间距
            
            // 计算可用宽度后确定图例列数
            const availableWidth = (rightScaleX + 100) - titleBlockWidth - 100; // 减去标题栏和间距
            const maxLegendCols = Math.max(2, Math.floor(availableWidth / (cellW + cellSpacingX)));
            const legendCols = Math.min(maxLegendCols, ROCK_NAMES.length);
            const legendRows = Math.ceil(ROCK_NAMES.length / legendCols);
            const legendWidth = legendCols * (cellW + cellSpacingX);
            const legendHeight = legendRows * (cellH + cellSpacingY) + 60; // 包含标题
            
            // 底部区域总高度（图例和标题栏并排，取较高者）
            const bottomAreaHeight = Math.max(legendHeight, titleBlockHeight) + 100;
            
            // 图框范围（考虑标尺标签文字宽度，约4位数字 * 字高 * 0.6）
            const scaleLabelWidth = CONFIG.textHeight * 4 * 0.6 + CONFIG.scaleTickLength + 30;
            const frameMinX = startPointX - scaleLabelWidth - 50;
            const frameMaxX = rightScaleX + scaleLabelWidth + 50;
            const frameMinY = startPointY - bottomAreaHeight - 80; // 底部留出空间
            const frameMaxY = drawHeight + CONFIG.frameMargin + 100;
            
            // 底部水平间距标签
            const scaleLabel = new TextEnt();
            scaleLabel.insertionPoint = [posMinX, startPointY - 60];
            scaleLabel.text = "水平间距(m)";
            scaleLabel.height = CONFIG.labelTextHeight;
            scaleLabel.textAlignment = TextAlignmentEnum.Left;
            scaleLabel.setDefaults();
            scaleLabel.color = 7;
            entities.push(scaleLabel);
            
            // 11. 绘制图框
            const innerFrame = new PolylineEnt();
            innerFrame.setPoints([
                [frameMinX, frameMinY],
                [frameMaxX, frameMinY],
                [frameMaxX, frameMaxY],
                [frameMinX, frameMaxY]
            ]);
            innerFrame.isClosed = true;
            innerFrame.setDefaults();
            innerFrame.color = 7;
            entities.push(innerFrame);
            
            const outerFrame = new PolylineEnt();
            const outerMargin = 20;
            outerFrame.setPoints([
                [frameMinX - outerMargin, frameMinY - outerMargin],
                [frameMaxX + outerMargin, frameMinY - outerMargin],
                [frameMaxX + outerMargin, frameMaxY + outerMargin],
                [frameMinX - outerMargin, frameMaxY + outerMargin]
            ]);
            outerFrame.isClosed = true;
            outerFrame.setDefaults();
            outerFrame.color = 7;
            outerFrame.lineWeight = 50;
            entities.push(outerFrame);
            
            // 标题
            const title = new TextEnt();
            title.insertionPoint = [(frameMinX + frameMaxX) / 2, frameMaxY - 30];
            title.text = `剖面图${Date.now()}`;
            title.height = CONFIG.titleTextHeight;
            title.textAlignment = TextAlignmentEnum.MidCenter;
            title.setDefaults();
            title.color = 4;
            entities.push(title);
            
            // 12. 绘制图例说明（左下角）
            const legendStartX = frameMinX + 50;
            const legendStartY = frameMinY + bottomAreaHeight - 30;
            
            const legendTitle = new TextEnt();
            legendTitle.insertionPoint = [legendStartX, legendStartY + 30];
            legendTitle.text = "图例说明";
            legendTitle.height = CONFIG.labelTextHeight;
            legendTitle.textAlignment = TextAlignmentEnum.Left;
            legendTitle.setDefaults();
            legendTitle.color = 7;
            entities.push(legendTitle);
            
            ROCK_NAMES.forEach((name, idx) => {
                const col = idx % legendCols;
                const row = Math.floor(idx / legendCols);
                const lx = legendStartX + col * (cellW + cellSpacingX);
                const ly = legendStartY - row * (cellH + cellSpacingY);
                
                const boundary = createRectBoundary(lx, ly - cellH, cellW, cellH);
                boundary.color = 7;
                entities.push(boundary);
                
                const hatch = new HatchEnt();
                hatch.patternName = name;
                hatch.patternScale = 3;
                hatch.setLoops(createEdgesFromPolyline(boundary));
                hatch.setDefaults();
                hatch.color = ROCK_COLORS[name] || 7;
                entities.push(hatch);
                
                const labelText = new TextEnt();
                labelText.insertionPoint = [lx + cellW + 10, ly - cellH / 2];
                labelText.text = name;
                labelText.height = CONFIG.labelTextHeight - 5;
                labelText.textAlignment = TextAlignmentEnum.MidLeft;
                labelText.setDefaults();
                labelText.color = 7;
                entities.push(labelText);
            });
            
            // 13. 绘制标题栏表格（右下角，确保与图例不重叠）
            const legendEndX = legendStartX + legendWidth;
            const titleBlockX = Math.max(legendEndX + 50, frameMaxX - titleBlockWidth - 50);
            const titleBlockY = frameMinY + titleBlockHeight + 30;
            
            // 标题栏数据：{ text, col, colSpan, fontSize, color }
            const titleRows = [
                [
                    { text: "单位", col: 0, colSpan: 1 },
                    { text: "唯杰地图VJMAP", col: 1, colSpan: 3, fontSize: 22, color: 4 }
                ],
                [
                    { text: "图名", col: 0, colSpan: 1 },
                    { text: "剖面图", col: 1, colSpan: 3, fontSize: 22, color: 4 }
                ],
                [
                    { text: "拟编", col: 0 }, { text: "张三", col: 1 },
                    { text: "顺序号", col: 2 }, { text: "1", col: 3 }
                ],
                [
                    { text: "制图", col: 0 }, { text: "李四", col: 1 },
                    { text: "图 号", col: 2 }, { text: "1", col: 3 }
                ],
                [
                    { text: "审核", col: 0 }, { text: "王五", col: 1 },
                    { text: "比例尺", col: 2 }, { text: "水平1:300\n垂直1:200", col: 3, fontSize: 12 }
                ],
                [
                    { text: "技术负责人", col: 0 }, { text: "李六", col: 1 },
                    { text: "日 期", col: 2 }, { text: new Date().toLocaleDateString(), col: 3 }
                ],
                [
                    { text: "项目负责人", col: 0 }, { text: "刘七", col: 1 },
                    { text: "资料来源", col: 2 }, { text: "**", col: 3 }
                ]
            ];
            
            for (let row = 0; row < titleRows.length; row++) {
                const rowY = titleBlockY - row * tbCellH;
                
                for (const cellData of titleRows[row]) {
                    const colSpan = cellData.colSpan || 1;
                    const cellX = titleBlockX + cellData.col * tbCellW;
                    const cellWidth = tbCellW * colSpan;
                    
                    // 绘制单元格边框
                    const cell = createRectBoundary(cellX, rowY - tbCellH, cellWidth, tbCellH);
                    cell.color = 7;
                    entities.push(cell);
                    
                    // 绘制文字（包含换行符时使用多行文字）
                    if (cellData.text) {
                        const cellLabel = cellData.text.includes('\n') ? new MTextEnt() : new TextEnt();
                        cellLabel.insertionPoint = [cellX + cellWidth / 2, rowY - tbCellH / 2];
                        cellLabel.text = cellData.text;
                        cellLabel.height = cellData.fontSize || 16;
                        if (cellLabel instanceof MTextEnt) {
                            cellLabel.textAttachment = 5; // MiddleCenter
                        } else {
                            cellLabel.textAlignment = TextAlignmentEnum.MidCenter;
                        }
                        cellLabel.setDefaults();
                        cellLabel.color = cellData.color || 7;
                        entities.push(cellLabel);
                    }
                }
            }
            
            // 添加所有实体
            Engine.addEntities(entities);
            Engine.zoomExtents();
            
            message.info("工程剖面图绘制完成");
            message.info(`包含 ${entities.length} 个实体`);
        }
        
        // 执行绘制
        drawSectionDiagram();
        
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
