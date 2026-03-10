export interface View3dSettings {
    selectedLayers: string[];
    selectedEntityTypes: string[];
    onlyWithElevation: boolean;
    displayRange: 'all' | 'currentView' | 'custom';
    customRange: { xmin: number; ymin: number; xmax: number; ymax: number } | null;
    useTubeRendering: boolean;
    tubeRadius: number;
    tubeColor: string;
    scaleZ: number;
}

export const DEFAULT_SETTINGS: View3dSettings = {
    selectedLayers: [],
    selectedEntityTypes: [],
    onlyWithElevation: false,
    displayRange: 'all',
    customRange: null,
    useTubeRendering: false,
    tubeRadius: 0.5,
    tubeColor: '#7dffeb',
    scaleZ: 1,
};

export const SUPPORTED_ENTITY_TYPES = [
    'LINE', 'PLINE', 'CIRCLE', 'ARC', 'ELLIPSE', 'SPLINE',
    'MESH', 'SOLID', 'HATCH', 'TEXT', 'MTEXT'
] as const;

export interface PolylineData3d {
    id: string;
    coordinates: [number, number, number][];
    color: string;
    lineWidth: number;
    entityId: number;
    objectId?: string;
}

export interface PolygonData3d {
    id: string;
    coordinates: [number, number, number][][];
    color: string;
    opacity: number;
    entityId: number;
    objectId?: string;
}

export interface MeshData3d {
    id: string;
    vertices: number[];
    indices: number[];
    color: string;
    entityId: number;
    objectId?: string;
}

export interface TubeData3d {
    id: string;
    paths: [number, number, number][];
    color: string;
    entityId: number;
    objectId?: string;
}

export interface ConvertedEntities {
    polylines: PolylineData3d[];
    polygons: PolygonData3d[];
    meshes: MeshData3d[];
    tubes: TubeData3d[];
    entityCount: number;
    bbox: {
        min: [number, number, number];
        max: [number, number, number];
    };
}
