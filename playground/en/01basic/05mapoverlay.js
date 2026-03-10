window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --地图叠加模式--将 WebCAD 叠加到 vjmap 地图上
        // 使用 CadMapOverlay 实现 CAD 与地图的叠加显示
        
        const { 
            CadMapOverlay, 
            LineEnt, CircleEnt, TextEnt, 
            Engine, 
            CadEventManager, CadEvents,
            message 
        } = vjcad;
        
        message.info("=== 地图叠加模式 ===");
        message.info("将 WebCAD 叠加到 vjmap 地图上");
        
        // ============================================================
        // 动态加载 vjmap
        // ============================================================
        
        const loadVjmap = () => {
            return new Promise((resolve, reject) => {
                // 检查是否已加载
                if (window.vjmap) {
                    resolve(window.vjmap);
                    return;
                }
                
                // 加载 CSS
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = 'https://vjmap.com/demo/js/vjmap/vjmap.min.css';
                document.head.appendChild(link);
                
                // 加载 JS
                const script = document.createElement('script');
                script.src = 'https://vjmap.com/demo/js/vjmap/vjmap.min.js';
                script.onload = () => {
                    if (window.vjmap) {
                        resolve(window.vjmap);
                    } else {
                        reject(new Error('vjmap 加载失败'));
                    }
                };
                script.onerror = () => reject(new Error('vjmap 脚本加载失败'));
                document.head.appendChild(script);
            });
        };
        
        // 等待 vjmap 加载完成
        const vjmap = await loadVjmap();
        message.info("vjmap 已加载");
        
        // ============================================================
        // 初始化 vjmap 地图
        // ============================================================
        
        // 设置地图容器样式
        const mapContainer = document.getElementById('map');
        mapContainer.style.background = '#022B4F';
        
        // 创建 vjmap 服务
        const svc = new vjmap.Service(env.serviceUrl, env.accessToken);
        
        // 打开地图
        const res = await svc.openMap({
            mapid: 'sys_zp',
            mapopenway: vjmap.MapOpenWay.GeomRender,
            style: vjmap.openMapDarkStyle()
        });
        
        if (res.error) {
            message.error('地图打开失败: ' + res.error);
            throw new Error(res.error);
        }
        
        // 获取地图范围
        const mapExtent = vjmap.GeoBounds.fromString(res.bounds);
        const prj = new vjmap.GeoProjection(mapExtent);
        
        message.info(`地图范围: ${res.bounds}`);
        
        // 创建地图
        const map = new vjmap.Map({
            container: 'map',
            style: svc.vectorStyle(),
            center: prj.toLngLat(mapExtent.center()),
            zoom: 1,
            pitch: 0,
            renderWorldCopies: false,
            pitchWithRotate: false,
            maxPitch: 0
        });
        
        map.attach(svc, prj);
        await map.onLoad();
        map.addControl(new vjmap.NavigationControl(), 'top-right');
        
        message.info("vjmap 地图初始化完成");
        
        // ============================================================
        // 使用 CadMapOverlay 叠加 WebCAD
        // ============================================================
        
        const cadOverlay = new CadMapOverlay({
            bounds: mapExtent,
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            themeMode: 0,
            enableSelection: true,
            // smoothAnimation: true（默认）- 使用 CSS transform 平滑过渡，动画结束后重绘
            // smoothAnimation: false - 实时重绘模式，响应更及时但可能有抖动
            smoothAnimation: true,
            onSelectionChanged: (selection) => {
                if (selection.length === 0) {
                    message.info("选择已清空");
                } else {
                    message.info(`选中 ${selection.length} 个实体`);
                    selection.forEach((ent, i) => {
                        message.info(`  [${i + 1}] ${ent.type}`);
                    });
                }
            }
        });
        
        // 添加到地图
        await cadOverlay.addTo(map);
        message.info("CadMapOverlay 已添加到地图");
        
        // ============================================================
        // 在范围内随机创建实体
        // ============================================================
        
        function randomPoint(bounds) {
            const [minX, minY, maxX, maxY] = bounds;
            const x = minX + Math.random() * (maxX - minX);
            const y = minY + Math.random() * (maxY - minY);
            return [x, y];
        }
        
        function randomColor() {
            return Math.floor(Math.random() * 7) + 1;
        }
        
        function addRandomEntities() {
            const bounds = cadOverlay.getCadBounds();
            const [minX, minY, maxX, maxY] = bounds;
            const avgSize = Math.min(maxX - minX, maxY - minY) / 20;
            
            const entities = [];
            
            // 创建 5 条随机线
            for (let i = 0; i < 5; i++) {
                const p1 = randomPoint(bounds);
                const p2 = randomPoint(bounds);
                const line = new LineEnt(p1, p2);
                line.setDefaults();
                line.color = randomColor();
                entities.push(line);
            }
            
            // 创建 5 个随机圆
            for (let i = 0; i < 5; i++) {
                const center = randomPoint(bounds);
                const radius = avgSize * (0.5 + Math.random());
                const circle = new CircleEnt(center, radius);
                circle.setDefaults();
                circle.color = randomColor();
                entities.push(circle);
            }
            
            // 创建 5 个随机文字
            const texts = ['WebCAD', 'vjmap', '测试', '示例', '叠加'];
            for (let i = 0; i < 5; i++) {
                const pos = randomPoint(bounds);
                const text = new TextEnt();
                text.insertionPoint = pos;
                text.text = texts[i % texts.length];
                text.height = avgSize * 0.5;
                text.setDefaults();
                text.color = randomColor();
                entities.push(text);
            }
            
            cadOverlay.addEntities(entities);
            message.info(`已添加 ${entities.length} 个随机实体`);
        }
        
        // 添加初始实体
        addRandomEntities();
        
        // 缩放到全图
        cadOverlay.zoomToExtents();
        
        // ============================================================
        // 创建控制面板
        // ============================================================
        
        const controlPanel = document.createElement('div');
        controlPanel.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(255, 255, 255, 0.95);
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.15);
            z-index: 100;
            font-family: sans-serif;
            font-size: 13px;
        `;
        
        controlPanel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px;">CadMapOverlay 示例</div>
            <div style="margin-bottom: 8px; color: #666;">
                点击选择实体 | ESC取消
            </div>
            <div style="margin-bottom: 8px;">
                <label style="cursor: pointer;">
                    <input type="checkbox" id="enableSelection" checked style="margin-right: 5px;">
                    允许选择
                </label>
            </div>
            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                <button id="btnZoomExtents" style="padding: 5px 10px; cursor: pointer;">全图</button>
                <button id="btnAddEntities" style="padding: 5px 10px; cursor: pointer;">添加实体</button>
                <button id="btnClearSelection" style="padding: 5px 10px; cursor: pointer;">清除选择</button>
                <button id="btnToggle" style="padding: 5px 10px; cursor: pointer;">显示/隐藏</button>
            </div>
        `;
        
        mapContainer.appendChild(controlPanel);
        
        // 绑定按钮事件
        let overlayVisible = true;
        
        document.getElementById('enableSelection').addEventListener('change', (e) => {
            cadOverlay.enableSelection = e.target.checked;
            message.info('选择功能: ' + (e.target.checked ? '启用' : '禁用'));
        });
        
        document.getElementById('btnZoomExtents').addEventListener('click', () => {
            cadOverlay.zoomToExtents();
        });
        
        document.getElementById('btnAddEntities').addEventListener('click', () => {
            addRandomEntities();
        });
        
        document.getElementById('btnClearSelection').addEventListener('click', () => {
            cadOverlay.clearSelection();
        });
        
        document.getElementById('btnToggle').addEventListener('click', () => {
            overlayVisible = !overlayVisible;
            cadOverlay.setVisible(overlayVisible);
            message.info('覆盖层: ' + (overlayVisible ? '显示' : '隐藏'));
        });
        
        // ============================================================
        // 使用说明
        // ============================================================
        
        message.info("\n=== 使用说明 ===");
        message.info("1. 点击实体可选中");
        message.info("2. ESC 取消选择");
        message.info("3. 可拖动/缩放/旋转地图，CAD 视图同步");
        message.info("4. 控制面板可添加实体、切换选择功能");
        
        message.info("\n=== CadMapOverlay API ===");
        message.info("cadOverlay.addTo(map) - 添加到地图");
        message.info("cadOverlay.getCadView() - 获取 MainView");
        message.info("cadOverlay.addEntities(ents) - 添加实体");
        message.info("cadOverlay.enableSelection - 启用/禁用选择");
        message.info("cadOverlay.zoomToExtents() - 缩放到全图");
        
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
