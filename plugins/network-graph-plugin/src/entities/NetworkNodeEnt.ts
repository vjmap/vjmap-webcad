import {
    CustomEntityBase,
    CustomEntityDbData,
    Point2D,
    CircleEnt,
    TextEnt,
    TextAlignmentEnum,
    EntityBase,
    type PointInput,
    type SnapPointResult,
    type GripPointResult,
    t
} from 'vjcad';

let _nodeCounter = 0;

function generateNetworkId(): string {
    return `nn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export class NetworkNodeEnt extends CustomEntityBase {
    readonly customType = 'NETWORK_NODE';
    get customDisplayName() { return t('network.entity.node.displayName'); }

    private _position: Point2D = new Point2D(0, 0);
    private _radius: number = 10;
    private _label: string = '';
    private _networkId: string = generateNetworkId();
    private _labelText: TextEnt;

    constructor() {
        super();
        this._labelText = new TextEnt([0, 0], '', 7, 0, TextAlignmentEnum.MidCenter);
        this._labelText.setDefaults();
    }

    static create(position: PointInput, label?: string, radius?: number): NetworkNodeEnt {
        const node = new NetworkNodeEnt();
        node._position = position instanceof Point2D ? position.clone() : new Point2D((position as number[])[0], (position as number[])[1]);
        if (label !== undefined) node._label = label;
        else node._label = String(++_nodeCounter);
        if (radius !== undefined) node._radius = radius;
        node._networkId = generateNetworkId();
        return node;
    }

    static resetCounter(): void {
        _nodeCounter = 0;
    }

    // --- Accessors ---

    get position(): Point2D { return this._position; }
    set position(val: Point2D) {
        this._position = val.clone();
        this.setModified();
    }

    get radius(): number { return this._radius; }
    set radius(val: number) {
        this._radius = val;
        this.setModified();
    }

    get label(): string { return this._label; }
    set label(val: string) {
        this._label = val;
        this.setModified();
    }

    get networkId(): string { return this._networkId; }

    // --- CustomEntityBase abstracts ---

    getSnapPoints(): SnapPointResult[] {
        return [{ point: this._position.clone(), type: 'center' }];
    }

    getGripPoints(): GripPointResult[] {
        return [{ point: this._position.clone(), gripId: 'center', type: 'move' }];
    }

    gripEdit(newPosition: Point2D, gripId: string): void {
        if (gripId === 'center') {
            this._position = newPosition.clone();
            this.setModified();
        }
    }

    protected buildNestEnts(): EntityBase[] {
        const entities: EntityBase[] = [];

        const circle = new CircleEnt(this._position.clone(), this._radius);
        circle.fromDefaultProps(this);
        entities.push(circle);

        this._labelText.insertionPoint = this._position.clone();
        this._labelText.text = this._label;
        this._labelText.height = this._radius * 0.7;
        this._labelText.textAlignment = TextAlignmentEnum.MidCenter;
        this._labelText.fromDefaultProps(this);
        this._labelText.block = this.block;
        entities.push(this._labelText);

        return entities;
    }

    clone(): NetworkNodeEnt {
        const cloned = new NetworkNodeEnt();
        cloned.fromDefaultProps(this);
        cloned._position = this._position.clone();
        cloned._radius = this._radius;
        cloned._label = this._label;
        cloned._networkId = this._networkId;
        cloned._labelText = this._labelText.clone() as TextEnt;
        cloned._labelText.fromDefaultProps(this._labelText);
        return cloned;
    }

    getEntityData(): any {
        return {
            position: { x: this._position.x, y: this._position.y },
            radius: this._radius,
            label: this._label,
            networkId: this._networkId
        };
    }

    setEntityData(data: any): void {
        if (data.position) {
            this._position = new Point2D(data.position.x, data.position.y);
        }
        if (data.radius !== undefined) this._radius = data.radius;
        if (data.label !== undefined) this._label = data.label;
        if (data.networkId !== undefined) this._networkId = data.networkId;
        this.setModified();
    }

    fromDb(dbData: CustomEntityDbData): void {
        this.fromDbDefaultProps(dbData);
        if (dbData.data) {
            this.setEntityData(dbData.data);
        }
    }

    // --- Geometric transforms ---

    move(fromPoint: PointInput, toPoint: PointInput): void {
        const from = fromPoint instanceof Point2D ? fromPoint : new Point2D((fromPoint as number[])[0], (fromPoint as number[])[1]);
        const to = toPoint instanceof Point2D ? toPoint : new Point2D((toPoint as number[])[0], (toPoint as number[])[1]);
        this._position.x += to.x - from.x;
        this._position.y += to.y - from.y;
        this.setModified();
    }

    rotate(centerPoint: PointInput, angle: number): void {
        const center = centerPoint instanceof Point2D ? centerPoint : new Point2D((centerPoint as number[])[0], (centerPoint as number[])[1]);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const dx = this._position.x - center.x;
        const dy = this._position.y - center.y;
        this._position.x = center.x + dx * cos - dy * sin;
        this._position.y = center.y + dx * sin + dy * cos;
        this.setModified();
    }

    scale(centerPoint: PointInput, factor: number): void {
        const center = centerPoint instanceof Point2D ? centerPoint : new Point2D((centerPoint as number[])[0], (centerPoint as number[])[1]);
        this._position.x = center.x + (this._position.x - center.x) * factor;
        this._position.y = center.y + (this._position.y - center.y) * factor;
        this._radius *= Math.abs(factor);
        this.setModified();
    }

    mirror(axisStart: PointInput, axisEnd: PointInput): void {
        const p1 = axisStart instanceof Point2D ? axisStart : new Point2D((axisStart as number[])[0], (axisStart as number[])[1]);
        const p2 = axisEnd instanceof Point2D ? axisEnd : new Point2D((axisEnd as number[])[0], (axisEnd as number[])[1]);
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return;
        const t = ((this._position.x - p1.x) * dx + (this._position.y - p1.y) * dy) / lenSq;
        const projX = p1.x + t * dx;
        const projY = p1.y + t * dy;
        this._position.x = 2 * projX - this._position.x;
        this._position.y = 2 * projY - this._position.y;
        this.setModified();
    }

    getPropertyInfo() {
        return [
            { category: t('network.entity.category.basic'), label: t('network.entity.prop.type'), value: this.customDisplayName, editable: false },
            { category: t('network.entity.category.basic'), label: t('network.entity.prop.label'), value: this._label, editable: true, type: 'string' as const, onChange: (v: string) => { this.label = v; } },
            { category: t('network.entity.category.geometry'), label: t('network.entity.prop.positionX'), value: this._position.x.toFixed(2), editable: true, type: 'number' as const, onChange: (v: number) => { this._position.x = v; this.setModified(); } },
            { category: t('network.entity.category.geometry'), label: t('network.entity.prop.positionY'), value: this._position.y.toFixed(2), editable: true, type: 'number' as const, onChange: (v: number) => { this._position.y = v; this.setModified(); } },
            { category: t('network.entity.category.geometry'), label: t('network.entity.prop.radius'), value: this._radius.toFixed(2), editable: true, type: 'number' as const, range: { min: 0.1 }, onChange: (v: number) => { this.radius = v; } },
            { category: t('network.entity.category.network'), label: t('network.entity.prop.networkId'), value: this._networkId, editable: false }
        ];
    }
}
