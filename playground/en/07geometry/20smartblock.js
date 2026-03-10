window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --智能识别为块--选择实体组，自动识别图纸中相同的重复图案，可转为块或属性文字块
        const {
            MainView, initCadContainer, Engine, Point2D,
            LineEnt, CircleEnt, ArcEnt, TextEnt, PolylineEnt, InsertEnt,
            createFloatingToolbar, IconRegistry, IconCategory,
            getWebCadCoreService, writeMessage, message,
            findPatternMatches, collectEntityData, defaultPatternMatchOptions,
            convertMatchesToBlocks,
            getSelections, getPoint, InputStatusEnum, SelectionInputOptions, PointInputOptions,
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
        
        // ============================================================
        // 1. Create test drawing: repeated circle+text patterns
        // ============================================================
        
        console.log("=== 智能识别为块 示例 ===\n");
        console.log("--- 1. 创建测试图形 ---");
        
        const positions = [
            [0, 0], [200, 0], [400, 0],
            [0, 200], [200, 200], [400, 200],
            [0, 400], [200, 400], [400, 400],
        ];
        const labels = ["A-1", "A-2", "A-3", "B-1", "B-2", "B-3", "C-1", "C-2", "C-3"];
        
        for (let i = 0; i < positions.length; i++) {
            const [cx, cy] = positions[i];
        
            // Outer circle
            const outerCircle = new CircleEnt([cx, cy], 60);
            outerCircle.setDefaults();
            outerCircle.color = 3;
            Engine.addEntities(outerCircle);
        
            // Inner circle
            const innerCircle = new CircleEnt([cx, cy], 30);
            innerCircle.setDefaults();
            innerCircle.color = 3;
            Engine.addEntities(innerCircle);
        
            // Cross lines
            const hLine = new LineEnt([cx - 40, cy], [cx + 40, cy]);
            hLine.setDefaults();
            hLine.color = 1;
            Engine.addEntities(hLine);
        
            const vLine = new LineEnt([cx, cy - 40], [cx, cy + 40]);
            vLine.setDefaults();
            vLine.color = 1;
            Engine.addEntities(vLine);
        
            // Label text (different value per instance)
            const text = new TextEnt();
            text.setDefaults();
            text.textString = labels[i];
            text.insertionPoint = new Point2D(cx - 15, cy - 80);
            text.height = 20;
            text.color = 5;
            Engine.addEntities(text);
        }
        
        console.log(`创建了 ${positions.length} 组重复图案（圆+十字+标签）`);
        Engine.zoomExtents();
        
        // ============================================================
        // 2. Helper functions
        // ============================================================
        
        function getAllEntities() {
            const space = Engine.currentDoc?.getCurrentSpace();
            return space ? [...space.items].filter(e => e && e.isAlive) : [];
        }
        
        function findEntitiesByIds(ids) {
            const all = getAllEntities();
            return ids.map(id => all.find(e => String(e.id) === String(id))).filter(Boolean);
        }
        
        // ============================================================
        // 3. Smart match via SDK
        // ============================================================
        
        async function doSmartMatch() {
            writeMessage("<br/>--- 智能匹配 ---");
            writeMessage("<br/>请选择要识别的实体（作为 pattern），按回车确认...");
        
            const selResult = await getSelections(new SelectionInputOptions());
            if (selResult.status !== InputStatusEnum.OK || !selResult.value.length) {
                writeMessage("<br/>未选择实体，取消。");
                return null;
            }
        
            const patternEntities = selResult.value;
            writeMessage(`<br/>已选择 ${patternEntities.length} 个实体作为 pattern`);
        
            const allEntities = getAllEntities();
            const options = { ...defaultPatternMatchOptions };
        
            writeMessage("<br/>正在匹配...");
            const t0 = performance.now();
        
            const output = findPatternMatches(patternEntities, allEntities, options);
        
            const elapsed = (performance.now() - t0).toFixed(1);
            writeMessage(`<br/>匹配完成: 找到 ${output.matches.length} 个匹配，耗时 ${elapsed}ms`);
        
            if (output.matches.length > 0) {
                writeMessage("<br/>匹配结果:");
                output.matches.forEach((m, i) => {
                    writeMessage(`<br/>  #${i + 1}: ${m.entityIds.length} 个实体, 得分 ${m.score.toFixed(2)}, 缩放 ${m.transform.scale.toFixed(2)}, 旋转 ${(m.transform.rotation * 180 / Math.PI).toFixed(1)}°`);
                });
        
                // Highlight first match
                const firstMatchEnts = findEntitiesByIds(output.matches[0].entityIds);
                if (firstMatchEnts.length > 0) {
                    Engine.zoomToEntities(firstMatchEnts);
                    Engine.editor?.ssSetFirst(firstMatchEnts);
                }
            }
        
            return { patternEntities, output };
        }
        
        // ============================================================
        // 4. Convert to block
        // ============================================================
        
        let lastMatchData = null;
        
        async function doConvertToBlock() {
            if (!lastMatchData || !lastMatchData.output.matches.length) {
                writeMessage("<br/>请先执行智能匹配");
                return;
            }
        
            writeMessage("<br/>--- 转换为块 ---");
            const blockName = convertMatchesToBlocks(
                lastMatchData.patternEntities,
                lastMatchData.output.matches,
                { blockName: undefined, textToAttribute: false }
            );
        
            if (blockName) {
                writeMessage(`<br/>成功创建块 "${blockName}"，共 ${lastMatchData.output.matches.length + 1} 个实例`);
                lastMatchData = null;
            }
        }
        
        // ============================================================
        // 5. Convert to attribute block (text becomes attribute)
        // ============================================================
        
        async function doConvertToAttrBlock() {
            if (!lastMatchData || !lastMatchData.output.matches.length) {
                writeMessage("<br/>请先执行智能匹配");
                return;
            }
        
            writeMessage("<br/>--- 转换为属性文字块 ---");
            const blockName = convertMatchesToBlocks(
                lastMatchData.patternEntities,
                lastMatchData.output.matches,
                { blockName: undefined, textToAttribute: true }
            );
        
            if (blockName) {
                writeMessage(`<br/>成功创建属性文字块 "${blockName}"，文本已转为属性，共 ${lastMatchData.output.matches.length + 1} 个实例`);
                lastMatchData = null;
            }
        }
        
        // ============================================================
        // 6. Locate match by index
        // ============================================================
        
        function doLocateMatch(index) {
            if (!lastMatchData || index >= lastMatchData.output.matches.length) {
                writeMessage("<br/>无效的匹配索引");
                return;
            }
            const match = lastMatchData.output.matches[index];
            const ents = findEntitiesByIds(match.entityIds);
            if (ents.length > 0) {
                Engine.zoomToEntities(ents);
                Engine.editor?.ssSetFirst(ents);
                writeMessage(`<br/>已定位到匹配 #${index + 1}`);
            }
        }
        
        // ============================================================
        // 7. Open SmartBlock panel (command)
        // ============================================================
        
        function doOpenPanel() {
            Engine.editor?.executerWithOp("SMARTBLOCK");
        }
        
        // ============================================================
        // 8. Floating toolbar
        // ============================================================
        
        function cmdIcon(name) {
            const svg = IconRegistry.getIcon(name, IconCategory.Commands);
            if (svg) return svg;
            const letter = name.charAt(0).toUpperCase();
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#2d3748"/><text x="16" y="21" text-anchor="middle" font-size="14" fill="#58a6ff" font-family="sans-serif">${letter}</text></svg>`;
        }
        
        const smartBlockIcon = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="4" fill="#2d3748"/><rect x="4" y="4" width="11" height="11" rx="1" stroke="#58a6ff" stroke-width="1.5" fill="none"/><rect x="4" y="17" width="11" height="11" rx="1" stroke="#58a6ff" stroke-width="1.5" fill="none" opacity="0.4" stroke-dasharray="2 1.5"/><circle cx="22" cy="22" r="5" stroke="#F59E0B" stroke-width="1.5" fill="none"/><line x1="25.5" y1="25.5" x2="28" y2="28" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/></svg>`;
        
        const toolbar = createFloatingToolbar('smartblock-demo', {
            title: '智能识别为块',
            columns: 3,
            iconSize: 32,
            position: { top: '80px', right: '20px' },
            items: [
                {
                    id: 'match',
                    icon: smartBlockIcon,
                    tooltip: '智能匹配（选择实体后识别）',
                    onClick: async () => {
                        lastMatchData = await doSmartMatch();
                    }
                },
                {
                    id: 'toblock',
                    icon: cmdIcon('block'),
                    tooltip: '转换为块',
                    onClick: () => doConvertToBlock()
                },
                {
                    id: 'toattrblock',
                    icon: cmdIcon('createsymbol'),
                    tooltip: '转换为属性文字块',
                    onClick: () => doConvertToAttrBlock()
                },
                {
                    id: 'locate0',
                    icon: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="4" fill="#2d3748"/><text x="16" y="22" text-anchor="middle" font-size="16" fill="#4ADE80" font-family="sans-serif">1</text></svg>`,
                    tooltip: '定位到匹配 #1',
                    onClick: () => doLocateMatch(0)
                },
                {
                    id: 'locate1',
                    icon: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="4" fill="#2d3748"/><text x="16" y="22" text-anchor="middle" font-size="16" fill="#4ADE80" font-family="sans-serif">2</text></svg>`,
                    tooltip: '定位到匹配 #2',
                    onClick: () => doLocateMatch(1)
                },
                {
                    id: 'panel',
                    icon: cmdIcon('smartblock'),
                    tooltip: '打开设置面板',
                    onClick: () => doOpenPanel()
                },
            ],
        });
        toolbar.show();
        
        // ============================================================
        // 9. Usage instructions
        // ============================================================
        
        message.info("=== 智能识别为块 示例 ===");
        message.info("图纸中有 9 组重复图案（双圆+十字+标签文字）");
        message.info("");
        message.info("--- 操作步骤 ---");
        message.info("1. 点击工具栏「智能匹配」按钮");
        message.info("2. 框选其中一组图案（如左上角的圆+十字+文字），按回车确认");
        message.info("3. 自动识别出其余 8 组相同图案");
        message.info("4. 点击「转换为块」将所有匹配转为块参照");
        message.info("5. 或点击「转换为属性文字块」，文字会变成块属性（每个实例保留各自的标签值）");
        message.info("");
        message.info("--- SDK 接口 ---");
        message.info("findPatternMatches(pattern, allEntities, options) → 匹配结果");
        message.info("convertMatchesToBlocks(pattern, matches, { textToAttribute }) → 转为块");
        message.info("collectEntityData(entity) → 单实体数据收集");
        message.info("");
        message.info("--- 也可以点击「打开设置面板」使用完整的 SMARTBLOCK 命令面板 ---");
        
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
