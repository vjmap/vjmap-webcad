import { createFloatingToolbar, writeMessage, t } from 'vjcad';
import { ANNO_TOOLBAR_ID } from '../constants';
import {
    ICON_ANNO_CLOUD, ICON_ANNO_ARROW, ICON_ANNO_RECT, ICON_ANNO_ELLIPSE,
    ICON_ANNO_TEXT, ICON_ANNO_LEADER, ICON_ANNO_FREEHAND, ICON_ANNO_STAMP,
    ICON_ANNO_HIGHLIGHT, ICON_ANNO_SHOW, ICON_ANNO_HIDE, ICON_ANNO_LIST,
    ICON_ANNO_CLEAR,
} from '../icons';

/**
 * Main annotation command — opens a floating toolbar containing all markup tools.
 */
export class AnnotationCommand {
    async main(): Promise<void> {
        const toolbar = createFloatingToolbar(ANNO_TOOLBAR_ID, {
            title: t('anno.toolbar.title'),
            columns: 5,
            iconSize: 30,
            position: { top: '80px', left: '60px' },
            items: [
                { id: 'cloud',     icon: ICON_ANNO_CLOUD,     tooltip: `${t('anno.toolbar.cloud')} (ANNO_CLOUD)`,     command: 'ANNO_CLOUD' },
                { id: 'arrow',     icon: ICON_ANNO_ARROW,     tooltip: `${t('anno.toolbar.arrow')} (ANNO_ARROW)`,     command: 'ANNO_ARROW' },
                { id: 'rect',      icon: ICON_ANNO_RECT,      tooltip: `${t('anno.toolbar.rect')} (ANNO_RECT)`,      command: 'ANNO_RECT' },
                { id: 'ellipse',   icon: ICON_ANNO_ELLIPSE,   tooltip: `${t('anno.toolbar.ellipse')} (ANNO_ELLIPSE)`,   command: 'ANNO_ELLIPSE' },
                { id: 'text',      icon: ICON_ANNO_TEXT,       tooltip: `${t('anno.toolbar.text')} (ANNO_TEXT)`,       command: 'ANNO_TEXT' },
                { id: 'leader',    icon: ICON_ANNO_LEADER,    tooltip: `${t('anno.toolbar.leader')} (ANNO_LEADER)`,     command: 'ANNO_LEADER' },
                { id: 'freehand',  icon: ICON_ANNO_FREEHAND,  tooltip: `${t('anno.toolbar.freehand')} (ANNO_FREEHAND)`, command: 'ANNO_FREEHAND' },
                { id: 'stamp',     icon: ICON_ANNO_STAMP,     tooltip: `${t('anno.toolbar.stamp')} (ANNO_STAMP)`,      command: 'ANNO_STAMP' },
                { id: 'highlight', icon: ICON_ANNO_HIGHLIGHT,  tooltip: `${t('anno.toolbar.highlight')} (ANNO_HIGHLIGHT)`,  command: 'ANNO_HIGHLIGHT' },
                { id: 'show',      icon: ICON_ANNO_SHOW,      tooltip: t('anno.toolbar.show'),               command: 'ANNO_SHOW' },
                { id: 'hide',      icon: ICON_ANNO_HIDE,      tooltip: t('anno.toolbar.hide'),               command: 'ANNO_HIDE' },
                { id: 'list',      icon: ICON_ANNO_LIST,      tooltip: t('anno.toolbar.list'),               command: 'ANNO_LIST' },
                { id: 'clear',     icon: ICON_ANNO_CLEAR,     tooltip: t('anno.toolbar.clear'),               command: 'ANNO_CLEAR' },
            ],
        });
        toolbar.show();
        writeMessage(`<br/>${t('anno.toolbar.opened')}`);
    }

    cancel(): void { /* nothing to clean up */ }
}

let _toolbarDestroyer: (() => void) | null = null;

export function setToolbarDestroyer(fn: () => void): void {
    _toolbarDestroyer = fn;
}

export function destroyAnnotationToolbar(): void {
    _toolbarDestroyer?.();
    _toolbarDestroyer = null;
}
