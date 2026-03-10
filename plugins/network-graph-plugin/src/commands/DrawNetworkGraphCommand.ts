import {
    Engine,
    PointInputOptions,
    InputStatusEnum,
    CircleEnt,
    Point2D,
    t
} from 'vjcad';
import { NetworkNodeEnt } from '../entities/NetworkNodeEnt';
import { NetworkBranchEnt } from '../entities/NetworkBranchEnt';
import { getNetworkService } from '../services/NetworkService';

const SNAP_TOLERANCE = 0.5;

export class DrawNetworkGraphCommand {
    private branchCount = 0;

    async main(): Promise<void> {
        Engine.writeMessage(`<br/>${t('network.draw.startMsg')}`);
        const service = getNetworkService();
        service.drawingInProgress = true;
        Engine.undoManager.start_undoMark();

        try {
            this.branchCount = this.getNextBranchIndex();

            while (true) {
                const newNodes: NetworkNodeEnt[] = [];

                const startResult = await this.getNodePoint(t('network.draw.specifyStart'));
                if (!startResult) break;
                if (startResult.created) newNodes.push(startResult.node);
                const startNode = startResult.node;

                const endResult = await this.getNodePoint(t('network.draw.specifyEnd'), startNode);
                if (!endResult) {
                    this.rollbackNodes(newNodes);
                    break;
                }
                if (endResult.created) newNodes.push(endResult.node);
                const endNode = endResult.node;

                const nextLabel = String(this.branchCount + 1);
                const bulge = await this.getArcOrLine(startNode, endNode, nextLabel);
                if (bulge === null) {
                    this.rollbackNodes(newNodes);
                    break;
                }

                const label = String(this.branchCount + 1);
                const branch = NetworkBranchEnt.create(
                    startNode.position, endNode.position,
                    startNode.networkId, endNode.networkId,
                    label, true,
                    startNode.radius, endNode.radius,
                    bulge
                );
                branch.setDefaults();
                Engine.addEntities(branch);
                branch.setSourceNodes(startNode.id, endNode.id);

                const shape = Math.abs(bulge) < 0.01 ? t('network.draw.shape.line') : t('network.draw.shape.arc');
                Engine.writeMessage(`<br/>${t('network.draw.branchCreated', {
                    label,
                    shape,
                    startLabel: startNode.label,
                    endLabel: endNode.label
                })}`);
                this.branchCount++;
            }
        } finally {
            service.drawingInProgress = false;
            Engine.undoManager.end_undoMark();
            Engine.clearPreview();
        }
    }

    /**
     * Delete newly created nodes that haven't been connected to a branch yet.
     */
    private rollbackNodes(nodes: NetworkNodeEnt[]): void {
        const alive = nodes.filter(n => n.isAlive);
        if (alive.length > 0) {
            Engine.eraseEntities(alive);
            Engine.writeMessage(`<br/>${t('network.draw.undoNodes', { count: alive.length })}`);
        }
    }

    private async getNodePoint(
        prompt: string,
        excludeNode?: NetworkNodeEnt
    ): Promise<{ node: NetworkNodeEnt; created: boolean } | null> {
        const options = new PointInputOptions(prompt);
        options.callback = (canvasPt) => {
            const wp = Engine.canvasToWcs(canvasPt);
            const existing = this.findNodeAtPoint(wp, excludeNode);
            Engine.clearPreview();
            if (!existing) {
                const preview = new CircleEnt([wp.x, wp.y], 10);
                preview.setDefaults();
                Engine.drawPreviewEntity(preview);
            }
        };

        const result = await Engine.getPoint(options);
        Engine.clearPreview();

        if (result.status !== InputStatusEnum.OK) return null;

        const pt = result.value;
        const existing = this.findNodeAtPoint(pt, excludeNode);
        if (existing) {
            Engine.writeMessage(`<br/>${t('network.draw.snapExisting', { label: existing.label })}`);
            return { node: existing, created: false };
        }

        const nextLabel = String(this.getNextNodeNumber());
        const node = NetworkNodeEnt.create(pt, nextLabel);
        node.setDefaults();
        Engine.addEntities(node);
        Engine.writeMessage(`<br/>${t('network.draw.createNew', { label: nextLabel })}`);
        return { node, created: true };
    }

    private async getArcOrLine(
        startNode: NetworkNodeEnt,
        endNode: NetworkNodeEnt,
        previewLabel: string
    ): Promise<number | null> {
        const sp = startNode.position;
        const ep = endNode.position;

        const options = new PointInputOptions(t('network.draw.specifyArcPoint'));
        options.useBasePoint = true;
        options.basePoint = sp;
        options.callback = (canvasPt) => {
            const wp = Engine.canvasToWcs(canvasPt);
            const b = NetworkBranchEnt.bulgeFromThirdPoint(sp, ep, wp);

            const preview = NetworkBranchEnt.create(
                sp, ep, '', '', previewLabel, true,
                startNode.radius, endNode.radius,
                Math.abs(b) < 0.02 ? 0 : b
            );
            preview.setDefaults();
            Engine.clearPreview();
            Engine.drawPreviewEntity(preview);
        };

        const result = await Engine.getPoint(options);
        Engine.clearPreview();

        if (result.status === InputStatusEnum.OK) {
            const b = NetworkBranchEnt.bulgeFromThirdPoint(sp, ep, result.value);
            return Math.abs(b) < 0.02 ? 0 : b;
        }
        if (result.status === InputStatusEnum.Cancel) {
            return null;
        }
        return 0;
    }

    private findNodeAtPoint(point: Point2D, excludeNode?: NetworkNodeEnt): NetworkNodeEnt | null {
        const nodes = Engine.getEntities(
            e => e.isAlive && e.type === 'CUSTOM' && e instanceof NetworkNodeEnt
        ) as NetworkNodeEnt[];

        for (const node of nodes) {
            if (excludeNode && node === excludeNode) continue;
            const dx = point.x - node.position.x;
            const dy = point.y - node.position.y;
            if (Math.sqrt(dx * dx + dy * dy) < Math.max(node.radius * SNAP_TOLERANCE, 1)) {
                return node;
            }
        }
        return null;
    }

    private getNextNodeNumber(): number {
        const nodes = Engine.getEntities(
            e => e.isAlive && e.type === 'CUSTOM' && e instanceof NetworkNodeEnt
        ) as NetworkNodeEnt[];
        let max = 0;
        for (const n of nodes) {
            const num = parseInt(n.label, 10);
            if (!isNaN(num) && num > max) max = num;
        }
        return max + 1;
    }

    private getNextBranchIndex(): number {
        return Engine.getEntities(
            e => e.isAlive && e.type === 'CUSTOM' && e instanceof NetworkBranchEnt
        ).length;
    }
}
