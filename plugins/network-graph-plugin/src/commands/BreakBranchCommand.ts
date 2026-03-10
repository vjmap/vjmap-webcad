import {
    Engine,
    SelectionSetInputOptions,
    PointInputOptions,
    InputStatusEnum,
    Point2D,
    CircleEnt,
    t
} from 'vjcad';
import { NetworkNodeEnt } from '../entities/NetworkNodeEnt';
import { NetworkBranchEnt } from '../entities/NetworkBranchEnt';
import { getNetworkService } from '../services/NetworkService';

function isNode(e: any): boolean { return e.isAlive && e.type === 'CUSTOM' && e.customType === 'NETWORK_NODE'; }
function isBranch(e: any): boolean { return e.isAlive && e.type === 'CUSTOM' && e.customType === 'NETWORK_BRANCH'; }

export class BreakBranchCommand {
    async main(): Promise<void> {
        Engine.writeMessage(`<br/>${t('network.break.startMsg')}`);

        const branch = await this.selectBranch(t('network.break.selectBranch'));
        if (!branch) return;

        const branchLabel = (branch as any)._label || (branch as any).label || '';
        Engine.writeMessage(`<br/>${t('network.break.branchSelected', { label: branchLabel })}`);

        const breakPt = await this.getBreakPoint();
        if (!breakPt) return;

        const service = getNetworkService();
        service.drawingInProgress = true;
        Engine.undoManager.start_undoMark();

        try {
            const oldStartNetId: string = (branch as any)._startNetworkId || (branch as any).startNetworkId || '';
            const oldEndNetId: string = (branch as any)._endNetworkId || (branch as any).endNetworkId || '';
            const oldStartPoint: Point2D = ((branch as any)._startPoint || (branch as any).startPoint).clone();
            const oldEndPoint: Point2D = ((branch as any)._endPoint || (branch as any).endPoint).clone();
            const oldStartRadius: number = (branch as any)._startNodeRadius || 0;
            const oldEndRadius: number = (branch as any)._endNodeRadius || 0;

            const allNodes = Engine.getEntities(e => isNode(e));
            let maxNum = 0;
            for (const n of allNodes) {
                const num = parseInt((n as any)._label || (n as any).label || '0', 10);
                if (!isNaN(num) && num > maxNum) maxNum = num;
            }

            const allBranches = Engine.getEntities(e => isBranch(e));
            let maxBranchNum = 0;
            for (const b of allBranches) {
                const num = parseInt((b as any)._label || (b as any).label || '0', 10);
                if (!isNaN(num) && num > maxBranchNum) maxBranchNum = num;
            }

            const newNode = NetworkNodeEnt.create(breakPt, String(maxNum + 1));
            newNode.setDefaults();
            Engine.addEntities(newNode);

            const branch1 = NetworkBranchEnt.create(
                oldStartPoint, breakPt,
                oldStartNetId, newNode.networkId,
                String(maxBranchNum + 1), true,
                oldStartRadius, newNode.radius,
                0
            );
            branch1.setDefaults();

            const branch2 = NetworkBranchEnt.create(
                breakPt, oldEndPoint,
                newNode.networkId, oldEndNetId,
                String(maxBranchNum + 2), true,
                newNode.radius, oldEndRadius,
                0
            );
            branch2.setDefaults();

            Engine.addEntities([branch1, branch2]);

            const freshNodes = Engine.getEntities(e => isNode(e));
            const nodeByNetId = new Map<string, any>();
            for (const n of freshNodes) nodeByNetId.set((n as any)._networkId || (n as any).networkId, n);

            const sn1 = nodeByNetId.get(oldStartNetId);
            const en1 = nodeByNetId.get(newNode.networkId);
            if (sn1 && en1) {
                (branch1 as any)._startPoint = (sn1._position || sn1.position).clone();
                (branch1 as any)._endPoint = (en1._position || en1.position).clone();
                (branch1 as any)._startNodeRadius = sn1._radius || sn1.radius || 0;
                (branch1 as any)._endNodeRadius = en1._radius || en1.radius || 0;
                branch1.setSourceNodes(sn1.id, en1.id);
            }

            const sn2 = nodeByNetId.get(newNode.networkId);
            const en2 = nodeByNetId.get(oldEndNetId);
            if (sn2 && en2) {
                (branch2 as any)._startPoint = (sn2._position || sn2.position).clone();
                (branch2 as any)._endPoint = (en2._position || en2.position).clone();
                (branch2 as any)._startNodeRadius = sn2._radius || sn2.radius || 0;
                (branch2 as any)._endNodeRadius = en2._radius || en2.radius || 0;
                branch2.setSourceNodes(sn2.id, en2.id);
            }

            Engine.eraseEntities(branch);

            Engine.pcanvas?.regen(true);
            Engine.writeMessage(`<br/>${t('network.break.complete', { nodeLabel: newNode.label, branchLabel })}`);
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
                Engine.writeMessage(`<br/>${t('network.break.pleaseSelectBranch')}`);
            } else {
                return null;
            }
        }
    }

    private async getBreakPoint(): Promise<Point2D | null> {
        const options = new PointInputOptions(t('network.break.specifyPoint'));
        options.callback = (canvasPt) => {
            const wp = Engine.canvasToWcs(canvasPt);
            const preview = new CircleEnt([wp.x, wp.y], 5);
            preview.setDefaults();
            Engine.clearPreview();
            Engine.drawPreviewEntity(preview);
        };

        const result = await Engine.getPoint(options);
        Engine.clearPreview();

        if (result.status === InputStatusEnum.OK) {
            return result.value;
        }
        return null;
    }
}
