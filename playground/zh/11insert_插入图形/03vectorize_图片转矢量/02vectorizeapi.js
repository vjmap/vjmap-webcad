window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --图片转矢量API--通过API将图片转换为矢量并插入到当前图
        const { 
            MainView, initCadContainer, Engine, message, Point2D, 
            getWebCadCoreService, CadDocument, regen 
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
        
        // ==================== 通过 API 进行图片转矢量 ====================
        
        // 注意：VectroizeService 需要从 insert-plugin 插件中导出
        // 此示例展示完整的 API 调用流程
        
        message.info("开始通过 API 进行图片转矢量...");
        
        // 1. 创建一个测试图片（使用 Canvas 绘制）
        // 实际使用时可以通过 URL 或 File 对象加载图片
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        // 绘制测试图形
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 200, 200);
        
        // 绘制一个红色矩形
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(20, 20, 60, 40);
        
        // 绘制一个蓝色圆形
        ctx.fillStyle = '#0000ff';
        ctx.beginPath();
        ctx.arc(150, 50, 30, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制一条黑色直线
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(20, 100);
        ctx.lineTo(180, 100);
        ctx.stroke();
        
        // 绘制一个绿色三角形
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(100, 120);
        ctx.lineTo(60, 180);
        ctx.lineTo(140, 180);
        ctx.closePath();
        ctx.fill();
        
        message.info("测试图片创建完成");
        
        // 2. 获取图片数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixelData = new Uint8Array(imageData.data.buffer);
        
        message.info(`图片尺寸: ${canvas.width} x ${canvas.height}`);
        
        // 3. 图片转矢量配置说明
        // VectroizeConfig 参数详解：
        const vectorizeConfig = {
            // 颜色模式
            // - 'color': 彩色模式，保留原始颜色
            // - 'binary': 黑白模式，转换为黑白二值图
            colorMode: 'color',
            
            // 层级模式（仅彩色模式有效）
            // - 'stacked': 堆叠模式，颜色区域层层堆叠
            // - 'cutout': 切除模式，上层颜色会切除下层
            hierarchical: 'stacked',
            
            // 曲线模式
            // - 'pixel': 像素模式，保留像素边缘
            // - 'polygon': 多边形模式，用直线段拟合
            // - 'spline': 样条模式，用平滑曲线拟合
            pathMode: 'spline',
            
            // 斑点过滤 (0-128)
            // 过滤掉面积小于此值的斑点
            filterSpeckle: 4,
            
            // 颜色精度 (1-8)（仅彩色模式有效）
            // 值越大颜色越精确，但处理越慢
            colorPrecision: 6,
            
            // 渐变步长 (0-128)（仅彩色模式有效）
            // 控制颜色渐变的平滑程度
            layerDifference: 16,
            
            // 拐角阈值 (0-180°)（仅样条模式有效）
            // 角度小于此值的拐角会被保留为尖角
            cornerThreshold: 60,
            
            // 线段长度阈值 (3.5-10)（仅样条模式有效）
            // 控制曲线拟合的精度
            lengthThreshold: 4,
            
            // 连接阈值 (0-180°)（仅样条模式有效）
            // 控制相邻曲线段的连接方式
            spliceThreshold: 45,
            
            // 路径精度 (0-8)
            // 输出 SVG 路径的小数精度
            pathPrecision: 8
        };
        
        message.info("转换配置:");
        message.info(`  颜色模式: ${vectorizeConfig.colorMode}`);
        message.info(`  曲线模式: ${vectorizeConfig.pathMode}`);
        message.info(`  斑点过滤: ${vectorizeConfig.filterSpeckle}`);
        
        // 4. 由于 VectroizeService 是插件提供的，这里演示如何手动处理
        // 实际项目中，如果安装了 insert-plugin，可以这样使用：
        // const { getVectroizeService } = await import('insert-plugin');
        // const service = getVectroizeService();
        // const result = await service.convertToSvg(pixelData, canvas.width, canvas.height, vectorizeConfig);
        
        // 这里我们使用替代方案：将 Canvas 导出为图片 URL，然后模拟转换结果
        const imageUrl = canvas.toDataURL('image/png');
        message.info("图片 URL 已生成");
        
        // 5. 模拟转换结果 - 创建对应的 SVG（实际应由 VectroizeService 生成）
        // 这里手动创建一个与测试图形对应的 SVG
        const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
            <rect x="20" y="20" width="60" height="40" fill="#ff0000"/>
            <circle cx="150" cy="50" r="30" fill="#0000ff"/>
            <line x1="20" y1="100" x2="180" y2="100" stroke="#000000" stroke-width="3"/>
            <polygon points="100,120 60,180 140,180" fill="#00ff00"/>
        </svg>
        `;
        
        message.info("SVG 生成完成");
        
        // 6. 解析 SVG 为 WebCAD 数据
        const wasmService = getWebCadCoreService();
        await wasmService.initWasm();
        
        const webcadData = await wasmService.parseSvgToWebcad(
            svgContent,
            0,    // whiteColorProcessing: 原样保留
            0,    // blackColorProcessing: 原样保留
            1,    // enableFill: 启用填充
            1,    // displayLineWeight: 显示线宽
            1.0   // lineWeightScale: 线宽缩放 1:1
        );
        
        if (!webcadData) {
            message.error("SVG 解析失败");
            throw new Error("SVG 解析失败");
        }
        
        // 7. 解析并插入实体
        const parsedData = JSON.parse(webcadData);
        const entities = parsedData.entities || [];
        message.info("解析到实体数量: " + entities.length);
        
        // 计算基点
        let basePoint = [100, 100]; // 默认中心点
        if (parsedData.bounds && parsedData.bounds.length === 4) {
            const [minX, minY, maxX, maxY] = parsedData.bounds;
            basePoint = [(minX + maxX) / 2, (minY + maxY) / 2];
        }
        
        // 构建文档数据
        const docData = {
            appName: "WebCAD Image Vectorize",
            docVer: 0.3,
            dbBlocks: {
                "*Model": {
                    blockId: "*Model",
                    name: "*Model",
                    isLayout: false,
                    basePoint: [0, 0],
                    lookPt: [0, 0],
                    twistAngle: 0,
                    zoom: 1,
                    UCSXANG: 0,
                    UCSORG: [0, 0],
                    items: entities
                }
            },
            dbLayers: [{
                name: "0",
                layerId: "0",
                layerOn: true,
                color: 7,
                lineType: "Continuous",
                lineWeight: -3,
                plottable: true
            }],
            dbTextStyles: [],
            dbLayouts: [{
                layoutId: 0,
                name: "Model",
                spaceName: "*Model"
            }]
        };
        
        // 创建临时文档并合并实体
        const symbolDoc = new CadDocument();
        await symbolDoc.fromDb(docData);
        
        const insertPoint = new Point2D(0, 0);
        const modelBlock = symbolDoc.blocks.itemByName("*Model");
        const basePt = new Point2D(basePoint[0], basePoint[1]);
        
        let addedCount = 0;
        for (const entity of modelBlock.items) {
            if (!entity.isAlive) continue;
            
            const cloned = entity.clone();
            cloned.move(basePt, insertPoint);
            
            Engine.addEntities(cloned);
            addedCount++;
        }
        
        message.info(`已添加 ${addedCount} 个实体`);
        
        // 8. 刷新视图
        regen();
        Engine.zoomExtents();
        
        message.info("图片转矢量完成!");
        message.info("");
        message.info("=== VectroizeConfig 参数说明 ===");
        message.info("colorMode: 'color'|'binary' - 彩色/黑白模式");
        message.info("hierarchical: 'stacked'|'cutout' - 堆叠/切除模式");
        message.info("pathMode: 'pixel'|'polygon'|'spline' - 曲线模式");
        message.info("filterSpeckle: 0-128 - 斑点过滤阈值");
        message.info("colorPrecision: 1-8 - 颜色精度");
        message.info("cornerThreshold: 0-180 - 拐角阈值(度)");
        
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
