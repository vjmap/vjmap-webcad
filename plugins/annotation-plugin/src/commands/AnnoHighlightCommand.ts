import {
    Engine, HatchEnt, BulgePoint, BulgePoints, Edge, Edges, Point2D,
    getPoint, InputStatusEnum, PointInputOptions,
    ssSetFirst, writeMessage, t,
} from 'vjcad';
import { ANNO_COLOR } from '../constants';
import { AnnotationLayerService } from '../services/AnnotationLayerService';

/**
 * Highlight annotation — draws a semi-transparent SOLID hatch rectangle
 * on the annotation layer so the underlying drawing shows through.
 */
export class AnnoHighlightCommand {
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
        writeMessage(`<br/>${t('anno.highlight.startMsg')}`);

        const r1 = await getPoint(new PointInputOptions(t('anno.highlight.specifyCorner1')));
        if (r1.status !== InputStatusEnum.OK) return;
        const p1 = r1.value;

        const opts2 = new PointInputOptions(t('anno.highlight.specifyCorner2'));
        opts2.useBasePoint = true;
        opts2.basePoint = p1;
        opts2.callback = (canvasPt: Point2D) => {
            const wpt = Engine.trans.CanvasToWcs(canvasPt);
            const ent = this.buildHighlight(p1, wpt);
            Engine.pcanvas.drawControl.resetPreview();
            Engine.pcanvas.drawControl.drawPreviewEntity(ent);
        };
        const r2 = await getPoint(opts2);
        if (r2.status !== InputStatusEnum.OK) return;

        const ent = this.buildHighlight(p1, r2.value);
        Engine.addEntities(ent);
        Engine.pcanvas.redraw();
        writeMessage(`<br/>${t('anno.highlight.complete')}`);
    }

    private buildHighlight(p1: Point2D, p2: Point2D): HatchEnt {
        const bp = new BulgePoints();
        bp.add(new BulgePoint([p1.x, p1.y]));
        bp.add(new BulgePoint([p2.x, p1.y]));
        bp.add(new BulgePoint([p2.x, p2.y]));
        bp.add(new BulgePoint([p1.x, p2.y]));

        const edge = new Edge();
        edge.bulgePoints = bp;

        const edges = new Edges();
        edges.items.push(edge);

        const hatch = new HatchEnt();
        hatch.setDefaults();
        hatch.color = ANNO_COLOR;
        hatch.patternName = 'SOLID';
        hatch.loops = edges;
        hatch.isClosed = true;
        hatch.bulgePoints = bp;
        hatch.transpMgr.setTp100(70);

        return hatch;
    }
}
