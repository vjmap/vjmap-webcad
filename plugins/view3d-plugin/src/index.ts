import type { Plugin, PluginContext } from 'vjcad';
import { t } from 'vjcad';
import { ICON_VIEW3D } from './icons';
import { View3dCommand, destroyView3dPanel } from './commands/View3dCommand';
import { registerView3dPluginMessages } from './i18n';

const plugin: Plugin = {
    manifest: {
        id: 'view3d',
        name: '3D View',
        version: '1.0.0',
        author: 'vjmap.com',
        description: '3D View Plugin - Visualize WebCAD entities with Z values in 3D view',
        keywords: ['view3d', '3d', 'viewer', 'elevation', 'z-value']
    },

    onLoad(context: PluginContext): void {
        registerView3dPluginMessages();
        console.log(`[${context.manifest.name}] ${t('view3d.plugin.loaded')}`);
    },

    onActivate(context: PluginContext): void {
        console.log(`[${context.manifest.name}] ${t('view3d.plugin.activated')}`);

        context.registerIcon('VIEW3D', ICON_VIEW3D);

        context.registerCommand('VIEW3D', t('view3d.cmd.view3d'), View3dCommand);

        context.addMenuItem('tool', { command: 'VIEW3D' });

        context.addRibbonGroup('plugins', {
            id: 'view3d',
            label: t('view3d.ribbon.groupLabel'),
            primaryButtons: [
                { icon: 'view3d', cmd: 'VIEW3D', prompt: t('view3d.ribbon.prompt'), type: 'large' }
            ]
        });
    },

    onDeactivate(context: PluginContext): void {
        console.log(`[${context.manifest.name}] ${t('view3d.plugin.deactivated')}`);
        destroyView3dPanel();
    },

    onUnload(context: PluginContext): void {
        console.log(`[${context.manifest.name}] ${t('view3d.plugin.unloaded')}`);
    }
};

export default plugin;
