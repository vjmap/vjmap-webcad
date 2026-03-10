import { writeMessage, t } from 'vjcad';
import { AnnotationLayerService } from '../services/AnnotationLayerService';

export class AnnoHideCommand {
    async main(): Promise<void> {
        AnnotationLayerService.getInstance().hideLayer();
        writeMessage(`<br/>${t('anno.hide.msg')}`);
    }
    cancel(): void { /* no-op */ }
}
