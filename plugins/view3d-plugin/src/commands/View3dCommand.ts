import { Engine, t } from 'vjcad';
import type { View3dPanelElement } from '../ui/View3dPanel';

let panelInstance: View3dPanelElement | null = null;

export class View3dCommand {
    async main(): Promise<void> {
        Engine.writeMessage(`<br/>${t('view3d.cmd.openPanel')}`);

        if (panelInstance) {
            panelInstance.show();
            return;
        }

        const { createView3dPanel } = await import('../ui/View3dPanel');
        panelInstance = createView3dPanel();
        panelInstance.show();
    }

    cancel(): void {
        // noop
    }
}

export function destroyView3dPanel(): void {
    if (panelInstance) {
        panelInstance.destroy();
        panelInstance = null;
    }
}
