import { LitElement, html, css, type TemplateResult, t } from 'vjcad';
import { Engine, type EntityBase } from 'vjcad';
import { ANNO_LAYER_NAME } from '../constants';

interface AnnoItem {
    entityId: number;
    type: string;
    index: number;
}

/**
 * Sidebar panel that lists all annotation entities.
 * Double-click an item to zoom to that specific entity.
 */
export class AnnoListPanel extends LitElement {
    declare panelId: number;
    declare name: string;
    declare mark: string;
    declare caption: string;
    declare label: string;
    declare src: string;
    declare isActive: boolean;
    declare _items: AnnoItem[];

    static properties = {
        _items: { type: Array, state: true },
    };

    static styles = css`
        :host {
            display: block;
            height: 100%;
            overflow: hidden;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .panel-wrap {
            padding: 10px;
            height: 100%;
            overflow-y: auto;
            color: var(--theme-color-font, #e8eaed);
            font-size: 13px;
        }
        .header {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 10px;
        }
        .title { font-weight: 600; font-size: 13px; }
        .count { color: #9ca3af; font-size: 12px; }
        .btn {
            padding: 4px 10px; border: 1px solid #3d4a5c; border-radius: 4px;
            background: #2d3748; color: #e8eaed; cursor: pointer; font-size: 12px;
        }
        .btn:hover { background: rgba(69,137,238,0.15); }
        .list { list-style: none; }
        .item {
            padding: 6px 10px; border-radius: 4px; cursor: pointer;
            display: flex; justify-content: space-between; align-items: center;
            transition: background 0.15s;
        }
        .item:hover { background: rgba(69,137,238,0.15); }
        .item-type { color: #73C5FF; font-weight: 500; }
        .item-id { color: #9ca3af; font-size: 11px; }
        .empty { color: #6b7280; text-align: center; padding: 20px 0; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 4px; }
    `;

    constructor() {
        super();
        this.panelId = 0;
        this.name = 'annotation-list';
        this.mark = '';
        this.caption = '';
        this.label = '';
        this.src = '';
        this.isActive = false;
        this._items = [];
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.caption = t('anno.list.title');
        this.label = t('anno.list.title');
        this.refresh();
    }

    refresh(): void {
        const entities = Engine.getEntities(
            (e: EntityBase) => e.layer === ANNO_LAYER_NAME && e._isAlive
        );
        this._items = entities.map((e, i) => ({
            entityId: e.id,
            type: e.type,
            index: i + 1,
        }));
    }

    private onItemDblClick(entityId: number): void {
        const entities = Engine.getEntities((e: EntityBase) => e.id === entityId);
        if (entities.length === 0) return;
        Engine.zoomToEntities(entities[0], {
            padding: { top: 80, bottom: 80, left: 80, right: 80 },
        });
    }

    private typeLabel(type: string): string {
        const map: Record<string, string> = {
            PLINE: t('anno.entity.polyline'), TEXT: t('anno.entity.text'), MTEXT: t('anno.entity.mtext'),
            HATCH: t('anno.entity.hatch'), MLEADER: t('anno.entity.mleader'),
        };
        return map[type] ?? type;
    }

    render(): TemplateResult {
        return html`
            <div class="panel-wrap">
                <div class="header">
                    <span class="title">${t('anno.list.title')} <span class="count">${t('anno.list.count', { count: this._items.length })}</span></span>
                    <button class="btn" @click=${() => this.refresh()}>${t('anno.list.refresh')}</button>
                </div>
                ${this._items.length === 0
                    ? html`<div class="empty">${t('anno.list.empty')}</div>`
                    : html`
                        <ul class="list">
                            ${this._items.map(item => html`
                                <li class="item"
                                    @dblclick=${() => this.onItemDblClick(item.entityId)}>
                                    <span><span class="item-type">${this.typeLabel(item.type)}</span> #${item.index}</span>
                                    <span class="item-id">ID:${item.entityId}</span>
                                </li>
                            `)}
                        </ul>
                    `}
            </div>
        `;
    }
}

// Registration is handled by SidebarPanelManager — do NOT self-register here.
