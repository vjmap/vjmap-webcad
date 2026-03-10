import { writeMessage, t } from 'vjcad';
import { AnnotationLayerService } from '../services/AnnotationLayerService';

export class AnnoShowCommand {
    async main(): Promise<void> {
        AnnotationLayerService.getInstance().showLayer();
        writeMessage(`<br/>${t('anno.show.msg')}`);
    }
    cancel(): void { /* no-op */ }
}
