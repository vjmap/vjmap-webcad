import type { Plugin, PluginContext } from 'vjcad';
import { CustomEntityRegistry, t } from 'vjcad';
import { ICON_NETWORK_NODE, ICON_GENERATE_NETWORK, ICON_MERGE_NODES, ICON_BREAK_BRANCH, ICON_REVERSE_BRANCH } from './icons';
import { NetworkNodeEnt } from './entities/NetworkNodeEnt';
import { NetworkBranchEnt } from './entities/NetworkBranchEnt';
import { DrawNetworkGraphCommand } from './commands/DrawNetworkGraphCommand';
import { GenerateNetworkCommand } from './commands/GenerateNetworkCommand';
import { MergeNodesCommand } from './commands/MergeNodesCommand';
import { BreakBranchCommand } from './commands/BreakBranchCommand';
import { ReverseBranchCommand } from './commands/ReverseBranchCommand';
import { getNetworkService } from './services/NetworkService';
import { registerNetworkGraphPluginMessages } from './i18n';

let entityAddedCleanup: (() => void) | null = null;

const plugin: Plugin = {
    manifest: {
        id: 'network-graph',
        name: 'Network Graph',
        version: '1.0.0',
        author: 'vjmap.com',
        description: 'Network Graph Plugin - Supports topological network drawing with nodes and branches, data generation, and topology-preserving copy-paste',
        keywords: ['network', 'graph', 'topology', 'node', 'branch']
    },

    onLoad(_context: PluginContext): void {
        registerNetworkGraphPluginMessages();
        const registry = CustomEntityRegistry.getInstance();
        registry.register('NETWORK_NODE', NetworkNodeEnt);
        registry.register('NETWORK_BRANCH', NetworkBranchEnt);
    },

    onActivate(context: PluginContext): void {
        context.registerIcon('DRAWNETWORKGRAPH', ICON_NETWORK_NODE);
        context.registerIcon('GENERATENETWORK', ICON_GENERATE_NETWORK);
        context.registerIcon('MERGENODES', ICON_MERGE_NODES);
        context.registerIcon('BREAKBRANCH', ICON_BREAK_BRANCH);
        context.registerIcon('REVERSEBRANCH', ICON_REVERSE_BRANCH);

        context.registerCommand('DRAWNETWORKGRAPH', t('network.cmd.drawNetworkGraph'), DrawNetworkGraphCommand);
        context.registerCommand('GENERATENETWORK', t('network.cmd.generateNetwork'), GenerateNetworkCommand);
        context.registerCommand('MERGENODES', t('network.cmd.mergeNodes'), MergeNodesCommand);
        context.registerCommand('BREAKBRANCH', t('network.cmd.breakBranch'), BreakBranchCommand);
        context.registerCommand('REVERSEBRANCH', t('network.cmd.reverseBranch'), ReverseBranchCommand);

        context.addRibbonGroup('plugins', {
            id: 'network-graph',
            label: t('network.ribbon.groupLabel'),
            primaryButtons: [
                { icon: 'drawnetworkgraph', cmd: 'DRAWNETWORKGRAPH', prompt: t('network.cmd.drawNetworkGraph'), type: 'large' },
                { icon: 'generatenetwork', cmd: 'GENERATENETWORK', prompt: t('network.cmd.generateNetwork'), type: 'large' }
            ],
            moreButtons: [
                { icon: 'mergenodes', cmd: 'MERGENODES', prompt: t('network.cmd.mergeNodes'), type: 'small' },
                { icon: 'breakbranch', cmd: 'BREAKBRANCH', prompt: t('network.cmd.breakBranch'), type: 'small' },
                { icon: 'reversebranch', cmd: 'REVERSEBRANCH', prompt: t('network.cmd.reverseBranch'), type: 'small' }
            ]
        });

        const service = getNetworkService();
        entityAddedCleanup = service.startListeners();
    },

    onDeactivate(_context: PluginContext): void {
        if (entityAddedCleanup) {
            entityAddedCleanup();
            entityAddedCleanup = null;
        }

        const registry = CustomEntityRegistry.getInstance();
        registry.unregister('NETWORK_NODE');
        registry.unregister('NETWORK_BRANCH');
    },

    onUnload(_context: PluginContext): void {
        // noop
    }
};

export default plugin;
