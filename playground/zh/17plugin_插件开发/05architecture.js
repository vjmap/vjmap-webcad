window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --建筑插件--加载建筑插件并通过SDK API创建建筑实体
        // 演示如何通过 PluginManager.loadByName 加载建筑插件，
        // 然后使用 SDK API 直接创建轴网、墙体、门窗等建筑实体并建立关联关系。
        //
        // 前置条件：需要先构建建筑插件
        //   cd webcad-plugins/architecture-plugin && npm run build
        //   然后将 dist/vcad-plugin-architecture.js 复制到 webcad-playground/public/static/plugins/
        
        const {
            MainView, initCadContainer, PluginManager, Engine,
            Point2D, MTextEnt, MTextAttachmentEnum, LineEnt, CircleEnt, TextEnt, TextAlignmentEnum,
            regen, message, writeMessage,
        } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // ============================================================
        // 1. 加载建筑插件（已加载则跳过，正在加载则等待）
        // ============================================================
        message.info("正在加载建筑插件...");
        
        const pm = PluginManager.getInstance();
        try {
            await pm.loadByName('vcad-plugin-architecture', {
                baseUrl: './static/plugins/'
            });
            message.info("建筑插件加载成功！");
        } catch (e) {
            message.error("建筑插件加载失败: " + e.message);
            message.info("请先构建插件: cd webcad-plugins/architecture-plugin && npm run build");
            message.info("然后复制 dist/vcad-plugin-architecture.js 到 webcad-playground/public/static/plugins/");
        }
        
        // ============================================================
        // 2. 获取建筑实体类（插件加载后通过全局变量暴露）
        // ============================================================
        const arch = window.vjcadArchEntities;
        if (!arch) {
            message.error("建筑实体类未找到，请确认插件已正确加载");
        } else {
            // ============================================================
            // 3. 通过 SDK API 创建完整户型图
            // ============================================================
            writeMessage("<br/>通过 SDK API 创建建筑实体...");
            Engine.undoManager.start_undoMark();
        
            const entities = [];
            const P = (x, y) => new Point2D(x, y);
        
            // -- 轴网参数 --
            const hSpacings = [3600, 3900, 5700]; // X方向间距
            const vSpacings = [4200, 2100, 4200]; // Y方向间距
            const totalW = 13200, totalH = 10500;
            const hPos = [0, 3600, 7500, 13200];
            const vPos = [0, 4200, 6300, 10500];
            const WT = 240, IWT = 120;
        
            // -- 3.1 创建轴网 --
            const axisGrid = arch.AxisGridEnt.create(P(0, 0), hSpacings, vSpacings);
            entities.push(axisGrid);
        
            // -- 3.2 创建柱子 --
            const colPositions = [
                P(0, 0), P(totalW, 0), P(0, totalH), P(totalW, totalH),
                P(hPos[2], 0), P(hPos[2], totalH),
            ];
            for (const pos of colPositions) {
                entities.push(arch.ColumnEnt.create(pos, 'rect', 400, 400));
            }
        
            // -- 3.3 创建外墙 --
            const extWalls = [];
            const extWallDefs = [
                [P(0, 0), P(totalW, 0)],
                [P(totalW, 0), P(totalW, totalH)],
                [P(totalW, totalH), P(0, totalH)],
                [P(0, totalH), P(0, 0)],
            ];
            for (const [s, e] of extWallDefs) {
                const w = arch.WallEnt.create(s, e, WT);
                extWalls.push(w);
                entities.push(w);
            }
        
            // -- 3.4 创建内墙 --
            const intWalls = [];
            const intWallDefs = [
                [P(0, vPos[1]), P(totalW, vPos[1]), IWT],
                [P(0, vPos[2]), P(totalW, vPos[2]), IWT],
                [P(hPos[1], vPos[0]), P(hPos[1], vPos[2]), IWT],
                [P(hPos[2], vPos[1]), P(hPos[2], vPos[2]), IWT],
                [P(hPos[2], vPos[2]), P(hPos[2], vPos[3]), IWT],
                [P(0, vPos[2]), P(1800, vPos[2]), IWT],
                [P(1800, vPos[1]), P(1800, vPos[2]), IWT],
            ];
            for (const [s, e, t] of intWallDefs) {
                const w = arch.WallEnt.create(s, e, t);
                intWalls.push(w);
                entities.push(w);
            }
        
            // -- 3.5 创建门（先收集关联信息，添加后再建立关联）--
            const associations = [];
        
            const addDoor = (pos, type, width, rot, wallThk, wall, openDir, openSide) => {
                const d = arch.DoorEnt.create(pos, type, width);
                d.rotation = rot;
                d.wallThickness = wallThk;
                d.openDirection = openDir || 'left';
                d.openSide = openSide || 'inside';
                entities.push(d);
                associations.push({ opening: d, wall });
            };
        
            // 入户门（南墙，双开门）
            addDoor(P(9000, 0), 'double', 1200, 0, WT, extWalls[0], 'left', 'inside');
            // 主卧门
            addDoor(P(2400, vPos[2]), 'single', 900, 0, IWT, intWalls[1], 'left', 'inside');
            // 次卧门
            addDoor(P(2400, vPos[1]), 'single', 900, 0, IWT, intWalls[0], 'left', 'outside');
            // 卫生间门
            addDoor(P(1800, 5250), 'single', 700, Math.PI / 2, IWT, intWalls[6], 'left', 'inside');
            // 厨房推拉门
            addDoor(P(hPos[2], 5250), 'sliding', 1500, Math.PI / 2, IWT, intWalls[3]);
            // 客厅门
            addDoor(P(5500, vPos[2]), 'single', 900, 0, IWT, intWalls[1], 'right', 'inside');
        
            // -- 3.6 创建窗 --
            const addWindow = (pos, type, width, rot, wallThk, wall) => {
                const w = arch.WindowEnt.create(pos, type, width);
                w.rotation = rot;
                w.wallThickness = wallThk;
                entities.push(w);
                associations.push({ opening: w, wall });
            };
        
            addWindow(P(1800, 0), 'standard', 1800, 0, WT, extWalls[0]);
            addWindow(P(11500, 0), 'standard', 1500, 0, WT, extWalls[0]);
            addWindow(P(1800, totalH), 'standard', 1800, 0, WT, extWalls[2]);
            addWindow(P(10000, totalH), 'bay', 2400, 0, WT, extWalls[2]);
            addWindow(P(0, 8400), 'standard', 1500, Math.PI / 2, WT, extWalls[3]);
            addWindow(P(0, 2100), 'standard', 1500, Math.PI / 2, WT, extWalls[3]);
            addWindow(P(totalW, 5250), 'standard', 1200, Math.PI / 2, WT, extWalls[1]);
        
            // -- 3.7 创建阳台 --
            entities.push(arch.BalconyEnt.create(P(0, totalH), P(hPos[1], totalH), 1500));
        
            // -- 3.8 房间标注（直接使用 MTextEnt）--
            const roomDefs = [
                [P(1800, vPos[2] + 2100), '主卧', 3600 * 4200],
                [P(1800, 2100), '次卧', 3600 * 4200],
                [P(900, vPos[1] + 1050), '卫生间', 1800 * 2100],
                [P(3000, vPos[1] + 1050), '走廊', 5700 * 2100],
                [P(hPos[2] + 2850, vPos[2] + 2100), '客厅', 5700 * 4200],
                [P(hPos[2] + 2850, vPos[1] + 1050), '厨房', 5700 * 2100],
                [P(hPos[2] + 2850, 2100), '餐厅', 5700 * 4200],
            ];
            for (const [pos, name, area] of roomDefs) {
                const areaStr = area > 0 ? `\\P${(area / 1e6).toFixed(1)}m²` : '';
                const mtext = new MTextEnt(pos, name + areaStr, 250, 0, MTextAttachmentEnum.MidCenter);
                mtext.color = 256;
                entities.push(mtext);
            }
        
            // -- 3.9 标高符号 --
            entities.push(arch.ElevationMarkEnt.create(P(-2500, 0), 0));
            entities.push(arch.ElevationMarkEnt.create(P(-2500, 1500), 300));
        
            // -- 3.10 剖切符号 --
            entities.push(arch.SectionMarkEnt.create(
                P(hPos[2], -2000), P(hPos[2], totalH + 2000), '1-1', 'left'
            ));
        
            // -- 3.11 指北针 --
            const nPos = P(totalW + 3000, totalH - 1500);
            const aSize = 600;
            entities.push(new LineEnt([nPos.x, nPos.y - aSize], [nPos.x, nPos.y + aSize]));
            entities.push(new LineEnt([nPos.x, nPos.y + aSize], [nPos.x - aSize * 0.3, nPos.y + aSize * 0.5]));
            entities.push(new LineEnt([nPos.x, nPos.y + aSize], [nPos.x + aSize * 0.3, nPos.y + aSize * 0.5]));
            entities.push(new TextEnt(P(nPos.x, nPos.y + aSize * 1.5), 'N', aSize * 0.5, 0, TextAlignmentEnum.MidCenter));
            entities.push(new CircleEnt(nPos, aSize));
        
            // ============================================================
            // 4. 添加所有实体到画布
            // ============================================================
            Engine.addEntities(entities);
        
            // ============================================================
            // 5. 建立门窗与墙体的关联关系（实体添加后才有 ID）
            // ============================================================
            for (const { opening, wall } of associations) {
                const wallId = wall.id ? String(wall.id) : '';
                const openingId = opening.id ? String(opening.id) : '';
                if (wallId && openingId) {
                    opening.wallHandle = wallId;
                    if (!wall.doorWindowHandles.includes(openingId)) {
                        wall.doorWindowHandles = [...wall.doorWindowHandles, openingId];
                    }
                }
            }
        
            // ============================================================
            // 6. 处理墙体拓扑（交叉处自动清理）
            // ============================================================
            // WallService 通过事件监听自动处理，也可手动触发
            if (window.vjcadArchEntities) {
                // WallService is started by the plugin's onActivate
                // Trigger topology processing by modifying any wall
                for (const w of [...extWalls, ...intWalls]) {
                    w.setModified();
                }
            }
        
            Engine.undoManager.end_undoMark();
            regen();
            Engine.zoomExtents();
        
            writeMessage(`<br/>示例户型图已通过 SDK API 创建！共 ${entities.length} 个图元。`);
            message.info("两室两厅户型图已生成，包含轴网、柱子、墙体、门窗、阳台、房间标注、标高、剖切、指北针");
        }
        
        // ============================================================
        // 使用说明
        // ============================================================
        message.info("\n=== 建筑插件 SDK API 使用说明 ===");
        message.info("1. pm.loadByName('vcad-plugin-architecture') 按包名加载插件");
        message.info("2. window.vjcadArchEntities 获取建筑实体类");
        message.info("3. AxisGridEnt.create() 创建轴网");
        message.info("4. WallEnt.create() 创建墙体");
        message.info("5. DoorEnt.create() / WindowEnt.create() 创建门窗");
        message.info("6. 通过 wallHandle / doorWindowHandles 建立关联");
        message.info("7. wall.setModified() 触发拓扑处理");
        
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
