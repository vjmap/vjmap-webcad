import { Engine, Layer, type EntityBase } from 'vjcad';
import { ANNO_LAYER_NAME, ANNO_COLOR } from '../constants';

/**
 * Manages the dedicated annotation layer.
 */
export class AnnotationLayerService {
    private static _instance: AnnotationLayerService;

    static getInstance(): AnnotationLayerService {
        if (!AnnotationLayerService._instance) {
            AnnotationLayerService._instance = new AnnotationLayerService();
        }
        return AnnotationLayerService._instance;
    }

    ensureLayer(): Layer {
        const layers = Engine.currentDoc.layers;
        let layer = layers.itemByName(ANNO_LAYER_NAME);
        if (!layer) {
            layer = new Layer(ANNO_LAYER_NAME);
            layer.color = ANNO_COLOR;
            layers.add(layer);
        }
        return layer;
    }

    setAsCurrentLayer(): string {
        this.ensureLayer();
        const prev = Engine.currentDoc.CLAYER;
        Engine.currentDoc.setCLAYER(ANNO_LAYER_NAME, false);
        return prev;
    }

    restoreLayer(previousLayer: string): void {
        Engine.currentDoc.setCLAYER(previousLayer, false);
    }

    showLayer(): void {
        const layer = this.ensureLayer();

        Engine.undoManager.start_undoMark();
        Engine.undoManager.layerModified_undoMark(layer);
        layer.layerOn = true;
        Engine.undoManager.end_undoMark();

        // Force full cache invalidation and redraw
        Engine.currentDoc.layers.invalidateStateCache();
        Engine.pcanvas.regen(true);
        try { Engine.view?.docBar?.clayerDropDown?.regen?.(); } catch { /* ok */ }
    }

    hideLayer(): void {
        const layer = this.ensureLayer();

        // Cannot hide the current layer — switch away first
        if (Engine.currentDoc.CLAYER.toUpperCase() === ANNO_LAYER_NAME.toUpperCase()) {
            Engine.undoManager.clayer_undoMark(Engine.currentDoc.CLAYER);
            Engine.currentDoc.setCLAYER('0', false);
        }

        Engine.undoManager.start_undoMark();
        Engine.undoManager.layerModified_undoMark(layer);
        layer.layerOn = false;
        Engine.undoManager.end_undoMark();

        // Force full cache invalidation and redraw
        Engine.currentDoc.layers.invalidateStateCache();
        Engine.pcanvas.regen(true);
        try { Engine.view?.docBar?.clayerDropDown?.regen?.(); } catch { /* ok */ }
    }

    isLayerVisible(): boolean {
        const layer = Engine.currentDoc.layers.itemByName(ANNO_LAYER_NAME);
        return layer ? layer.layerOn : false;
    }

    getAnnotationEntities(): EntityBase[] {
        return Engine.getEntities(
            (e: EntityBase) => e.layer === ANNO_LAYER_NAME && e._isAlive
        );
    }

    clearAll(): void {
        const entities = this.getAnnotationEntities();
        if (entities.length > 0) {
            Engine.eraseEntities(entities);
            Engine.pcanvas.regen();
        }
    }
}

/**
 * Compute an appropriate annotation globalWidth based on the current
 * view extent.  Heuristic: screenDiagonal / 500, min 0.5.
 */
export function getAnnoLineWidth(): number {
    try {
        const bounds = Engine.pcanvas.getScreenBoundsWcs();
        if (bounds && bounds.hasSizeBounds) {
            const dx = bounds.maxX - bounds.minX;
            const dy = bounds.maxY - bounds.minY;
            const diag = Math.sqrt(dx * dx + dy * dy);
            return Math.max(diag / 500, 0.5);
        }
    } catch { /* fallback */ }
    return 2;
}

/**
 * Compute a sensible revcloud arc length for the current view.
 * Heuristic: screenDiagonal / 30, clamped to [10, 100000].
 */
export function getAnnoArcLength(): number {
    try {
        const bounds = Engine.pcanvas.getScreenBoundsWcs();
        if (bounds && bounds.hasSizeBounds) {
            const dx = bounds.maxX - bounds.minX;
            const dy = bounds.maxY - bounds.minY;
            const diag = Math.sqrt(dx * dx + dy * dy);
            return Math.max(Math.min(diag / 30, 100000), 10);
        }
    } catch { /* fallback */ }
    return 50;
}
