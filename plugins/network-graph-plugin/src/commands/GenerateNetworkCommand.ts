import {
    Engine,
    PointInputOptions,
    InputStatusEnum,
    Point2D,
    t
} from 'vjcad';
import { getNetworkService } from '../services/NetworkService';
import { GenerateNetworkDialog } from '../ui/GenerateNetworkDialog';

export class GenerateNetworkCommand {
    async main(): Promise<void> {
        Engine.writeMessage(`<br/>${t('network.generate.startMsg')}`);

        const dialog = new GenerateNetworkDialog();
        const data = await dialog.startDialog();

        if (!data) {
            Engine.writeMessage(`<br/>${t('network.generate.cancelled')}`);
            return;
        }

        if (data.nodes.length === 0) {
            Engine.writeMessage(`<br/>${t('network.generate.noNodes')}`);
            return;
        }

        const service = getNetworkService();
        service.drawingInProgress = true;
        Engine.undoManager.start_undoMark();

        try {
            const { nodes, branches } = service.generateNetwork(data);

            if (nodes.length === 0) {
                Engine.writeMessage(`<br/>${t('network.generate.noEntities')}`);
                return;
            }

            const basePointOpts = new PointInputOptions(t('network.generate.specifyBasePoint'));
            basePointOpts.callback = (canvasPt) => {
                const wp = Engine.canvasToWcs(canvasPt);
                Engine.clearPreview();
                for (const node of nodes) {
                    const previewNode = node.clone();
                    previewNode.move(new Point2D(0, 0), wp);
                    Engine.drawPreviewEntity(previewNode);
                }
            };

            const baseResult = await Engine.getPoint(basePointOpts);
            Engine.clearPreview();

            if (baseResult.status !== InputStatusEnum.OK) {
                Engine.writeMessage(`<br/>${t('network.generate.cancelled')}`);
                return;
            }

            const insertPt = baseResult.value;
            const origin = new Point2D(0, 0);
            for (const node of nodes) {
                node.move(origin, insertPt);
            }
            for (const branch of branches) {
                const sp = branch.startPoint;
                const ep = branch.endPoint;
                branch.startPoint = new Point2D(sp.x + insertPt.x, sp.y + insertPt.y);
                branch.endPoint = new Point2D(ep.x + insertPt.x, ep.y + insertPt.y);
            }

            Engine.addEntities([...nodes, ...branches]);
            service.linkBranches(nodes, branches);
            Engine.zoomExtents();
            Engine.writeMessage(`<br/>${t('network.generate.complete', { nodeCount: nodes.length, branchCount: branches.length })}`);
        } finally {
            service.drawingInProgress = false;
            Engine.undoManager.end_undoMark();
            Engine.clearPreview();
        }
    }
}
