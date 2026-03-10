window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --网络图--拓扑网络图完整示例（节点+分支+拓扑关系+交互绘制）
        // 本示例包含：
        // 1. 定义网络节点实体（NetworkNodeEnt）和网络分支实体（NetworkBranchEnt）
        // 2. 用示例数据生成一张完整的网络图（含直线和圆弧分支）
        // 3. 注册交互绘制命令，用户可手动绘制网络图
        // 特性：
        // - 移动节点时，关联的分支自动跟随（Reactor模式）
        // - 分支不与节点圆相交，箭头绘制在分支中间
        // - 分支支持直线和圆弧两种形式，拖动中点夹点可转换
        // - 删除节点时级联删除关联分支，删除分支时清理孤立节点
        const {
            MainView, initCadContainer, Engine, Point2D, message,
            CustomEntityRegistry, CustomEntityBase,
            EntityReactorManager, ReactorEvent, CadEventManager, CadEvents,
            CircleEnt, LineEnt, ArcEnt, SolidEnt, TextEnt, TextAlignmentEnum,
            CommandRegistry, CommandDefinition, CommandOptions,
            PointInputOptions, InputStatusEnum, writeMessage
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
        // 工具函数
        // ============================================================
        
        // 生成唯一的网络ID
        function genId() { return `nn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`; }
        
        // ============================================================
        // 网络节点实体 - 继承 CustomEntityBase
        // 作为 Owner 实体，移动时通过 Reactor 通知关联分支更新
        // ============================================================
        class NetworkNodeEnt extends CustomEntityBase {
            get customType() { return 'NETWORK_NODE'; }
            get customDisplayName() { return '网络节点'; }
        
            constructor() {
                super();
                this._position = new Point2D(0, 0);  // 节点中心坐标
                this._radius = 10;                    // 圆半径
                this._label = '';                      // 节点标签
                this._networkId = genId();             // 唯一网络ID（用于拓扑关系和复制粘贴重建）
                // 持久文本成员：在buildNestEnts中直接push，不克隆（WebCAD约束）
                this._labelText = new TextEnt([0, 0], '', 7, 0, TextAlignmentEnum.MidCenter);
                this._labelText.setDefaults();
            }
        
            get position() { return this._position; }
            get networkId() { return this._networkId; }
            get radius() { return this._radius; }
            get label() { return this._label; }
        
            // 捕捉点：圆心
            getSnapPoints() { return [{ point: this._position.clone(), type: 'center' }]; }
        
            // 夹点：圆心（可拖动移动节点）
            getGripPoints() { return [{ point: this._position.clone(), gripId: 'center', type: 'move' }]; }
        
            // 夹点编辑：更新位置并触发 setModified -> reactor 通知关联分支
            gripEdit(newPos, gripId) {
                if (gripId === 'center') { this._position = newPos.clone(); this.setModified(); }
            }
        
            // 构建嵌套实体（用于渲染）：圆 + 居中文字
            buildNestEnts() {
                const circle = new CircleEnt(this._position.clone(), this._radius);
                circle.fromDefaultProps(this);
                // 文本直接使用持久成员，设置 block 属性
                this._labelText.insertionPoint = this._position.clone();
                this._labelText.text = this._label;
                this._labelText.height = this._radius * 0.7;
                this._labelText.textAlignment = TextAlignmentEnum.MidCenter;
                this._labelText.fromDefaultProps(this);
                this._labelText.block = this.block;
                return [circle, this._labelText];
            }
        
            // 克隆：保留 networkId（复制粘贴时用于重建拓扑），克隆文字
            clone() {
                const c = new NetworkNodeEnt();
                c.fromDefaultProps(this);
                c._position = this._position.clone();
                c._radius = this._radius;
                c._label = this._label;
                c._networkId = this._networkId;
                c._labelText = this._labelText.clone();
                c._labelText.fromDefaultProps(this._labelText);
                return c;
            }
        
            // 序列化/反序列化
            getEntityData() {
                return { position: { x: this._position.x, y: this._position.y }, radius: this._radius, label: this._label, networkId: this._networkId };
            }
            setEntityData(d) {
                if (d.position) this._position = new Point2D(d.position.x, d.position.y);
                if (d.radius !== undefined) this._radius = d.radius;
                if (d.label !== undefined) this._label = d.label;
                if (d.networkId !== undefined) this._networkId = d.networkId;
                this.setModified();
            }
            fromDb(db) { this.fromDbDefaultProps(db); if (db.data) this.setEntityData(db.data); }
        
            // 几何变换：移动位置后 setModified 触发 reactor
            move(f, t) {
                const fp = f instanceof Point2D ? f : new Point2D(f[0], f[1]);
                const tp = t instanceof Point2D ? t : new Point2D(t[0], t[1]);
                this._position.x += tp.x - fp.x;
                this._position.y += tp.y - fp.y;
                this.setModified();
            }
        }
        
        // ============================================================
        // 网络分支实体 - 继承 CustomEntityBase + 实现 IEntityReactor
        // 作为 Reactor 订阅两端节点，节点移动时自动更新端点
        // 支持直线（bulge=0）和圆弧（bulge≠0）两种形式
        // ============================================================
        class NetworkBranchEnt extends CustomEntityBase {
            get customType() { return 'NETWORK_BRANCH'; }
            get customDisplayName() { return '网络分支'; }
        
            constructor() {
                super();
                this._startPoint = new Point2D(0, 0);   // 起点（缓存，由reactor更新）
                this._endPoint = new Point2D(1, 0);      // 终点（缓存）
                this._label = '';                         // 分支标签
                this._showArrow = true;                   // 是否显示箭头
                this._bulge = 0;                          // 凸度（0=直线，非0=圆弧）
                this._startNetworkId = '';                // 起始节点的networkId
                this._endNetworkId = '';                  // 终止节点的networkId
                this._startNodeRadius = 0;                // 缓存起始节点半径（用于裁剪）
                this._endNodeRadius = 0;                  // 缓存终止节点半径
                this._ownerRefs = [];                     // reactor关联引用
                this._reactorDirty = false;
                this._reactorRegistered = false;
                this._labelText = new TextEnt([0, 0], '', 5, 0, TextAlignmentEnum.MidCenter);
                this._labelText.setDefaults();
            }
        
            get startNetworkId() { return this._startNetworkId; }
            get endNetworkId() { return this._endNetworkId; }
            get isAssociative() { return this._ownerRefs.length > 0; }
        
            // 捕捉点
            getSnapPoints() {
                return [
                    { point: this._startPoint.clone(), type: 'endpoint' },
                    { point: this._endPoint.clone(), type: 'endpoint' }
                ];
            }
        
            // 夹点：分支中点（直线在线中点，圆弧在弧顶点）
            // 拖动中点夹点可将直线变为圆弧，或调整圆弧弧度
            getGripPoints() {
                const sp = this._startPoint, ep = this._endPoint;
                const dx = ep.x - sp.x, dy = ep.y - sp.y, len = Math.sqrt(dx * dx + dy * dy);
                let mx = (sp.x + ep.x) / 2, my = (sp.y + ep.y) / 2;
                if (len > 1e-6 && Math.abs(this._bulge) > 1e-6) {
                    const px = -dy / len, py = dx / len;
                    const sag = this._bulge * len / 2;
                    mx += px * sag; my += py * sag;
                }
                return [{ point: new Point2D(mx, my), gripId: 'mid', type: 'stretch' }];
            }
        
            // 夹点编辑：根据拖动位置计算新的凸度值
            gripEdit(newPos, gripId) {
                if (gripId !== 'mid') return;
                const sp = this._startPoint, ep = this._endPoint;
                const dx = ep.x - sp.x, dy = ep.y - sp.y, len = Math.sqrt(dx * dx + dy * dy);
                if (len < 1e-6) return;
                const cross = dx * (newPos.y - sp.y) - dy * (newPos.x - sp.x);
                const nb = 2 * cross / (len * len);
                this._bulge = Math.abs(nb) < 0.02 ? 0 : nb; // 接近0时自动归为直线
                this.setModified();
            }
        
            // 计算圆弧参数（圆心、半径）
            _getArcParams() {
                if (Math.abs(this._bulge) < 1e-6) return null;
                const dx = this._endPoint.x - this._startPoint.x;
                const dy = this._endPoint.y - this._startPoint.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                if (len < 1e-6) return null;
                const halfChord = len / 2;
                const b = this._bulge;
                const radius = halfChord * (b * b + 1) / (2 * Math.abs(b));
                const mx = (this._startPoint.x + this._endPoint.x) / 2;
                const my = (this._startPoint.y + this._endPoint.y) / 2;
                const perpX = -dy / len, perpY = dx / len;
                const distToCenter = -halfChord * (1 - b * b) / (2 * b);
                return { center: new Point2D(mx + perpX * distToCenter, my + perpY * distToCenter), radius };
            }
        
            // 构建嵌套实体（渲染）
            // 核心逻辑：裁剪+圆弧/直线+箭头+标签
            buildNestEnts() {
                if (this._reactorDirty && this._ownerRefs.length > 0) this.updateFromOwners();
                const entities = [];
                const sp = this._startPoint, ep = this._endPoint;
                const dx = ep.x - sp.x, dy = ep.y - sp.y, len = Math.sqrt(dx * dx + dy * dy);
                if (len < 1e-6) return entities;
        
                // 从reactor获取节点半径
                let sr = this._startNodeRadius, er = this._endNodeRadius;
                if (this._ownerRefs.length > 0) {
                    const space = this.block?.doc?.currentSpace;
                    if (space) {
                        for (const ref of this._ownerRefs) {
                            for (const e of space.aliveItems) {
                                if (e.id === ref.entityId && e instanceof NetworkNodeEnt) {
                                    if (ref.meta?.role === 'start') { sr = e.radius; this._startNodeRadius = sr; }
                                    if (ref.meta?.role === 'end') { er = e.radius; this._endNodeRadius = er; }
                                }
                            }
                        }
                    }
                }
        
                let midPt, tangentX, tangentY;
        
                if (Math.abs(this._bulge) < 1e-6) {
                    // ---- 直线 ----
                    // 裁剪：起点沿弦方向偏移起始节点半径，终点反向偏移终止节点半径
                    const ux = dx / len, uy = dy / len;
                    const vs = new Point2D(sp.x + ux * sr, sp.y + uy * sr);
                    const ve = new Point2D(ep.x - ux * er, ep.y - uy * er);
                    const vdx = ve.x - vs.x, vdy = ve.y - vs.y, vl = Math.sqrt(vdx * vdx + vdy * vdy);
                    if (vl < 1e-6) return entities;
                    const line = new LineEnt(vs.clone(), ve.clone());
                    line.fromDefaultProps(this);
                    entities.push(line);
                    midPt = new Point2D((vs.x + ve.x) / 2, (vs.y + ve.y) / 2);
                    tangentX = vdx / vl; tangentY = vdy / vl;
                } else {
                    // ---- 圆弧 ----
                    // 用ArcEnt渲染，始终使用CCW模式
                    const arcP = this._getArcParams();
                    if (!arcP) return entities;
                    const { center, radius } = arcP;
                    const startAng = Math.atan2(sp.y - center.y, sp.x - center.x);
                    const endAng = Math.atan2(ep.y - center.y, ep.x - center.x);
                    // 裁剪角度：在节点圆内的弧段不绘制
                    const trimStart = sr > 0 && sr < 2 * radius ? 2 * Math.asin(sr / (2 * radius)) : 0;
                    const trimEnd = er > 0 && er < 2 * radius ? 2 * Math.asin(er / (2 * radius)) : 0;
        
                    let arcStart, arcEnd;
                    if (this._bulge > 0) {
                        // 正凸度：自然方向CW，交换起止角以CCW渲染
                        arcStart = endAng + trimEnd;
                        arcEnd = startAng - trimStart;
                    } else {
                        arcStart = startAng + trimStart;
                        arcEnd = endAng - trimEnd;
                    }
                    const arc = new ArcEnt(center.clone(), radius, arcStart, arcEnd);
                    arc._isCCW = true;
                    arc.fromDefaultProps(this);
                    entities.push(arc);
        
                    // 弧中点
                    let adjustedEnd = arcEnd;
                    if (adjustedEnd < arcStart) adjustedEnd += 2 * Math.PI;
                    const midAng = (arcStart + adjustedEnd) / 2;
                    midPt = new Point2D(center.x + radius * Math.cos(midAng), center.y + radius * Math.sin(midAng));
                    if (this._bulge > 0) { tangentX = Math.sin(midAng); tangentY = -Math.cos(midAng); }
                    else { tangentX = -Math.sin(midAng); tangentY = Math.cos(midAng); }
                }
        
                // 箭头：在分支中点绘制实体填充三角形
                if (this._showArrow) {
                    const al = Math.min(len * 0.08, 6), aw = al * 0.45;
                    const px = -tangentY, py = tangentX;
                    const arrow = new SolidEnt(
                        [midPt.x + tangentX * al / 2, midPt.y + tangentY * al / 2],
                        [midPt.x - tangentX * al / 2 + px * aw, midPt.y - tangentY * al / 2 + py * aw],
                        [midPt.x - tangentX * al / 2 - px * aw, midPt.y - tangentY * al / 2 - py * aw]
                    );
                    arrow.fromDefaultProps(this);
                    entities.push(arrow);
                }
        
                // 标签：放在分支中点旁边
                const lpx = -tangentY, lpy = tangentX;
                const off = Math.abs(this._bulge) > 0.01 ? 3 + Math.abs(this._bulge) * len * 0.05 : 5;
                const sgn = this._bulge > 0.01 ? 1 : this._bulge < -0.01 ? -1 : 1;
                this._labelText.insertionPoint = new Point2D(midPt.x + lpx * off * sgn, midPt.y + lpy * off * sgn);
                this._labelText.text = this._label;
                this._labelText.height = 5;
                this._labelText.textAlignment = TextAlignmentEnum.MidCenter;
                this._labelText.fromDefaultProps(this);
                this._labelText.block = this.block;
                entities.push(this._labelText);
                return entities;
            }
        
            clone() {
                const c = new NetworkBranchEnt();
                c.fromDefaultProps(this);
                c._startPoint = this._startPoint.clone(); c._endPoint = this._endPoint.clone();
                c._label = this._label; c._showArrow = this._showArrow; c._bulge = this._bulge;
                c._startNetworkId = this._startNetworkId; c._endNetworkId = this._endNetworkId;
                c._startNodeRadius = this._startNodeRadius; c._endNodeRadius = this._endNodeRadius;
                c._labelText = this._labelText.clone(); c._labelText.fromDefaultProps(this._labelText);
                return c;
            }
        
            getEntityData() {
                return {
                    startPoint: { x: this._startPoint.x, y: this._startPoint.y },
                    endPoint: { x: this._endPoint.x, y: this._endPoint.y },
                    label: this._label, showArrow: this._showArrow, bulge: this._bulge,
                    startNetworkId: this._startNetworkId, endNetworkId: this._endNetworkId,
                    startNodeRadius: this._startNodeRadius, endNodeRadius: this._endNodeRadius,
                    ownerRefs: this._ownerRefs.length > 0 ? [...this._ownerRefs] : undefined
                };
            }
            setEntityData(d) {
                if (d.startPoint) this._startPoint = new Point2D(d.startPoint.x, d.startPoint.y);
                if (d.endPoint) this._endPoint = new Point2D(d.endPoint.x, d.endPoint.y);
                if (d.label !== undefined) this._label = d.label;
                if (d.showArrow !== undefined) this._showArrow = d.showArrow;
                if (d.bulge !== undefined) this._bulge = d.bulge;
                if (d.startNetworkId !== undefined) this._startNetworkId = d.startNetworkId;
                if (d.endNetworkId !== undefined) this._endNetworkId = d.endNetworkId;
                if (d.startNodeRadius !== undefined) this._startNodeRadius = d.startNodeRadius;
                if (d.endNodeRadius !== undefined) this._endNodeRadius = d.endNodeRadius;
                if (d.ownerRefs) this._ownerRefs = [...d.ownerRefs];
                this.setModified();
            }
            fromDb(db) { this.fromDbDefaultProps(db); if (db.data) this.setEntityData(db.data); }
        
            // 移动：更新缓存端点（粘贴时需要），reactor之后会覆盖
            move(f, t) {
                const fp = f instanceof Point2D ? f : new Point2D(f[0], f[1]);
                const tp = t instanceof Point2D ? t : new Point2D(t[0], t[1]);
                const ddx = tp.x - fp.x, ddy = tp.y - fp.y;
                this._startPoint.x += ddx; this._startPoint.y += ddy;
                this._endPoint.x += ddx; this._endPoint.y += ddy;
                this.setModified();
            }
        
            // ---- IEntityReactor 接口实现 ----
        
            getOwnerIds() { return this._ownerRefs.map(r => r.entityId); }
        
            // 节点变化时的回调
            onOwnerChanged(args) {
                if (args.event === ReactorEvent.Erased) {
                    this._ownerRefs = this._ownerRefs.filter(r => r.entityId !== args.ownerId);
                    if (this._ownerRefs.length === 0) this.unlinkAllOwners();
                } else {
                    this.setReactorDirty();
                }
            }
        
            setReactorDirty() { this._reactorDirty = true; this.setModified(); }
            isReactorDirty() { return this._reactorDirty; }
        
            // 从关联节点更新端点位置
            updateFromOwners() {
                if (!this._ownerRefs.length) { this._reactorDirty = false; return false; }
                const space = this.block?.doc?.currentSpace;
                if (!space) { this._reactorDirty = false; return false; }
                for (const ref of this._ownerRefs) {
                    for (const e of space.aliveItems) {
                        if (e.id === ref.entityId && e instanceof NetworkNodeEnt) {
                            if (ref.meta?.role === 'start') { this._startPoint = e.position.clone(); this._startNodeRadius = e.radius; }
                            if (ref.meta?.role === 'end') { this._endPoint = e.position.clone(); this._endNodeRadius = e.radius; }
                        }
                    }
                }
                this._reactorDirty = false;
                return true;
            }
        
            unlinkAllOwners() {
                if (this._reactorRegistered) {
                    EntityReactorManager.getInstance().unregisterReactor(this.id, this.block?.doc?.docId);
                    this._reactorRegistered = false;
                }
                this._ownerRefs = [];
            }
        
            tryRegisterReactor(docId) {
                if (this._reactorRegistered) return false;
                if (this._ownerRefs.length > 0) {
                    EntityReactorManager.getInstance().registerReactor(this, docId);
                    this._reactorRegistered = true;
                    return true;
                }
                return false;
            }
        
            // 建立reactor关联（必须在addEntity之后调用，因为需要有效的entity id）
            setSourceNodes(startId, endId) {
                this.unlinkAllOwners();
                this._ownerRefs = [
                    { entityId: startId, meta: { role: 'start' } },
                    { entityId: endId, meta: { role: 'end' } }
                ];
                const space = this.block?.doc?.currentSpace;
                if (space) {
                    for (const e of space.aliveItems) {
                        if (e.id === startId && e instanceof NetworkNodeEnt) { this._startPoint = e.position.clone(); this._startNodeRadius = e.radius; }
                        if (e.id === endId && e instanceof NetworkNodeEnt) { this._endPoint = e.position.clone(); this._endNodeRadius = e.radius; }
                    }
                }
                const did = this.block?.doc?.docId;
                if (did !== undefined) {
                    EntityReactorManager.getInstance().registerReactor(this, did);
                    this._reactorRegistered = true;
                }
            }
        
            // 从第三点计算凸度值（用于交互绘制圆弧分支）
            static bulgeFromThirdPoint(sp, ep, pt) {
                const dx = ep.x - sp.x, dy = ep.y - sp.y, len = Math.sqrt(dx * dx + dy * dy);
                if (len < 1e-6) return 0;
                const cross = dx * (pt.y - sp.y) - dy * (pt.x - sp.x);
                return 2 * cross / (len * len);
            }
        }
        
        // ============================================================
        // 注册自定义实体类型
        // ============================================================
        const registry = CustomEntityRegistry.getInstance();
        registry.register('NETWORK_NODE', NetworkNodeEnt);
        registry.register('NETWORK_BRANCH', NetworkBranchEnt);
        
        // ============================================================
        // 从拓扑数据生成网络图
        // ============================================================
        function generateNetwork(data) {
            const nodeMap = new Map();
            const nodes = [];
            const branches = [];
        
            // 创建节点实体
            for (const nd of data.nodes) {
                const node = new NetworkNodeEnt();
                node._position = new Point2D(nd.x, nd.y);
                node._label = nd.label;
                node._radius = nd.radius || 15;
                node.objectId = 'node_' + nd.id; // 设置objectId，clone时会生成clone_前缀
                node.setDefaults();
                nodeMap.set(nd.id, node);
                nodes.push(node);
            }
        
            // 创建分支实体
            for (const bd of data.branches) {
                const sn = nodeMap.get(bd.startNodeId);
                const en = nodeMap.get(bd.endNodeId);
                if (!sn || !en) continue;
                const b = new NetworkBranchEnt();
                b._startPoint = sn.position.clone();
                b._endPoint = en.position.clone();
                b._startNetworkId = sn.networkId;
                b._endNetworkId = en.networkId;
                b._startNodeRadius = sn._radius;
                b._endNodeRadius = en._radius;
                b._label = bd.label;
                b._showArrow = bd.showArrow !== false;
                b._bulge = bd.bulge || 0;
                b.objectId = 'branch_' + bd.label; // 设置objectId
                b.setDefaults();
                branches.push(b);
            }
        
            return { nodes, branches, nodeMap };
        }
        
        // 建立reactor关联（需在addEntity之后调用）
        function linkBranches(nodes, branches) {
            const byId = new Map();
            for (const n of nodes) byId.set(n.networkId, n);
            for (const b of branches) {
                const sn = byId.get(b.startNetworkId);
                const en = byId.get(b.endNetworkId);
                if (sn && en) b.setSourceNodes(sn.id, en.id);
            }
        }
        
        // ============================================================
        // 示例拓扑数据
        // ============================================================
        const topologyData = {
            nodes: [
                { id: '1', x: 0,   y: 0,    label: '1', radius: 18 },
                { id: '2', x: 200, y: 120,  label: '2', radius: 18 },
                { id: '3', x: 200, y: -120, label: '3', radius: 18 },
                { id: '4', x: 450, y: 0,    label: '4', radius: 18 },
                { id: '5', x: 620, y: 0,    label: '5', radius: 18 }
            ],
            branches: [
                { startNodeId: '1', endNodeId: '2', label: '1' },
                { startNodeId: '1', endNodeId: '3', label: '2' },
                { startNodeId: '2', endNodeId: '3', label: '3' },
                { startNodeId: '1', endNodeId: '4', label: '4' },
                { startNodeId: '2', endNodeId: '4', label: '5', bulge: 0.15 },  // 圆弧分支
                { startNodeId: '2', endNodeId: '4', label: '6' },
                { startNodeId: '2', endNodeId: '4', label: '7', bulge: -0.15 }, // 反向圆弧分支
                { startNodeId: '3', endNodeId: '4', label: '8' },
                { startNodeId: '4', endNodeId: '5', label: '9' }
            ]
        };
        
        // 生成并添加到画布
        const { nodes, branches } = generateNetwork(topologyData);
        Engine.addEntities([...nodes, ...branches]);
        linkBranches(nodes, branches);
        Engine.zoomExtents();
        
        // ============================================================
        // 注册交互绘制命令 BINDRAWNETWORK
        // 流程：点击起始节点位置 -> 点击终止节点位置 -> 回车=直线/点击第三点=圆弧
        // 如果点击位置附近有已有节点，自动捕捉复用；否则创建新节点
        // ============================================================
        const SNAP_TOLERANCE = 0.5;
        let nodeCount = nodes.length + 1;
        let branchCount = branches.length;
        
        function findNodeAtPoint(pt, exclude) {
            const all = Engine.getEntities(e => e.isAlive && e.type === 'CUSTOM' && e.customType === 'NETWORK_NODE');
            for (const n of all) {
                if (exclude && n === exclude) continue;
                const dx = pt.x - n._position.x, dy = pt.y - n._position.y;
                if (Math.sqrt(dx * dx + dy * dy) < Math.max(n._radius * SNAP_TOLERANCE, 1)) return n;
            }
            return null;
        }
        
        class DrawNetworkCmd {
            async main() {
                writeMessage('<br/>绘制网络图 - 点击指定起止节点位置（自动捕捉已有节点），回车=直线，点击第三点=圆弧');
                drawingInProgress = true;
                Engine.undoManager.start_undoMark();
        
                try {
                    while (true) {
                        const newNodes = [];
        
                        // 步骤1：指定起始节点位置
                        const startResult = await this.getNodePoint('指定起始节点位置:');
                        if (!startResult) break;
                        if (startResult.created) newNodes.push(startResult.node);
        
                        // 步骤2：指定终止节点位置
                        const endResult = await this.getNodePoint('指定终止节点位置:', startResult.node);
                        if (!endResult) { this.rollback(newNodes); break; }
                        if (endResult.created) newNodes.push(endResult.node);
        
                        // 步骤3：回车=直线，点击第三点=圆弧
                        const bulge = await this.getArcOrLine(startResult.node, endResult.node);
                        if (bulge === null) { this.rollback(newNodes); break; }
        
                        // 步骤4：创建分支
                        const label = String(++branchCount);
                        const sn = startResult.node, en = endResult.node;
                        const b = new NetworkBranchEnt();
                        b._startPoint = sn.position.clone(); b._endPoint = en.position.clone();
                        b._startNetworkId = sn.networkId; b._endNetworkId = en.networkId;
                        b._startNodeRadius = sn._radius; b._endNodeRadius = en._radius;
                        b._label = label; b._bulge = bulge;
                        b.objectId = 'branch_draw_' + label;
                        b.setDefaults();
                        Engine.addEntities(b);
                        b.setSourceNodes(sn.id, en.id);
                        const shape = Math.abs(bulge) < 0.01 ? '直线' : '圆弧';
                        writeMessage(`<br/>已创建分支 ${label} (${shape}): 节点${sn._label} → 节点${en._label}`);
                    }
                } finally {
                    drawingInProgress = false;
                    Engine.undoManager.end_undoMark();
                    Engine.clearPreview();
                }
            }
        
            rollback(nodes) {
                const alive = nodes.filter(n => n.isAlive);
                if (alive.length > 0) Engine.eraseEntities(alive);
            }
        
            async getNodePoint(prompt, exclude) {
                const opts = new PointInputOptions(prompt);
                opts.callback = (cp) => {
                    const wp = Engine.canvasToWcs(cp);
                    Engine.clearPreview();
                    if (!findNodeAtPoint(wp, exclude)) {
                        Engine.drawPreviewEntity(new CircleEnt([wp.x, wp.y], 10));
                    }
                };
                const r = await Engine.getPoint(opts);
                Engine.clearPreview();
                if (r.status !== InputStatusEnum.OK) return null;
                const pt = r.value;
                const existing = findNodeAtPoint(pt, exclude);
                if (existing) {
                    writeMessage(`<br/>捕捉到已有节点 ${existing._label}`);
                    return { node: existing, created: false };
                }
                const n = new NetworkNodeEnt();
                n._position = pt.clone(); n._label = String(nodeCount++); n._radius = 10;
                n.objectId = 'node_draw_' + n._label;
                n.setDefaults();
                Engine.addEntities(n);
                writeMessage(`<br/>创建新节点 ${n._label}`);
                return { node: n, created: true };
            }
        
            async getArcOrLine(sn, en) {
                const sp = sn.position, ep = en.position;
                const nextLabel = String(branchCount + 1);
                const opts = new PointInputOptions('指定圆弧经过点 <直线>:');
                opts.useBasePoint = true; opts.basePoint = sp;
                opts.callback = (cp) => {
                    const wp = Engine.canvasToWcs(cp);
                    const bg = NetworkBranchEnt.bulgeFromThirdPoint(sp, ep, wp);
                    const prev = new NetworkBranchEnt();
                    prev._startPoint = sp.clone(); prev._endPoint = ep.clone();
                    prev._startNodeRadius = sn._radius; prev._endNodeRadius = en._radius;
                    prev._bulge = Math.abs(bg) < 0.02 ? 0 : bg; prev._showArrow = true; prev._label = nextLabel;
                    prev.setDefaults();
                    Engine.clearPreview(); Engine.drawPreviewEntity(prev);
                };
                const r = await Engine.getPoint(opts); Engine.clearPreview();
                if (r.status === InputStatusEnum.OK) {
                    const bg = NetworkBranchEnt.bulgeFromThirdPoint(sp, ep, r.value);
                    return Math.abs(bg) < 0.02 ? 0 : bg;
                }
                if (r.status === InputStatusEnum.Cancel) return null;
                return 0; // 回车=直线
            }
        }
        
        // 注册绘制命令
        const cmdOpts = new CommandOptions();
        CommandRegistry.regist(new CommandDefinition('BINDRAWNETWORK', '绘制网络图', DrawNetworkCmd, cmdOpts));
        
        // ============================================================
        // 级联删除：删除节点时删除关联分支，删除分支时删除孤立节点
        // ============================================================
        function isNode(e) { return e.type === 'CUSTOM' && e.customType === 'NETWORK_NODE'; }
        function isBranch(e) { return e.type === 'CUSTOM' && e.customType === 'NETWORK_BRANCH'; }
        function isAliveNode(e) { return e.isAlive && isNode(e); }
        function isAliveBranch(e) { return e.isAlive && isBranch(e); }
        function getNetId(e) { return e._networkId || e.networkId || ''; }
        function getStartNetId(e) { return e._startNetworkId || e.startNetworkId || ''; }
        function getEndNetId(e) { return e._endNetworkId || e.endNetworkId || ''; }
        
        let cascadeProcessing = false;
        let pendingErasedNodes = [];
        let pendingErasedBranches = [];
        let cascadeTimer = null;
        
        function processCascadeDelete() {
            cascadeProcessing = true;
            try {
                const deletedNodeNetIds = new Set(pendingErasedNodes.map(n => getNetId(n)));
                const deletedBranchNodeNetIds = new Set();
                for (const b of pendingErasedBranches) {
                    const sid = getStartNetId(b), eid = getEndNetId(b);
                    if (sid) deletedBranchNodeNetIds.add(sid);
                    if (eid) deletedBranchNodeNetIds.add(eid);
                }
                pendingErasedNodes = [];
                pendingErasedBranches = [];
        
                // 阶段1：删除关联到已删除节点的分支
                if (deletedNodeNetIds.size > 0) {
                    const aliveBranches = Engine.getEntities(e => isAliveBranch(e));
                    const toDelete = aliveBranches.filter(b => {
                        return deletedNodeNetIds.has(getStartNetId(b)) || deletedNodeNetIds.has(getEndNetId(b));
                    });
                    if (toDelete.length > 0) {
                        for (const b of toDelete) {
                            const sid = getStartNetId(b), eid = getEndNetId(b);
                            if (sid) deletedBranchNodeNetIds.add(sid);
                            if (eid) deletedBranchNodeNetIds.add(eid);
                        }
                        Engine.eraseEntities(toDelete);
                    }
                }
        
                // 阶段2：删除孤立节点（没有分支引用的节点）
                if (deletedBranchNodeNetIds.size > 0) {
                    const remainingBranches = Engine.getEntities(e => isAliveBranch(e));
                    const stillReferenced = new Set();
                    for (const b of remainingBranches) {
                        const sid = getStartNetId(b), eid = getEndNetId(b);
                        if (sid) stillReferenced.add(sid);
                        if (eid) stillReferenced.add(eid);
                    }
                    const candidates = [...deletedBranchNodeNetIds].filter(
                        id => !stillReferenced.has(id) && !deletedNodeNetIds.has(id)
                    );
                    if (candidates.length > 0) {
                        const allNodes = Engine.getEntities(e => isAliveNode(e));
                        const orphanSet = new Set(candidates);
                        const orphans = allNodes.filter(n => orphanSet.has(getNetId(n)));
                        if (orphans.length > 0) Engine.eraseEntities(orphans);
                    }
                }
            } finally {
                cascadeProcessing = false;
            }
        }
        
        // 监听删除事件
        const eventMgr = CadEventManager.getInstance();
        const erasedHandler = (args) => {
            if (cascadeProcessing) return;
            const entityList = args?.entities || (args?.entity ? [args.entity] : []);
            if (entityList.length === 0) return;
            let queued = false;
            for (const entity of entityList) {
                if (isNode(entity)) { pendingErasedNodes.push(entity); queued = true; }
                else if (isBranch(entity)) { pendingErasedBranches.push(entity); queued = true; }
            }
            if (queued && !cascadeTimer) {
                cascadeTimer = setTimeout(() => { cascadeTimer = null; processCascadeDelete(); }, 0);
            }
        };
        eventMgr.on(CadEvents.EntitiesErased, erasedHandler);
        eventMgr.on(CadEvents.EntityErased, erasedHandler);
        
        // ============================================================
        // 复制粘贴拓扑验证 + ID重映射
        // 粘贴时：拒绝不完整的拓扑（只有节点没有分支，或只有分支没有节点）
        // 完整粘贴时：为克隆节点生成新的networkId，更新分支引用
        // ============================================================
        let drawingInProgress = false; // 绘制命令运行时为true，跳过验证
        let pendingAddedEntities = [];
        let rebuildTimer = null;
        
        function setNetId(e, id) { e._networkId = id; if (typeof e.setModified === 'function') e.setModified(); }
        function setStartNetId(e, id) { e._startNetworkId = id; }
        function setEndNetId(e, id) { e._endNetworkId = id; }
        
        function rebuildTopology(entities) {
            const docId = Engine.currentDoc?.docId;
            if (docId === undefined) return;
        
            const pastedNodes = entities.filter(e => isNode(e));
            const pastedBranches = entities.filter(e => isBranch(e));
            if (pastedNodes.length === 0 && pastedBranches.length === 0) return;
        
            // 只对粘贴（clone_前缀）进行验证，不影响正常创建和undo恢复
            const allNetworkEntities = [...pastedNodes, ...pastedBranches];
            const isFromPaste = allNetworkEntities.length > 0 &&
                allNetworkEntities.every(e => { const oid = e.objectId; return oid && oid.startsWith('clone_'); });
        
            if (!drawingInProgress && isFromPaste) {
                let reject = false;
                if (pastedNodes.length > 0 && pastedBranches.length === 0) {
                    reject = true; // 只有节点没有分支
                } else if (pastedBranches.length > 0 && pastedNodes.length === 0) {
                    reject = true; // 只有分支没有节点
                } else if (pastedNodes.length > 0 && pastedBranches.length > 0) {
                    const nodeNetIds = new Set(pastedNodes.map(n => getNetId(n)));
                    const refByBranches = new Set();
                    for (const b of pastedBranches) {
                        const sid = getStartNetId(b), eid = getEndNetId(b);
                        if (sid) refByBranches.add(sid);
                        if (eid) refByBranches.add(eid);
                    }
                    const hasOrphanBranch = pastedBranches.some(b => !nodeNetIds.has(getStartNetId(b)) || !nodeNetIds.has(getEndNetId(b)));
                    const hasOrphanNode = pastedNodes.some(n => !refByBranches.has(getNetId(n)));
                    reject = hasOrphanBranch || hasOrphanNode;
                }
                if (reject) {
                    const toDelete = allNetworkEntities.filter(e => e.isAlive);
                    if (toDelete.length > 0) {
                        cascadeProcessing = true;
                        try { Engine.eraseEntities(toDelete, { recordUndo: false }); }
                        finally { cascadeProcessing = false; }
                    }
                    return;
                }
            }
        
            // ID重映射：为克隆节点生成新ID，更新分支引用
            const idMapping = new Map();
            const allAliveNodes = Engine.getEntities(e => isAliveNode(e));
            for (const pNode of pastedNodes) {
                const netId = getNetId(pNode);
                if (!netId) continue;
                if (allAliveNodes.some(n => n !== pNode && getNetId(n) === netId)) {
                    const newId = genId();
                    setNetId(pNode, newId);
                    idMapping.set(netId, newId);
                }
            }
            for (const pBranch of pastedBranches) {
                const oldStart = getStartNetId(pBranch), oldEnd = getEndNetId(pBranch);
                if (idMapping.has(oldStart)) setStartNetId(pBranch, idMapping.get(oldStart));
                if (idMapping.has(oldEnd)) setEndNetId(pBranch, idMapping.get(oldEnd));
            }
        
            // 注册reactor并同步端点
            let needsRegen = false;
            for (const pBranch of pastedBranches) {
                if (getStartNetId(pBranch) && getEndNetId(pBranch)) {
                    if (typeof pBranch.tryRegisterReactor === 'function') pBranch.tryRegisterReactor(docId);
                    if (typeof pBranch.updateFromOwners === 'function') pBranch.updateFromOwners();
                    needsRegen = true;
                }
            }
            if (needsRegen) Engine.pcanvas?.regen(true);
        }
        
        // 监听添加事件（防抖150ms）
        const addedHandler = (args) => {
            const entities = args?.entities || (args?.entity ? [args.entity] : []);
            for (const entity of entities) {
                if (isNode(entity) || isBranch(entity)) pendingAddedEntities.push(entity);
            }
            if (pendingAddedEntities.length > 0) {
                if (rebuildTimer) clearTimeout(rebuildTimer);
                rebuildTimer = setTimeout(() => {
                    const pending = [...pendingAddedEntities];
                    pendingAddedEntities = [];
                    rebuildTimer = null;
                    rebuildTopology(pending);
                }, 150);
            }
        };
        eventMgr.on(CadEvents.EntityAdded, addedHandler);
        eventMgr.on(CadEvents.EntitiesAdded, addedHandler);
        
        // ============================================================
        // UI 按钮：点击绘制网络图
        // ============================================================
        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'position:fixed;top:60px;right:20px;z-index:9999;display:flex;gap:8px;';
        
        const btnDraw = document.createElement('button');
        btnDraw.textContent = '✏️ 绘制网络图';
        btnDraw.style.cssText = 'padding:8px 16px;background:#1a56db;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3);';
        btnDraw.onmouseenter = () => btnDraw.style.background = '#1e40af';
        btnDraw.onmouseleave = () => btnDraw.style.background = '#1a56db';
        btnDraw.onclick = () => Engine.editor.executerWithOp('BINDRAWNETWORK');
        
        btnContainer.appendChild(btnDraw);
        document.body.appendChild(btnContainer);
        
        // ============================================================
        // 控制台提示
        // ============================================================
        console.log("=== 网络图示例 ===");
        console.log(`已生成 ${nodes.length} 个节点, ${branches.length} 条分支`);
        console.log("分支5和7使用圆弧（bulge=±0.15），其余为直线");
        console.log("");
        console.log("操作说明：");
        console.log("  移动节点 → 分支自动跟随（Reactor模式）");
        console.log("  拖动分支中点夹点 → 直线变圆弧");
        console.log("  删除节点 → 级联删除关联分支");
        console.log("  删除分支 → 清理孤立节点");
        console.log("  点击右上角按钮或输入 BINDRAWNETWORK 手动绘制");
        
        message.info("网络图：移动节点分支自动跟随，点击右上角按钮或输入 BINDRAWNETWORK 手动绘制");
        
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
