import {
    Engine, PolylineEnt, Point2D,
    getPoint, getKeyword, InputStatusEnum, PointInputOptions, KeywordInputOptions,
    ssSetFirst, writeMessage, t,
} from 'vjcad';
import { ANNO_COLOR } from '../constants';
import { AnnotationLayerService, getAnnoLineWidth } from '../services/AnnotationLayerService';

type ArrowStyle = 'single' | 'double' | 'polyline';

/**
 * Arrow annotation — supports multiple arrow styles:
 *   single   – line with arrowhead at endpoint
 *   double   – line with arrowheads at both ends
 *   polyline – multi-segment polyline with arrowhead at last segment
 */
export class AnnoArrowCommand {
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

        const kwOpts = new KeywordInputOptions(t('anno.arrow.selectStyle'));
        kwOpts.keywords = ['S', 'D', 'P'];
        kwOpts.defaultKeyword = 'S';
        const kwRes = await getKeyword(kwOpts);
        if (kwRes.status !== InputStatusEnum.OK) return;

        const styleMap: Record<string, ArrowStyle> = { S: 'single', D: 'double', P: 'polyline' };
        const style = styleMap[kwRes.value] ?? 'single';

        if (style === 'polyline') {
            await this.drawPolylineArrow();
        } else {
            await this.drawStraightArrow(style);
        }
    }

    private async drawStraightArrow(style: ArrowStyle): Promise<void> {
        writeMessage(`<br/>${t(style === 'double' ? 'anno.arrow.double' : 'anno.arrow.single')}`);

        const r1 = await getPoint(new PointInputOptions(t('anno.arrow.specifyStart')));
        if (r1.status !== InputStatusEnum.OK) return;
        const startPt = r1.value;

        const endOpts = new PointInputOptions(t('anno.arrow.specifyEnd'));
        endOpts.useBasePoint = true;
        endOpts.basePoint = startPt;
        endOpts.callback = (canvasPt: Point2D) => {
            const wpt = Engine.trans.CanvasToWcs(canvasPt);
            const preview = this.buildStraightArrow(startPt, wpt, style);
            Engine.pcanvas.drawControl.resetPreview();
            preview.forEach(e => Engine.pcanvas.drawControl.drawPreviewEntity(e));
        };
        const r2 = await getPoint(endOpts);
        if (r2.status !== InputStatusEnum.OK) return;

        const entities = this.buildStraightArrow(startPt, r2.value, style);
        this.addEntities(entities);
        writeMessage(`<br/>${t('anno.arrow.complete')}`);
    }

    private async drawPolylineArrow(): Promise<void> {
        writeMessage(`<br/>${t('anno.arrow.polylineMsg')}`);

        const r1 = await getPoint(new PointInputOptions(t('anno.arrow.specifyStart')));
        if (r1.status !== InputStatusEnum.OK) return;
        const points: Point2D[] = [r1.value];

        let collecting = true;
        while (collecting) {
            const opts = new PointInputOptions(t('anno.arrow.specifyNextPoint', { count: points.length }));
            opts.keywords.push('D');
            opts.useBasePoint = true;
            opts.basePoint = points[points.length - 1];
            opts.callback = (canvasPt: Point2D) => {
                const wpt = Engine.trans.CanvasToWcs(canvasPt);
                const tmpPts = [...points, wpt];
                const preview = this.buildPolyArrow(tmpPts);
                Engine.pcanvas.drawControl.resetPreview();
                preview.forEach(e => Engine.pcanvas.drawControl.drawPreviewEntity(e));
            };
            const r = await getPoint(opts);
            if (r.status === InputStatusEnum.OK) {
                points.push(r.value);
                if (points.length >= 2) {
                    const preview = this.buildPolyArrow(points);
                    Engine.pcanvas.drawControl.resetPreview();
                    preview.forEach(e => Engine.pcanvas.drawControl.drawPreviewEntity(e));
                }
            } else if (r.stringResult === 'D') {
                collecting = false;
            } else {
                collecting = false;
            }
        }

        if (points.length >= 2) {
            const entities = this.buildPolyArrow(points);
            this.addEntities(entities);
            writeMessage(`<br/>${t('anno.arrow.polylineComplete')}`);
        }
    }

    private addEntities(entities: PolylineEnt[]): void {
        entities.forEach(e => {
            const added = Engine.pcanvas.addEntity(e);
            Engine.undoManager.added_undoMark([added]);
        });
        Engine.pcanvas.redraw();
    }

    // ── Builders ───────────────────────────────────────

    private buildStraightArrow(from: Point2D, to: Point2D, style: ArrowStyle): PolylineEnt[] {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1e-8) return [];

        const lw = getAnnoLineWidth();
        const ux = dx / len;
        const uy = dy / len;
        const headLen = Math.min(len * 0.15, lw * 8);
        const headW = headLen * 0.5;

        const results: PolylineEnt[] = [];

        // Shaft (trimmed at both ends if double)
        const shaftFrom = style === 'double'
            ? new Point2D(from.x + ux * headLen, from.y + uy * headLen)
            : from;
        const shaftTo = new Point2D(to.x - ux * headLen, to.y - uy * headLen);

        const shaft = new PolylineEnt([[shaftFrom.x, shaftFrom.y], [shaftTo.x, shaftTo.y]]);
        shaft.setDefaults();
        shaft.color = ANNO_COLOR;
        shaft.globalWidth = lw;
        results.push(shaft);

        // Arrowhead at endpoint
        results.push(this.buildHead(to, ux, uy, headLen, headW, lw));

        // Arrowhead at start if double
        if (style === 'double') {
            results.push(this.buildHead(from, -ux, -uy, headLen, headW, lw));
        }

        return results;
    }

    private buildPolyArrow(pts: Point2D[]): PolylineEnt[] {
        if (pts.length < 2) return [];

        const lw = getAnnoLineWidth();

        // Last segment direction for arrowhead
        const last = pts[pts.length - 1];
        const prev = pts[pts.length - 2];
        const dx = last.x - prev.x;
        const dy = last.y - prev.y;
        const segLen = Math.sqrt(dx * dx + dy * dy);
        if (segLen < 1e-8) return [];

        const ux = dx / segLen;
        const uy = dy / segLen;
        const headLen = Math.min(segLen * 0.15, lw * 8);
        const headW = headLen * 0.5;

        // Shaft: all points except trim last segment
        const shaftPts: [number, number][] = pts.slice(0, -1).map(p => [p.x, p.y]);
        shaftPts.push([last.x - ux * headLen, last.y - uy * headLen]);

        const shaft = new PolylineEnt(shaftPts);
        shaft.setDefaults();
        shaft.color = ANNO_COLOR;
        shaft.globalWidth = lw;

        const head = this.buildHead(last, ux, uy, headLen, headW, lw);

        return [shaft, head];
    }

    private buildHead(tip: Point2D, ux: number, uy: number, headLen: number, headW: number, lw: number): PolylineEnt {
        const baseX = tip.x - ux * headLen;
        const baseY = tip.y - uy * headLen;
        const head = new PolylineEnt([
            [baseX - uy * headW, baseY + ux * headW],
            [tip.x, tip.y],
            [baseX + uy * headW, baseY - ux * headW],
        ]);
        head.setDefaults();
        head.color = ANNO_COLOR;
        head.globalWidth = lw;
        head.isClosed = true;
        return head;
    }
}
