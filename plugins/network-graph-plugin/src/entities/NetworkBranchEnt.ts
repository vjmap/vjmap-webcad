import {
    CustomEntityBase,
    CustomEntityDbData,
    Point2D,
    LineEnt,
    ArcEnt,
    SolidEnt,
    TextEnt,
    TextAlignmentEnum,
    EntityBase,
    EntityReactorManager,
    type IEntityReactor,
    type ReactorEventArgs,
    ReactorEvent,
    type OwnerReference,
    type PointInput,
    type SnapPointResult,
    type GripPointResult,
    t
} from 'vjcad';
import { NetworkNodeEnt } from './NetworkNodeEnt';

export class NetworkBranchEnt extends CustomEntityBase implements IEntityReactor {
    readonly customType = 'NETWORK_BRANCH';
    
    get customDisplayName(): string {
        return t('network.entity.branch.displayName');
    }

    private _startPoint: Point2D = new Point2D(0, 0);
    private _endPoint: Point2D = new Point2D(1, 0);
    private _label: string = '';
    private _labelOffset: Point2D = new Point2D(0, 0);
    private _showArrow: boolean = true;
    private _bulge: number = 0;

    private _startNetworkId: string = '';
    private _endNetworkId: string = '';
    private _startNodeRadius: number = 0;
    private _endNodeRadius: number = 0;

    _ownerRefs: OwnerReference[] = [];
    _reactorDirty: boolean = false;
    _reactorRegistered: boolean = false;

    private _labelText: TextEnt;

    constructor() {
        super();
        this._labelText = new TextEnt([0, 0], '', 5, 0, TextAlignmentEnum.MidCenter);
        this._labelText.setDefaults();
    }

    static create(
        startPoint: PointInput, endPoint: PointInput,
        startNetworkId: string, endNetworkId: string,
        label?: string, showArrow?: boolean,
        startNodeRadius?: number, endNodeRadius?: number,
        bulge?: number
    ): NetworkBranchEnt {
        const b = new NetworkBranchEnt();
        b._startPoint = startPoint instanceof Point2D ? startPoint.clone() : new Point2D((startPoint as number[])[0], (startPoint as number[])[1]);
        b._endPoint = endPoint instanceof Point2D ? endPoint.clone() : new Point2D((endPoint as number[])[0], (endPoint as number[])[1]);
        b._startNetworkId = startNetworkId;
        b._endNetworkId = endNetworkId;
        if (label !== undefined) b._label = label;
        else b._label = '';
        if (showArrow !== undefined) b._showArrow = showArrow;
        if (startNodeRadius !== undefined) b._startNodeRadius = startNodeRadius;
        if (endNodeRadius !== undefined) b._endNodeRadius = endNodeRadius;
        if (bulge !== undefined) b._bulge = bulge;
        return b;
    }

    // --- Accessors ---

    get startPoint(): Point2D { return this._startPoint; }
    set startPoint(val: Point2D) { this._startPoint = val.clone(); this.setModified(); }
    get endPoint(): Point2D { return this._endPoint; }
    set endPoint(val: Point2D) { this._endPoint = val.clone(); this.setModified(); }
    get label(): string { return this._label; }
    set label(val: string) { this._label = val; this.setModified(); }
    get showArrow(): boolean { return this._showArrow; }
    set showArrow(val: boolean) { this._showArrow = val; this.setModified(); }
    get bulge(): number { return this._bulge; }
    set bulge(val: number) { this._bulge = val; this.setModified(); }
    get startNetworkId(): string { return this._startNetworkId; }
    get endNetworkId(): string { return this._endNetworkId; }
    get isAssociative(): boolean { return this._ownerRefs.length > 0; }

    // --- Arc geometry helpers ---

    private getChordInfo() {
        const dx = this._endPoint.x - this._startPoint.x;
        const dy = this._endPoint.y - this._startPoint.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        return { dx, dy, len };
    }

    /**
     * Compute the arc's center and radius from start, end, bulge.
     * Returns null for straight lines.
     */
    private getArcParams(): { center: Point2D; radius: number } | null {
        if (Math.abs(this._bulge) < 1e-6) return null;
        const { dx, dy, len } = this.getChordInfo();
        if (len < 1e-6) return null;
        const halfChord = len / 2;
        const b = this._bulge;
        const radius = halfChord * (b * b + 1) / (2 * Math.abs(b));
        const mx = (this._startPoint.x + this._endPoint.x) / 2;
        const my = (this._startPoint.y + this._endPoint.y) / 2;
        const perpX = -dy / len, perpY = dx / len;
        const distToCenter = -halfChord * (1 - b * b) / (2 * b);
        const cx = mx + perpX * distToCenter;
        const cy = my + perpY * distToCenter;
        return { center: new Point2D(cx, cy), radius };
    }

    /** Midpoint on the arc (or line midpoint if bulge==0) */
    getArcMidpoint(): Point2D {
        const { dx, dy, len } = this.getChordInfo();
        const mx = (this._startPoint.x + this._endPoint.x) / 2;
        const my = (this._startPoint.y + this._endPoint.y) / 2;
        if (len < 1e-6 || Math.abs(this._bulge) < 1e-6) {
            return new Point2D(mx, my);
        }
        const perpX = -dy / len, perpY = dx / len;
        const sag = this._bulge * len / 2;
        return new Point2D(mx + perpX * sag, my + perpY * sag);
    }

    // --- CustomEntityBase abstracts ---

    getSnapPoints(): SnapPointResult[] {
        return [
            { point: this._startPoint.clone(), type: 'endpoint' },
            { point: this._endPoint.clone(), type: 'endpoint' },
            { point: this.getArcMidpoint(), type: 'midpoint' }
        ];
    }

    getGripPoints(): GripPointResult[] {
        return [{ point: this.getArcMidpoint(), gripId: 'mid', type: 'stretch' }];
    }

    gripEdit(newPosition: Point2D, gripId: string): void {
        if (gripId !== 'mid') return;
        const { dx, dy, len } = this.getChordInfo();
        if (len < 1e-6) return;
        const cross = dx * (newPosition.y - this._startPoint.y) - dy * (newPosition.x - this._startPoint.x);
        const perpDist = cross / len;
        const newBulge = 2 * perpDist / len;
        this._bulge = Math.abs(newBulge) < 0.02 ? 0 : newBulge;
        this.setModified();
    }

    protected buildNestEnts(): EntityBase[] {
        if (this._reactorDirty && this.isAssociative) {
            this.updateFromOwners();
        }

        const entities: EntityBase[] = [];
        const sp = this._startPoint;
        const ep = this._endPoint;
        const { dx, dy, len } = this.getChordInfo();
        if (len < 1e-6) return entities;

        // Resolve node radii
        let sr = this._startNodeRadius;
        let er = this._endNodeRadius;
        if (this._ownerRefs.length > 0) {
            for (const ref of this._ownerRefs) {
                const ent = this.findOwnerEntity(ref);
                if (ent && ent instanceof NetworkNodeEnt) {
                    if (ref.meta?.role === 'start') { sr = ent.radius; this._startNodeRadius = sr; }
                    if (ref.meta?.role === 'end') { er = ent.radius; this._endNodeRadius = er; }
                }
            }
        }

        let midPt: Point2D;
        let tangentX: number;
        let tangentY: number;

        if (Math.abs(this._bulge) < 1e-6) {
            // ---- STRAIGHT LINE ----
            const ux = dx / len, uy = dy / len;
            const visStart = new Point2D(sp.x + ux * sr, sp.y + uy * sr);
            const visEnd = new Point2D(ep.x - ux * er, ep.y - uy * er);
            const vdx = visEnd.x - visStart.x, vdy = visEnd.y - visStart.y;
            const vl = Math.sqrt(vdx * vdx + vdy * vdy);
            if (vl < 1e-6) return entities;

            const line = new LineEnt(visStart.clone(), visEnd.clone());
            line.fromDefaultProps(this);
            entities.push(line);

            midPt = new Point2D((visStart.x + visEnd.x) / 2, (visStart.y + visEnd.y) / 2);
            tangentX = vdx / vl;
            tangentY = vdy / vl;
        } else {
            // ---- ARC ----
            const arcP = this.getArcParams();
            if (!arcP) return entities;
            const { center, radius } = arcP;

            const startAng = Math.atan2(sp.y - center.y, sp.x - center.x);
            const endAng = Math.atan2(ep.y - center.y, ep.x - center.x);

            const trimStart = sr > 0 && sr < 2 * radius ? 2 * Math.asin(sr / (2 * radius)) : 0;
            const trimEnd = er > 0 && er < 2 * radius ? 2 * Math.asin(er / (2 * radius)) : 0;

            // Always render as CCW arc to avoid ArcEnt CW rendering issues.
            // Positive bulge: natural direction is CW → swap start/end for CCW.
            // Negative bulge: natural direction is CCW → use as-is.
            let arcStart: number;
            let arcEnd: number;
            if (this._bulge > 0) {
                const cwVisStart = startAng - trimStart;
                const cwVisEnd = endAng + trimEnd;
                arcStart = cwVisEnd;
                arcEnd = cwVisStart;
            } else {
                arcStart = startAng + trimStart;
                arcEnd = endAng - trimEnd;
            }

            const arc = new ArcEnt(center.clone(), radius, arcStart, arcEnd);
            arc._isCCW = true;
            arc.fromDefaultProps(this);
            entities.push(arc);

            // Midpoint of trimmed arc (always CCW from arcStart to arcEnd)
            let adjustedEnd = arcEnd;
            if (adjustedEnd < arcStart) adjustedEnd += 2 * Math.PI;
            const midAng = (arcStart + adjustedEnd) / 2;
            midPt = new Point2D(center.x + radius * Math.cos(midAng), center.y + radius * Math.sin(midAng));

            // Tangent: CCW tangent then flip for positive bulge (swapped direction)
            if (this._bulge > 0) {
                tangentX = Math.sin(midAng);
                tangentY = -Math.cos(midAng);
            } else {
                tangentX = -Math.sin(midAng);
                tangentY = Math.cos(midAng);
            }
        }

        // Arrow at midpoint
        if (this._showArrow) {
            const arrowLen = Math.min(len * 0.08, 6);
            const arrowW = arrowLen * 0.45;
            const px = -tangentY, py = tangentX;

            const arrow = new SolidEnt(
                [midPt.x + tangentX * arrowLen / 2, midPt.y + tangentY * arrowLen / 2],
                [midPt.x - tangentX * arrowLen / 2 + px * arrowW, midPt.y - tangentY * arrowLen / 2 + py * arrowW],
                [midPt.x - tangentX * arrowLen / 2 - px * arrowW, midPt.y - tangentY * arrowLen / 2 - py * arrowW]
            );
            arrow.fromDefaultProps(this);
            entities.push(arrow);
        }

        // Label
        const labelPerpX = -tangentY, labelPerpY = tangentX;
        const labelPt = new Point2D(midPt.x + this._labelOffset.x, midPt.y + this._labelOffset.y);
        if (this._labelOffset.x === 0 && this._labelOffset.y === 0) {
            const offset = 5;
            const sign = this._bulge > 0.01 ? 1 : (this._bulge < -0.01 ? -1 : 1);
            labelPt.x = midPt.x + labelPerpX * offset * sign;
            labelPt.y = midPt.y + labelPerpY * offset * sign;
        }
        this._labelText.insertionPoint = labelPt;
        this._labelText.text = this._label;
        this._labelText.height = 5;
        this._labelText.textAlignment = TextAlignmentEnum.MidCenter;
        this._labelText.fromDefaultProps(this);
        this._labelText.block = this.block;
        entities.push(this._labelText);

        return entities;
    }

    clone(): NetworkBranchEnt {
        const c = new NetworkBranchEnt();
        c.fromDefaultProps(this);
        c._startPoint = this._startPoint.clone();
        c._endPoint = this._endPoint.clone();
        c._label = this._label;
        c._labelOffset = this._labelOffset.clone();
        c._showArrow = this._showArrow;
        c._bulge = this._bulge;
        c._startNetworkId = this._startNetworkId;
        c._endNetworkId = this._endNetworkId;
        c._startNodeRadius = this._startNodeRadius;
        c._endNodeRadius = this._endNodeRadius;
        c._labelText = this._labelText.clone() as TextEnt;
        c._labelText.fromDefaultProps(this._labelText);
        return c;
    }

    getEntityData(): any {
        return {
            startPoint: { x: this._startPoint.x, y: this._startPoint.y },
            endPoint: { x: this._endPoint.x, y: this._endPoint.y },
            label: this._label,
            labelOffset: { x: this._labelOffset.x, y: this._labelOffset.y },
            showArrow: this._showArrow,
            bulge: this._bulge,
            startNetworkId: this._startNetworkId,
            endNetworkId: this._endNetworkId,
            startNodeRadius: this._startNodeRadius,
            endNodeRadius: this._endNodeRadius,
            ownerRefs: this._ownerRefs.length > 0 ? [...this._ownerRefs] : undefined
        };
    }

    setEntityData(data: any): void {
        if (data.startPoint) this._startPoint = new Point2D(data.startPoint.x, data.startPoint.y);
        if (data.endPoint) this._endPoint = new Point2D(data.endPoint.x, data.endPoint.y);
        if (data.label !== undefined) this._label = data.label;
        if (data.labelOffset) this._labelOffset = new Point2D(data.labelOffset.x, data.labelOffset.y);
        if (data.showArrow !== undefined) this._showArrow = data.showArrow;
        if (data.bulge !== undefined) this._bulge = data.bulge;
        if (data.startNetworkId !== undefined) this._startNetworkId = data.startNetworkId;
        if (data.endNetworkId !== undefined) this._endNetworkId = data.endNetworkId;
        if (data.startNodeRadius !== undefined) this._startNodeRadius = data.startNodeRadius;
        if (data.endNodeRadius !== undefined) this._endNodeRadius = data.endNodeRadius;
        if (data.ownerRefs && data.ownerRefs.length > 0) this._ownerRefs = [...data.ownerRefs];
        this.setModified();
    }

    fromDb(dbData: CustomEntityDbData): void {
        this.fromDbDefaultProps(dbData);
        if (dbData.data) this.setEntityData(dbData.data);
    }

    move(fromPoint: PointInput, toPoint: PointInput): void {
        const from = fromPoint instanceof Point2D ? fromPoint : new Point2D((fromPoint as number[])[0], (fromPoint as number[])[1]);
        const to = toPoint instanceof Point2D ? toPoint : new Point2D((toPoint as number[])[0], (toPoint as number[])[1]);
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        // Move cached endpoints (needed for paste transform; reactor will correct them later)
        this._startPoint.x += dx;
        this._startPoint.y += dy;
        this._endPoint.x += dx;
        this._endPoint.y += dy;
        // Do NOT move _labelOffset — it's relative to the arc midpoint which moves with the endpoints
        this.setModified();
    }

    rotate(_c: PointInput, _a: number): void { this.setModified(); }
    scale(_c: PointInput, _f: number): void { this.setModified(); }
    mirror(_a: PointInput, _b: PointInput): void { this.setModified(); }

    // --- IEntityReactor ---

    getOwnerIds(): number[] { return this._ownerRefs.map(r => r.entityId); }

    onOwnerChanged(args: ReactorEventArgs): void {
        if (args.event === ReactorEvent.Erased) {
            this._ownerRefs = this._ownerRefs.filter(r => r.entityId !== args.ownerId);
            if (this._ownerRefs.length === 0) this.unlinkAllOwners();
        } else {
            this.setReactorDirty();
        }
    }

    setReactorDirty(): void { this._reactorDirty = true; this.setModified(); }
    isReactorDirty(): boolean { return this._reactorDirty; }

    updateFromOwners(): boolean {
        if (this._ownerRefs.length === 0) { this._reactorDirty = false; return false; }
        for (const ref of this._ownerRefs) {
            const ent = this.findOwnerEntity(ref);
            if (ent && ent instanceof NetworkNodeEnt) {
                if (ref.meta?.role === 'start') { this._startPoint = ent.position.clone(); this._startNodeRadius = ent.radius; }
                if (ref.meta?.role === 'end') { this._endPoint = ent.position.clone(); this._endNodeRadius = ent.radius; }
            }
        }
        this._reactorDirty = false;
        return true;
    }

    unlinkAllOwners(): void {
        if (this._reactorRegistered) {
            const docId = (this.block as any)?.doc?.docId;
            EntityReactorManager.getInstance().unregisterReactor(this.id, docId);
            this._reactorRegistered = false;
        }
        this._ownerRefs = [];
    }

    tryRegisterReactor(docId: number): boolean {
        if (this._reactorRegistered) return false;
        if (this._ownerRefs.length > 0) {
            EntityReactorManager.getInstance().registerReactor(this, docId);
            this._reactorRegistered = true;
            return true;
        }
        if (this._startNetworkId && this._endNetworkId) {
            const sn = this.findNodeByNetworkId(this._startNetworkId);
            const en = this.findNodeByNetworkId(this._endNetworkId);
            if (sn && en) {
                this._ownerRefs = [
                    { entityId: sn.id, meta: { role: 'start' } },
                    { entityId: en.id, meta: { role: 'end' } }
                ];
                this._startPoint = sn.position.clone();
                this._endPoint = en.position.clone();
                this._startNodeRadius = sn.radius;
                this._endNodeRadius = en.radius;
                EntityReactorManager.getInstance().registerReactor(this, docId);
                this._reactorRegistered = true;
                this.setModified();
                return true;
            }
        }
        return false;
    }

    setSourceNodes(startNodeId: number, endNodeId: number): void {
        this.unlinkAllOwners();
        this._ownerRefs = [
            { entityId: startNodeId, meta: { role: 'start' } },
            { entityId: endNodeId, meta: { role: 'end' } }
        ];
        const space = (this.block as any)?.doc?.currentSpace;
        if (space) {
            for (const ent of space.aliveItems) {
                if (ent.id === startNodeId && ent instanceof NetworkNodeEnt) {
                    this._startPoint = ent.position.clone(); this._startNodeRadius = ent.radius;
                }
                if (ent.id === endNodeId && ent instanceof NetworkNodeEnt) {
                    this._endPoint = ent.position.clone(); this._endNodeRadius = ent.radius;
                }
            }
        }
        const docId = (this.block as any)?.doc?.docId;
        if (docId !== undefined) {
            EntityReactorManager.getInstance().registerReactor(this, docId);
            this._reactorRegistered = true;
        }
    }

    protected findOwnerEntity(ref: OwnerReference): EntityBase | null {
        const space = (this.block as any)?.doc?.currentSpace;
        if (!space) return null;
        for (const entity of space.aliveItems) {
            if (entity.id === ref.entityId) return entity;
        }
        return null;
    }

    findNodeByNetworkId(networkId: string): NetworkNodeEnt | null {
        const space = (this.block as any)?.doc?.currentSpace;
        if (!space) return null;
        for (const entity of space.aliveItems) {
            if (entity.type === 'CUSTOM' && entity instanceof NetworkNodeEnt && entity.networkId === networkId) {
                return entity;
            }
        }
        return null;
    }

    /**
     * Calculate bulge from a third point. Uses perpendicular distance projection
     * to produce an intuitive arc curvature proportional to how far the point
     * is from the chord.
     */
    static bulgeFromThirdPoint(start: Point2D, end: Point2D, through: Point2D): number {
        const dx = end.x - start.x, dy = end.y - start.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1e-6) return 0;
        const cross = dx * (through.y - start.y) - dy * (through.x - start.x);
        const perpDist = cross / len;
        return 2 * perpDist / len;
    }

    getPropertyInfo() {
        return [
            { category: t('network.entity.category.basic'), label: t('network.entity.prop.type'), value: this.customDisplayName, editable: false },
            { category: t('network.entity.category.basic'), label: t('network.entity.prop.label'), value: this._label, editable: true, type: 'string' as const, onChange: (v: string) => { this.label = v; } },
            { category: t('network.entity.category.geometry'), label: t('network.entity.prop.shape'), value: Math.abs(this._bulge) < 1e-6 ? t('network.entity.value.line') : t('network.entity.value.arc'), editable: false },
            { category: t('network.entity.category.geometry'), label: t('network.entity.prop.bulge'), value: this._bulge.toFixed(4), editable: true, type: 'number' as const, onChange: (v: number) => { this.bulge = v; } },
            { category: t('network.entity.category.display'), label: t('network.entity.prop.arrow'), value: this._showArrow ? t('network.entity.value.yes') : t('network.entity.value.no'), editable: true, type: 'boolean' as const, booleanValue: this._showArrow, onChange: (v: boolean) => { this.showArrow = v; } },
            { category: t('network.entity.category.network'), label: t('network.entity.prop.associative'), value: this.isAssociative ? t('network.entity.value.yes') : t('network.entity.value.no'), editable: false }
        ];
    }
}
