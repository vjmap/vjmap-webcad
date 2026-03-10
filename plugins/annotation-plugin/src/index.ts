/**
 * WebCAD Annotation Plugin
 *
 * Provides a complete set of CAD markup / redline tools for reviewing
 * drawings: revision clouds, arrows, rectangles, ellipses, text, leaders,
 * freehand sketches, stamps, highlights, plus show / hide / list / clear
 * management commands.
 *
 * All annotation entities are placed on a dedicated _ANNOTATION layer
 * (red, non-destructive) and drawn with polyline globalWidth for
 * reliable bold display regardless of LWDISPLAY settings.
 */

import type { Plugin, PluginContext } from 'vjcad';
import { t } from 'vjcad';

import {
    ICON_ANNOTATION, ICON_ANNO_CLOUD, ICON_ANNO_ARROW, ICON_ANNO_RECT,
    ICON_ANNO_ELLIPSE, ICON_ANNO_TEXT, ICON_ANNO_LEADER, ICON_ANNO_FREEHAND,
    ICON_ANNO_STAMP, ICON_ANNO_HIGHLIGHT, ICON_ANNO_SHOW, ICON_ANNO_HIDE,
    ICON_ANNO_LIST, ICON_ANNO_CLEAR,
} from './icons';

import { AnnotationCommand, destroyAnnotationToolbar } from './commands/AnnotationCommand';
import { AnnoCloudCommand }     from './commands/AnnoCloudCommand';
import { AnnoArrowCommand }     from './commands/AnnoArrowCommand';
import { AnnoRectCommand }      from './commands/AnnoRectCommand';
import { AnnoEllipseCommand }   from './commands/AnnoEllipseCommand';
import { AnnoTextCommand }      from './commands/AnnoTextCommand';
import { AnnoLeaderCommand }    from './commands/AnnoLeaderCommand';
import { AnnoFreehandCommand }  from './commands/AnnoFreehandCommand';
import { AnnoStampCommand }     from './commands/AnnoStampCommand';
import { AnnoHighlightCommand } from './commands/AnnoHighlightCommand';
import { AnnoShowCommand }      from './commands/AnnoShowCommand';
import { AnnoHideCommand }      from './commands/AnnoHideCommand';
import { AnnoClearCommand }     from './commands/AnnoClearCommand';
import { AnnoListCommand, destroyAnnoListPanel } from './commands/AnnoListCommand';
import { registerAnnotationPluginMessages } from './i18n';

const plugin: Plugin = {
    manifest: {
        id: 'annotation',
        name: t('anno.plugin.name'),
        version: '1.0.0',
        author: 'vjmap.com',
        description: t('anno.plugin.description'),
        keywords: ['annotation', 'markup', 'redline', 'review', 'cloud', 'arrow', 'stamp'],
    },

    onLoad(_context: PluginContext): void {
        registerAnnotationPluginMessages();
    },

    onActivate(context: PluginContext): void {

        // ── Icons ──
        context.registerIcon('ANNOTATION',     ICON_ANNOTATION);
        context.registerIcon('ANNO_CLOUD',     ICON_ANNO_CLOUD);
        context.registerIcon('ANNO_ARROW',     ICON_ANNO_ARROW);
        context.registerIcon('ANNO_RECT',      ICON_ANNO_RECT);
        context.registerIcon('ANNO_ELLIPSE',   ICON_ANNO_ELLIPSE);
        context.registerIcon('ANNO_TEXT',       ICON_ANNO_TEXT);
        context.registerIcon('ANNO_LEADER',    ICON_ANNO_LEADER);
        context.registerIcon('ANNO_FREEHAND',  ICON_ANNO_FREEHAND);
        context.registerIcon('ANNO_STAMP',     ICON_ANNO_STAMP);
        context.registerIcon('ANNO_HIGHLIGHT', ICON_ANNO_HIGHLIGHT);
        context.registerIcon('ANNO_SHOW',      ICON_ANNO_SHOW);
        context.registerIcon('ANNO_HIDE',      ICON_ANNO_HIDE);
        context.registerIcon('ANNO_LIST',      ICON_ANNO_LIST);
        context.registerIcon('ANNO_CLEAR',     ICON_ANNO_CLEAR);

        // ── Commands ──
        context.registerCommand('ANNOTATION',     t('anno.cmd.toolbar'), AnnotationCommand);
        context.registerCommand('ANNO_CLOUD',     t('anno.cmd.cloud'), AnnoCloudCommand);
        context.registerCommand('ANNO_ARROW',     t('anno.cmd.arrow'), AnnoArrowCommand);
        context.registerCommand('ANNO_RECT',      t('anno.cmd.rect'), AnnoRectCommand);
        context.registerCommand('ANNO_ELLIPSE',   t('anno.cmd.ellipse'), AnnoEllipseCommand);
        context.registerCommand('ANNO_TEXT',      t('anno.cmd.text'), AnnoTextCommand);
        context.registerCommand('ANNO_LEADER',    t('anno.cmd.leader'), AnnoLeaderCommand);
        context.registerCommand('ANNO_FREEHAND',  t('anno.cmd.freehand'), AnnoFreehandCommand);
        context.registerCommand('ANNO_STAMP',     t('anno.cmd.stamp'), AnnoStampCommand);
        context.registerCommand('ANNO_HIGHLIGHT', t('anno.cmd.highlight'), AnnoHighlightCommand);
        context.registerCommand('ANNO_SHOW',      t('anno.cmd.show'), AnnoShowCommand);
        context.registerCommand('ANNO_HIDE',      t('anno.cmd.hide'), AnnoHideCommand);
        context.registerCommand('ANNO_CLEAR',     t('anno.cmd.clear'), AnnoClearCommand);
        context.registerCommand('ANNO_LIST',      t('anno.cmd.list'), AnnoListCommand);

        // ── Ribbon — "审阅" tab ──
        context.addRibbonTab(
            { id: 'review', label: t('anno.ribbon.tab'), groups: [] },
            'plugins'
        );
        context.addRibbonGroup('review', {
            id: 'annotation-tools',
            label: t('anno.ribbon.tools'),
            pinnable: true,
            primaryButtons: [
                { icon: 'annotation', cmd: 'ANNOTATION', prompt: t('anno.cmd.toolbar'), type: 'large' },
            ],
            moreButtons: [
                { icon: 'anno_cloud',     cmd: 'ANNO_CLOUD',     prompt: t('anno.cmd.cloud') },
                { icon: 'anno_arrow',     cmd: 'ANNO_ARROW',     prompt: t('anno.cmd.arrow') },
                { icon: 'anno_rect',      cmd: 'ANNO_RECT',      prompt: t('anno.cmd.rect') },
                { icon: 'anno_ellipse',   cmd: 'ANNO_ELLIPSE',   prompt: t('anno.cmd.ellipse') },
                { icon: 'anno_text',      cmd: 'ANNO_TEXT',      prompt: t('anno.cmd.text') },
                { icon: 'anno_leader',    cmd: 'ANNO_LEADER',    prompt: t('anno.cmd.leader') },
                { icon: 'anno_freehand',  cmd: 'ANNO_FREEHAND',  prompt: t('anno.cmd.freehand') },
                { icon: 'anno_stamp',     cmd: 'ANNO_STAMP',     prompt: t('anno.cmd.stamp') },
                { icon: 'anno_highlight', cmd: 'ANNO_HIGHLIGHT', prompt: t('anno.cmd.highlight') },
            ],
        });
        context.addRibbonGroup('review', {
            id: 'annotation-manage',
            label: t('anno.ribbon.manage'),
            primaryButtons: [
                { icon: 'anno_show',  cmd: 'ANNO_SHOW',  prompt: t('anno.cmd.show') },
                { icon: 'anno_hide',  cmd: 'ANNO_HIDE',  prompt: t('anno.cmd.hide') },
                { icon: 'anno_list',  cmd: 'ANNO_LIST',  prompt: t('anno.cmd.list') },
                { icon: 'anno_clear', cmd: 'ANNO_CLEAR', prompt: t('anno.cmd.clear') },
            ],
        });

        // ── Menu ──
        context.addMenu({ id: 'review', label: t('anno.menu.review') });
        context.addMenuItem('review', { command: 'ANNOTATION' });
        context.addMenuItem('review', { command: 'ANNO_SHOW' });
        context.addMenuItem('review', { command: 'ANNO_HIDE' });
        context.addMenuItem('review', { command: 'ANNO_CLEAR' });
        context.addMenuItem('review', { command: 'ANNO_LIST' });

        // Sidebar panel is created on-demand by AnnoListCommand (not at load time).
    },

    onDeactivate(context: PluginContext): void {
        console.log(`[${context.manifest.name}] ${t('anno.plugin.deactivated')}`);
        destroyAnnotationToolbar();
        destroyAnnoListPanel();
    },

    onUnload(context: PluginContext): void {
        console.log(`[${context.manifest.name}] ${t('anno.plugin.unloaded')}`);
    },
};

export default plugin;
