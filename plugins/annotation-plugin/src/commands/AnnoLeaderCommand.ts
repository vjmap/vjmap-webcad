import { Engine, writeMessage, t } from 'vjcad';
import { ANNO_LAYER_NAME } from '../constants';
import { AnnotationLayerService } from '../services/AnnotationLayerService';

/**
 * Leader annotation — switches to annotation layer then invokes MLEADER.
 *
 * We cannot nest commands (await executerWithOp inside main), so we
 * schedule MLEADER after this command finishes.  To ensure entities
 * land on the annotation layer we verify and re-assign afterwards.
 */
export class AnnoLeaderCommand {
    async main(): Promise<void> {
        const svc = AnnotationLayerService.getInstance();
        const prev = svc.setAsCurrentLayer();
        writeMessage(`<br/>${t('anno.leader.startMsg')}`);

        const layer = Engine.currentDoc.layers.itemByName(ANNO_LAYER_NAME);
        const layerId = layer?.layerId ?? '0';

        setTimeout(async () => {
            try {
                // Double-check that CLAYER is still _ANNOTATION
                if (Engine.currentDoc.CLAYER !== ANNO_LAYER_NAME) {
                    Engine.currentDoc.setCLAYER(ANNO_LAYER_NAME, false);
                }
                await Engine.editor.executerWithOp('MLEADER');
            } catch { /* user cancelled */ }
            finally {
                // Ensure any newly created entities on _ANNOTATION have the correct layerId
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
