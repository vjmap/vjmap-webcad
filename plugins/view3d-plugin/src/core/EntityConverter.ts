import { Engine, ColorConverter } from 'vjcad';
import type { View3dSettings, PolylineData3d, PolygonData3d, MeshData3d, TubeData3d, ConvertedEntities } from '../types';
import type { BBox3d } from './CoordTransform';

type AnyEntity = any;

let idCounter = 0;
function nextId(): string {
    return `e3d_${++idCounter}`;
}

function colorToHex(entity: AnyEntity): string {
    let colorIndex = entity.color ?? 7;
    if (colorIndex === 256) {
        const layer = Engine.currentDoc?.layers?.itemById(entity.layerId);
        colorIndex = layer?.color ?? 7;
    }
    if (colorIndex === 0) colorIndex = 7;
    // isDarkBackground=false so index 7 stays white (#FFFFFF) on dark 3D background
    const hex = ColorConverter.GetColorHexStr(colorIndex, false);
    return `#${hex}`;
}

function getZ(point: any, elevation = 0): number {
    if (point.z !== undefined && point.z !== null) return point.z;
    return elevation;
}

function entityHasZ(entity: AnyEntity): boolean {
    const type = entity.type;
    if (type === 'LINE') {
        return (getZ(entity.startPoint) !== 0) || (getZ(entity.endPoint) !== 0);
    }
    if (type === 'PLINE') {
        if (entity.elevation && entity.elevation !== 0) return true;
        if (entity.hasElevations) return true;
        const items = entity.bulgePoints?.items;
        if (items) {
            for (const bp of items) {
                if (bp.point2d.z !== undefined && bp.point2d.z !== 0) return true;
            }
        }
        return false;
    }
    if (type === 'CIRCLE' || type === 'ARC' || type === 'ELLIPSE') {
        return getZ(entity.center) !== 0;
    }
    if (type === 'MESH') {
        const verts = entity.vertices;
        if (verts) {
            for (let i = 2; i < verts.length; i += 3) {
                if (verts[i] !== 0) return true;
            }
        }
        return false;
    }
    if (type === 'SOLID') {
        return (getZ(entity.point1) !== 0 || getZ(entity.point2) !== 0 ||
                getZ(entity.point3) !== 0 || getZ(entity.point4) !== 0);
    }
    return false;
}

function getEntityBounds(entity: AnyEntity): { minX: number; minY: number; maxX: number; maxY: number } | null {
    try {
        const bbox = entity.boundingBox?.();
        if (bbox && bbox.minX !== undefined && bbox.maxX !== undefined) {
            return { minX: bbox.minX, minY: bbox.minY, maxX: bbox.maxX, maxY: bbox.maxY };
        }
    } catch { /* ignore */ }

    try {
        const type = entity.type;
        if (type === 'LINE') {
            const sp = entity.startPoint, ep = entity.endPoint;
            return {
                minX: Math.min(sp.x, ep.x), minY: Math.min(sp.y, ep.y),
                maxX: Math.max(sp.x, ep.x), maxY: Math.max(sp.y, ep.y)
            };
        }
        if (type === 'CIRCLE') {
            const c = entity.center, r = entity.radius;
            return { minX: c.x - r, minY: c.y - r, maxX: c.x + r, maxY: c.y + r };
        }
        if (type === 'ARC') {
            const c = entity.center, r = entity.radius;
            return { minX: c.x - r, minY: c.y - r, maxX: c.x + r, maxY: c.y + r };
        }
        if (type === 'PLINE') {
            const items = entity.bulgePoints?.items;
            if (items && items.length > 0) {
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                for (const bp of items) {
                    const pt = bp.point2d;
                    if (pt.x < minX) minX = pt.x;
                    if (pt.y < minY) minY = pt.y;
                    if (pt.x > maxX) maxX = pt.x;
                    if (pt.y > maxY) maxY = pt.y;
                }
                return { minX, minY, maxX, maxY };
            }
        }
    } catch { /* ignore */ }
    return null;
}

function boundsOverlap(
    a: { minX: number; minY: number; maxX: number; maxY: number },
    b: { minX: number; minY: number; maxX: number; maxY: number }
): boolean {
    return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
}

let cachedViewBounds: { minX: number; minY: number; maxX: number; maxY: number } | null = null;

function getViewBounds(): { minX: number; minY: number; maxX: number; maxY: number } | null {
    try {
        const pcanvas = (Engine as any).pcanvas;
        if (!pcanvas) return null;
        const wcs = pcanvas.getScreenBoundsWcs(1.0);
        if (!wcs) return null;
        const { minX, minY, maxX, maxY } = wcs;
        if (minX === undefined || maxX === undefined) return null;
        return {
            minX: Math.min(minX, maxX), minY: Math.min(minY, maxY),
            maxX: Math.max(minX, maxX), maxY: Math.max(minY, maxY)
        };
    } catch { return null; }
}

function isInBounds(entity: AnyEntity, settings: View3dSettings): boolean {
    if (settings.displayRange === 'all') return true;

    let range: { minX: number; minY: number; maxX: number; maxY: number } | null = null;

    if (settings.displayRange === 'currentView') {
        range = cachedViewBounds;
    } else if (settings.displayRange === 'custom' && settings.customRange) {
        const r = settings.customRange;
        range = { minX: r.xmin, minY: r.ymin, maxX: r.xmax, maxY: r.ymax };
    }

    if (!range) return true;

    const eb = getEntityBounds(entity);
    if (!eb) return true;
    return boundsOverlap(eb, range);
}

export function matchFilter(entity: AnyEntity, settings: View3dSettings): boolean {
    if (!entity || entity.type === 'INSERT') return false;
    if (!entity.visible) return false;

    if (settings.selectedLayers.length > 0) {
        const layerName = entity.layer ?? '0';
        if (!settings.selectedLayers.includes(layerName)) return false;
    }

    if (settings.selectedEntityTypes.length > 0) {
        if (!settings.selectedEntityTypes.includes(entity.type)) return false;
    }

    if (settings.onlyWithElevation) {
        if (!entityHasZ(entity)) return false;
    }

    if (!isInBounds(entity, settings)) return false;

    return true;
}

function discretizeArc(cx: number, cy: number, cz: number, radius: number,
    startAng: number, endAng: number, segments = 32): [number, number, number][] {
    const pts: [number, number, number][] = [];
    let sweep = endAng - startAng;
    if (sweep <= 0) sweep += Math.PI * 2;
    for (let i = 0; i <= segments; i++) {
        const t = startAng + (sweep * i) / segments;
        pts.push([cx + radius * Math.cos(t), cy + radius * Math.sin(t), cz]);
    }
    return pts;
}

function discretizeCircle(cx: number, cy: number, cz: number, radius: number,
    segments = 32): [number, number, number][] {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= segments; i++) {
        const t = (Math.PI * 2 * i) / segments;
        pts.push([cx + radius * Math.cos(t), cy + radius * Math.sin(t), cz]);
    }
    return pts;
}

function discretizeEllipse(cx: number, cy: number, cz: number,
    majorRadius: number, minorRadius: number, majorAxis: number,
    startAngle: number, endAngle: number, segments = 48): [number, number, number][] {
    const pts: [number, number, number][] = [];
    const isFullEllipse = (startAngle === 0 && endAngle === 0) ||
                          Math.abs(endAngle - startAngle) < 1e-10;
    const sa = isFullEllipse ? 0 : startAngle;
    const ea = isFullEllipse ? Math.PI * 2 : endAngle;
    let sweep = ea - sa;
    if (sweep <= 0) sweep += Math.PI * 2;
    const cos_a = Math.cos(majorAxis);
    const sin_a = Math.sin(majorAxis);
    const count = isFullEllipse ? segments : segments;
    for (let i = 0; i <= count; i++) {
        const t = sa + (sweep * i) / count;
        const ex = majorRadius * Math.cos(t);
        const ey = minorRadius * Math.sin(t);
        pts.push([
            cx + ex * cos_a - ey * sin_a,
            cy + ex * sin_a + ey * cos_a,
            cz
        ]);
    }
    return pts;
}

function convertLine(entity: AnyEntity): PolylineData3d {
    const sp = entity.startPoint;
    const ep = entity.endPoint;
    return {
        id: nextId(),
        coordinates: [
            [sp.x, sp.y, getZ(sp)],
            [ep.x, ep.y, getZ(ep)]
        ],
        color: colorToHex(entity),
        lineWidth: 1,
        entityId: entity.id,
        objectId: entity.objectId
    };
}

function convertPolyline(entity: AnyEntity): PolylineData3d {
    const items = entity.bulgePoints?.items ?? [];
    const elev = entity.elevation ?? 0;
    const coords: [number, number, number][] = [];

    for (let i = 0; i < items.length; i++) {
        const bp = items[i];
        const pt = bp.point2d;
        const z = pt.z !== undefined ? pt.z : elev;
        coords.push([pt.x, pt.y, z]);
    }

    if (entity.isClosed && coords.length > 1) {
        const first = coords[0];
        const last = coords[coords.length - 1];
        if (Math.abs(first[0] - last[0]) > 1e-6 ||
            Math.abs(first[1] - last[1]) > 1e-6 ||
            Math.abs(first[2] - last[2]) > 1e-6) {
            coords.push([...first]);
        }
    }

    return {
        id: nextId(),
        coordinates: coords,
        color: colorToHex(entity),
        lineWidth: 1,
        entityId: entity.id,
        objectId: entity.objectId
    };
}

function convertCircle(entity: AnyEntity): PolylineData3d {
    const c = entity.center;
    const z = getZ(c);
    return {
        id: nextId(),
        coordinates: discretizeCircle(c.x, c.y, z, entity.radius),
        color: colorToHex(entity),
        lineWidth: 1,
        entityId: entity.id,
        objectId: entity.objectId
    };
}

function convertArc(entity: AnyEntity): PolylineData3d {
    const c = entity.center;
    const z = getZ(c);
    return {
        id: nextId(),
        coordinates: discretizeArc(c.x, c.y, z, entity.radius,
            entity.startAng ?? 0, entity.endAng ?? Math.PI),
        color: colorToHex(entity),
        lineWidth: 1,
        entityId: entity.id,
        objectId: entity.objectId
    };
}

function convertEllipse(entity: AnyEntity): PolylineData3d {
    const c = entity.center;
    const z = getZ(c);
    return {
        id: nextId(),
        coordinates: discretizeEllipse(c.x, c.y, z,
            entity.majorRadius, entity.minorRadius, entity.majorAxis,
            entity.startAngle ?? 0, entity.endAngle ?? 0),
        color: colorToHex(entity),
        lineWidth: 1,
        entityId: entity.id,
        objectId: entity.objectId
    };
}

function convertSpline(entity: AnyEntity): PolylineData3d | null {
    try {
        const geoms = entity.subGeometries;
        if (!geoms || geoms.length === 0) return null;
        const coords: [number, number, number][] = [];
        for (const g of geoms) {
            if (coords.length === 0) {
                coords.push([g.startPoint.x, g.startPoint.y, getZ(g.startPoint)]);
            }
            coords.push([g.endPoint.x, g.endPoint.y, getZ(g.endPoint)]);
        }
        return {
            id: nextId(),
            coordinates: coords,
            color: colorToHex(entity),
            lineWidth: 1,
            entityId: entity.id,
            objectId: entity.objectId
        };
    } catch {
        return null;
    }
}

function convertMesh(entity: AnyEntity): MeshData3d | null {
    const verts = entity.vertices as Float64Array;
    const indices = entity.indices as Uint32Array;
    if (!verts || verts.length < 9 || !indices || indices.length < 3) return null;

    return {
        id: nextId(),
        vertices: Array.from(verts),
        indices: Array.from(indices),
        color: colorToHex(entity),
        entityId: entity.id,
        objectId: entity.objectId
    };
}

function convertSolid(entity: AnyEntity): PolygonData3d {
    const p1 = entity.point1, p2 = entity.point2, p3 = entity.point3, p4 = entity.point4;
    const ring: [number, number, number][] = [
        [p1.x, p1.y, getZ(p1)],
        [p2.x, p2.y, getZ(p2)],
        [p3.x, p3.y, getZ(p3)],
        [p4.x, p4.y, getZ(p4)],
        [p1.x, p1.y, getZ(p1)]
    ];
    return {
        id: nextId(),
        coordinates: [ring],
        color: colorToHex(entity),
        opacity: 0.7,
        entityId: entity.id,
        objectId: entity.objectId
    };
}

function convertHatch(entity: AnyEntity): PolygonData3d | null {
    try {
        const items = entity.bulgePoints?.items;
        if (!items || items.length < 3) return null;
        const ring: [number, number, number][] = items.map((bp: any) => {
            const pt = bp.point2d;
            return [pt.x, pt.y, getZ(pt)] as [number, number, number];
        });
        if (ring.length > 0) {
            ring.push([...ring[0]]);
        }
        return {
            id: nextId(),
            coordinates: [ring],
            color: colorToHex(entity),
            opacity: 0.5,
            entityId: entity.id,
            objectId: entity.objectId
        };
    } catch {
        return null;
    }
}

export function convertEntities(settings: View3dSettings): ConvertedEntities {
    idCounter = 0;
    cachedViewBounds = (settings.displayRange === 'currentView') ? getViewBounds() : null;
    const polylines: PolylineData3d[] = [];
    const polygons: PolygonData3d[] = [];
    const meshes: MeshData3d[] = [];
    const tubes: TubeData3d[] = [];

    const bmin: [number, number, number] = [Infinity, Infinity, Infinity];
    const bmax: [number, number, number] = [-Infinity, -Infinity, -Infinity];

    const updateBBox = (coords: [number, number, number][]) => {
        for (const [x, y, z] of coords) {
            if (x < bmin[0]) bmin[0] = x;
            if (y < bmin[1]) bmin[1] = y;
            if (z < bmin[2]) bmin[2] = z;
            if (x > bmax[0]) bmax[0] = x;
            if (y > bmax[1]) bmax[1] = y;
            if (z > bmax[2]) bmax[2] = z;
        }
    };

    let space: any;
    try {
        space = Engine.currentDoc?.currentSpace;
    } catch {
        return { polylines, polygons, meshes, tubes, entityCount: 0, bbox: { min: [0, 0, 0], max: [1, 1, 1] } };
    }
    if (!space) {
        return { polylines, polygons, meshes, tubes, entityCount: 0, bbox: { min: [0, 0, 0], max: [1, 1, 1] } };
    }

    const entities = space.aliveItems ?? space.items ?? [];

    for (const ent of entities) {
        if (!matchFilter(ent, settings)) continue;

        try {
            switch (ent.type) {
                case 'LINE': {
                    const d = convertLine(ent);
                    updateBBox(d.coordinates);
                    if (settings.useTubeRendering) {
                        tubes.push({ id: d.id, paths: d.coordinates, color: d.color, entityId: d.entityId, objectId: d.objectId });
                    } else {
                        polylines.push(d);
                    }
                    break;
                }
                case 'PLINE': {
                    const d = convertPolyline(ent);
                    if (d.coordinates.length >= 2) {
                        updateBBox(d.coordinates);
                        if (settings.useTubeRendering) {
                            tubes.push({ id: d.id, paths: d.coordinates, color: d.color, entityId: d.entityId, objectId: d.objectId });
                        } else {
                            polylines.push(d);
                        }
                    }
                    break;
                }
                case 'CIRCLE': {
                    const d = convertCircle(ent);
                    updateBBox(d.coordinates);
                    polylines.push(d);
                    break;
                }
                case 'ARC': {
                    const d = convertArc(ent);
                    updateBBox(d.coordinates);
                    polylines.push(d);
                    break;
                }
                case 'ELLIPSE': {
                    const d = convertEllipse(ent);
                    updateBBox(d.coordinates);
                    polylines.push(d);
                    break;
                }
                case 'SPLINE': {
                    const d = convertSpline(ent);
                    if (d && d.coordinates.length >= 2) {
                        updateBBox(d.coordinates);
                        if (settings.useTubeRendering) {
                            tubes.push({ id: d.id, paths: d.coordinates, color: d.color, entityId: d.entityId, objectId: d.objectId });
                        } else {
                            polylines.push(d);
                        }
                    }
                    break;
                }
                case 'MESH': {
                    const d = convertMesh(ent);
                    if (d) {
                        const vCoords: [number, number, number][] = [];
                        for (let i = 0; i < d.vertices.length; i += 3) {
                            vCoords.push([d.vertices[i], d.vertices[i + 1], d.vertices[i + 2]]);
                        }
                        updateBBox(vCoords);
                        meshes.push(d);
                    }
                    break;
                }
                case 'SOLID': {
                    const d = convertSolid(ent);
                    updateBBox(d.coordinates[0]);
                    polygons.push(d);
                    break;
                }
                case 'HATCH': {
                    const d = convertHatch(ent);
                    if (d) {
                        updateBBox(d.coordinates[0]);
                        polygons.push(d);
                    }
                    break;
                }
            }
        } catch {
            // skip problematic entities
        }
    }

    const entityCount = polylines.length + polygons.length + meshes.length + tubes.length;

    if (bmin[0] === Infinity) {
        return { polylines, polygons, meshes, tubes, entityCount, bbox: { min: [0, 0, 0], max: [1, 1, 1] } };
    }

    const bbox: BBox3d = { min: bmin, max: bmax };
    return { polylines, polygons, meshes, tubes, entityCount, bbox };
}
