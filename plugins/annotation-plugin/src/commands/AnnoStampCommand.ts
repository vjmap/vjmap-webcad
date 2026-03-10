import {
    Engine, TextEnt, PolylineEnt, Point2D, TextAlignmentEnum,
    getPoint, getKeyword, InputStatusEnum, PointInputOptions, KeywordInputOptions,
    ssSetFirst, writeMessage, t,
} from 'vjcad';
import { ANNO_COLOR, STAMP_PRESETS } from '../constants';
import { getAnnoLineWidth } from '../services/AnnotationLayerService';
import { AnnotationLayerService } from '../services/AnnotationLayerService';

/**
 * Stamp annotation — lets the user pick a pre-defined stamp label, then
 * places it at a clicked point with a rectangular border.
 */
export class AnnoStampCommand {
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

        const labels = STAMP_PRESETS.map((s, i) => `${i + 1}=${typeof s.label === 'function' ? s.label() : s.label}`);
        const keys = STAMP_PRESETS.map((_, i) => String(i + 1));
        const kwOpts = new KeywordInputOptions(t('anno.stamp.selectStamp', { options: labels.join('/') }));
        kwOpts.keywords = keys;
        kwOpts.defaultKeyword = '1';

        const kwResult = await getKeyword(kwOpts);
        if (kwResult.status !== InputStatusEnum.OK) return;

        const idx = parseInt(kwResult.value, 10) - 1;
        const selected = STAMP_PRESETS[idx] ?? STAMP_PRESETS[0];
        const stampText = typeof selected.text === 'function' ? selected.text() : selected.text;

        writeMessage(`<br/>${t('anno.stamp.placed', { stampName: stampText })}`);
        const ptOpts = new PointInputOptions(t('anno.stamp.specifyPosition'));
        const ptResult = await getPoint(ptOpts);
        if (ptResult.status !== InputStatusEnum.OK) return;

        const entities = this.buildStamp(ptResult.value, stampText);
        entities.forEach(e => {
            const added = Engine.pcanvas.addEntity(e);
            Engine.undoManager.added_undoMark([added]);
        });
        Engine.pcanvas.redraw();
        writeMessage(`<br/>${t('anno.stamp.placed', { stampName: stampText })}`);
    }

    private buildStamp(center: Point2D, text: string): (TextEnt | PolylineEnt)[] {
        const lw = getAnnoLineWidth();
        const charCount = text.length;
        const textH = lw * 5;
        const padX = textH * 0.6;
        const padY = textH * 0.4;
        const halfW = (charCount * textH) / 2 + padX;
        const halfH = textH / 2 + padY;

        const textEnt = new TextEnt(center, text, textH, 0, TextAlignmentEnum.MidCenter);
        textEnt.setDefaults();
        textEnt.color = ANNO_COLOR;

        const border = new PolylineEnt([
            [center.x - halfW, center.y - halfH],
            [center.x + halfW, center.y - halfH],
            [center.x + halfW, center.y + halfH],
            [center.x - halfW, center.y + halfH],
        ]);
        border.setDefaults();
        border.color = ANNO_COLOR;
        border.globalWidth = lw;
        border.isClosed = true;

        return [textEnt, border];
    }
}
