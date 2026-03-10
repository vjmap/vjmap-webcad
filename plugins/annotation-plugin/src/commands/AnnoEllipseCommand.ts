import {
    Engine, PolylineEnt, Point2D,
    getPoint, InputStatusEnum, PointInputOptions,
    ssSetFirst, writeMessage, t,
} from 'vjcad';
import { ANNO_COLOR } from '../constants';
import { AnnotationLayerService, getAnnoLineWidth } from '../services/AnnotationLayerService';

const ELLIPSE_SEGMENTS = 36;

/**
 * Ellipse annotation — approximated with a PolylineEnt so globalWidth works.
 * User picks center, then a point on the major axis, then a point defining
 * the minor radius.
 */
export class AnnoEllipseCommand {
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
        writeMessage(`<br/>${t('anno.ellipse.startMsg')}`);

        const r1 = await getPoint(new PointInputOptions(t('anno.ellipse.specifyCenter')));
        if (r1.status !== InputStatusEnum.OK) return;
        const center = r1.value;

        const opts2 = new PointInputOptions(t('anno.ellipse.specifyMajorAxis'));
        opts2.useBasePoint = true;
        opts2.basePoint = center;
        const r2 = await getPoint(opts2);
        if (r2.status !== InputStatusEnum.OK) return;

        const dx = r2.value.x - center.x;
        const dy = r2.value.y - center.y;
        const majorR = Math.sqrt(dx * dx + dy * dy);
        if (majorR < 1e-8) return;
        const angle = Math.atan2(dy, dx);

        const opts3 = new PointInputOptions(t('anno.ellipse.specifyMinorAxis'));
        opts3.useBasePoint = true;
        opts3.basePoint = center;
        opts3.callback = (canvasPt: Point2D) => {
            const wpt = Engine.trans.CanvasToWcs(canvasPt);
            const ndx = wpt.x - center.x;
            const ndy = wpt.y - center.y;
            const minorR = Math.abs(-ndx * Math.sin(angle) + ndy * Math.cos(angle));
            const ent = this.buildEllipse(center, majorR, Math.max(minorR, 1e-4), angle);
            Engine.pcanvas.drawControl.resetPreview();
            Engine.pcanvas.drawControl.drawPreviewEntity(ent);
        };
        const r3 = await getPoint(opts3);
        if (r3.status !== InputStatusEnum.OK) return;

        const ndx = r3.value.x - center.x;
        const ndy = r3.value.y - center.y;
        const minorR = Math.abs(-ndx * Math.sin(angle) + ndy * Math.cos(angle));

        const ent = this.buildEllipse(center, majorR, Math.max(minorR, 1e-4), angle);
        Engine.addEntities(ent);
        Engine.pcanvas.redraw();
        writeMessage(`<br/>${t('anno.ellipse.complete')}`);
    }

    private buildEllipse(center: Point2D, a: number, b: number, rotation: number): PolylineEnt {
        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);
        const pts: [number, number][] = [];
        for (let i = 0; i < ELLIPSE_SEGMENTS; i++) {
            const t = (2 * Math.PI * i) / ELLIPSE_SEGMENTS;
            const lx = a * Math.cos(t);
            const ly = b * Math.sin(t);
            pts.push([center.x + lx * cosR - ly * sinR, center.y + lx * sinR + ly * cosR]);
        }
        const ent = new PolylineEnt(pts);
        ent.setDefaults();
        ent.color = ANNO_COLOR;
        ent.globalWidth = getAnnoLineWidth();
        ent.isClosed = true;
        return ent;
    }
}
