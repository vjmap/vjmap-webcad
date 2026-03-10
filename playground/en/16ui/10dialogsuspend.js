window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --对话框暂停/恢复--在对话框中选择实体、拾取点的用法
        // 使用 BaseDialogComponent 的 suspend() 和 resume() 方法实现
        // 重要：必须在命令上下文中运行，否则点击会触发默认命令
        
        const { 
            MainView, initCadContainer, Engine, 
            LineEnt, CircleEnt, PolylineEnt,
            BaseDialogComponent, 
            PointInputOptions, SelectionInputOptions, InputStatusEnum,
            Point2D,  // 用于设置 basePoint
            LitElement, html, css,
            writeMessage, message,
            // 命令注册相关
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
        
        // 创建一些实体供选择
        const line = new LineEnt([0, 0], [100, 50]);
        line.setDefaults();
        line.color = 1;
        
        const circle = new CircleEnt([60, 60], 25);
        circle.setDefaults();
        circle.color = 3;
        
        const rect = new PolylineEnt();
        rect.setPoints([[120, 20], [200, 20], [200, 80], [120, 80]]);
        rect.isClosed = true;
        rect.setDefaults();
        rect.color = 5;
        
        Engine.addEntities([line, circle, rect]);
        Engine.zoomExtents();
        
        message.info("=== 对话框暂停/恢复 ===");
        message.info("在对话框中选择实体、拾取点的示例");
        
        // ============================================================
        // 示例：自定义对话框，支持在对话框中选择实体和拾取点
        // ============================================================
        
        /**
         * 自定义测量对话框
         * 演示如何在对话框打开时让用户选择实体和拾取点
         */
        class MeasureDialog extends LitElement {
            static properties = {
                selectedEntities: { type: Array },
                entityCount: { type: Number },
                startPoint: { type: Object },
                endPoint: { type: Object },
                distance: { type: Number },
            };
        
            static styles = css`
                :host {
                    display: block;
                }
                /* 深色标题栏样式 - 覆盖 base-dialog 的 CSS 变量 */
                base-dialog {
                    --dialog-header-bg: #2d2d30;
                    --dialog-header-color: #f0f0f0;
                    --dialog-header-border: rgba(255,255,255,0.1);
                    --dialog-contents-color: #2d2d30;
                }
                .container {
                    padding: 16px;
                    min-width: 320px;
                    background: #2d2d30;
                    color: #f0f0f0;
                }
                .section {
                    margin-bottom: 16px;
                    padding: 12px;
                    background: #3c3c3c;
                    border-radius: 4px;
                }
                .section-title {
                    font-weight: bold;
                    margin-bottom: 8px;
                    color: #0095ff;
                }
                .row {
                    display: flex;
                    align-items: center;
                    margin: 8px 0;
                    gap: 8px;
                }
                .label {
                    min-width: 80px;
                }
                .value {
                    flex: 1;
                    padding: 4px 8px;
                    background: #252526;
                    border-radius: 4px;
                    font-family: monospace;
                }
                .btn {
                    padding: 6px 12px;
                    background: #0e639c;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .btn:hover {
                    background: #1177bb;
                }
                .btn:disabled {
                    background: #555;
                    cursor: not-allowed;
                }
                .btn-clear {
                    background: #6c6c6c;
                }
                .btn-clear:hover {
                    background: #888;
                }
                .button-bar {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    margin-top: 16px;
                    padding-top: 12px;
                    border-top: 1px solid #555;
                }
                .result {
                    font-size: 18px;
                    color: #4ec9b0;
                    text-align: center;
                    padding: 12px;
                }
            `;
        
            constructor() {
                super();
                this.selectedEntities = [];
                this.entityCount = 0;
                this.startPoint = null;
                this.endPoint = null;
                this.distance = null;
                this.result = null;
                this.baseDialog = null;
            }
        
            /**
             * 选择实体按钮回调
             * 暂停对话框，让用户在CAD界面选择实体
             */
            async selectEntities() {
                // 暂停对话框
                if (this.baseDialog) this.baseDialog.suspend();
                
                // 显示提示
                writeMessage("<br/>请选择实体（可多选，右键或回车确认）:");
                
                // 调用编辑器的选择接口
                const options = new SelectionInputOptions();
                const result = await Engine.editor.getSelections(options);
                
                // 恢复对话框
                if (this.baseDialog) this.baseDialog.resume();
                
                if (result.status === InputStatusEnum.OK && result.value && result.value.length > 0) {
                    // 累加选择的实体（去重）
                    const newEntities = result.value.filter(
                        e => !this.selectedEntities.some(existing => existing.id === e.id)
                    );
                    this.selectedEntities = [...this.selectedEntities, ...newEntities];
                    this.entityCount = this.selectedEntities.length;
                    writeMessage(`<br/>已选择 ${this.entityCount} 个实体`);
                }
                
                this.requestUpdate();
            }
        
            /**
             * 清空选择的实体
             */
            clearEntities() {
                this.selectedEntities = [];
                this.entityCount = 0;
                this.requestUpdate();
            }
        
            /**
             * 拾取起点按钮回调
             * 暂停对话框，让用户在CAD界面拾取点
             */
            async pickStartPoint() {
                // 暂停对话框
                if (this.baseDialog) this.baseDialog.suspend();
                
                // 调用编辑器的拾取点接口
                const options = new PointInputOptions("指定起点:");
                const result = await Engine.editor.getPoint(options);
                
                // 恢复对话框
                if (this.baseDialog) this.baseDialog.resume();
                
                if (result.status === InputStatusEnum.OK && result.value) {
                    this.startPoint = { x: result.value.x, y: result.value.y };
                    this.updateDistance();
                    writeMessage(`<br/>起点: (${this.startPoint.x.toFixed(2)}, ${this.startPoint.y.toFixed(2)})`);
                }
                
                this.requestUpdate();
            }
        
            /**
             * 拾取终点按钮回调
             */
            async pickEndPoint() {
                // 暂停对话框
                if (this.baseDialog) this.baseDialog.suspend();
                
                // 调用编辑器的拾取点接口，如果有起点则显示橡皮线
                const options = new PointInputOptions("指定终点:");
                if (this.startPoint) {
                    options.useBasePoint = true;
                    options.basePoint = new Point2D(this.startPoint.x, this.startPoint.y);
                }
                
                const result = await Engine.editor.getPoint(options);
                
                // 恢复对话框
                if (this.baseDialog) this.baseDialog.resume();
                
                if (result.status === InputStatusEnum.OK && result.value) {
                    this.endPoint = { x: result.value.x, y: result.value.y };
                    this.updateDistance();
                    writeMessage(`<br/>终点: (${this.endPoint.x.toFixed(2)}, ${this.endPoint.y.toFixed(2)})`);
                }
                
                this.requestUpdate();
            }
        
            /**
             * 计算距离
             */
            updateDistance() {
                if (this.startPoint && this.endPoint) {
                    const dx = this.endPoint.x - this.startPoint.x;
                    const dy = this.endPoint.y - this.startPoint.y;
                    this.distance = Math.sqrt(dx * dx + dy * dy);
                } else {
                    this.distance = null;
                }
            }
        
            /**
             * 格式化坐标显示
             */
            formatPoint(point) {
                if (!point) return '未指定';
                return `(${point.x.toFixed(4)}, ${point.y.toFixed(4)})`;
            }
        
            /**
             * 确定按钮回调
             */
            okCallback() {
                this.result = {
                    entities: this.selectedEntities,
                    startPoint: this.startPoint,
                    endPoint: this.endPoint,
                    distance: this.distance
                };
                if (this.baseDialog) this.baseDialog.close();
            }
        
            /**
             * 取消按钮回调
             */
            cancelCallback() {
                this.result = null;
                if (this.baseDialog) this.baseDialog.close();
            }
        
            /**
             * 启动对话框
             */
            async startDialog() {
                Engine.dialog.appendChild(this);
                await this.updateComplete;
                
                this.baseDialog = this.renderRoot.querySelector('base-dialog');
                
                if (this.baseDialog) {
                    await this.baseDialog._startBaseDialog({
                        title: "测量工具",
                        renderTarget: this.renderRoot
                    });
                }
                
                this.remove();
                return this.result;
            }
        
            render() {
                return html`
                    <base-dialog>
                        <div class="container">
                            <!-- 实体选择区域 -->
                            <div class="section">
                                <div class="section-title">选择实体</div>
                                <div class="row">
                                    <span class="label">已选实体:</span>
                                    <span class="value">${this.entityCount > 0 ? `${this.entityCount} 个` : '未选择'}</span>
                                    <button class="btn" @click=${this.selectEntities}>选择</button>
                                    ${this.entityCount > 0 ? html`
                                        <button class="btn btn-clear" @click=${this.clearEntities}>清空</button>
                                    ` : ''}
                                </div>
                            </div>
                            
                            <!-- 点选择区域 -->
                            <div class="section">
                                <div class="section-title">测量距离</div>
                                <div class="row">
                                    <span class="label">起点:</span>
                                    <span class="value">${this.formatPoint(this.startPoint)}</span>
                                    <button class="btn" @click=${this.pickStartPoint}>拾取</button>
                                </div>
                                <div class="row">
                                    <span class="label">终点:</span>
                                    <span class="value">${this.formatPoint(this.endPoint)}</span>
                                    <button class="btn" @click=${this.pickEndPoint} ?disabled=${!this.startPoint}>拾取</button>
                                </div>
                                ${this.distance !== null ? html`
                                    <div class="result">
                                        距离: ${this.distance.toFixed(4)}
                                    </div>
                                ` : ''}
                            </div>
                            
                            <!-- 按钮栏 -->
                            <div class="button-bar">
                                <button class="btn btn-clear" @click=${this.cancelCallback}>取消</button>
                                <button class="btn" @click=${this.okCallback}>确定</button>
                            </div>
                        </div>
                    </base-dialog>
                `;
            }
        }
        
        // 注册自定义元素
        customElements.define('measure-dialog', MeasureDialog);
        
        // ============================================================
        // 创建命令类 - 重要：对话框必须在命令上下文中运行！
        // ============================================================
        
        /**
         * 测量命令类
         * 对话框中的 suspend/resume 功能必须在命令上下文中使用，
         * 否则点击会触发默认命令行为。
         */
        class MeasureCommand {
            async main() {
                writeMessage("<br/>启动测量对话框...");
                
                const dialog = new MeasureDialog();
                const result = await dialog.startDialog();
                
                if (result) {
                    writeMessage("<br/><br/>========== 测量结果 ==========");
                    writeMessage(`<br/>选择实体数: ${result.entities.length}`);
                    if (result.startPoint) {
                        writeMessage(`<br/>起点: (${result.startPoint.x.toFixed(2)}, ${result.startPoint.y.toFixed(2)})`);
                    }
                    if (result.endPoint) {
                        writeMessage(`<br/>终点: (${result.endPoint.x.toFixed(2)}, ${result.endPoint.y.toFixed(2)})`);
                    }
                    if (result.distance !== null) {
                        writeMessage(`<br/>距离: ${result.distance.toFixed(4)}`);
                    }
                } else {
                    writeMessage("<br/>用户取消了操作");
                }
            }
        }
        
        // ============================================================
        // 注册命令
        // ============================================================
        
        // 注册测量命令
        const cmdDef = new CommandDefinition(
            'MYDIALOGDEMO',           // 命令名称
            '对话框暂停/恢复示例',     // 命令描述
            MeasureCommand,            // 命令类
            new CommandOptions()       // 命令选项
        );
        CommandRegistry.regist(cmdDef);
        CommandRegistry.updated = true;
        
        message.info("\n=== 命令已注册 ===");
        message.info("输入 MYDIALOGDEMO 或点击下方按钮执行命令");
        
        // 延迟自动执行演示命令
        setTimeout(async () => {
            message.info("\n--- 自动执行测量命令 ---");
            message.info("点击【选择】可选择实体");
            message.info("点击【拾取】可在CAD界面拾取点");
            
            // 通过 Editor 执行命令（在命令上下文中运行）
            await Engine.editor.executerWithOp('MYDIALOGDEMO');
        }, 1000);
        
        message.info("\n=== 关键说明 ===");
        message.info("【重要】对话框的 suspend/resume 必须在命令上下文中使用！");
        message.info("如果直接调用对话框（不在命令中），点击会触发默认命令。");
        
        message.info("\n=== 关键API ===");
        message.info("baseDialog.suspend() - 暂停对话框，允许用户操作CAD界面");
        message.info("baseDialog.resume() - 恢复对话框");
        message.info("baseDialog.isSuspended - 检查是否处于暂停状态");
        
        message.info("\n=== 使用步骤 ===");
        message.info("1. 创建命令类，在 main() 方法中启动对话框");
        message.info("2. 继承 LitElement 创建对话框组件");
        message.info("3. 在 render() 中使用 <base-dialog> 包裹内容");
        message.info("4. 通过 _startBaseDialog() 启动对话框");
        message.info("5. 需要用户操作CAD时调用 suspend()");
        message.info("6. 用户操作完成后调用 resume()");
        message.info("7. 使用 CommandRegistry.regist() 注册命令");
        message.info("8. 使用 Engine.editor.executerWithOp() 执行命令");
        
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
