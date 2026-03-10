window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --表格提取--extractTables函数从图纸中自动识别并提取表格数据
        const { MainView, initCadContainer, LineEnt, TextEnt, TextAlignmentEnum, Engine, message, extractTables } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // ==================== 第一步：绘制一个表格 ====================
        // 创建一个 3x4 的表格（3行4列）
        const tableStartX = 0;
        const tableStartY = 0;
        const cellWidth = 100;
        const cellHeight = 40;
        const rows = 3;
        const cols = 4;
        
        // 表格数据
        const tableData = [
            ['序号', '名称', '数量', '单位'],
            ['1', '钢筋', '100', '吨'],
            ['2', '混凝土', '500', '立方米']
        ];
        
        // 绘制水平线
        for (let r = 0; r <= rows; r++) {
            const y = tableStartY - r * cellHeight;
            const line = new LineEnt(
                [tableStartX, y],
                [tableStartX + cols * cellWidth, y]
            );
            line.setDefaults();
            Engine.addEntities(line);
        }
        
        // 绘制垂直线
        for (let c = 0; c <= cols; c++) {
            const x = tableStartX + c * cellWidth;
            const line = new LineEnt(
                [x, tableStartY],
                [x, tableStartY - rows * cellHeight]
            );
            line.setDefaults();
            Engine.addEntities(line);
        }
        
        // 填充文字内容
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const text = new TextEnt();
                text.text = tableData[r][c];
                // 文字位置在单元格中心
                const x = tableStartX + c * cellWidth + cellWidth / 2;
                const y = tableStartY - r * cellHeight - cellHeight / 2;
                text.insertionPoint = [x, y];
                text.height = 15;
                text.textAlignment = TextAlignmentEnum.MidCenter; // 中心对齐
                text.setDefaults();
                Engine.addEntities(text);
            }
        }
        
        // 缩放到图形范围
        Engine.zoomExtents();
        
        message.info("表格已绘制完成，准备提取...");
        
        // ==================== 第二步：使用 extractTables 提取表格数据 ====================
        // 方式1：全图提取（最简单）
        const result = extractTables();
        
        // 检查结果
        if (result.error) {
            message.error("提取失败: " + result.error);
        } else if (result.tables.length === 0) {
            message.warn("未识别到表格数据");
        } else {
            message.success(`成功识别到 ${result.tables.length} 个表格`);
            
            // 遍历每个表格
            result.tables.forEach((table, index) => {
                console.log(`=== 表格 ${index + 1} ===`);
                console.log(`行数: ${table.rowCount}, 列数: ${table.colCount}`);
                console.log(`范围: ${table.rect}`);
                
                // 打印表格数据
                console.log("表格内容:");
                for (let r = 0; r < table.rowCount; r++) {
                    const row = table.datas[r] || [];
                    console.log(`  第${r + 1}行:`, row.join(' | '));
                }
                
                // 检查合并单元格
                if (table.spans && Object.keys(table.spans).length > 0) {
                    console.log("合并单元格:", table.spans);
                }
            });
            
            // 在界面上显示提取结果
            message.info(`表格1: ${result.tables[0].rowCount}行 x ${result.tables[0].colCount}列`);
            
            // 打印第一行（表头）
            const firstTable = result.tables[0];
            if (firstTable.datas && firstTable.datas[0]) {
                message.info("表头: " + firstTable.datas[0].join(', '));
            }
        }
        
        // ==================== 更多用法示例 ====================
        
        // 方式2：指定区域提取
        // const result2 = extractTables({
        //     bounds: { minX: 0, minY: -120, maxX: 400, maxY: 0 }
        // });
        
        // 方式3：指定图层提取
        // const result3 = extractTables({
        //     layers: ['表格图层']
        // });
        
        // 方式4：完整参数
        // const result4 = extractTables({
        //     bounds: { minX: 0, minY: -200, maxX: 500, maxY: 100 },
        //     includeLine: true,
        //     includePolyline: true,
        //     includeText: true,
        //     includeMText: true,
        //     digit: 2,           // 小数精度
        //     tol: 0,             // 误差值（0为自动）
        //     tableEdgeMinPoint: 8,
        //     tableTextMinCount: 2,
        //     debug: false
        // });
        
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
