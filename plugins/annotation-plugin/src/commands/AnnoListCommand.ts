import { Engine, writeMessage, t } from 'vjcad';
import { AnnoListPanel } from '../ui/AnnoListPanel';

const PANEL_NAME = 'annotation-list';

let _panelRegistered = false;

function registerPanel(): void {
    const vjcad = (window as any).vjcad;
    if (!vjcad?.registerSidebarPanel) return;
    vjcad.registerSidebarPanel({
        name: PANEL_NAME,
        label: t('anno.list.panelLabel'),
        icon: './images/actbar/actbar-commands.svg',
        position: 'right',
        panelClass: AnnoListPanel,
        order: 5,
    });
    _panelRegistered = true;
}

function unregisterPanel(): void {
    if (!_panelRegistered) return;
    const vjcad = (window as any).vjcad;
    if (vjcad?.unregisterSidebarPanel) {
        vjcad.unregisterSidebarPanel(PANEL_NAME);
    }
    _panelRegistered = false;
}

/**
 * Toggle the annotation list panel.
 * First invocation creates & opens; second invocation destroys.
 */
export class AnnoListCommand {
    async main(): Promise<void> {
        if (_panelRegistered) {
            unregisterPanel();
            writeMessage(`<br/>${t('anno.list.panelClosed')}`);
        } else {
            registerPanel();
            const pc = Engine.view?.panelController;
            if (pc) {
                pc.paletteActive(PANEL_NAME, 'open', true);
            }
            writeMessage(`<br/>${t('anno.list.panelOpened')}`);
        }
    }

    cancel(): void { /* no-op */ }
}

/** Called on plugin deactivate to clean up. */
export function destroyAnnoListPanel(): void {
    unregisterPanel();
}
