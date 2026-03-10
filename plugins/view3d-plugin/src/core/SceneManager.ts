import { Engine, SystemConstants, t } from 'vjcad';
import * as THREE from 'three';
import * as vjmap3d from 'vjmap3d';
import 'vjmap3d/dist/vjmap3d.min.css';
import type { View3dSettings, PolylineData3d, PolygonData3d, MeshData3d, TubeData3d } from '../types';
import { CoordTransform } from './CoordTransform';
import { convertEntities } from './EntityConverter';

interface EntityMapping {
    entityId: number;
    objectId?: string;
    worldCenter?: THREE.Vector3;
}

export class SceneManager {
    private container: HTMLDivElement;
    private coordCallback: (text: string) => void;
    private app: vjmap3d.App | null = null;
    private coordTransform = new CoordTransform();
    private entityMap = new Map<string, EntityMapping>();
    private currentEntities: any[] = [];
    private selected3dEntityId: string | null = null;

    constructor(container: HTMLDivElement, coordCallback: (text: string) => void) {
        this.container = container;
        this.coordCallback = coordCallback;
    }

    async init(): Promise<void> {
        this.createApp();
    }

    // ========== Scene Creation ==========

    private createApp(): void {
        const serviceUrl = SystemConstants.SERVICE_URL || '';
        const accessToken = SystemConstants.ACCESS_TOKEN || '';

        const svc = new vjmap3d.Service(serviceUrl, accessToken);
        this.app = new vjmap3d.App(svc, {
            container: this.container,
            render: {
                alpha: true,
                antialias: true,
                powerPreference: 'default',
                logarithmicDepthBuffer: true
            },
            scene: {
                showAxesHelper: true,
                axesHelperSize: 5,
                defaultLights: false,
                gridHelper: {
                    visible: true,
                    args: [1000, 1000],
                    cellSize: 5,
                    sectionSize: 25
                }
            },
            camera: {
                isOrthographicCamera: false,
                fov: 45,
                near: 0.01,
                far: 10000,
                autoNearFar: false,
                viewHelper: { enable: true, position: 'leftBottom' }
            },
            control: {
               leftButtonPan: true,
                initState: {
                    cameraTarget: new THREE.Vector3(0, 0, 0),
                    cameraPosition: new THREE.Vector3(0, 60, 40)
                }
            },
            stat: { show: false },
            postProcess: {
                enable: true,
                useFXAA: true,
                disableMergeEffect: false
            }
        } as any);

        const dir1 = new THREE.DirectionalLight(0xffffff, 1.0);
        dir1.position.set(400, 300, 300);
        this.app.scene.add(dir1);

        const dir2 = new THREE.DirectionalLight(0xffffff, 1.5);
        dir2.position.set(-400, -300, -300);
        this.app.scene.add(dir2);

        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        this.app.scene.add(ambient);

        this.setupMouseEvents();
    }

    // ========== Mouse Events & Coordinate Display ==========

    private setupMouseEvents(): void {
        if (!this.app) return;

        this.app.signal.onMouseMove.add((e: any) => {
            try {
                const me = e.originalEvent as MouseEvent;
                if (!me) return;
                const pos = this.app!.unproject(me.offsetX, me.offsetY, true);
                if (!pos) return;
                const cad = this.coordTransform.fromWorld(pos.x, pos.y, pos.z);
                this.coordCallback(
                    `X: ${cad[0].toFixed(2)}  Y: ${cad[1].toFixed(2)}  Z: ${cad[2].toFixed(2)}`
                );
            } catch { /* ignore */ }
        });

        this.app.signal.onMouseClick.add((_e: any, obj: any) => {
            if (!obj?.target) return;
            const faceIndex = obj.intersection?.faceIndex ?? 0;
            const entity = obj.target;
            this.handle3dEntityClick(entity, faceIndex);
        });
    }

    // ========== Rendering ==========

    async render(settings: View3dSettings, keepCamera: boolean): Promise<number> {
        if (!this.app) return 0;

        let cameraPos: any;
        let cameraTarget: any;
        if (keepCamera && (this.app as any).cameraControl) {
            cameraPos = this.app.camera.position.clone();
            cameraTarget = (this.app as any).cameraControl.getTarget(new THREE.Vector3());
        }

        this.clearScene();

        const data = convertEntities(settings);
        this.coordTransform.computeFromBBox(data.bbox, settings.scaleZ);

        this.renderPolylines(data.polylines);
        this.renderPolygons(data.polygons);
        this.renderMeshes(data.meshes);

        if (settings.useTubeRendering && data.tubes.length > 0) {
            this.renderTubes(data.tubes, settings.tubeRadius, settings.tubeColor);
        }

        if (keepCamera && cameraPos && cameraTarget) {
            this.app.setCameraLookAt(cameraPos, cameraTarget, false);
        } else {
            this.fitCamera();
        }

        return data.entityCount;
    }

    private clearScene(): void {
        for (const ent of this.currentEntities) {
            try {
                ent.removeFrom?.(this.app) || ent.remove?.();
            } catch { /* ignore */ }
        }
        this.currentEntities = [];
        this.entityMap.clear();
        this.selected3dEntityId = null;
    }

    // ========== Polyline Rendering ==========

    private renderPolylines(polylines: PolylineData3d[]): void {
        if (polylines.length === 0) return;

        const dataArr = polylines.map(p => ({
            id: p.id,
            coordinates: p.coordinates.map(c => this.coordTransform.toWorld(c[0], c[1], c[2])),
            color: p.color,
            lineWidth: p.lineWidth
        }));

        const entity = new vjmap3d.PolylinesEntity({
            data: dataArr,
            style: { vertexColors: true, transparent: true }
        } as any);
        entity.addTo(this.app!);
        entity.pointerEvents = true;
        this.currentEntities.push(entity);

        for (let i = 0; i < polylines.length; i++) {
            const p = polylines[i];
            const coords = dataArr[i].coordinates as [number, number, number][];
            this.entityMap.set(p.id, { entityId: p.entityId, objectId: p.objectId, worldCenter: this.calcCenter(coords) });
        }
    }

    // ========== Polygon Rendering ==========

    private renderPolygons(polygons: PolygonData3d[]): void {
        if (polygons.length === 0) return;

        const dataArr = polygons.map(p => ({
            id: p.id,
            coordinates: p.coordinates.map(ring =>
                ring.map(c => this.coordTransform.toWorld(c[0], c[1], c[2]))
            ),
            color: p.color,
            opacity: p.opacity
        }));

        const entity = new vjmap3d.PolygonsEntity({
            data: dataArr,
            style: { transparent: true },
            showBorder: true,
            isXYPlane: false
        } as any);
        entity.addTo(this.app!);
        entity.pointerEvents = true;
        this.currentEntities.push(entity);

        for (let i = 0; i < polygons.length; i++) {
            const p = polygons[i];
            const coords = (dataArr[i].coordinates as [number, number, number][][])[0] ?? [];
            this.entityMap.set(p.id, { entityId: p.entityId, objectId: p.objectId, worldCenter: this.calcCenter(coords) });
        }
    }

    // ========== Mesh Rendering ==========

    private renderMeshes(meshes: MeshData3d[]): void {
        if (meshes.length === 0) return;

        for (const m of meshes) {
            const worldVerts: number[] = [];
            for (let i = 0; i < m.vertices.length; i += 3) {
                const w = this.coordTransform.toWorld(m.vertices[i], m.vertices[i + 1], m.vertices[i + 2]);
                worldVerts.push(w[0], w[1], w[2]);
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(worldVerts), 3));
            geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(m.indices), 1));
            geometry.computeVertexNormals();

            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(m.color),
                side: THREE.DoubleSide,
                metalness: 0.1,
                roughness: 0.8
            });

            const mesh3d = new THREE.Mesh(geometry, material);
            const entity = vjmap3d.MeshEntity.fromObject3d(mesh3d);
            entity.addTo(this.app!);
            entity.pointerEvents = true;
            this.currentEntities.push(entity);

            const meshCoords: [number, number, number][] = [];
            for (let i = 0; i < worldVerts.length; i += 3) {
                meshCoords.push([worldVerts[i], worldVerts[i + 1], worldVerts[i + 2]]);
            }
            this.entityMap.set(m.id, { entityId: m.entityId, objectId: m.objectId, worldCenter: this.calcCenter(meshCoords) });
        }
    }

    // ========== Tube Rendering ==========

    private renderTubes(tubes: TubeData3d[], tubeRadius: number, tubeColor: string): void {
        if (tubes.length === 0) return;

        const scaledRadius = tubeRadius * this.coordTransform.scale;
        const threeColor = new THREE.Color(tubeColor);

        const tubeDataArr = tubes.map(t => ({
            id: t.id,
            paths: t.paths.map(c => this.coordTransform.toWorld(c[0], c[1], c[2]) as [number, number, number]),
            color: t.color
        }));

        try {
            const allData = tubeDataArr.map(td => ({
                paths: td.paths,
                color: td.color
            }));

            const outerMaterial = new THREE.MeshPhongMaterial({
                color: threeColor,
                side: THREE.FrontSide
            });

            const pathTube = new vjmap3d.PathTubeEntities({
                data: allData,
                sect: { shape: 'circle', radius: scaledRadius, circleSegments: 8 },
                nodeRadius: scaledRadius * 1.2,
                outerMaterial: outerMaterial
            } as any);
            pathTube.addTo(this.app!);
            this.currentEntities.push(pathTube.entity || pathTube);
        } catch {
            for (const td of tubeDataArr) {
                if (td.paths.length < 2) continue;
                try {
                    const vec3Paths = td.paths.map(p => new THREE.Vector3(p[0], p[1], p[2]));
                    const curve = new THREE.CatmullRomCurve3(vec3Paths, false, 'catmullrom', 0.1);
                    const geometry = new THREE.TubeGeometry(curve, td.paths.length * 4, scaledRadius, 6, false);
                    const material = new THREE.MeshPhongMaterial({
                        color: threeColor,
                        side: THREE.DoubleSide
                    });
                    const mesh3d = new THREE.Mesh(geometry, material);
                    this.app!.scene.add(mesh3d);
                    this.currentEntities.push(mesh3d);
                } catch { /* skip */ }
            }
        }

        for (const t of tubes) {
            this.entityMap.set(t.id, { entityId: t.entityId, objectId: t.objectId });
        }
    }

    private calcCenter(coords: [number, number, number][]): THREE.Vector3 {
        if (coords.length === 0) return new THREE.Vector3();
        let sx = 0, sy = 0, sz = 0;
        for (const [x, y, z] of coords) { sx += x; sy += y; sz += z; }
        const n = coords.length;
        return new THREE.Vector3(sx / n, sy / n, sz / n);
    }

    // ========== Camera ==========

    private fitCamera(): void {
        if (!this.app) return;
        const dist = this.coordTransform.getCameraDistance();
        const target = new THREE.Vector3(0, 0, 0);
        const position = new THREE.Vector3(0, dist * 0.8, dist * 1);
        this.app.setCameraLookAt(position, target, false);
    }

    // ========== 2D/3D Linkage ==========

    locate2dTo3d(): void {
        if (!this.app) return;
        try {
            const selected = Engine.ssGetFirst();
            if (!selected || selected.length === 0) {
                this.coordCallback(t('view3d.msg.selectEntityIn2d'));
                return;
            }

            const selectedIds = new Set(selected.map((e: any) => e.id));

            for (const [id3d, mapping] of this.entityMap.entries()) {
                if (selectedIds.has(mapping.entityId)) {
                    this.highlightAndFlyTo(id3d);
                    this.coordCallback(t('view3d.msg.locatedTo3d', { entityId: mapping.entityId }));
                    return;
                }
            }
            this.coordCallback(t('view3d.msg.notFoundIn3d'));
        } catch { /* ignore */ }
    }

    locate3dTo2d(): void {
        if (!this.selected3dEntityId) {
            this.coordCallback(t('view3d.msg.selectEntityIn3d'));
            return;
        }
        const mapping = this.entityMap.get(this.selected3dEntityId);
        if (!mapping) return;

        try {
            const space = Engine.currentDoc?.currentSpace;
            const entities = (space as any)?.aliveItems ?? (space as any)?.items ?? [];
            const target = entities.find((e: any) => e.id === mapping.entityId);
            if (target) {
                Engine.zoomToEntities([target]);
                Engine.ssSetFirst([target]);
                this.coordCallback(t('view3d.msg.locatedTo2d', { entityId: mapping.entityId }));
            }
        } catch { /* ignore */ }
    }

    private handle3dEntityClick(entity: any, faceIndex: number): void {
        try {
            const itemData = entity.getItemDataByFaceIndex?.(faceIndex);
            const id = itemData?.id ?? itemData?.data?.id;
            if (id && this.entityMap.has(id)) {
                this.selected3dEntityId = id;
                const mapping = this.entityMap.get(id)!;
                this.coordCallback(t('view3d.msg.selectedEntity', { entityId: mapping.entityId }));
                return;
            }
        } catch { /* ignore */ }

        for (const [id3d, mapping] of this.entityMap.entries()) {
            for (const ent of this.currentEntities) {
                if (ent === entity || ent.object3d === entity || ent === entity.parent) {
                    this.selected3dEntityId = id3d;
                    this.coordCallback(t('view3d.msg.selectedEntity', { entityId: mapping.entityId }));
                    return;
                }
            }
        }
    }

    private highlightAndFlyTo(id3d: string): void {
        for (const ent of this.currentEntities) {
            try {
                ent.clearHighlight?.();
                ent.setItemHighlight?.(id3d, true);
            } catch { /* ignore */ }
        }

        const mapping = this.entityMap.get(id3d);
        if (mapping?.worldCenter && this.app) {
            const target = mapping.worldCenter.clone();
            const dist = this.coordTransform.getCameraDistance() * 0.4;
            const position = new THREE.Vector3(
                target.x + dist * 0.3,
                target.y + dist * 0.6,
                target.z + dist * 0.3
            );
            this.app.setCameraLookAt(position, target, true);
        }
    }

    // ========== Lifecycle ==========

    resize(): void {
        if (!this.app) return;
        try {
            (this.app as any).signal?.onContainerSizeChange?.dispatch?.();
            const renderer = (this.app as any).renderer;
            if (renderer && this.container) {
                const w = this.container.clientWidth;
                const h = this.container.clientHeight;
                if (w > 0 && h > 0) {
                    renderer.setSize(w, h);
                    if (this.app.camera) {
                        (this.app.camera as any).aspect = w / h;
                        (this.app.camera as any).updateProjectionMatrix();
                    }
                }
            }
        } catch { /* ignore */ }
    }

    destroy(): void {
        this.clearScene();
        if (this.app) {
            try {
                (this.app as any).dispose?.();
            } catch { /* ignore */ }
            this.app = null;
        }
    }
}
