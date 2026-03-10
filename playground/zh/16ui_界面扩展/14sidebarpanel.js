window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --侧边栏面板--registerSidebarPanel 用法
        // 使用 SidebarPanelManager 和 BasePanelComponent 创建自定义侧边栏面板
        // 支持注册到左侧或右侧侧边栏，并与系统面板无缝集成
        
        const { 
            MainView, initCadContainer, Engine, 
            LineEnt, CircleEnt, TextEnt, Point2D,
            LitElement, html, css,
            BasePanelComponent,
            SidebarPanelManager,
            registerSidebarPanel,
            unregisterSidebarPanel,
            activateSidebarPanel,
            ssGetFirst,
            writeMessage, message
        } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "right", // 显示两侧侧边栏
            autoActivatePropertyPanel: false, // 选择实体时不自动切换到特性面板
            // excludedPanelsFromAutoActivate: ["draw-tools"], // 或者: 仅在绘图工具面板激活时不切换到特性面板
            // 配置内置面板位置
            // 可用面板名称: "props"(特性), "blocks"(块), "images"(图像),
            //             "dsettings"(捕捉), "commands"(命令), "alias"(别名)
            leftPanels: ["props", "dsettings"],  // 左侧：特性、捕捉设置
            rightPanels: ["blocks", "images", "commands", "alias"],  // 右侧：块、图像、命令、别名
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建一些初始实体
        const line = new LineEnt([0, 0], [100, 50]);
        line.setDefaults();
        line.color = 1;
        
        const circle = new CircleEnt([60, 60], 25);
        circle.setDefaults();
        circle.color = 3;
        
        Engine.addEntities([line, circle]);
        Engine.zoomExtents();
        
        message.info("=== 侧边栏面板二次开发 ===");
        
        // ============================================================
        // 示例1：简单的绘图工具面板（左侧）
        // ============================================================
        
        /**
         * 自定义绘图工具面板
         * 继承 BasePanelComponent，注册到左侧侧边栏
         */
        class DrawToolsPanel extends BasePanelComponent {
            // 合并基类样式
            static styles = [
                BasePanelComponent.baseStyles,
                css`
                    .tool-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 8px;
                        margin-bottom: 16px;
                    }
                    .color-preview {
                        width: 20px;
                        height: 20px;
                        border-radius: 4px;
                        border: 1px solid #555;
                        margin-right: 8px;
                    }
                    .stat-item {
                        display: flex;
                        justify-content: space-between;
                        padding: 6px 0;
                        border-bottom: 1px dashed #3d4a5c;
                    }
                    .stat-value {
                        color: #58a6ff;
                        font-weight: 500;
                    }
                `
            ];
        
            static properties = {
                entityCount: { type: Number },
                currentColor: { type: Number }
            };
        
            constructor() {
                super();
                this.entityCount = 0;
                this.currentColor = 1;
            }
        
            connectedCallback() {
                super.connectedCallback();
                // 延迟刷新，确保 Engine 已准备好
                setTimeout(() => this.refreshStats(), 100);
            }
        
            refreshStats() {
                const entities = Engine.currentSpace?.items || [];
                this.entityCount = entities.length;
            }
        
            drawLine() {
                const x1 = Math.random() * 100;
                const y1 = Math.random() * 100;
                const x2 = x1 + Math.random() * 50;
                const y2 = y1 + Math.random() * 50;
                
                const line = new LineEnt([x1, y1], [x2, y2]);
                line.setDefaults();
                line.color = this.currentColor;
                Engine.addEntities(line);
                Engine.zoomExtents();
                this.refreshStats();
                writeMessage(`<br/>绘制直线: (${x1.toFixed(1)}, ${y1.toFixed(1)}) → (${x2.toFixed(1)}, ${y2.toFixed(1)})`);
            }
        
            drawCircle() {
                const cx = Math.random() * 100;
                const cy = Math.random() * 100;
                const r = Math.random() * 20 + 10;
                
                const circle = new CircleEnt([cx, cy], r);
                circle.setDefaults();
                circle.color = this.currentColor;
                Engine.addEntities(circle);
                Engine.zoomExtents();
                this.refreshStats();
                writeMessage(`<br/>绘制圆: 圆心(${cx.toFixed(1)}, ${cy.toFixed(1)}), 半径=${r.toFixed(1)}`);
            }
        
            drawText() {
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                
                const text = new TextEnt();
                text.position = [x, y];
                text.text = `文字 ${Date.now() % 1000}`;
                text.height = 5;
                text.setDefaults();
                text.color = this.currentColor;
                Engine.addEntities(text);
                Engine.zoomExtents();
                this.refreshStats();
                writeMessage(`<br/>绘制文字: 位置(${x.toFixed(1)}, ${y.toFixed(1)})`);
            }
        
            setColor(color) {
                this.currentColor = color;
                writeMessage(`<br/>当前颜色设置为: ${color}`);
            }
        
            zoomExtents() {
                Engine.zoomExtents();
                writeMessage("<br/>缩放至全图");
            }
        
            render() {
                return html`
                    <div class="panel-content">
                        <div class="panel-section">
                            <div class="panel-section-title">绘图工具</div>
                            <div class="tool-grid">
                                <button class="panel-btn" @click=${this.drawLine}>画直线</button>
                                <button class="panel-btn" @click=${this.drawCircle}>画圆</button>
                                <button class="panel-btn" @click=${this.drawText}>画文字</button>
                                <button class="panel-btn" @click=${this.zoomExtents}>缩放全图</button>
                            </div>
                        </div>
        
                        <div class="panel-section">
                            <div class="panel-section-title">颜色选择</div>
                            <div class="panel-row">
                                <span class="panel-label">当前颜色:</span>
                                <div style="display: flex; gap: 4px; margin-left: auto;">
                                    ${[1, 2, 3, 4, 5, 6, 7].map(c => html`
                                        <div 
                                            class="color-preview" 
                                            style="background: ${this.getColorHex(c)}; cursor: pointer; ${this.currentColor === c ? 'border: 2px solid #fff;' : ''}"
                                            @click=${() => this.setColor(c)}
                                            title="颜色 ${c}">
                                        </div>
                                    `)}
                                </div>
                            </div>
                        </div>
        
                        <div class="panel-section">
                            <div class="panel-section-title">统计信息</div>
                            <div class="stat-item">
                                <span>实体总数</span>
                                <span class="stat-value">${this.entityCount}</span>
                            </div>
                            <button class="panel-btn" style="width: 100%; margin-top: 8px;" @click=${this.refreshStats}>
                                刷新统计
                            </button>
                        </div>
                    </div>
                `;
            }
        
            getColorHex(colorIndex) {
                const colors = {
                    1: '#ff0000', // Red
                    2: '#ffff00', // Yellow
                    3: '#00ff00', // Green
                    4: '#00ffff', // Cyan
                    5: '#0000ff', // Blue
                    6: '#ff00ff', // Magenta
                    7: '#ffffff'  // White
                };
                return colors[colorIndex] || '#ffffff';
            }
        }
        
        // ============================================================
        // 示例2：实体信息面板（右侧）
        // ============================================================
        
        /**
         * 实体信息面板
         * 显示选中实体的详细信息
         */
        class EntityInfoPanel extends BasePanelComponent {
            static styles = [
                BasePanelComponent.baseStyles,
                css`
                    .info-card {
                        background: var(--tmc-dark1, #1a242e);
                        border-radius: 6px;
                        padding: 12px;
                        margin-bottom: 12px;
                    }
                    .info-title {
                        font-size: 14px;
                        font-weight: 600;
                        color: #58a6ff;
                        margin-bottom: 8px;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 4px 0;
                        font-size: 12px;
                    }
                    .info-label {
                        color: #8b949e;
                    }
                    .info-value {
                        color: #e6edf3;
                    }
                    .empty-state {
                        text-align: center;
                        padding: 40px 20px;
                        color: #8b949e;
                    }
                    .empty-icon {
                        font-size: 48px;
                        margin-bottom: 12px;
                    }
                `
            ];
        
            static properties = {
                selectedEntities: { type: Array },
                lastUpdate: { type: String }
            };
        
            constructor() {
                super();
                this.selectedEntities = [];
                this.lastUpdate = '-';
            }
        
            connectedCallback() {
                super.connectedCallback();
                // 延迟刷新，确保 Engine 已准备好
                setTimeout(() => this.refreshInfo(), 100);
            }
        
            refreshInfo() {
                // 获取当前选择集（预选实体）
                const ss = ssGetFirst();
                this.selectedEntities = ss || [];
                this.lastUpdate = new Date().toLocaleTimeString();
                
                if (this.selectedEntities.length > 0) {
                    writeMessage(`<br/>选中 ${this.selectedEntities.length} 个实体`);
                }
            }
        
            getEntityTypeName(entity) {
                if (!entity) return '未知';
                const type = entity.dxfName || entity.constructor?.name || '未知';
                const typeMap = {
                    'LINE': '直线',
                    'CIRCLE': '圆',
                    'ARC': '圆弧',
                    'POLYLINE': '多段线',
                    'LWPOLYLINE': '多段线',
                    'TEXT': '文字',
                    'MTEXT': '多行文字',
                    'INSERT': '块参照',
                    'HATCH': '填充',
                    'DIMENSION': '标注',
                    'ELLIPSE': '椭圆'
                };
                return typeMap[type] || type;
            }
        
            render() {
                return html`
                    <div class="panel-content">
                        <div class="panel-section">
                            <div class="panel-section-title">选择信息</div>
                            <div class="panel-row">
                                <span class="panel-label">选中数量:</span>
                                <span class="panel-value" style="color: #58a6ff;">${this.selectedEntities.length}</span>
                            </div>
                            <div class="panel-row">
                                <span class="panel-label">更新时间:</span>
                                <span class="panel-value">${this.lastUpdate}</span>
                            </div>
                            <button class="panel-btn panel-btn-primary" style="width: 100%; margin-top: 8px;" @click=${this.refreshInfo}>
                                刷新信息
                            </button>
                        </div>
        
                        ${this.selectedEntities.length === 0 ? html`
                            <div class="empty-state">
                                <div class="empty-icon">📋</div>
                                <div>请选择实体</div>
                                <div style="font-size: 12px; margin-top: 4px;">
                                    点击"刷新信息"查看选中实体
                                </div>
                            </div>
                        ` : html`
                            <div class="panel-section">
                                <div class="panel-section-title">实体详情</div>
                                ${this.selectedEntities.slice(0, 5).map((entity, index) => html`
                                    <div class="info-card">
                                        <div class="info-title">${index + 1}. ${this.getEntityTypeName(entity)}</div>
                                        <div class="info-row">
                                            <span class="info-label">图层:</span>
                                            <span class="info-value">${entity.layer || '0'}</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="info-label">颜色:</span>
                                            <span class="info-value">${entity.color ?? 'ByLayer'}</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="info-label">Handle:</span>
                                            <span class="info-value">${entity.handle || '-'}</span>
                                        </div>
                                    </div>
                                `)}
                                ${this.selectedEntities.length > 5 ? html`
                                    <div style="text-align: center; color: #8b949e; font-size: 12px;">
                                        还有 ${this.selectedEntities.length - 5} 个实体...
                                    </div>
                                ` : ''}
                            </div>
                        `}
                    </div>
                `;
            }
        }
        
        // ============================================================
        // 注册自定义面板
        // ============================================================
        
        message.info("\n=== 注册自定义侧边栏面板 ===");
        
        // 注册绘图工具面板到左侧
        registerSidebarPanel({
            name: "draw-tools",
            label: "绘图工具",
            icon: "./images/actbar/actbar-draw-settings.svg", // 使用系统图标
            position: "left",
            panelClass: DrawToolsPanel,
            order: 10 // 排在前面
        });
        message.info("已注册: 绘图工具面板 (左侧)");
        
        // 注册实体信息面板到右侧
        registerSidebarPanel({
            name: "entity-info",
            label: "实体信息",
            icon: "./images/actbar/actbar-property.svg", // 使用系统图标
            position: "right",
            panelClass: EntityInfoPanel,
            order: 5 // 排在前面
        });
        message.info("已注册: 实体信息面板 (右侧)");
        
        // ============================================================
        // 延迟激活面板
        // ============================================================
        
        setTimeout(() => {
            // 激活自定义面板
            activateSidebarPanel("draw-tools");
            message.info("已激活: 绘图工具面板");
        }, 500);
        
        setTimeout(() => {
            activateSidebarPanel("entity-info");
            message.info("已激活: 实体信息面板");
        }, 1000);
        
        // 30 秒后注销一个面板示例
        setTimeout(() => {
            unregisterSidebarPanel("draw-tools");
            message.info("已注销: 绘图工具面板 (30 秒超时示例)");
        }, 30000);
        
        // ============================================================
        // 使用说明
        // ============================================================
        
        message.info("\n=== SidebarPanelManager 用法 ===");
        message.info("1. 继承 BasePanelComponent 创建面板类");
        message.info("2. 定义 static styles 合并基类样式");
        message.info("3. 实现 render() 方法渲染内容");
        message.info("4. 调用 registerSidebarPanel() 注册面板");
        
        message.info("\n=== registerSidebarPanel 配置 ===");
        message.info("name: 面板唯一标识符（必需）");
        message.info("label: 面板显示标签（必需）");
        message.info("icon: 活动栏图标路径（必需）");
        message.info("position: 'left' | 'right'（默认 left）");
        message.info("panelClass: 面板类（必需）");
        message.info("order: 排序数字，越小越靠前");
        
        message.info("\n=== 便捷函数 ===");
        message.info("registerSidebarPanel(config) - 注册面板");
        message.info("unregisterSidebarPanel(name) - 注销面板");
        message.info("activateSidebarPanel(name) - 激活面板");
        
        message.info("\n=== BasePanelComponent 内置样式类 ===");
        message.info(".panel-content - 面板内容容器");
        message.info(".panel-section - 分组区块");
        message.info(".panel-section-title - 分组标题");
        message.info(".panel-row - 行布局");
        message.info(".panel-label / .panel-value - 标签和值");
        message.info(".panel-input - 输入框样式");
        message.info(".panel-btn / .panel-btn-primary - 按钮样式");
        message.info(".panel-list / .panel-list-item - 列表样式");
        
        message.info("\n=== 生命周期方法 ===");
        message.info("onActivate() - 面板激活时调用");
        message.info("onDeactivate() - 面板停用时调用");
        message.info("refresh() - 刷新面板内容");
        
        message.info("\n=== MainView 配置 ===");
        message.info("autoActivatePropertyPanel: false - 禁止选择实体时自动切换到特性面板");
        message.info("excludedPanelsFromAutoActivate: ['panel-name'] - 指定面板激活时不切换（其他面板激活时仍会切换）");
        message.info("（本示例已启用 autoActivatePropertyPanel: false，选择实体后不会自动切换面板）");
        
        message.info("\n点击侧边活动栏的图标可切换到自定义面板！");
        
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
