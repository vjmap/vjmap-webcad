import {
    Engine,
    SelectionSetInputOptions,
    InputStatusEnum,
    t
} from 'vjcad';
import { getNetworkService } from '../services/NetworkService';

function isNode(e: any): boolean { return e.isAlive && e.type === 'CUSTOM' && e.customType === 'NETWORK_NODE'; }

export class ReverseBranchCommand {
    async main(): Promise<void> {
        Engine.writeMessage(`<br/>${t('network.reverse.startMsg')}`);

        const branch = await this.selectBranch(t('network.reverse.selectBranch'));
        if (!branch) return;

        const service = getNetworkService();
        service.drawingInProgress = true;
        Engine.undoManager.start_undoMark();

        try {
            const oldStartNetId = (branch as any)._startNetworkId || (branch as any).startNetworkId;
            const oldEndNetId = (branch as any)._endNetworkId || (branch as any).endNetworkId;
            (branch as any)._startNetworkId = oldEndNetId;
            (branch as any)._endNetworkId = oldStartNetId;

            const oldStartPt = ((branch as any)._startPoint || (branch as any).startPoint).clone();
            const oldEndPt = ((branch as any)._endPoint || (branch as any).endPoint).clone();
            (branch as any)._startPoint = oldEndPt;
            (branch as any)._endPoint = oldStartPt;

            const oldStartR = (branch as any)._startNodeRadius || 0;
            const oldEndR = (branch as any)._endNodeRadius || 0;
            (branch as any)._startNodeRadius = oldEndR;
            (branch as any)._endNodeRadius = oldStartR;

            if ((branch as any)._bulge !== undefined) {
                (branch as any)._bulge = -(branch as any)._bulge;
            }

            if (typeof branch.unlinkAllOwners === 'function') branch.unlinkAllOwners();

            const allNodes = Engine.getEntities(e => isNode(e));
            const nodeByNetId = new Map<string, any>();
            for (const n of allNodes) nodeByNetId.set((n as any)._networkId || (n as any).networkId, n);

            const newStart = nodeByNetId.get(oldEndNetId);
            const newEnd = nodeByNetId.get(oldStartNetId);
            if (newStart && newEnd && typeof branch.setSourceNodes === 'function') {
                branch.setSourceNodes(newStart.id, newEnd.id);
            }

            if (typeof branch.setModified === 'function') branch.setModified();
            Engine.pcanvas?.regen(true);

            const label = (branch as any)._label || (branch as any).label || '';
            Engine.writeMessage(`<br/>${t('network.reverse.complete', { label })}`);
        } finally {
            service.drawingInProgress = false;
            Engine.undoManager.end_undoMark();
        }
    }

    private async selectBranch(prompt: string): Promise<any | null> {
        while (true) {
            const options = new SelectionSetInputOptions(prompt);
            const result = await Engine.getEntity(options);
            if (result.status === InputStatusEnum.OK && result.pickedEntity) {
                if (result.pickedEntity.type === 'CUSTOM' &&
                    (result.pickedEntity as any).customType === 'NETWORK_BRANCH') {
                    return result.pickedEntity;
                }
                Engine.writeMessage(`<br/>${t('network.reverse.pleaseSelectBranch')}`);
            } else {
                return null;
            }
        }
    }
}
