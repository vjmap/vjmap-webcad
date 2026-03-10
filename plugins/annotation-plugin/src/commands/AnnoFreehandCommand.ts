import {
    Engine, PolylineEnt, Point2D,
    getPoint, InputStatusEnum, PointInputOptions,
    ssSetFirst, writeMessage, t,
} from 'vjcad';
import { ANNO_COLOR } from '../constants';
import { AnnotationLayerService, getAnnoLineWidth } from '../services/AnnotationLayerService';

/**
 * Freehand drawing annotation — continuously collects points while the user
 * moves the cursor, producing a polyline sketch on the annotation layer.
 */
export class AnnoFreehandCommand {
    private points: Point2D[] = [];

    async main(): Promise<void> {
        const svc = AnnotationLayerService.getInstance();
        const prev = svc.setAsCurrentLayer();
        try {
            await this.run();
        } finally {
            svc.restoreLayer(prev);
        }
    }

    cancel(): void { /* no-op */ }

    private async run(): Promise<void> {
        ssSetFirst([]);
        writeMessage(`<br/>${t('anno.freehand.startMsg')}`);

        const r1 = await getPoint(new PointInputOptions(t('anno.freehand.specifyStart')));
        if (r1.status !== InputStatusEnum.OK) return;
        this.points = [r1.value];

        let drawing = true;
        while (drawing) {
            const opts = new PointInputOptions(t('anno.freehand.drawPrompt'));
            opts.useBasePoint = true;
            opts.basePoint = this.points[this.points.length - 1];
            opts.callback = (canvasPt: Point2D) => {
                const wpt = Engine.trans.CanvasToWcs(canvasPt);
                this.points.push(wpt);
                if (this.points.length >= 2) {
                    const ent = this.buildPolyline();
                    Engine.pcanvas.drawControl.resetPreview();
                    Engine.pcanvas.drawControl.drawPreviewEntity(ent);
                }
            };
            const r = await getPoint(opts);
            if (r.status === InputStatusEnum.OK) {
                this.points.push(r.value);
            }
            drawing = false;
        }

        if (this.points.length >= 2) {
            const ent = this.buildPolyline();
            Engine.addEntities(ent);
            Engine.pcanvas.redraw();
            writeMessage(`<br/>${t('anno.freehand.complete')}`);
        }
    }

    private buildPolyline(): PolylineEnt {
        const pts: [number, number][] = this.points.map(p => [p.x, p.y]);
        const ent = new PolylineEnt(pts);
        ent.setDefaults();
        ent.color = ANNO_COLOR;
        ent.globalWidth = getAnnoLineWidth();
        return ent;
    }
}
