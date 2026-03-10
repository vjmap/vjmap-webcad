window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --模态对话框基类--ModalDialogBase 用法
        // 提供统一的模态对话框框架，内置深色主题样式
        // 子类只需实现 renderContent() 方法
        
        const { 
            MainView, initCadContainer, Engine, 
            LineEnt, CircleEnt, TextEnt,
            LitElement, html, css,
            ModalDialogBase, createNoShadowStyles, DialogColors,
            PointInputOptions, InputStatusEnum, Point2D,
            writeMessage, message,
            CommandRegistry, CommandDefinition, CommandOptions
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
        
        message.info("=== 模态对话框基类 ModalDialogBase ===");
        
        // ============================================================
        // 示例1：简单模态对话框（使用 Shadow DOM）
        // ============================================================
        
        /**
         * 简单设置对话框
         * 继承 ModalDialogBase，只需实现 renderContent()
         */
        class SimpleSettingsDialog extends ModalDialogBase {
            static dialogTitle = "简单设置";
        
            static properties = {
                ...ModalDialogBase.properties,
                lineColor: { type: Number },
                lineWidth: { type: Number },
            };
        
            constructor() {
                super();
                this.lineColor = 1;
                this.lineWidth = 1;
            }
        
            // 实现 renderContent - 渲染对话框主体内容
            renderContent() {
                return html`
                    <div style="min-width: 300px;">
                        <div class="row">
                            <span class="label" style="width: 80px;">线颜色:</span>
                            <input type="number" class="input" style="flex: 1;" min="1" max="255"
                                .value=${String(this.lineColor)}
                                @input=${(e) => this.lineColor = parseInt(e.target.value)}>
                        </div>
                        <div class="row" style="margin-top: 12px;">
                            <span class="label" style="width: 80px;">线宽:</span>
                            <input type="number" class="input" style="flex: 1;" min="1" max="10"
                                .value=${String(this.lineWidth)}
                                @input=${(e) => this.lineWidth = parseInt(e.target.value)}>
                        </div>
                    </div>
                `;
            }
        
            // 覆盖 confirm 方法设置返回结果
            confirm() {
                this.result = {
                    lineColor: this.lineColor,
                    lineWidth: this.lineWidth,
                };
                this.close();
            }
        }
        
        customElements.define('simple-settings-dialog', SimpleSettingsDialog);
        
        // ============================================================
        // 示例2：带拾取功能的对话框（使用 suspend/resume）
        // ============================================================
        
        /**
         * 画圆对话框
         * 演示如何在对话框中使用 suspend/resume 拾取点
         */
        class DrawCircleDialog extends ModalDialogBase {
            static dialogTitle = "画圆工具";
        
            static properties = {
                ...ModalDialogBase.properties,
                centerPoint: { type: Object },
                radius: { type: Number },
                color: { type: Number },
            };
        
            constructor() {
                super();
                this.centerPoint = null;
                this.radius = 20;
                this.color = 3;
            }
        
            // 拾取圆心
            async pickCenter() {
                this.suspend();
                
                const options = new PointInputOptions("指定圆心:");
                const result = await Engine.editor.getPoint(options);
                
                this.resume();
                
                if (result.status === InputStatusEnum.OK && result.value) {
                    this.centerPoint = { x: result.value.x, y: result.value.y };
                    writeMessage(`<br/>圆心: (${this.centerPoint.x.toFixed(2)}, ${this.centerPoint.y.toFixed(2)})`);
                }
            }
        
            // 拾取半径点
            async pickRadius() {
                if (!this.centerPoint) return;
                
                this.suspend();
                
                const options = new PointInputOptions("指定半径:");
                options.useBasePoint = true;
                options.basePoint = new Point2D(this.centerPoint.x, this.centerPoint.y);
                
                const result = await Engine.editor.getPoint(options);
                
                this.resume();
                
                if (result.status === InputStatusEnum.OK && result.value) {
                    const dx = result.value.x - this.centerPoint.x;
                    const dy = result.value.y - this.centerPoint.y;
                    this.radius = Math.sqrt(dx * dx + dy * dy);
                    writeMessage(`<br/>半径: ${this.radius.toFixed(2)}`);
                }
            }
        
            formatPoint(point) {
                return point ? `(${point.x.toFixed(2)}, ${point.y.toFixed(2)})` : '未指定';
            }
        
            renderContent() {
                return html`
                    <div style="min-width: 320px;">
                        <div class="section-title">圆参数</div>
                        
                        <div class="row">
                            <span class="label" style="width: 60px;">圆心:</span>
                            <span class="input" style="flex: 1; background: #0d1117;">${this.formatPoint(this.centerPoint)}</span>
                            <button class="btn" @click=${this.pickCenter}>拾取</button>
                        </div>
                        
                        <div class="row" style="margin-top: 12px;">
                            <span class="label" style="width: 60px;">半径:</span>
                            <input type="number" class="input" style="width: 80px;" min="1"
                                .value=${String(this.radius.toFixed(2))}
                                @input=${(e) => this.radius = parseFloat(e.target.value)}>
                            <button class="btn" @click=${this.pickRadius} ?disabled=${!this.centerPoint}>从图拾取</button>
                        </div>
                        
                        <div class="row" style="margin-top: 12px;">
                            <span class="label" style="width: 60px;">颜色:</span>
                            <input type="number" class="input" style="flex: 1;" min="1" max="255"
                                .value=${String(this.color)}
                                @input=${(e) => this.color = parseInt(e.target.value)}>
                        </div>
                    </div>
                `;
            }
        
            confirm() {
                if (!this.centerPoint) {
                    writeMessage("<br/>请先指定圆心！");
                    return;
                }
                this.result = {
                    center: this.centerPoint,
                    radius: this.radius,
                    color: this.color,
                };
                this.close();
            }
        }
        
        customElements.define('draw-circle-dialog', DrawCircleDialog);
        
        // ============================================================
        // 示例3：禁用 Shadow DOM 的对话框
        // ============================================================
        
        /**
         * 禁用 Shadow DOM 的对话框示例
         * 用于需要使用第三方库 CSS 的场景
         */
        class NoShadowDialog extends ModalDialogBase {
            static dialogTitle = "无 Shadow DOM";
        
            // 禁用 Shadow DOM
            useShadowDOM = false;
        
            static properties = {
                ...ModalDialogBase.properties,
                inputValue: { type: String },
            };
        
            constructor() {
                super();
                this.inputValue = '示例文本';
            }
        
            renderContent() {
                return html`
                    <div style="min-width: 280px;">
                        <div class="row">
                            <span class="label" style="width: 60px;">输入:</span>
                            <input type="text" class="input" style="flex: 1;"
                                .value=${this.inputValue}
                                @input=${(e) => this.inputValue = e.target.value}>
                        </div>
                        <div class="hint" style="margin-top: 12px;">
                            此对话框禁用了 Shadow DOM，样式通过内联方式注入。
                            适用于需要使用第三方库（如 x-spreadsheet）的场景。
                        </div>
                    </div>
                `;
            }
        
            confirm() {
                this.result = { value: this.inputValue };
                this.close();
            }
        
            // 禁用 Shadow DOM 时需要手动注入样式
            render() {
                return html`
                    <style>${createNoShadowStyles('no-shadow-dialog')}</style>
                    <base-dialog>
                        <div class="dialog-body">
                            ${this.renderContent()}
                        </div>
                        <div class="dialog-footer">
                            ${this.renderFooter()}
                        </div>
                    </base-dialog>
                `;
            }
        }
        
        customElements.define('no-shadow-dialog', NoShadowDialog);
        
        // ============================================================
        // 命令类
        // ============================================================
        
        class Demo1Command {
            async main() {
                writeMessage("<br/>--- 简单设置对话框 ---");
                const dialog = new SimpleSettingsDialog();
                const result = await dialog.startDialog();
                
                if (result) {
                    writeMessage(`<br/>设置结果: 颜色=${result.lineColor}, 线宽=${result.lineWidth}`);
                } else {
                    writeMessage("<br/>用户取消");
                }
            }
        }
        
        class Demo2Command {
            async main() {
                writeMessage("<br/>--- 画圆对话框 ---");
                const dialog = new DrawCircleDialog();
                const result = await dialog.startDialog();
                
                if (result) {
                    // 创建圆
                    const circle = new CircleEnt([result.center.x, result.center.y], result.radius);
                    circle.setDefaults();
                    circle.color = result.color;
                    Engine.addEntities(circle);
                    Engine.zoomExtents();
                    writeMessage(`<br/>已创建圆: 圆心=(${result.center.x.toFixed(2)}, ${result.center.y.toFixed(2)}), 半径=${result.radius.toFixed(2)}`);
                } else {
                    writeMessage("<br/>用户取消");
                }
            }
        }
        
        class Demo3Command {
            async main() {
                writeMessage("<br/>--- 无 Shadow DOM 对话框 ---");
                const dialog = new NoShadowDialog();
                const result = await dialog.startDialog();
                
                if (result) {
                    writeMessage(`<br/>输入值: ${result.value}`);
                } else {
                    writeMessage("<br/>用户取消");
                }
            }
        }
        
        // 注册命令
        CommandRegistry.regist(new CommandDefinition('DEMO_SIMPLE', '简单设置对话框', Demo1Command, new CommandOptions()));
        CommandRegistry.regist(new CommandDefinition('DEMO_CIRCLE', '画圆对话框', Demo2Command, new CommandOptions()));
        CommandRegistry.regist(new CommandDefinition('DEMO_NOSHADOW', '无 Shadow DOM 对话框', Demo3Command, new CommandOptions()));
        CommandRegistry.updated = true;
        
        message.info("\n=== 命令已注册 ===");
        message.info("DEMO_SIMPLE - 简单设置对话框");
        message.info("DEMO_CIRCLE - 画圆对话框（支持拾取）");
        message.info("DEMO_NOSHADOW - 无 Shadow DOM 对话框");
        
        // 自动执行演示
        setTimeout(async () => {
            message.info("\n--- 自动执行画圆对话框 ---");
            await Engine.editor.executerWithOp('DEMO_CIRCLE');
        }, 1000);
        
        message.info("\n=== ModalDialogBase 用法 ===");
        message.info("1. 继承 ModalDialogBase<T>");
        message.info("2. 设置 static dialogTitle = '标题'");
        message.info("3. 实现 renderContent() 渲染内容");
        message.info("4. 覆盖 confirm() 设置 this.result");
        message.info("5. 使用 suspend()/resume() 暂停/恢复");
        
        message.info("\n=== 禁用 Shadow DOM ===");
        message.info("设置 useShadowDOM = false");
        message.info("使用 createNoShadowStyles(tagName) 注入样式");
        
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
