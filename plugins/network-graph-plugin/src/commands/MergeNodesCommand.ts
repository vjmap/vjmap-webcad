import {
    Engine,
    SelectionSetInputOptions,
    InputStatusEnum,
    t
} from 'vjcad';
import { getNetworkService } from '../services/NetworkService';

function isNode(e: any): boolean { return e.isAlive && e.type === 'CUSTOM' && e.customType === 'NETWORK_NODE'; }
function isBranch(e: any): boolean { return e.isAlive && e.type === 'CUSTOM' && e.customType === 'NETWORK_BRANCH'; }

export class MergeNodesCommand {
    async main(): Promise<void> {
        Engine.writeMessage(`<br/>${t('network.merge.startMsg')}`);

        const removeNode = await this.selectNode(t('network.merge.selectRemove'));
        if (!removeNode) return;
        Engine.writeMessage(`<br/>${t('network.merge.removeNode', { label: removeNode._label || removeNode.label })}`);

        const targetNode = await this.selectNode(t('network.merge.selectTarget'));
        if (!targetNode) return;
        if (targetNode === removeNode) {
            Engine.writeMessage(`<br/>${t('network.merge.cannotMergeSelf')}`);
            return;
        }
        Engine.writeMessage(`<br/>${t('network.merge.targetNode', { label: targetNode._label || targetNode.label })}`);

        const service = getNetworkService();
        service.drawingInProgress = true;
        Engine.undoManager.start_undoMark();

        try {
            const removeNetId: string = removeNode._networkId || removeNode.networkId;
            const targetNetId: string = targetNode._networkId || targetNode.networkId;

            const allBranches = Engine.getEntities(e => isBranch(e));
            const branchesToDelete: any[] = [];
            const branchesToRelink: any[] = [];

            for (const branch of allBranches) {
                const startId: string = (branch as any)._startNetworkId || (branch as any).startNetworkId || '';
                const endId: string = (branch as any)._endNetworkId || (branch as any).endNetworkId || '';
                const startIsRemoved = startId === removeNetId;
                const endIsRemoved = endId === removeNetId;
                if (!startIsRemoved && !endIsRemoved) continue;

                const newStartId = startIsRemoved ? targetNetId : startId;
                const newEndId = endIsRemoved ? targetNetId : endId;

                if (newStartId === newEndId) {
                    branchesToDelete.push(branch);
                } else {
                    (branch as any)._startNetworkId = newStartId;
                    (branch as any)._endNetworkId = newEndId;
                    branchesToRelink.push(branch);
                }
            }

            if (branchesToDelete.length > 0) {
                Engine.eraseEntities(branchesToDelete);
            }

            const allNodes = Engine.getEntities(e => isNode(e));
            const nodeByNetId = new Map<string, any>();
            for (const n of allNodes) nodeByNetId.set((n as any)._networkId || (n as any).networkId, n);

            for (const branch of branchesToRelink) {
                const sid = (branch as any)._startNetworkId || (branch as any).startNetworkId;
                const eid = (branch as any)._endNetworkId || (branch as any).endNetworkId;
                const sn = nodeByNetId.get(sid);
                const en = nodeByNetId.get(eid);
                if (sn && en) {
                    if (typeof branch.unlinkAllOwners === 'function') branch.unlinkAllOwners();

                    const snPos = sn._position || sn.position;
                    const enPos = en._position || en.position;
                    (branch as any)._startPoint = snPos.clone();
                    (branch as any)._endPoint = enPos.clone();
                    (branch as any)._startNodeRadius = sn._radius || sn.radius || 0;
                    (branch as any)._endNodeRadius = en._radius || en.radius || 0;

                    if (typeof branch.setSourceNodes === 'function') branch.setSourceNodes(sn.id, en.id);
                    if (typeof branch.setModified === 'function') branch.setModified();
                }
            }

            Engine.eraseEntities(removeNode);

            Engine.pcanvas?.regen(true);
            Engine.writeMessage(`<br/>${t('network.merge.complete', { 
                removeLabel: removeNode._label || removeNode.label, 
                targetLabel: targetNode._label || targetNode.label 
            })}`);
        } finally {
            service.drawingInProgress = false;
            Engine.undoManager.end_undoMark();
        }
    }

    private async selectNode(prompt: string): Promise<any | null> {
        while (true) {
            const options = new SelectionSetInputOptions(prompt);
            const result = await Engine.getEntity(options);
            if (result.status === InputStatusEnum.OK && result.pickedEntity) {
                if (result.pickedEntity.type === 'CUSTOM' &&
                    (result.pickedEntity as any).customType === 'NETWORK_NODE') {
                    return result.pickedEntity;
                }
                Engine.writeMessage(`<br/>${t('network.merge.pleaseSelectNode')}`);
            } else {
                return null;
            }
        }
    }
}
