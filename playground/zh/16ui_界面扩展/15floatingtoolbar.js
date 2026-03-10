window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --浮动工具栏--createFloatingToolbar 创建浮动可拖动图标工具栏
        // 支持横式/竖式布局、可选标题栏、图标命令执行、单例管理
        
        const {
            MainView, initCadContainer, Engine,
            LineEnt, CircleEnt, ArcEnt, TextEnt,
            createFloatingToolbar,
            IconRegistry, IconCategory,
            writeMessage, message
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
        
        // Pre-populate some entities so toolbar actions feel responsive
        const line = new LineEnt([0, 0], [100, 50]);
        line.setDefaults();
        line.color = 1;
        const circle = new CircleEnt([60, 60], 25);
        circle.setDefaults();
        circle.color = 3;
        Engine.addEntities([line, circle]);
        Engine.zoomExtents();
        
        // ── Helper: build icon from IconRegistry or fallback SVG ─────────────
        
        function cmdIcon(name) {
            const svg = IconRegistry.getIcon(name, IconCategory.Commands);
            if (svg) return svg;
            const letter = name.charAt(0).toUpperCase();
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#2d3748"/><text x="16" y="21" text-anchor="middle" font-size="16" fill="#58a6ff" font-family="sans-serif">${letter}</text></svg>`;
        }
        
        // ============================================================
        // 示例1：横式绘图工具栏（4列，带标题）
        // ============================================================
        
        const drawToolbar = createFloatingToolbar('draw-tools', {
            title: '绘图工具',
            columns: 4,
            iconSize: 30,
            position: { top: '80px', right: '20px' },
            items: [
                { id: 'line',     icon: cmdIcon('line'),     tooltip: '直线 (LINE)',     command: 'LINE' },
                { id: 'pline',    icon: cmdIcon('pline'),    tooltip: '多段线 (PLINE)',  command: 'PLINE' },
                { id: 'arc',      icon: cmdIcon('arc'),      tooltip: '圆弧 (ARC)',      command: 'ARC' },
                { id: 'circle',   icon: cmdIcon('circle'),   tooltip: '圆 (CIRCLE)',     command: 'CIRCLE' },
                { id: 'rectang',  icon: cmdIcon('rectang'),  tooltip: '矩形 (RECTANG)',  command: 'RECTANG' },
                { id: 'ellipse',  icon: cmdIcon('ellipse'),  tooltip: '椭圆 (ELLIPSE)',  command: 'ELLIPSE' },
                { id: 'polygon',  icon: cmdIcon('polygon'),  tooltip: '多边形 (POLYGON)', command: 'POLYGON' },
                { id: 'hatch',    icon: cmdIcon('hatch'),    tooltip: '图案填充 (HATCH)', command: 'HATCH' },
            ],
        });
        drawToolbar.show();
        
        // ============================================================
        // 示例2：竖式编辑工具栏（固定1列，无标题）
        // ============================================================
        
        const editToolbar = createFloatingToolbar('edit-tools', {
            title: '',
            columns: 1,
            iconSize: 28,
            position: { top: '80px', left: '60px' },
            items: [
                { id: 'move',    icon: cmdIcon('move'),    tooltip: '移动 (MOVE)',    command: 'MOVE' },
                { id: 'copy',    icon: cmdIcon('copy'),    tooltip: '复制 (COPY)',    command: 'COPY' },
                { id: 'rotate',  icon: cmdIcon('rotate'),  tooltip: '旋转 (ROTATE)',  command: 'ROTATE' },
                { id: 'scale',   icon: cmdIcon('scale'),   tooltip: '缩放 (SCALE)',   command: 'SCALE' },
                { id: 'mirror',  icon: cmdIcon('mirror'),  tooltip: '镜像 (MIRROR)',  command: 'MIRROR' },
                { id: 'offset',  icon: cmdIcon('offset'),  tooltip: '偏移 (OFFSET)',  command: 'OFFSET' },
                { id: 'trim',    icon: cmdIcon('trim'),    tooltip: '剪切 (TRIM)',    command: 'TRIM' },
                { id: 'extend',  icon: cmdIcon('extend'),  tooltip: '延伸 (EXTEND)',  command: 'EXTEND' },
                { id: 'fillet',  icon: cmdIcon('fillet'),   tooltip: '圆角 (FILLET)',  command: 'FILLET' },
                { id: 'explode', icon: cmdIcon('explode'),  tooltip: '分解 (EXPLODE)', command: 'EXPLODE' },
            ],
        });
        editToolbar.show();
        
        // ============================================================
        // 示例3：无标题的紧凑工具栏（2行横排）
        // ============================================================
        
        const quickToolbar = createFloatingToolbar('quick-tools', {
            rows: 2,
            iconSize: 26,
            position: { bottom: '60px', right: '20px' },
            items: [
                { id: 'undo',   icon: cmdIcon('undo'),   tooltip: '撤销 (UNDO)',   command: 'UNDO' },
                { id: 'redo',   icon: cmdIcon('redo'),   tooltip: '重做 (REDO)',   command: 'REDO' },
                { id: 'erase',  icon: cmdIcon('erase'),  tooltip: '删除 (ERASE)',  command: 'ERASE' },
                {
                    id: 'zoomext',
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
                    tooltip: '缩放全图',
                    onClick: () => { Engine.zoomExtents(); writeMessage('<br/>缩放全图'); }
                },
            ],
        });
        quickToolbar.show();
        
        // ============================================================
        // 示例4：动态添加/移除项
        // ============================================================
        
        message.info("=== 浮动工具栏 FloatingToolbar ===");
        
        setTimeout(() => {
            drawToolbar.addItem({
                id: 'spline',
                icon: cmdIcon('spline'),
                tooltip: '样条曲线 (SPLINE)',
                command: 'SPLINE',
            });
            message.info("已动态添加: 样条曲线按钮 → 绘图工具栏");
        }, 2000);
        
        setTimeout(() => {
            drawToolbar.addItem({
                id: 'text',
                icon: cmdIcon('text'),
                tooltip: '文字 (TEXT)',
                command: 'TEXT',
            });
            message.info("已动态添加: 文字按钮 → 绘图工具栏");
        }, 3000);
        
        // ============================================================
        // 示例5：单例验证 - 再次创建同 id 不会重复
        // ============================================================
        
        setTimeout(() => {
            const same = createFloatingToolbar('draw-tools', { title: '不会重建' });
            message.info(`单例验证: createFloatingToolbar('draw-tools') 返回已有实例, isVisible=${same.isVisible}`);
        }, 4000);
        
        // ============================================================
        // 使用说明
        // ============================================================
        
        message.info("\n=== 使用说明 ===");
        message.info("1. createFloatingToolbar(id, options) 创建浮动工具栏");
        message.info("2. 拖拽标题栏（或顶部拖拽条）可移动工具栏");
        message.info("3. 点击工具图标执行相应 CAD 命令");
        message.info("4. 鼠标悬停可查看工具提示");
        message.info("5. 点击 × 或调用 hide() 可关闭");
        message.info("6. 同 id 重复调用不会重建");
        
        message.info("\n=== 配置项 ===");
        message.info("title       - 标题文字（设置后显示标题栏）");
        message.info("showHeader  - 是否显示标题栏");
        message.info("columns     - 固定列数（横式布局）");
        message.info("rows        - 固定行数（列式布局）");
        message.info("iconSize    - 图标按钮尺寸(px)");
        message.info("position    - 初始位置 { top, right, bottom, left }");
        
        message.info("\n=== 管理方法 ===");
        message.info("addItem(item)            - 添加工具项");
        message.info("addItems(items)          - 批量添加");
        message.info("removeItem(id)           - 移除工具项");
        message.info("updateItem(id, updates)  - 更新工具项");
        message.info("show() / hide() / close() / destroy()");
        
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
