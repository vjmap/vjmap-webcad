window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --对话框暂停/恢复 (Vue3版本)--在对话框中选择实体、拾取点的用法
        // 使用 Vue 3 + BaseDialogComponent 实现
        // 重要：必须在命令上下文中运行，否则点击会触发默认命令
        
        const { 
            MainView, initCadContainer, Engine, 
            LineEnt, CircleEnt, PolylineEnt,
            BaseDialogComponent, 
            PointInputOptions, SelectionInputOptions, InputStatusEnum,
            Point2D,
            LitElement, html, css,
            writeMessage, message,
            CommandRegistry, CommandDefinition, CommandOptions
        } = vjcad;
        
        // ============================================================
        // 动态加载 Vue 3
        // ============================================================
        
        const loadVue3 = () => {
            return new Promise((resolve, reject) => {
                // 检查是否已加载
                if (window.Vue) {
                    resolve(window.Vue);
                    return;
                }
                
                const script = document.createElement('script');
                script.src = '/js/vue@3.js';
                script.onload = () => {
                    if (window.Vue) {
                        resolve(window.Vue);
                    } else {
                        reject(new Error('Vue 3 加载失败'));
                    }
                };
                script.onerror = () => reject(new Error('Vue 3 脚本加载失败'));
                document.head.appendChild(script);
            });
        };
        
        // 等待 Vue 3 加载完成
        const Vue = await loadVue3();
        const { createApp, ref, computed, onMounted } = Vue;
        
        message.info("Vue 3 已加载");
        
        // ============================================================
        // 初始化 CAD
        // ============================================================
        
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
        
        message.info("=== 对话框暂停/恢复 (Vue3版本) ===");
        
        // ============================================================
        // Vue 3 对话框组件
        // ============================================================
        
        /**
         * 创建 Vue 3 对话框
         * 使用 base-dialog 作为容器，Vue 负责内容渲染
         */
        class VueMeasureDialog {
            constructor() {
                this.result = null;
                this.baseDialog = null;
                this.vueApp = null;
                this.container = null;
                
                // 响应式数据（供 Vue 使用）
                this.state = {
                    selectedEntities: [],
                    entityCount: 0,
                    startPoint: null,
                    endPoint: null,
                    distance: null
                };
            }
        
            /**
             * 选择实体
             */
            async selectEntities() {
                if (this.baseDialog) this.baseDialog.suspend();
                
                writeMessage("<br/>请选择实体（可多选，右键或回车确认）:");
                
                const options = new SelectionInputOptions();
                const result = await Engine.editor.getSelections(options);
                
                if (this.baseDialog) this.baseDialog.resume();
                
                if (result.status === InputStatusEnum.OK && result.value?.length > 0) {
                    const newEntities = result.value.filter(
                        e => !this.state.selectedEntities.some(existing => existing.id === e.id)
                    );
                    this.state.selectedEntities.push(...newEntities);
                    this.state.entityCount = this.state.selectedEntities.length;
                    writeMessage(`<br/>已选择 ${this.state.entityCount} 个实体`);
                }
            }
        
            /**
             * 清空选择
             */
            clearEntities() {
                this.state.selectedEntities = [];
                this.state.entityCount = 0;
            }
        
            /**
             * 拾取起点
             */
            async pickStartPoint() {
                if (this.baseDialog) this.baseDialog.suspend();
                
                const options = new PointInputOptions("指定起点:");
                const result = await Engine.editor.getPoint(options);
                
                if (this.baseDialog) this.baseDialog.resume();
                
                if (result.status === InputStatusEnum.OK && result.value) {
                    this.state.startPoint = { x: result.value.x, y: result.value.y };
                    this.updateDistance();
                    writeMessage(`<br/>起点: (${this.state.startPoint.x.toFixed(2)}, ${this.state.startPoint.y.toFixed(2)})`);
                }
            }
        
            /**
             * 拾取终点
             */
            async pickEndPoint() {
                if (this.baseDialog) this.baseDialog.suspend();
                
                const options = new PointInputOptions("指定终点:");
                if (this.state.startPoint) {
                    options.useBasePoint = true;
                    options.basePoint = new Point2D(this.state.startPoint.x, this.state.startPoint.y);
                }
                
                const result = await Engine.editor.getPoint(options);
                
                if (this.baseDialog) this.baseDialog.resume();
                
                if (result.status === InputStatusEnum.OK && result.value) {
                    this.state.endPoint = { x: result.value.x, y: result.value.y };
                    this.updateDistance();
                    writeMessage(`<br/>终点: (${this.state.endPoint.x.toFixed(2)}, ${this.state.endPoint.y.toFixed(2)})`);
                }
            }
        
            /**
             * 计算距离
             */
            updateDistance() {
                if (this.state.startPoint && this.state.endPoint) {
                    const dx = this.state.endPoint.x - this.state.startPoint.x;
                    const dy = this.state.endPoint.y - this.state.startPoint.y;
                    this.state.distance = Math.sqrt(dx * dx + dy * dy);
                } else {
                    this.state.distance = null;
                }
            }
        
            /**
             * 确定
             */
            ok() {
                this.result = {
                    entities: [...this.state.selectedEntities],
                    startPoint: this.state.startPoint,
                    endPoint: this.state.endPoint,
                    distance: this.state.distance
                };
                if (this.baseDialog) this.baseDialog.close();
            }
        
            /**
             * 取消
             */
            cancel() {
                this.result = null;
                if (this.baseDialog) this.baseDialog.close();
            }
        
            /**
             * 启动对话框
             */
            async startDialog() {
                // 创建容器元素
                this.container = document.createElement('div');
                this.container.innerHTML = `
                    <base-dialog>
                        <div id="vue-dialog-root"></div>
                    </base-dialog>
                `;
                
                // 添加样式
                const style = document.createElement('style');
                style.textContent = `
                    base-dialog {
                        --dialog-header-bg: #2d2d30;
                        --dialog-header-color: #f0f0f0;
                        --dialog-header-border: rgba(255,255,255,0.1);
                        --dialog-contents-color: #2d2d30;
                    }
                `;
                this.container.appendChild(style);
                
                Engine.dialog.appendChild(this.container);
                
                // 获取 base-dialog 引用
                this.baseDialog = this.container.querySelector('base-dialog');
                
                // 创建 Vue 应用
                const dialogInstance = this;
                
                this.vueApp = createApp({
                    setup() {
                        // 响应式状态
                        const entityCount = ref(dialogInstance.state.entityCount);
                        const startPoint = ref(dialogInstance.state.startPoint);
                        const endPoint = ref(dialogInstance.state.endPoint);
                        const distance = ref(dialogInstance.state.distance);
                        
                        // 监听状态变化（简单轮询方式，实际项目可用更优雅的方式）
                        const updateState = () => {
                            entityCount.value = dialogInstance.state.entityCount;
                            startPoint.value = dialogInstance.state.startPoint;
                            endPoint.value = dialogInstance.state.endPoint;
                            distance.value = dialogInstance.state.distance;
                        };
                        
                        // 定时更新状态
                        let timer = null;
                        onMounted(() => {
                            timer = setInterval(updateState, 100);
                        });
                        
                        // 格式化坐标
                        const formatPoint = (point) => {
                            if (!point) return '未指定';
                            return `(${point.x.toFixed(4)}, ${point.y.toFixed(4)})`;
                        };
                        
                        // 方法
                        const selectEntities = () => dialogInstance.selectEntities();
                        const clearEntities = () => {
                            dialogInstance.clearEntities();
                            updateState();
                        };
                        const pickStartPoint = () => dialogInstance.pickStartPoint();
                        const pickEndPoint = () => dialogInstance.pickEndPoint();
                        const ok = () => {
                            if (timer) clearInterval(timer);
                            dialogInstance.ok();
                        };
                        const cancel = () => {
                            if (timer) clearInterval(timer);
                            dialogInstance.cancel();
                        };
                        
                        return {
                            entityCount,
                            startPoint,
                            endPoint,
                            distance,
                            formatPoint,
                            selectEntities,
                            clearEntities,
                            pickStartPoint,
                            pickEndPoint,
                            ok,
                            cancel
                        };
                    },
                    template: `
                        <div class="vue-dialog-container">
                            <!-- 实体选择区域 -->
                            <div class="section">
                                <div class="section-title">选择实体</div>
                                <div class="row">
                                    <span class="label">已选实体:</span>
                                    <span class="value">{{ entityCount > 0 ? entityCount + ' 个' : '未选择' }}</span>
                                    <button class="btn" @click="selectEntities">选择</button>
                                    <button v-if="entityCount > 0" class="btn btn-clear" @click="clearEntities">清空</button>
                                </div>
                            </div>
                            
                            <!-- 点选择区域 -->
                            <div class="section">
                                <div class="section-title">测量距离</div>
                                <div class="row">
                                    <span class="label">起点:</span>
                                    <span class="value">{{ formatPoint(startPoint) }}</span>
                                    <button class="btn" @click="pickStartPoint">拾取</button>
                                </div>
                                <div class="row">
                                    <span class="label">终点:</span>
                                    <span class="value">{{ formatPoint(endPoint) }}</span>
                                    <button class="btn" @click="pickEndPoint" :disabled="!startPoint">拾取</button>
                                </div>
                                <div v-if="distance !== null" class="result">
                                    距离: {{ distance.toFixed(4) }}
                                </div>
                            </div>
                            
                            <!-- 按钮栏 -->
                            <div class="button-bar">
                                <button class="btn btn-clear" @click="cancel">取消</button>
                                <button class="btn" @click="ok">确定</button>
                            </div>
                        </div>
                    `
                });
                
                // 挂载 Vue 应用
                const vueRoot = this.container.querySelector('#vue-dialog-root');
                this.vueApp.mount(vueRoot);
                
                // 添加组件样式
                const componentStyle = document.createElement('style');
                componentStyle.textContent = `
                    .vue-dialog-container {
                        padding: 16px;
                        min-width: 320px;
                        background: #2d2d30;
                        color: #f0f0f0;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
                        transition: background 0.2s;
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
                vueRoot.appendChild(componentStyle);
                
                // 启动 base-dialog
                await this.baseDialog._startBaseDialog({
                    title: "测量工具 (Vue3)",
                    renderTarget: this.container
                });
                
                // 清理
                if (this.vueApp) {
                    this.vueApp.unmount();
                }
                this.container.remove();
                
                return this.result;
            }
        }
        
        // ============================================================
        // 创建命令类
        // ============================================================
        
        class VueMeasureCommand {
            async main() {
                writeMessage("<br/>启动 Vue3 测量对话框...");
                
                const dialog = new VueMeasureDialog();
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
        
        const cmdDef = new CommandDefinition(
            'VUEDIALOGDEMO',
            'Vue3对话框暂停/恢复示例',
            VueMeasureCommand,
            new CommandOptions()
        );
        CommandRegistry.regist(cmdDef);
        CommandRegistry.updated = true;
        
        message.info("\n=== 命令已注册 ===");
        message.info("输入 VUEDIALOGDEMO 执行命令");
        
        // 延迟自动执行演示命令
        setTimeout(async () => {
            message.info("\n--- 自动执行 Vue3 测量命令 ---");
            message.info("点击【选择】可选择实体");
            message.info("点击【拾取】可在CAD界面拾取点");
            
            await Engine.editor.executerWithOp('VUEDIALOGDEMO');
        }, 1000);
        
        message.info("\n=== Vue 3 集成说明 ===");
        message.info("1. 动态加载 Vue 3: const Vue = await loadVue3()");
        message.info("2. 使用 createApp() 创建 Vue 应用");
        message.info("3. 使用 base-dialog 作为对话框容器");
        message.info("4. Vue 负责内容渲染，base-dialog 提供模态功能");
        message.info("5. 调用 suspend/resume 实现CAD交互");
        
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
