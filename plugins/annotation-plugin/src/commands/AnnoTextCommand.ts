import { Engine, writeMessage, t } from 'vjcad';
import { ANNO_LAYER_NAME } from '../constants';
import { AnnotationLayerService } from '../services/AnnotationLayerService';

/**
 * Text annotation — switches to annotation layer then invokes MTEXT.
 *
 * We cannot nest commands (await executerWithOp inside main), so we
 * schedule MTEXT after this command finishes.
 */
export class AnnoTextCommand {
    async main(): Promise<void> {
        const svc = AnnotationLayerService.getInstance();
        const prev = svc.setAsCurrentLayer();
        writeMessage(`<br/>${t('anno.text.startMsg')}`);

        const layer = Engine.currentDoc.layers.itemByName(ANNO_LAYER_NAME);
        const layerId = layer?.layerId ?? '0';

        setTimeout(async () => {
            try {
                if (Engine.currentDoc.CLAYER !== ANNO_LAYER_NAME) {
                    Engine.currentDoc.setCLAYER(ANNO_LAYER_NAME, false);
                }
                await Engine.editor.executerWithOp('MTEXT');
            } catch { /* user cancelled */ }
            finally {
                const entities = Engine.getEntities(
                    (e: any) => e.layer === ANNO_LAYER_NAME && e._isAlive && e.layerId !== layerId
                );
                for (const e of entities) {
                    (e as any).layerId = layerId;
                }
                svc.restoreLayer(prev);
            }
        }, 50);
    }

    cancel(): void { /* no-op */ }
}
