window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --非模态面板基类--ModelessPanelBase 用法
        // 提供统一的非模态面板框架，内置深色主题样式和拖拽功能
        // 面板不阻止用户操作 CAD 界面
        
        const { 
            MainView, initCadContainer, Engine, 
            LineEnt, CircleEnt, TextEnt,
            LitElement, html, css,
            ModelessPanelBase, createPanel,
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
        
        // 创建一些实体
        const line = new LineEnt([0, 0], [100, 50]);
        line.setDefaults();
        line.color = 1;
        
        const circle = new CircleEnt([60, 60], 25);
        circle.setDefaults();
        circle.color = 3;
        
        Engine.addEntities([line, circle]);
        Engine.zoomExtents();
        
        message.info("=== 非模态面板基类 ModelessPanelBase ===");
        
        // ============================================================
        // 示例1：简单工具面板
        // ============================================================
        
        /**
         * 绘图工具面板
         * 继承 ModelessPanelBase，只需实现 renderContent()
         */
        class DrawToolsPanel extends ModelessPanelBase {
            static panelTitle = "绘图工具";
            static panelWidth = "200px";
            static initialPosition = { top: '100px', right: '20px' };
        
            // 绘制直线
            drawLine() {
                const x1 = Math.random() * 100;
                const y1 = Math.random() * 100;
                const x2 = x1 + Math.random() * 50;
                const y2 = y1 + Math.random() * 50;
                
                const line = new LineEnt([x1, y1], [x2, y2]);
                line.setDefaults();
                line.color = Math.floor(Math.random() * 7) + 1;
                Engine.addEntities(line);
                Engine.zoomExtents();
                writeMessage(`<br/>创建直线: (${x1.toFixed(1)}, ${y1.toFixed(1)}) - (${x2.toFixed(1)}, ${y2.toFixed(1)})`);
            }
        
            // 绘制圆
            drawCircle() {
                const cx = Math.random() * 100;
                const cy = Math.random() * 100;
                const r = Math.random() * 20 + 10;
                
                const circle = new CircleEnt([cx, cy], r);
                circle.setDefaults();
                circle.color = Math.floor(Math.random() * 7) + 1;
                Engine.addEntities(circle);
                Engine.zoomExtents();
                writeMessage(`<br/>创建圆: 圆心=(${cx.toFixed(1)}, ${cy.toFixed(1)}), 半径=${r.toFixed(1)}`);
            }
        
            // 绘制文字
            drawText() {
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                
                const text = new TextEnt();
                text.position = [x, y];
                text.text = `文字 ${Date.now() % 1000}`;
                text.height = 5;
                text.setDefaults();
                Engine.addEntities(text);
                Engine.zoomExtents();
                writeMessage(`<br/>创建文字: 位置=(${x.toFixed(1)}, ${y.toFixed(1)})`);
            }
        
            // 缩放至全图
            zoomExtents() {
                Engine.zoomExtents();
                writeMessage("<br/>缩放至全图");
            }
        
            renderContent() {
                return html`
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <button class="btn btn-primary" @click=${this.drawLine}>画直线</button>
                        <button class="btn btn-primary" @click=${this.drawCircle}>画圆</button>
                        <button class="btn btn-primary" @click=${this.drawText}>画文字</button>
                        <div style="border-top: 1px solid #3d4a5c; margin: 8px 0;"></div>
                        <button class="btn" @click=${this.zoomExtents}>缩放全图</button>
                    </div>
                `;
            }
        }
        
        // 注册自定义元素
        customElements.define('draw-tools-panel', DrawToolsPanel);
        
        // ============================================================
        // 示例2：属性面板（带状态）
        // ============================================================
        
        /**
         * 属性设置面板
         * 演示带状态的非模态面板
         */
        class PropertiesPanel extends ModelessPanelBase {
            static panelTitle = "属性设置";
            static panelWidth = "280px";
            static initialPosition = { top: '100px', left: '20px' };
        
            static properties = {
                ...ModelessPanelBase.properties,
                currentColor: { type: Number },
                lineWeight: { type: Number },
                layerName: { type: String },
            };
        
            constructor() {
                super();
                this.currentColor = 7;
                this.lineWeight = 1;
                this.layerName = "0";
            }
        
            applySettings() {
                writeMessage(`<br/>应用设置: 颜色=${this.currentColor}, 线宽=${this.lineWeight}, 图层=${this.layerName}`);
            }
        
            renderContent() {
                return html`
                    <div>
                        <div class="section-title">常规属性</div>
                        
                        <div class="row">
                            <span class="label" style="width: 60px;">颜色:</span>
                            <input type="number" class="input" style="flex: 1;" min="1" max="255"
                                .value=${String(this.currentColor)}
                                @input=${(e) => this.currentColor = parseInt(e.target.value)}>
                        </div>
                        
                        <div class="row" style="margin-top: 8px;">
                            <span class="label" style="width: 60px;">线宽:</span>
                            <input type="number" class="input" style="flex: 1;" min="1" max="10"
                                .value=${String(this.lineWeight)}
                                @input=${(e) => this.lineWeight = parseInt(e.target.value)}>
                        </div>
                        
                        <div class="row" style="margin-top: 8px;">
                            <span class="label" style="width: 60px;">图层:</span>
                            <input type="text" class="input" style="flex: 1;"
                                .value=${this.layerName}
                                @input=${(e) => this.layerName = e.target.value}>
                        </div>
                        
                        <div style="margin-top: 16px;">
                            <button class="btn btn-primary" style="width: 100%;" @click=${this.applySettings}>
                                应用设置
                            </button>
                        </div>
                    </div>
                `;
            }
        }
        
        customElements.define('properties-panel', PropertiesPanel);
        
        // ============================================================
        // 示例3：信息面板（动态标题）
        // ============================================================
        
        /**
         * 实体信息面板
         * 演示动态标题和复杂布局
         */
        class EntityInfoPanel extends ModelessPanelBase {
            static panelTitle = "实体信息";
            static panelWidth = "320px";
            static initialPosition = { bottom: '20px', right: '20px' };
            static maxHeight = "300px";
        
            static properties = {
                ...ModelessPanelBase.properties,
                entityCount: { type: Number },
                lastUpdate: { type: String },
            };
        
            constructor() {
                super();
                this.entityCount = 0;
                this.lastUpdate = '-';
            }
        
            // 覆盖 onShow 在显示时更新数据
            onShow() {
                super.onShow();
                this.refreshInfo();
            }
        
            refreshInfo() {
                const entities = Engine.getEntities();
                this.entityCount = entities.length;
                this.lastUpdate = new Date().toLocaleTimeString();
                writeMessage(`<br/>刷新实体信息: ${this.entityCount} 个实体`);
            }
        
            // 覆盖 getPanelTitle 实现动态标题
            getPanelTitle() {
                return `实体信息 (${this.entityCount})`;
            }
        
            renderContent() {
                return html`
                    <div>
                        <div class="status" style="margin-bottom: 12px;">
                            当前图纸共有 <strong style="color: #58a6ff;">${this.entityCount}</strong> 个实体
                        </div>
                        
                        <div class="row">
                            <span class="label" style="width: 80px;">更新时间:</span>
                            <span style="color: #9ca3af;">${this.lastUpdate}</span>
                        </div>
                        
                        <div style="margin-top: 16px;">
                            <button class="btn" style="width: 100%;" @click=${this.refreshInfo}>
                                刷新信息
                            </button>
                        </div>
                    </div>
                `;
            }
        }
        
        customElements.define('entity-info-panel', EntityInfoPanel);
        
        // ============================================================
        // 创建面板实例
        // ============================================================
        
        // 方式1：直接创建和添加
        const toolsPanel = new DrawToolsPanel();
        document.body.appendChild(toolsPanel);
        
        // 方式2：使用 createPanel 工厂函数
        const propsManager = createPanel(PropertiesPanel, 'properties-panel');
        
        // 方式3：手动创建
        const infoPanel = new EntityInfoPanel();
        document.body.appendChild(infoPanel);
        
        // ============================================================
        // 控制面板显示
        // ============================================================
        
        message.info("\n=== 面板控制 ===");
        
        // 显示绘图工具面板
        setTimeout(() => {
            toolsPanel.show();
            message.info("已显示: 绘图工具面板（右上）");
        }, 500);
        
        // 显示属性面板
        setTimeout(() => {
            propsManager.show();
            message.info("已显示: 属性设置面板（左上）");
        }, 1000);
        
        // 显示信息面板
        setTimeout(() => {
            infoPanel.show();
            message.info("已显示: 实体信息面板（右下）");
        }, 1500);
        
        message.info("\n=== ModelessPanelBase 用法 ===");
        message.info("1. 继承 ModelessPanelBase");
        message.info("2. 设置 static panelTitle = '标题'");
        message.info("3. 设置 static panelWidth = '宽度'");
        message.info("4. 设置 static initialPosition = { top, right, ... }");
        message.info("5. 实现 renderContent() 渲染内容");
        message.info("6. 调用 show()/hide()/toggle() 控制显示");
        
        message.info("\n=== 可覆盖的钩子方法 ===");
        message.info("onShow() - 面板显示时调用");
        message.info("onHide() - 面板隐藏时调用");
        message.info("onDestroy() - 面板销毁时调用");
        message.info("getPanelTitle() - 动态获取标题");
        
        message.info("\n=== createPanel 工厂函数 ===");
        message.info("const manager = createPanel(PanelClass, tagName)");
        message.info("manager.show() / hide() / toggle() / destroy()");
        message.info("manager.isVisible - 检查是否可见");
        
        message.info("\n=== 特性 ===");
        message.info("- 内置拖拽功能（拖动标题栏）");
        message.info("- 深色主题样式");
        message.info("- position: fixed 定位");
        message.info("- 自动边界限制");
        
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
