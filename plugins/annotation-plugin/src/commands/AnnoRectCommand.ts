import {
    Engine, PolylineEnt, Point2D,
    getPoint, InputStatusEnum, PointInputOptions,
    ssSetFirst, writeMessage, t,
} from 'vjcad';
import { ANNO_COLOR } from '../constants';
import { AnnotationLayerService, getAnnoLineWidth } from '../services/AnnotationLayerService';

/**
 * Rectangle annotation — draws a rectangle on the annotation layer.
 */
export class AnnoRectCommand {
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
        writeMessage(`<br/>${t('anno.rect.startMsg')}`);

        const r1 = await getPoint(new PointInputOptions(t('anno.rect.specifyCorner1')));
        if (r1.status !== InputStatusEnum.OK) return;
        const p1 = r1.value;

        const opts2 = new PointInputOptions(t('anno.rect.specifyCorner2'));
        opts2.useBasePoint = true;
        opts2.basePoint = p1;
        opts2.callback = (canvasPt: Point2D) => {
            const wpt = Engine.trans.CanvasToWcs(canvasPt);
            const ent = this.buildRect(p1, wpt);
            Engine.pcanvas.drawControl.resetPreview();
            Engine.pcanvas.drawControl.drawPreviewEntity(ent);
        };
        const r2 = await getPoint(opts2);
        if (r2.status !== InputStatusEnum.OK) return;

        const entity = this.buildRect(p1, r2.value);
        Engine.addEntities(entity);
        Engine.pcanvas.redraw();
        writeMessage(`<br/>${t('anno.rect.complete')}`);
    }

    private buildRect(p1: Point2D, p2: Point2D): PolylineEnt {
        const ent = new PolylineEnt([
            [p1.x, p1.y], [p2.x, p1.y], [p2.x, p2.y], [p1.x, p2.y],
        ]);
        ent.setDefaults();
        ent.color = ANNO_COLOR;
        ent.globalWidth = getAnnoLineWidth();
        ent.isClosed = true;
        return ent;
    }
}
