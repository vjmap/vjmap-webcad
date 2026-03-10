import { LitElement, html, css, Engine, PointInputOptions, CornerInputOptions, InputStatusEnum, Point2D, t } from 'vjcad';
import type { View3dSettings } from '../types';
import { DEFAULT_SETTINGS, SUPPORTED_ENTITY_TYPES } from '../types';
import { SceneManager } from '../core/SceneManager';

const STORAGE_KEY = 'view3d-settings';

export class View3dPanelElement extends LitElement {
    static properties = {
        _visible: { type: Boolean, state: true },
        _isFullscreen: { type: Boolean, state: true },
        _settingsCollapsed: { type: Boolean, state: true },
        _coordText: { type: String, state: true },
        _entityCount: { type: Number, state: true },
        _layers: { type: Array, state: true },
        _settings: { type: Object, state: true },
        _loading: { type: Boolean, state: true },
    };

    declare _visible: boolean;
    declare _isFullscreen: boolean;
    declare _settingsCollapsed: boolean;
    declare _coordText: string;
    declare _entityCount: number;
    declare _layers: string[];
    declare _settings: View3dSettings;
    declare _loading: boolean;

    private sceneManager: SceneManager | null = null;
    private isDragging = false;
    private dragStartX = 0;
    private dragStartY = 0;
    private panelStartLeft = 0;
    private panelStartTop = 0;
    private isResizing = false;
    private resizeEdge = '';
    private resizeStartX = 0;
    private resizeStartY = 0;
    private resizeStartW = 0;
    private resizeStartH = 0;
    private resizeStartLeft = 0;
    private resizeStartTop = 0;
    private boundMouseMove = this.handleMouseMove.bind(this);
    private boundMouseUp = this.handleMouseUp.bind(this);

    constructor() {
        super();
        this._visible = false;
        this._isFullscreen = false;
        this._settingsCollapsed = true;
        this._coordText = 'X: --  Y: --  Z: --';
        this._entityCount = 0;
        this._layers = [];
        this._settings = { ...DEFAULT_SETTINGS };
        this._loading = false;
    }

    static styles = css`
        :host {
            position: fixed;
            top: 0; right: 0;
            background: #1e2530;
            border: 1px solid #3d4a5c;
            border-radius: 4px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 13px;
            color: #e8eaed;
            z-index: 100001;
            display: none;
            flex-direction: column;
            user-select: none;
            overflow: hidden;
            min-width: 320px;
            min-height: 300px;
        }
        :host([data-visible]) { display: flex; }
        :host([data-fullscreen]) {
            top: 0 !important; left: 0 !important; right: 0 !important;
            width: 100vw !important; height: 100vh !important;
            border-radius: 0;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #161b22; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #484f58; }

        .header {
            display: flex; align-items: center;
            padding: 5px 10px;
            background: #161b22;
            border-bottom: 1px solid #3d4a5c;
            cursor: move; flex-shrink: 0;
        }
        .title { flex: 1; font-size: 13px; font-weight: 600; color: #f0f6fc; }
        .hbtn {
            width: 24px; height: 24px; border: none; background: transparent;
            color: #8b949e; cursor: pointer; border-radius: 3px;
            display: flex; align-items: center; justify-content: center;
            font-size: 14px; margin-left: 2px;
        }
        .hbtn:hover { background: #30363d; color: #f0f6fc; }

        /* Toolbar row */
        .toolbar {
            display: flex; align-items: center;
            padding: 4px 8px; gap: 6px;
            background: #1a2030;
            border-bottom: 1px solid #2d333b;
            flex-shrink: 0; flex-wrap: wrap;
        }
        .tb-btn {
            padding: 3px 10px; border: 1px solid #30363d; border-radius: 3px;
            background: #21262d; color: #c9d1d9; font-size: 12px;
            cursor: pointer; white-space: nowrap;
        }
        .tb-btn:hover { background: #30363d; border-color: #484f58; }
        .tb-btn.primary { background: #1f6feb; border-color: #1f6feb; color: #fff; }
        .tb-btn.primary:hover { background: #388bfd; }
        .tb-sep { width: 1px; height: 18px; background: #30363d; }
        .tb-check {
            display: flex; align-items: center; gap: 4px; font-size: 12px; color: #c9d1d9;
            cursor: pointer;
        }
        .tb-check input { width: 14px; height: 14px; accent-color: #58a6ff; }
        .tb-label { font-size: 12px; color: #8b949e; }
        .tb-input {
            width: 52px; padding: 2px 5px;
            background: #0d1117; border: 1px solid #30363d; border-radius: 3px;
            color: #e8eaed; font-size: 12px; height: 24px; outline: none;
        }
        .tb-input:focus { border-color: #58a6ff; }
        .tb-select {
            padding: 2px 5px;
            background: #0d1117; border: 1px solid #30363d; border-radius: 3px;
            color: #e8eaed; font-size: 12px; height: 24px; outline: none;
            max-width: 100px;
        }
        .tb-select:focus { border-color: #58a6ff; }

        /* Settings drawer */
        .settings-drawer {
            overflow: hidden; flex-shrink: 0;
            transition: max-height 0.2s ease;
            border-bottom: 1px solid #2d333b;
        }
        .settings-drawer.collapsed { max-height: 0; border-bottom: none; }
        .settings-drawer:not(.collapsed) { max-height: 300px; }
        .settings-inner {
            padding: 8px 10px;
            display: grid; grid-template-columns: 1fr 1fr;
            gap: 6px 12px; font-size: 12px;
            overflow-y: auto; max-height: 288px;
        }
        .s-field { display: flex; flex-direction: column; gap: 3px; }
        .s-field.full { grid-column: 1 / -1; }
        .s-label { color: #8b949e; font-size: 11px; }
        .s-select {
            width: 100%; padding: 3px 5px;
            background: #0d1117; border: 1px solid #30363d; border-radius: 3px;
            color: #e8eaed; font-size: 12px; outline: none;
        }
        .s-select[multiple] { height: 56px; }
        .s-select:focus { border-color: #58a6ff; }
        .range-row {
            display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 4px;
        }
        .range-row input {
            padding: 2px 4px; background: #0d1117; border: 1px solid #30363d;
            border-radius: 3px; color: #e8eaed; font-size: 11px; height: 22px; outline: none;
        }

        /* 3D Viewer */
        .viewer-container {
            flex: 1; position: relative; background: #0d1117;
            overflow: hidden; min-height: 200px;
        }
        .viewer-3d { width: 100%; height: 100%; }
        .loading-overlay {
            position: absolute; inset: 0;
            background: rgba(13,17,23,0.8);
            display: flex; align-items: center; justify-content: center;
            color: #8b949e; font-size: 13px; z-index: 10;
        }

        /* Coord bar */
        .coord-bar {
            padding: 4px 10px; background: #161b22;
            border-top: 1px solid #3d4a5c;
            font-size: 12px; color: #8b949e; flex-shrink: 0;
            display: flex; align-items: center; justify-content: space-between;
        }
        .coord-text { font-family: 'Consolas','Monaco',monospace; font-size: 12px; }
        .link-btns { display: flex; gap: 4px; }
        .link-btn {
            padding: 2px 8px; border: 1px solid #30363d; border-radius: 3px;
            background: #21262d; color: #8b949e; font-size: 11px; cursor: pointer;
        }
        .link-btn:hover { background: #30363d; color: #c9d1d9; }

        /* Resize handles */
        .rh { position: absolute; z-index: 5; }
        .rh-n { top: -3px; left: 8px; right: 8px; height: 6px; cursor: n-resize; }
        .rh-s { bottom: -3px; left: 8px; right: 8px; height: 6px; cursor: s-resize; }
        .rh-w { left: -3px; top: 8px; bottom: 8px; width: 6px; cursor: w-resize; }
        .rh-e { right: -3px; top: 8px; bottom: 8px; width: 6px; cursor: e-resize; }
        .rh-nw { top: -3px; left: -3px; width: 10px; height: 10px; cursor: nw-resize; }
        .rh-ne { top: -3px; right: -3px; width: 10px; height: 10px; cursor: ne-resize; }
        .rh-sw { bottom: -3px; left: -3px; width: 10px; height: 10px; cursor: sw-resize; }
        .rh-se { bottom: -3px; right: -3px; width: 10px; height: 10px; cursor: se-resize; }
    `;

    connectedCallback(): void {
        super.connectedCallback();
        document.addEventListener('mousemove', this.boundMouseMove);
        document.addEventListener('mouseup', this.boundMouseUp);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('mouseup', this.boundMouseUp);
        this.sceneManager?.destroy();
        this.sceneManager = null;
    }

    show(): void {
        this._visible = true;
        this.setAttribute('data-visible', '');
        this.applyDefaultSize();
        this.loadSettings();
        this.refreshLayers();
        requestAnimationFrame(() => {
            requestAnimationFrame(() => this.initScene());
        });
    }

    hide(): void {
        this._visible = false;
        this.removeAttribute('data-visible');
    }

    destroy(): void {
        this.sceneManager?.destroy();
        this.sceneManager = null;
        this.remove();
    }

    private applyDefaultSize(): void {
        if (this._isFullscreen) return;
        const w = Math.max(500, Math.floor(window.innerWidth * 0.4));
        this.style.width = `${w}px`;
        this.style.height = `${window.innerHeight}px`;
        this.style.top = '0px';
        this.style.right = '0px';
        this.style.left = 'auto';
    }

    private loadSettings(): void {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                this._settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            }
        } catch { /* use defaults */ }
    }

    private saveSettings(): void {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this._settings)); } catch { /* */ }
    }

    private refreshLayers(): void {
        try {
            const layers = Engine.currentDoc?.layers?.items;
            if (layers) this._layers = layers.map((l: any) => l.name);
        } catch { this._layers = []; }
    }

    private async initScene(): Promise<void> {
        const container = this.renderRoot.querySelector('.viewer-3d') as HTMLDivElement;
        if (!container) return;
        if (!this.sceneManager) {
            this.sceneManager = new SceneManager(container, (c) => { this._coordText = c; });
            await this.sceneManager.init();
        }
        await this.refresh(false);
    }

    async refresh(keepCamera = true): Promise<void> {
        if (!this.sceneManager) return;
        this._loading = true;
        try {
            this._entityCount = await this.sceneManager.render(this._settings, keepCamera);
        } finally { this._loading = false; }
    }

    private toggleFullscreen(): void {
        this._isFullscreen = !this._isFullscreen;
        if (this._isFullscreen) this.setAttribute('data-fullscreen', '');
        else { this.removeAttribute('data-fullscreen'); this.applyDefaultSize(); }
        requestAnimationFrame(() => this.sceneManager?.resize());
    }

    private updateSetting<K extends keyof View3dSettings>(key: K, value: View3dSettings[K]): void {
        this._settings = { ...this._settings, [key]: value };
        this.saveSettings();
    }

    private resetSettings(): void {
        this._settings = { ...DEFAULT_SETTINGS };
        this.saveSettings();
        this.refresh(false);
    }

    // --- Drag ---
    private handleHeaderMouseDown(e: MouseEvent): void {
        if ((e.target as HTMLElement).closest('.hbtn') || this._isFullscreen) return;
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        const r = this.getBoundingClientRect();
        this.panelStartLeft = r.left;
        this.panelStartTop = r.top;
    }

    // --- Resize ---
    private handleResizeMouseDown(e: MouseEvent, edge: string): void {
        if (this._isFullscreen) return;
        e.preventDefault(); e.stopPropagation();
        this.isResizing = true;
        this.resizeEdge = edge;
        this.resizeStartX = e.clientX;
        this.resizeStartY = e.clientY;
        const r = this.getBoundingClientRect();
        this.resizeStartW = r.width; this.resizeStartH = r.height;
        this.resizeStartLeft = r.left; this.resizeStartTop = r.top;
    }

    private handleMouseMove(e: MouseEvent): void {
        if (this.isDragging) {
            this.style.left = `${this.panelStartLeft + e.clientX - this.dragStartX}px`;
            this.style.top = `${this.panelStartTop + e.clientY - this.dragStartY}px`;
            this.style.right = 'auto';
            return;
        }
        if (this.isResizing) {
            const dx = e.clientX - this.resizeStartX;
            const dy = e.clientY - this.resizeStartY;
            const edge = this.resizeEdge;
            let nw = this.resizeStartW, nh = this.resizeStartH;
            let nl = this.resizeStartLeft, nt = this.resizeStartTop;
            if (edge.includes('e')) nw = Math.max(320, this.resizeStartW + dx);
            if (edge.includes('w')) { nw = Math.max(320, this.resizeStartW - dx); nl = this.resizeStartLeft + (this.resizeStartW - nw); }
            if (edge.includes('s')) nh = Math.max(300, this.resizeStartH + dy);
            if (edge.includes('n')) { nh = Math.max(300, this.resizeStartH - dy); nt = this.resizeStartTop + (this.resizeStartH - nh); }
            this.style.width = `${nw}px`; this.style.height = `${nh}px`;
            this.style.left = `${nl}px`; this.style.top = `${nt}px`;
            this.style.right = 'auto';
            this.sceneManager?.resize();
        }
    }

    private handleMouseUp(): void { this.isDragging = false; this.isResizing = false; }

    private getMultiSelectValues(e: Event): string[] {
        return Array.from((e.target as HTMLSelectElement).selectedOptions).map(o => o.value);
    }

    render() {
        const s = this._settings;
        return html`
            <div class="rh rh-n" @mousedown=${(e: MouseEvent) => this.handleResizeMouseDown(e, 'n')}></div>
            <div class="rh rh-s" @mousedown=${(e: MouseEvent) => this.handleResizeMouseDown(e, 's')}></div>
            <div class="rh rh-w" @mousedown=${(e: MouseEvent) => this.handleResizeMouseDown(e, 'w')}></div>
            <div class="rh rh-e" @mousedown=${(e: MouseEvent) => this.handleResizeMouseDown(e, 'e')}></div>
            <div class="rh rh-nw" @mousedown=${(e: MouseEvent) => this.handleResizeMouseDown(e, 'nw')}></div>
            <div class="rh rh-ne" @mousedown=${(e: MouseEvent) => this.handleResizeMouseDown(e, 'ne')}></div>
            <div class="rh rh-sw" @mousedown=${(e: MouseEvent) => this.handleResizeMouseDown(e, 'sw')}></div>
            <div class="rh rh-se" @mousedown=${(e: MouseEvent) => this.handleResizeMouseDown(e, 'se')}></div>

            <div class="header" @mousedown=${this.handleHeaderMouseDown}>
                <span class="title">${t('view3d.panel.title')}</span>
                <button class="hbtn" title="${t('view3d.panel.fullscreen')}" @click=${this.toggleFullscreen}>${this._isFullscreen ? '⧉' : '⛶'}</button>
                <button class="hbtn" title="${t('view3d.panel.close')}" @click=${() => this.hide()}>✕</button>
            </div>

            <!-- Compact toolbar -->
            <div class="toolbar">
                <button class="tb-btn primary" @click=${() => this.refresh(true)}>${t('view3d.panel.refresh')}</button>
                <button class="tb-btn" @click=${() => { this._settingsCollapsed = !this._settingsCollapsed; }}>
                    ${this._settingsCollapsed ? t('view3d.panel.settingsCollapsed') : t('view3d.panel.settingsExpanded')}
                </button>
                <div class="tb-sep"></div>
                <label class="tb-check">
                    <input type="checkbox" .checked=${s.onlyWithElevation}
                        @change=${(e: Event) => this.updateSetting('onlyWithElevation', (e.target as HTMLInputElement).checked)}>
                    ${t('view3d.panel.onlyWithElevation')}
                </label>
                <div class="tb-sep"></div>
                <label class="tb-check">
                    <input type="checkbox" .checked=${s.useTubeRendering}
                        @change=${(e: Event) => { this.updateSetting('useTubeRendering', (e.target as HTMLInputElement).checked); this.refresh(true); }}>
                    ${t('view3d.panel.useTubeRendering')}
                </label>
                <div class="tb-sep"></div>
                <span class="tb-label">${t('view3d.panel.scaleZ')}</span>
                <input class="tb-input" type="number" min="0.01" step="0.1"
                    .value=${String(s.scaleZ)}
                    @change=${(e: Event) => this.updateSetting('scaleZ', +(e.target as HTMLInputElement).value || 1)}>
                ${s.useTubeRendering ? html`
                    <div class="tb-sep"></div>
                    <span class="tb-label">${t('view3d.panel.tubeColor')}</span>
                    <input class="tb-input" type="color" style="width:28px;padding:1px 2px;height:24px"
                        .value=${s.tubeColor}
                        @change=${(e: Event) => this.updateSetting('tubeColor', (e.target as HTMLInputElement).value)}>
                ` : ''}
                <div class="tb-sep"></div>
                <button class="tb-btn" @click=${this.resetSettings}>${t('view3d.panel.resetDefaults')}</button>
            </div>

            <!-- Expandable settings drawer -->
            <div class="settings-drawer ${this._settingsCollapsed ? 'collapsed' : ''}">
                <div class="settings-inner">
                    <div class="s-field">
                        <span class="s-label">${t('view3d.settings.layerFilter')}</span>
                        <select class="s-select" multiple
                            @change=${(e: Event) => this.updateSetting('selectedLayers', this.getMultiSelectValues(e))}>
                            ${this._layers.map(l => html`<option value=${l} ?selected=${s.selectedLayers.includes(l)}>${l}</option>`)}
                        </select>
                    </div>
                    <div class="s-field">
                        <span class="s-label">${t('view3d.settings.entityType')}</span>
                        <select class="s-select" multiple
                            @change=${(e: Event) => this.updateSetting('selectedEntityTypes', this.getMultiSelectValues(e))}>
                            ${SUPPORTED_ENTITY_TYPES.map(t => html`<option value=${t} ?selected=${s.selectedEntityTypes.includes(t)}>${t}</option>`)}
                        </select>
                    </div>
                    <div class="s-field">
                        <span class="s-label">${t('view3d.settings.displayRange')}</span>
                        <select class="s-select"
                            .value=${s.displayRange}
                            @change=${(e: Event) => this.updateSetting('displayRange', (e.target as HTMLSelectElement).value as any)}>
                            <option value="all">${t('view3d.settings.displayRange.all')}</option>
                            <option value="currentView">${t('view3d.settings.displayRange.currentView')}</option>
                            <option value="custom">${t('view3d.settings.displayRange.custom')}</option>
                        </select>
                    </div>
                    ${s.useTubeRendering ? html`
                        <div class="s-field">
                            <span class="s-label">${t('view3d.settings.tubeRadius')}</span>
                            <input class="tb-input" style="width:100%" type="number" min="0.001" step="0.005"
                                .value=${String(s.tubeRadius)}
                                @change=${(e: Event) => this.updateSetting('tubeRadius', +(e.target as HTMLInputElement).value || 0.02)}>
                        </div>
                    ` : ''}
                    ${s.displayRange === 'custom' ? html`
                        <div class="s-field full">
                            <span class="s-label">${t('view3d.settings.customRange')}</span>
                            <div class="range-row">
                                <input type="number" placeholder="Xmin" .value=${String(s.customRange?.xmin ?? '')}
                                    @change=${(e: Event) => this.updateCustomRange('xmin', +(e.target as HTMLInputElement).value)}>
                                <input type="number" placeholder="Ymin" .value=${String(s.customRange?.ymin ?? '')}
                                    @change=${(e: Event) => this.updateCustomRange('ymin', +(e.target as HTMLInputElement).value)}>
                                <input type="number" placeholder="Xmax" .value=${String(s.customRange?.xmax ?? '')}
                                    @change=${(e: Event) => this.updateCustomRange('xmax', +(e.target as HTMLInputElement).value)}>
                                <input type="number" placeholder="Ymax" .value=${String(s.customRange?.ymax ?? '')}
                                    @change=${(e: Event) => this.updateCustomRange('ymax', +(e.target as HTMLInputElement).value)}>
                            </div>
                            <button class="tb-btn" style="margin-top:4px" @click=${() => this.pickRangeFromMap()}>${t('view3d.settings.selectRangeFromMap')}</button>
                        </div>
                    ` : ''}
                </div>
            </div>

            <div class="viewer-container">
                <div class="viewer-3d"></div>
                ${this._loading ? html`<div class="loading-overlay">${t('view3d.panel.loading')}</div>` : ''}
            </div>

            <div class="coord-bar">
                <span class="coord-text">${this._coordText}</span>
                <span style="color:#6e7681; margin: 0 6px;">${t('view3d.panel.entityCount')} ${this._entityCount}</span>
                <div class="link-btns">
                    <button class="link-btn" @click=${() => this.sceneManager?.locate2dTo3d()} title="${t('view3d.coord.locate2dTo3dTitle')}">${t('view3d.coord.locate2dTo3d')}</button>
                    <button class="link-btn" @click=${() => this.sceneManager?.locate3dTo2d()} title="${t('view3d.coord.locate3dTo2dTitle')}">${t('view3d.coord.locate3dTo2d')}</button>
                </div>
            </div>
        `;
    }

    private updateCustomRange(key: string, value: number): void {
        const range = this._settings.customRange ?? { xmin: 0, ymin: 0, xmax: 100, ymax: 100 };
        (range as any)[key] = value;
        this.updateSetting('customRange', { ...range });
    }

    private async pickRangeFromMap(): Promise<void> {
        try {
            const ptOpts = new PointInputOptions();
            ptOpts.message = t('view3d.msg.specifyFirstCorner');
            const ptResult = await Engine.getPoint(ptOpts);
            if (ptResult.status !== InputStatusEnum.OK) return;
            const p1 = ptResult.value;

            const cornerOpts = new CornerInputOptions();
            cornerOpts.basePoint = new Point2D(p1.x, p1.y);
            cornerOpts.message = t('view3d.msg.specifyOppositeCorner');
            const cornerResult = await Engine.getCorner(cornerOpts);
            if (cornerResult.status !== InputStatusEnum.OK) return;
            const p2 = cornerResult.value;

            const range = {
                xmin: Math.min(p1.x, p2.x),
                ymin: Math.min(p1.y, p2.y),
                xmax: Math.max(p1.x, p2.x),
                ymax: Math.max(p1.y, p2.y)
            };
            this.updateSetting('customRange', range);
        } catch { /* user cancelled */ }
    }
}

if (!customElements.get('vjcad-view3d-panel')) {
    customElements.define('vjcad-view3d-panel', View3dPanelElement);
}

export function createView3dPanel(): View3dPanelElement {
    const panel = document.createElement('vjcad-view3d-panel') as View3dPanelElement;
    document.body.appendChild(panel);
    return panel;
}
