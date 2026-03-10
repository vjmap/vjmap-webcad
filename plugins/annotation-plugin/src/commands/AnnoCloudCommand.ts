import {
    Engine, PolylineEnt, Point2D,
    getPoint, getReal, InputStatusEnum, PointInputOptions, RealInputOptions,
    ssSetFirst, writeMessage, generateRevcloudBulgePoints, t,
} from 'vjcad';
import { ANNO_COLOR } from '../constants';
import { AnnotationLayerService, getAnnoLineWidth, getAnnoArcLength } from '../services/AnnotationLayerService';

/**
 * Cloud markup — draws a revision cloud on the annotation layer.
 * Arc length auto-adapts to the current view extent so the cloud is
 * properly visible on both tiny and huge-coordinate drawings.
 */
export class AnnoCloudCommand {
    private arcLength = 0;
    private pathPoints: Point2D[] = [];
    private polyEntity: PolylineEnt | null = null;
    private step = 1;

    async main(): Promise<void> {
        const svc = AnnotationLayerService.getInstance();
        const prev = svc.setAsCurrentLayer();
        try {
            await this.run();
        } finally {
            svc.restoreLayer(prev);
        }
    }

    cancel(): void { this.step = 0; }

    private async run(): Promise<void> {
        ssSetFirst([]);
        this.arcLength = getAnnoArcLength();
        this.step = 1;
        while (this.step >= 1) {
            if (this.step === 1) await this.promptArcLen();
            else if (this.step === 2) await this.promptStart();
            else if (this.step === 3) await this.promptSecond();
            else await this.promptNext();
        }
        Engine.pcanvas.regen();
    }

    private async promptArcLen(): Promise<void> {
        writeMessage(`<br/>${t('anno.cloud.arcLenMsg', { arcLength: this.arcLength.toFixed(1) })}`);
        const opts = new RealInputOptions(t('anno.cloud.specifyArcLen', { defaultValue: this.arcLength.toFixed(1) }));
        opts.defaultValue = this.arcLength;
        const r = await getReal(opts);
        if (r.status === InputStatusEnum.OK) {
            if (r.value > 0) this.arcLength = r.value;
            this.step = 2;
        } else {
            this.step = 0;
        }
    }

    private async promptStart(): Promise<void> {
        const r = await getPoint(new PointInputOptions(t('anno.cloud.specifyStart')));
        if (r.status === InputStatusEnum.OK) { this.pathPoints.push(r.value); this.step = 3; }
        else this.step = 0;
    }

    private async promptSecond(): Promise<void> {
        const last = this.pathPoints[this.pathPoints.length - 1];
        const opts = new PointInputOptions(t('anno.cloud.specifyNext'));
        opts.keywords.push('U');
        opts.useBasePoint = true;
        opts.basePoint = last;
        opts.callback = this.preview(last);
        const r = await getPoint(opts);
        if (r.status === InputStatusEnum.OK) {
            this.pathPoints.push(r.value);
            this.buildEntity(false);
            this.step = 4;
        } else if (r.stringResult === 'U') {
            this.pathPoints.pop();
            this.step = 2;
        } else {
            this.step = 0;
        }
    }

    private async promptNext(): Promise<void> {
        const last = this.pathPoints[this.pathPoints.length - 1];
        const opts = new PointInputOptions(t('anno.cloud.specifyNextOrClose'));
        opts.keywords.push('C', 'U');
        opts.useBasePoint = true;
        opts.basePoint = last;
        opts.callback = this.preview(last);
        const r = await getPoint(opts);
        if (r.status === InputStatusEnum.OK) {
            this.pathPoints.push(r.value);
            this.rebuildEntity(false);
            Engine.pcanvas.regenPartial();
        } else if (r.stringResult === 'C') {
            this.rebuildEntity(true);
            this.step = 0;
            writeMessage(`<br/>${t('anno.cloud.complete')}`);
        } else if (r.stringResult === 'U') {
            if (this.pathPoints.length > 2) { this.pathPoints.pop(); this.rebuildEntity(false); Engine.pcanvas.regen(); }
            else if (this.pathPoints.length === 2) {
                this.pathPoints.pop();
                if (this.polyEntity) { Engine.currentSpace.eraseEntities([this.polyEntity]); this.polyEntity = null; }
                Engine.pcanvas.regen();
                this.step = 3;
            }
        } else {
            this.step = 0;
        }
    }

    private preview(from: Point2D) {
        return (canvasPt: Point2D) => {
            const wpt = Engine.trans.CanvasToWcs(canvasPt);
            const bp = generateRevcloudBulgePoints([from, wpt], { arcLength: this.arcLength });
            if (bp.length >= 2) {
                const pl = new PolylineEnt(bp);
                pl.setDefaults();
                pl.color = ANNO_COLOR;
                pl.globalWidth = getAnnoLineWidth();
                Engine.pcanvas.drawControl.resetPreview();
                Engine.pcanvas.drawControl.drawPreviewEntity(pl);
            }
        };
    }

    private buildEntity(closed: boolean): void {
        const bp = generateRevcloudBulgePoints(this.pathPoints, { arcLength: this.arcLength, isClosed: closed });
        this.polyEntity = new PolylineEnt(bp);
        this.polyEntity.setDefaults();
        this.polyEntity.color = ANNO_COLOR;
        this.polyEntity.globalWidth = getAnnoLineWidth();
        this.polyEntity.isClosed = closed;
        this.polyEntity = Engine.pcanvas.addEntity(this.polyEntity) as PolylineEnt;
        Engine.undoManager.added_undoMark([this.polyEntity]);
        Engine.pcanvas.redraw();
    }

    private rebuildEntity(closed: boolean): void {
        if (!this.polyEntity) return;
        this.polyEntity.bulgePoints = generateRevcloudBulgePoints(this.pathPoints, { arcLength: this.arcLength, isClosed: closed });
        this.polyEntity.isClosed = closed;
    }
}
