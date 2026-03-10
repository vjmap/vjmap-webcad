window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --导出为PNG图片--EXPORTPNG命令将图纸导出为PNG图片
        const {
            MainView, initCadContainer, Engine,
            LineEnt, CircleEnt, Point2D,
            exportEntitiesToImageAndDownload, exportEntitiesToImage,
            createFloatingToolbar, writeMessage, message
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
        
        // 创建示例实体
        const line1 = new LineEnt(new Point2D(0, 0), new Point2D(200, 0));
        const line2 = new LineEnt(new Point2D(200, 0), new Point2D(200, 150));
        const line3 = new LineEnt(new Point2D(200, 150), new Point2D(0, 150));
        const line4 = new LineEnt(new Point2D(0, 150), new Point2D(0, 0));
        const circle = new CircleEnt(new Point2D(100, 75), 50);
        const diag1 = new LineEnt(new Point2D(0, 0), new Point2D(200, 150));
        const diag2 = new LineEnt(new Point2D(200, 0), new Point2D(0, 150));
        
        diag1.color = 1;
        diag2.color = 1;
        const entities = [line1, line2, line3, line4, circle, diag1, diag2];
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        // SVG 图标
        const svgIcon = (letter, color = '#58a6ff') =>
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#2d3748"/><text x="16" y="21" text-anchor="middle" font-size="14" fill="${color}" font-family="sans-serif" font-weight="bold">${letter}</text></svg>`;
        
        // 创建导出工具栏
        const toolbar = createFloatingToolbar('export-png', {
            title: '导出 PNG',
            columns: 2,
            iconSize: 36,
            position: { top: '80px', left: '20px' },
            items: [
                {
                    id: 'dialog',
                    icon: svgIcon('⚙', '#f0a500'),
                    tooltip: '打开导出对话框 (EXPORTPNG)',
                    onClick: async () => {
                        writeMessage('<br/>打开导出对话框...');
                        await Engine.editor.executerWithOp('EXPORTPNG');
                    },
                },
                {
                    id: 'transparent',
                    icon: svgIcon('T', '#34d399'),
                    tooltip: '透明背景 PNG (默认)',
                    onClick: async () => {
                        writeMessage('<br/>导出透明背景 PNG...');
                        const ok = await exportEntitiesToImageAndDownload({
                            width: 2048,
                            fileName: 'webcad-transparent.png',
                        });
                        writeMessage(ok ? '<br/>透明背景导出成功!' : '<br/>导出失败');
                    },
                },
                {
                    id: 'light',
                    icon: svgIcon('W', '#e8eaed'),
                    tooltip: '白色背景 PNG',
                    onClick: async () => {
                        writeMessage('<br/>导出白色背景 PNG...');
                        const ok = await exportEntitiesToImageAndDownload({
                            width: 1920,
                            transparent: false,
                            theme: 'light',
                            fileName: 'webcad-light.png',
                        });
                        writeMessage(ok ? '<br/>白色背景导出成功!' : '<br/>导出失败');
                    },
                },
                {
                    id: 'dark',
                    icon: svgIcon('B', '#6b7280'),
                    tooltip: '黑色背景 PNG',
                    onClick: async () => {
                        writeMessage('<br/>导出黑色背景 PNG...');
                        const ok = await exportEntitiesToImageAndDownload({
                            width: 1920,
                            transparent: false,
                            theme: 'dark',
                            fileName: 'webcad-dark.png',
                        });
                        writeMessage(ok ? '<br/>黑色背景导出成功!' : '<br/>导出失败');
                    },
                },
                {
                    id: 'partial',
                    icon: svgIcon('P', '#a78bfa'),
                    tooltip: '只导出圆和对角线 (透明)',
                    onClick: async () => {
                        writeMessage('<br/>导出部分实体...');
                        const ok = await exportEntitiesToImageAndDownload({
                            entities: [circle, diag1, diag2],
                            width: 1280,
                            fileName: 'webcad-partial.png',
                        });
                        writeMessage(ok ? '<br/>部分实体导出成功!' : '<br/>导出失败');
                    },
                },
                {
                    id: 'blob',
                    icon: svgIcon('R', '#38bdf8'),
                    tooltip: '获取 Blob (不下载)',
                    onClick: async () => {
                        writeMessage('<br/>获取 Blob...');
                        const result = await exportEntitiesToImage({ width: 800 });
                        if (result.success && result.blob) {
                            writeMessage(`<br/>Blob 大小: ${(result.blob.size / 1024).toFixed(1)} KB`);
                        } else {
                            writeMessage('<br/>获取 Blob 失败');
                        }
                    },
                },
                {
                    id: 'jpeg',
                    icon: svgIcon('J', '#fb923c'),
                    tooltip: '导出 JPEG (白色背景)',
                    onClick: async () => {
                        writeMessage('<br/>导出 JPEG...');
                        const ok = await exportEntitiesToImageAndDownload({
                            width: 1920,
                            theme: 'light',
                            mimeType: 'image/jpeg',
                            quality: 0.9,
                            fileName: 'webcad-export.jpg',
                        });
                        writeMessage(ok ? '<br/>JPEG 导出成功!' : '<br/>JPEG 导出失败');
                    },
                },
            ],
        });
        toolbar.show();
        
        message.info("=== 导出为 PNG 图片示例 ===");
        message.info(`已创建 ${entities.length} 个实体，点击右上角工具栏按钮进行导出`);
        message.info("");
        message.info("工具栏按钮说明：");
        message.info("  ⚙  打开导出对话框（可自定义所有参数）");
        message.info("  T  透明背景 PNG（默认导出方式）");
        message.info("  W  白色背景 PNG");
        message.info("  B  黑色背景 PNG");
        message.info("  P  只导出部分实体（圆和对角线）");
        message.info("  R  获取 Blob 对象（不下载，可用于上传）");
        message.info("  J  导出 JPEG 格式");
        message.info("");
        message.info("API 参数说明：");
        message.info("  entities    - 实体数组 (默认全部)");
        message.info("  width       - 图片宽度（像素），渲染上限 4096px");
        message.info("  height      - 图片高度（省略时按实体宽高比自动计算）");
        message.info("  transparent - 透明背景 (默认 true，仅 PNG 有效)");
        message.info("  theme       - 'light' 白底 / 'dark' 黑底（非透明时使用）");
        message.info("  fileName    - 下载文件名");
        message.info("  mimeType    - 'image/png' 或 'image/jpeg'");
        message.info("  quality     - JPEG 质量 (0-1)");
        
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
