import { html, LitElement, Engine, type TemplateResult, EntityBase, t } from 'vjcad';
import type { NetworkData } from '../services/NetworkService';
import { computeLayout, type LayoutAlgorithmType } from '../services/LayoutAlgorithm';

const EXAMPLE_TWO_TABLE_NODES = `id,label,x,y
1,1,0,0
2,2,200,120
3,3,200,-120
4,4,450,0
5,5,620,0`;

const EXAMPLE_TWO_TABLE_BRANCHES = `startNodeId,endNodeId,label,bulge
1,2,1,0
1,3,2,0
2,3,3,0
1,4,4,0
2,4,5,0.15
2,4,6,0
2,4,7,-0.15
3,4,8,0
4,5,9,0`;

const EXAMPLE_SINGLE_TABLE = `startNode,endNode,label
1,2,1
1,3,2
2,3,3
1,4,4
2,4,5
3,4,6
4,5,7`;

export class GenerateNetworkDialog extends LitElement {
    declare mode: 'two' | 'single';
    declare nodesCsv: string;
    declare branchesCsv: string;
    declare singleCsv: string;
    declare algorithm: LayoutAlgorithmType;
    declare nodeRadius: number;
    declare nodeSpacing: number;
    declare errorMessage: string;

    private result: NetworkData | undefined;
    private baseDialog!: any;

    static properties = {
        mode: { type: String },
        nodesCsv: { type: String },
        branchesCsv: { type: String },
        singleCsv: { type: String },
        algorithm: { type: String },
        nodeRadius: { type: Number },
        nodeSpacing: { type: Number },
        errorMessage: { type: String }
    };

    constructor() {
        super();
        this.mode = 'two';
        this.nodesCsv = '';
        this.branchesCsv = '';
        this.singleCsv = '';
        this.algorithm = 'force';
        this.nodeRadius = 15;
        this.nodeSpacing = 150;
        this.errorMessage = '';
    }

    createRenderRoot() { return this as any; }

    async firstUpdated(): Promise<void> {
        this.baseDialog = this.querySelector('base-dialog');
    }

    private loadExample(): void {
        if (this.mode === 'two') {
            this.nodesCsv = EXAMPLE_TWO_TABLE_NODES;
            this.branchesCsv = EXAMPLE_TWO_TABLE_BRANCHES;
        } else {
            this.singleCsv = EXAMPLE_SINGLE_TABLE;
        }
        this.errorMessage = '';
    }

    private loadFromCurrentGraph(): void {
        const allEnts = Engine.getEntities((e: EntityBase) => e.isAlive && e.type === 'CUSTOM');
        const nodes = allEnts.filter((e: any) => e.customType === 'NETWORK_NODE');
        const branches = allEnts.filter((e: any) => e.customType === 'NETWORK_BRANCH');

        if (nodes.length === 0 && branches.length === 0) {
            this.errorMessage = t('network.dialog.noEntities');
            return;
        }

        // Build node CSV
        const nodeLines = ['id,label,x,y'];
        const netIdToLabel = new Map<string, string>();
        for (const n of nodes) {
            const label = (n as any)._label || (n as any).label || '';
            const netId = (n as any)._networkId || (n as any).networkId || '';
            const pos = (n as any)._position || (n as any).position;
            const x = pos ? Math.round(pos.x * 100) / 100 : 0;
            const y = pos ? Math.round(pos.y * 100) / 100 : 0;
            netIdToLabel.set(netId, label);
            nodeLines.push(`${label},${label},${x},${y}`);
        }

        // Build branch CSV
        const branchLines = ['startNodeId,endNodeId,label,bulge'];
        for (const b of branches) {
            const startNetId = (b as any)._startNetworkId || (b as any).startNetworkId || '';
            const endNetId = (b as any)._endNetworkId || (b as any).endNetworkId || '';
            const label = (b as any)._label || (b as any).label || '';
            const bulge = (b as any)._bulge || (b as any).bulge || 0;
            const startLabel = netIdToLabel.get(startNetId) || startNetId;
            const endLabel = netIdToLabel.get(endNetId) || endNetId;
            branchLines.push(`${startLabel},${endLabel},${label},${bulge}`);
        }

        if (this.mode === 'single') {
            // Single table: branch relation only
            const singleLines = ['startNode,endNode,label'];
            for (const b of branches) {
                const startNetId = (b as any)._startNetworkId || (b as any).startNetworkId || '';
                const endNetId = (b as any)._endNetworkId || (b as any).endNetworkId || '';
                const label = (b as any)._label || (b as any).label || '';
                const startLabel = netIdToLabel.get(startNetId) || startNetId;
                const endLabel = netIdToLabel.get(endNetId) || endNetId;
                singleLines.push(`${startLabel},${endLabel},${label}`);
            }
            this.singleCsv = singleLines.join('\n');
        } else {
            this.nodesCsv = nodeLines.join('\n');
            this.branchesCsv = branchLines.join('\n');
        }
        this.errorMessage = '';
    }

    private parseCsv(text: string): Record<string, string>[] {
        const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length < 2) return [];
        const headers = lines[0].split(',').map(h => h.trim());
        const rows: Record<string, string>[] = [];
        for (let i = 1; i < lines.length; i++) {
            const vals = lines[i].split(',').map(v => v.trim());
            const row: Record<string, string> = {};
            for (let j = 0; j < headers.length; j++) {
                row[headers[j]] = vals[j] || '';
            }
            rows.push(row);
        }
        return rows;
    }

    private buildNetworkData(): NetworkData | null {
        try {
            this.errorMessage = '';

            if (this.mode === 'two') {
                return this.buildFromTwoTables();
            } else {
                return this.buildFromSingleTable();
            }
        } catch (e: any) {
            this.errorMessage = e.message || String(e);
            return null;
        }
    }

    private buildFromTwoTables(): NetworkData {
        const nodeRows = this.parseCsv(this.nodesCsv);
        const branchRows = this.parseCsv(this.branchesCsv);
        if (nodeRows.length === 0) throw new Error(t('network.dialog.nodeDataEmpty'));
        if (branchRows.length === 0) throw new Error(t('network.dialog.branchDataEmpty'));

        const hasCoords = nodeRows[0].x !== undefined && nodeRows[0].y !== undefined &&
            nodeRows[0].x !== '' && nodeRows[0].y !== '';

        const nodes = nodeRows.map(r => ({
            id: r.id,
            label: r.label || r.id,
            x: hasCoords ? parseFloat(r.x) : undefined as any,
            y: hasCoords ? parseFloat(r.y) : undefined as any,
            radius: this.nodeRadius
        }));

        if (!hasCoords) {
            const edges = branchRows.map(r => ({ source: r.startNodeId, target: r.endNodeId }));
            const positions = computeLayout(nodes.map(n => n.id), edges, {
                algorithm: this.algorithm,
                nodeSpacing: this.nodeSpacing
            });
            for (const node of nodes) {
                const pos = positions.get(node.id);
                if (pos) { node.x = pos.x; node.y = pos.y; }
                else { node.x = 0; node.y = 0; }
            }
        }

        const branches = branchRows.map(r => ({
            startNodeId: r.startNodeId,
            endNodeId: r.endNodeId,
            label: r.label || '',
            bulge: r.bulge ? parseFloat(r.bulge) : 0
        }));

        return { nodes, branches };
    }

    private buildFromSingleTable(): NetworkData {
        const rows = this.parseCsv(this.singleCsv);
        if (rows.length === 0) throw new Error(t('network.dialog.branchDataEmpty'));

        const nodeIdSet = new Set<string>();
        for (const r of rows) {
            nodeIdSet.add(r.startNode);
            nodeIdSet.add(r.endNode);
        }

        const nodeIds = [...nodeIdSet].sort((a, b) => {
            const na = parseInt(a), nb = parseInt(b);
            if (!isNaN(na) && !isNaN(nb)) return na - nb;
            return a.localeCompare(b);
        });

        const edges = rows.map(r => ({ source: r.startNode, target: r.endNode }));
        const positions = computeLayout(nodeIds, edges, {
            algorithm: this.algorithm,
            nodeSpacing: this.nodeSpacing
        });

        const nodes = nodeIds.map(id => {
            const pos = positions.get(id) || { x: 0, y: 0 };
            return { id, label: id, x: pos.x, y: pos.y, radius: this.nodeRadius };
        });

        const branches = rows.map(r => ({
            startNodeId: r.startNode,
            endNodeId: r.endNode,
            label: r.label || ''
        }));

        return { nodes, branches };
    }

    private ok_callback(): void {
        const data = this.buildNetworkData();
        if (data) {
            this.result = data;
            this.baseDialog?.close();
        }
    }

    private cancel_callback(): void {
        this.result = undefined;
        this.baseDialog?.close();
    }

    async startDialog(): Promise<NetworkData | undefined> {
        Engine.dialog!.appendChild(this);
        await this.updateComplete;

        await this.baseDialog?._startBaseDialog({
            title: t('network.dialog.title'),
            renderTarget: this.renderRoot
        });

        this.remove();
        return this.result;
    }

    render(): TemplateResult {
        return html`
            <style>
                generate-network-dialog { display: block; --dialog-header-bg: #1e2530; --dialog-header-color: #e8eaed; --dialog-header-border: #3d4a5c; --dialog-contents-color: transparent; }
                generate-network-dialog base-dialog { --dialog-header-bg: #1e2530; --dialog-header-color: #e8eaed; --dialog-header-border: #3d4a5c; --dialog-contents-color: transparent; }
                generate-network-dialog #container { display: flex; flex-direction: column; background: #1a1f2e; width: 700px; height: 620px; }
                generate-network-dialog #main-content { display: flex; flex: 1; min-height: 0; overflow: hidden; }
                generate-network-dialog #left-panel { flex: 1; display: flex; flex-direction: column; padding: 12px; gap: 8px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #3d4a5c #1a1f2e; }
                generate-network-dialog #left-panel::-webkit-scrollbar { width: 6px; }
                generate-network-dialog #left-panel::-webkit-scrollbar-track { background: #1a1f2e; }
                generate-network-dialog #left-panel::-webkit-scrollbar-thumb { background: #3d4a5c; border-radius: 3px; }
                generate-network-dialog #left-panel::-webkit-scrollbar-thumb:hover { background: #4d5a6c; }
                generate-network-dialog textarea::-webkit-scrollbar { width: 6px; }
                generate-network-dialog textarea::-webkit-scrollbar-track { background: #0d1117; }
                generate-network-dialog textarea::-webkit-scrollbar-thumb { background: #3d4a5c; border-radius: 3px; }
                generate-network-dialog textarea::-webkit-scrollbar-thumb:hover { background: #4d5a6c; }
                generate-network-dialog #right-panel { width: 180px; padding: 12px; border-left: 1px solid #3d4a5c; display: flex; flex-direction: column; gap: 10px; }
                generate-network-dialog .section-title { color: #9ca3af; font-size: 12px; margin-bottom: 4px; }
                generate-network-dialog .mode-tabs { display: flex; gap: 0; margin-bottom: 4px; }
                generate-network-dialog .mode-tab { flex: 1; padding: 6px 12px; text-align: center; cursor: pointer; background: #2d3446; color: #9ca3af; border: 1px solid #3d4a5c; font-size: 12px; }
                generate-network-dialog .mode-tab:first-child { border-radius: 4px 0 0 4px; }
                generate-network-dialog .mode-tab:last-child { border-radius: 0 4px 4px 0; }
                generate-network-dialog .mode-tab.active { background: #1a56db; color: #fff; border-color: #1a56db; }
                generate-network-dialog textarea { width: 100%; font-family: monospace; font-size: 12px; background: #0d1117; color: #e8eaed; border: 1px solid #3d4a5c; border-radius: 4px; padding: 6px; resize: none; }
                generate-network-dialog .csv-area { flex: 1; min-height: 120px; }
                generate-network-dialog .csv-area-single { flex: 1; min-height: 300px; }
                generate-network-dialog label.radio-label { display: flex; align-items: center; gap: 6px; color: #e8eaed; font-size: 12px; cursor: pointer; padding: 2px 0; }
                generate-network-dialog label.radio-label input[type="radio"] { accent-color: #1a56db; }
                generate-network-dialog .input-row { display: flex; align-items: center; gap: 6px; }
                generate-network-dialog .input-row label { color: #9ca3af; font-size: 12px; white-space: nowrap; }
                generate-network-dialog .input-row input[type="number"] { width: 60px; background: #0d1117; color: #e8eaed; border: 1px solid #3d4a5c; border-radius: 3px; padding: 3px 5px; font-size: 12px; }
                generate-network-dialog .error-message { color: #f87171; padding: 4px 12px; font-size: 12px; }
                generate-network-dialog #button-bar { display: flex; justify-content: space-between; padding: 8px 12px; border-top: 1px solid #3d4a5c; }
                generate-network-dialog #button-bar button { padding: 5px 14px; border: 1px solid #3d4a5c; border-radius: 4px; background: #2d3446; color: #e8eaed; cursor: pointer; font-size: 12px; }
                generate-network-dialog #button-bar button:hover { background: #3d4a5c; }
                generate-network-dialog #button-bar button.btn-primary { background: #1a56db; border-color: #1a56db; }
                generate-network-dialog #button-bar button.btn-primary:hover { background: #1e40af; }
            </style>
            <base-dialog>
                <div id="container">
                    <div id="main-content">
                        <div id="left-panel">
                            <div class="mode-tabs">
                                <div class="mode-tab ${this.mode === 'two' ? 'active' : ''}"
                                    @click=${() => { this.mode = 'two'; this.errorMessage = ''; }}>${t('network.dialog.twoTableMode')}</div>
                                <div class="mode-tab ${this.mode === 'single' ? 'active' : ''}"
                                    @click=${() => { this.mode = 'single'; this.errorMessage = ''; }}>${t('network.dialog.singleTableMode')}</div>
                            </div>

                            ${this.mode === 'two' ? this.renderTwoTableMode() : this.renderSingleTableMode()}
                        </div>

                        <div id="right-panel">
                            <div class="section-title">${t('network.dialog.layoutAlgorithm')}</div>
                            <label class="radio-label">
                                <input type="radio" name="algo" value="force"
                                    .checked=${this.algorithm === 'force'}
                                    @change=${() => this.algorithm = 'force'} />
                                ${t('network.dialog.forceDirected')}
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="algo" value="circular"
                                    .checked=${this.algorithm === 'circular'}
                                    @change=${() => this.algorithm = 'circular'} />
                                ${t('network.dialog.circular')}
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="algo" value="hierarchical"
                                    .checked=${this.algorithm === 'hierarchical'}
                                    @change=${() => this.algorithm = 'hierarchical'} />
                                ${t('network.dialog.hierarchical')}
                            </label>

                            <div style="margin-top: 8px;">
                                <div class="section-title">${t('network.dialog.parameters')}</div>
                                <div class="input-row">
                                    <label>${t('network.dialog.nodeRadius')}</label>
                                    <input type="number" .value=${String(this.nodeRadius)} min="1"
                                        @change=${(e: Event) => this.nodeRadius = parseInt((e.target as HTMLInputElement).value) || 15} />
                                </div>
                                <div class="input-row" style="margin-top: 6px;">
                                    <label>${t('network.dialog.nodeSpacing')}</label>
                                    <input type="number" .value=${String(this.nodeSpacing)} min="10"
                                        @change=${(e: Event) => this.nodeSpacing = parseInt((e.target as HTMLInputElement).value) || 150} />
                                </div>
                            </div>
                        </div>
                    </div>

                    ${this.errorMessage ? html`<div class="error-message">${this.errorMessage}</div>` : ''}

                    <div id="button-bar">
                        <div style="display:flex; gap:8px;">
                            <button @click=${() => this.loadExample()}>${t('network.dialog.loadExample')}</button>
                            <button @click=${() => this.loadFromCurrentGraph()}>${t('network.dialog.loadFromGraph')}</button>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <button @click=${() => this.cancel_callback()}>${t('network.dialog.cancel')}</button>
                            <button class="btn-primary" @click=${() => this.ok_callback()}>${t('network.dialog.generate')}</button>
                        </div>
                    </div>
                </div>
            </base-dialog>
        `;
    }

    private renderTwoTableMode(): TemplateResult {
        return html`
            <div class="section-title">${t('network.dialog.nodeData')}</div>
            <textarea class="csv-area" .value=${this.nodesCsv}
                @input=${(e: Event) => this.nodesCsv = (e.target as HTMLTextAreaElement).value}
                placeholder="id,label,x,y&#10;1,1,0,0&#10;2,2,200,120"></textarea>

            <div class="section-title">${t('network.dialog.branchData')}</div>
            <textarea class="csv-area" .value=${this.branchesCsv}
                @input=${(e: Event) => this.branchesCsv = (e.target as HTMLTextAreaElement).value}
                placeholder="startNodeId,endNodeId,label,bulge&#10;1,2,1,0&#10;2,3,2,0"></textarea>
        `;
    }

    private renderSingleTableMode(): TemplateResult {
        return html`
            <div class="section-title">${t('network.dialog.branchRelation')}</div>
            <textarea class="csv-area-single" .value=${this.singleCsv}
                @input=${(e: Event) => this.singleCsv = (e.target as HTMLTextAreaElement).value}
                placeholder="startNode,endNode,label&#10;1,2,1&#10;2,3,2&#10;3,1,3"></textarea>
            <div style="color:#6b7280; font-size:11px;">${t('network.dialog.autoExtractHint')}</div>
        `;
    }
}

customElements.define('generate-network-dialog', GenerateNetworkDialog);
