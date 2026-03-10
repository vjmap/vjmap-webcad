import { writeMessage, t } from 'vjcad';
import { AnnotationLayerService } from '../services/AnnotationLayerService';

export class AnnoClearCommand {
    async main(): Promise<void> {
        const svc = AnnotationLayerService.getInstance();
        const count = svc.getAnnotationEntities().length;
        if (count === 0) {
            writeMessage(`<br/>${t('anno.clear.noEntities')}`);
            return;
        }
        svc.clearAll();
        writeMessage(`<br/>${t('anno.clear.cleared', { count })}`);
    }
    cancel(): void { /* no-op */ }
}
