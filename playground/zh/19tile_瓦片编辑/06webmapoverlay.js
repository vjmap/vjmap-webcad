window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --互联网地图叠加--在CAD图纸上叠加互联网地图底图
        const { MainView, initCadContainer, Engine, DrawingManagerService, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 互联网地图叠加示例 ===");
        message.info("在 CAD 图纸上叠加高德/天地图作为参考底图");
        
        // ============================================================
        // 1. 从服务端直接打开图纸（非瓦片模式）
        // ============================================================
        
        const drawingManager = new DrawingManagerService();
        
        const mapid = 'sys_cad2000';
        const openResult = await drawingManager.openDrawing({
            type: 'imports',
            mapid: mapid,
            version: 'v1',
            branch: 'main',
            patchId: 'base',
            readOnly: false
        });
        
        if (!openResult.success) {
            message.error(`打开图纸失败: ${openResult.error}`);
            throw new Error(openResult.error);
        }
        
        const webcadData = openResult.webcadData;
        const jsonString = openResult.webcadJson;
        const docName = `${mapid}_v1_main`;
        const virtualFile = new File([jsonString], docName, { type: 'application/json' });
        await Engine.view.openDbDoc(virtualFile, webcadData);
        
        Engine.currentDoc.serverSource = {
            type: 'imports',
            mapid: mapid,
            version: 'v1',
            branchName: 'main',
            lastPatchId: openResult.latestPatchId || 'base'
        };
        
        await Engine.currentDoc.setOriginalJson(openResult.webcadJson);
        message.info("图纸已打开");
        
        // ============================================================
        // 2. 获取图纸范围并计算 mapbounds
        // ============================================================
        
        const pcanvas = Engine.pcanvas;
        const items = Engine.currentSpace.aliveItems;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const item of items) {
            const b = item.bounds;
            if (!b) continue;
            const wcs1 = pcanvas.trans.DcsToWcs({ x: b.x, y: b.y });
            const wcs2 = pcanvas.trans.DcsToWcs({ x: b.x + b.width, y: b.y + b.height });
            if (wcs1.x < minX) minX = wcs1.x;
            if (wcs1.y < minY) minY = wcs1.y;
            if (wcs2.x > maxX) maxX = wcs2.x;
            if (wcs2.y > maxY) maxY = wcs2.y;
        }
        
        const mapBoundsStr = `${minX},${minY},${maxX},${maxY}`;
        const epsgCode = "EPSG:4509";
        
        message.info(`图纸范围: ${mapBoundsStr}`);
        message.info(`坐标系: ${epsgCode}`);
        
        // ============================================================
        // 3. API 方式叠加互联网地图
        // ============================================================
        
        function enableGaodeSatellite() {
            Engine.enableWebMap({
                tileCrs: "gcj02",
                tileUrl: [
                    "https://webst0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}",
                    "https://webst0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
                ],
                tileShards: "1,2,3,4",
                mapbounds: mapBoundsStr,
                srs: epsgCode,
            });
            message.info("已叠加：高德影像地图");
        }
        
        function enableGaodeRoad() {
            Engine.enableWebMap({
                tileCrs: "gcj02",
                tileUrl: [
                    "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
                ],
                tileShards: "1,2,3,4",
                mapbounds: mapBoundsStr,
                srs: epsgCode,
            });
            message.info("已叠加：高德道路地图");
        }
        
        function enableTiandituSatellite() {
            Engine.enableWebMap({
                tileCrs: "wgs84",
                tileUrl: [
                    "https://t{s}.tianditu.gov.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}&tk={t}",
                    "https://t{s}.tianditu.gov.cn/DataServer?T=cva_w&X={x}&Y={y}&L={z}&tk={t}",
                ],
                tileShards: "1,2,3,4,5,6",
                tileToken: ["6d53378dc5f7dbef8d84ffdd2b54139b", "69eb2fa0de3b2a668f1ef603a3f8bc73"],
                mapbounds: mapBoundsStr,
                srs: epsgCode,
            });
            message.info("已叠加：天地图影像");
        }
        
        function disableWebMap() {
            Engine.disableWebMap();
            message.info("已移除互联网地图叠加");
        }
        
        function setAlpha(value) {
            Engine.setWebMapAlpha(value);
            pcanvas.redraw();
            message.info(`地图透明度设置为 ${Math.round(value * 100)}%`);
        }
        
        function openOverlayPanel() {
            Engine.editor.executerWithOp('WEBMAPOVERLAY');
            message.info("已打开互联网地图叠加面板");
        }
        
        // ============================================================
        // 4. 控制面板
        // ============================================================
        
        const mapContainer = document.getElementById('map');
        
        const controlPanel = document.createElement('div');
        controlPanel.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(30, 30, 40, 0.92);
            padding: 14px 16px;
            border-radius: 8px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.3);
            z-index: 100;
            font-family: sans-serif;
            font-size: 13px;
            color: #e0e0e0;
            min-width: 220px;
        `;
        
        controlPanel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; color: #58a6ff;">互联网地图叠加示例</div>
            <div style="margin-bottom: 6px; color: #9ca3af; font-size: 12px;">API 方式叠加</div>
            <div style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px;">
                <button id="btnGaodeSat" style="padding: 5px 10px; cursor: pointer;">叠加高德影像</button>
                <button id="btnGaodeRoad" style="padding: 5px 10px; cursor: pointer;">叠加高德道路</button>
                <button id="btnTianditu" style="padding: 5px 10px; cursor: pointer;">叠加天地图影像</button>
                <button id="btnRemove" style="padding: 5px 10px; cursor: pointer;">移除地图</button>
            </div>
            <div style="margin-bottom: 6px; color: #9ca3af; font-size: 12px;">透明度</div>
            <div style="display: flex; gap: 5px; margin-bottom: 10px;">
                <button id="btnAlpha100" style="padding: 5px 8px; cursor: pointer;">100%</button>
                <button id="btnAlpha70" style="padding: 5px 8px; cursor: pointer;">70%</button>
                <button id="btnAlpha50" style="padding: 5px 8px; cursor: pointer;">50%</button>
                <button id="btnAlpha30" style="padding: 5px 8px; cursor: pointer;">30%</button>
            </div>
            <div style="margin-bottom: 6px; color: #9ca3af; font-size: 12px;">命令方式</div>
            <div>
                <button id="btnPanel" style="padding: 5px 10px; cursor: pointer;">打开叠加面板</button>
            </div>
        `;
        
        mapContainer.appendChild(controlPanel);
        
        document.getElementById('btnGaodeSat').addEventListener('click', enableGaodeSatellite);
        document.getElementById('btnGaodeRoad').addEventListener('click', enableGaodeRoad);
        document.getElementById('btnTianditu').addEventListener('click', enableTiandituSatellite);
        document.getElementById('btnRemove').addEventListener('click', disableWebMap);
        document.getElementById('btnAlpha100').addEventListener('click', () => setAlpha(1.0));
        document.getElementById('btnAlpha70').addEventListener('click', () => setAlpha(0.7));
        document.getElementById('btnAlpha50').addEventListener('click', () => setAlpha(0.5));
        document.getElementById('btnAlpha30').addEventListener('click', () => setAlpha(0.3));
        document.getElementById('btnPanel').addEventListener('click', openOverlayPanel);
        
        // Default: overlay Gaode satellite
        enableGaodeSatellite();
        
        // ============================================================
        // 5. 使用说明
        // ============================================================
        
        message.info("");
        message.info("=== API 说明 ===");
        message.info("Engine.enableWebMap(config) - 启用互联网地图叠加");
        message.info("Engine.disableWebMap()     - 移除叠加");
        message.info("Engine.setWebMapAlpha(0~1) - 设置透明度");
        message.info("Engine.isWebMapEnabled()   - 查询是否启用");
        message.info("");
        message.info("=== 叠加模式 ===");
        message.info("自动模式: 提供 srs (EPSG代号)，服务端自动转换坐标");
        message.info("手动模式: 提供 fourParameterBefore (四参数)，自定义坐标变换");
        message.info("");
        message.info("命令方式: WEBMAPOVERLAY 命令打开可视化配置面板");
        
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
