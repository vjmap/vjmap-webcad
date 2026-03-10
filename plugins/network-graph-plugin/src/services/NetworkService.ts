import {
    Engine,
    EntityBase,
    CadEventManager,
    CadEvents,
    CustomEntityBase
} from 'vjcad';
import { NetworkNodeEnt } from '../entities/NetworkNodeEnt';
import { NetworkBranchEnt } from '../entities/NetworkBranchEnt';

export interface NetworkNodeData {
    id: string;
    x?: number;
    y?: number;
    label: string;
    radius?: number;
}

export interface NetworkBranchData {
    startNodeId: string;
    endNodeId: string;
    label: string;
    showArrow?: boolean;
    bulge?: number;
}

export interface NetworkData {
    nodes: NetworkNodeData[];
    branches: NetworkBranchData[];
}

/** Type check only (for identifying erased entities in events) */
function isNetworkNode(e: EntityBase): boolean {
    return e.type === 'CUSTOM' && (e as any).customType === 'NETWORK_NODE';
}

function isNetworkBranch(e: EntityBase): boolean {
    return e.type === 'CUSTOM' && (e as any).customType === 'NETWORK_BRANCH';
}

/** Type check + alive (for querying entities that still exist) */
function isAliveNetworkNode(e: EntityBase): boolean {
    return e.isAlive && isNetworkNode(e);
}

function isAliveNetworkBranch(e: EntityBase): boolean {
    return e.isAlive && isNetworkBranch(e);
}

function getNetworkId(e: EntityBase): string {
    return (e as any)._networkId || (e as any).networkId || '';
}

function getStartNetworkId(e: EntityBase): string {
    return (e as any)._startNetworkId || (e as any).startNetworkId || '';
}

function getEndNetworkId(e: EntityBase): string {
    return (e as any)._endNetworkId || (e as any).endNetworkId || '';
}

function setNetworkId(e: EntityBase, id: string): void {
    (e as any)._networkId = id;
    if (typeof (e as any).setModified === 'function') (e as any).setModified();
}

function setStartNetworkId(e: EntityBase, id: string): void {
    (e as any)._startNetworkId = id;
}

function setEndNetworkId(e: EntityBase, id: string): void {
    (e as any)._endNetworkId = id;
}

function generateNetworkId(): string {
    return `nn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export class NetworkService {
    private pendingAddedEntities: EntityBase[] = [];
    private rebuildTimer: ReturnType<typeof setTimeout> | null = null;
    private cleanups: (() => void)[] = [];

    private erasedNodes: EntityBase[] = [];
    private erasedBranches: EntityBase[] = [];
    private cascadeTimer: ReturnType<typeof setTimeout> | null = null;
    private cascadeProcessing = false;

    /** When true, rebuildTopology skips paste validation (drawing command in progress) */
    drawingInProgress = false;

    generateNetwork(data: NetworkData): { nodes: NetworkNodeEnt[], branches: NetworkBranchEnt[] } {
        const nodeMap = new Map<string, NetworkNodeEnt>();
        const nodes: NetworkNodeEnt[] = [];
        const branches: NetworkBranchEnt[] = [];

        for (const nd of data.nodes) {
            const node = NetworkNodeEnt.create([nd.x ?? 0, nd.y ?? 0], nd.label, nd.radius);
            node.setDefaults();
            nodeMap.set(nd.id, node);
            nodes.push(node);
        }

        for (const bd of data.branches) {
            const startNode = nodeMap.get(bd.startNodeId);
            const endNode = nodeMap.get(bd.endNodeId);
            if (!startNode || !endNode) continue;
            const branch = NetworkBranchEnt.create(
                startNode.position, endNode.position,
                startNode.networkId, endNode.networkId,
                bd.label, bd.showArrow,
                startNode.radius, endNode.radius,
                bd.bulge
            );
            branch.setDefaults();
            branches.push(branch);
        }

        return { nodes, branches };
    }

    linkBranches(nodes: NetworkNodeEnt[], branches: NetworkBranchEnt[]): void {
        const nodeByNetId = new Map<string, NetworkNodeEnt>();
        for (const n of nodes) nodeByNetId.set(n.networkId, n);
        for (const b of branches) {
            const sn = nodeByNetId.get(b.startNetworkId);
            const en = nodeByNetId.get(b.endNetworkId);
            if (sn && en) b.setSourceNodes(sn.id, en.id);
        }
    }

    rebuildTopology(entities: EntityBase[]): void {
        const docId = Engine.currentDoc?.docId;
        if (docId === undefined) return;

        const pastedNodes = entities.filter(e => isNetworkNode(e));
        const pastedBranches = entities.filter(e => isNetworkBranch(e));
        if (pastedNodes.length === 0 && pastedBranches.length === 0) return;

        // Validate completeness for paste scenarios ONLY.
        // Paste creates clones (objectId starts with "clone_").
        // Skip for: drawing commands (drawingInProgress), undo restores, and normal entity creation.
        const allNetworkEntities = [...pastedNodes, ...pastedBranches];
        const isFromPaste = allNetworkEntities.length > 0 &&
            allNetworkEntities.every(e => {
                const oid = (e as any).objectId;
                return oid && oid.startsWith('clone_');
            });

        if (!this.drawingInProgress && isFromPaste) {
            let reject = false;

            if (pastedNodes.length > 0 && pastedBranches.length === 0) {
                reject = true;
            } else if (pastedBranches.length > 0 && pastedNodes.length === 0) {
                reject = true;
            } else if (pastedNodes.length > 0 && pastedBranches.length > 0) {
                const pastedNodeNetIds = new Set(pastedNodes.map(n => getNetworkId(n)));
                const referencedByBranches = new Set<string>();
                for (const b of pastedBranches) {
                    const sid = getStartNetworkId(b);
                    const eid = getEndNetworkId(b);
                    if (sid) referencedByBranches.add(sid);
                    if (eid) referencedByBranches.add(eid);
                }

                const hasOrphanBranch = pastedBranches.some(b => {
                    const sid = getStartNetworkId(b);
                    const eid = getEndNetworkId(b);
                    return !pastedNodeNetIds.has(sid) || !pastedNodeNetIds.has(eid);
                });
                const hasOrphanNode = pastedNodes.some(n => !referencedByBranches.has(getNetworkId(n)));
                reject = hasOrphanBranch || hasOrphanNode;
            }

            if (reject) {
                const toDelete = [...pastedNodes, ...pastedBranches].filter(e => e.isAlive);
                if (toDelete.length > 0) {
                    // Suppress cascade delete — we're just cleaning up rejected paste,
                    // not deleting real network entities
                    this.cascadeProcessing = true;
                    try {
                        Engine.eraseEntities(toDelete, { recordUndo: false });
                    } finally {
                        this.cascadeProcessing = false;
                    }
                }
                return;
            }
        }

        // Remap duplicate networkIds (pasted copy vs existing original)
        const idMapping = new Map<string, string>();
        const allAliveNodes = Engine.getEntities(e => isAliveNetworkNode(e));

        for (const pNode of pastedNodes) {
            const netId = getNetworkId(pNode);
            if (!netId) continue;
            if (allAliveNodes.some(n => n !== pNode && getNetworkId(n) === netId)) {
                const newId = generateNetworkId();
                setNetworkId(pNode, newId);
                idMapping.set(netId, newId);
            }
        }

        // Update pasted branch references
        for (const pBranch of pastedBranches) {
            const oldStart = getStartNetworkId(pBranch);
            const oldEnd = getEndNetworkId(pBranch);
            if (idMapping.has(oldStart)) setStartNetworkId(pBranch, idMapping.get(oldStart)!);
            if (idMapping.has(oldEnd)) setEndNetworkId(pBranch, idMapping.get(oldEnd)!);
        }

        // Register reactors and sync endpoints from nodes
        let needsRegen = false;
        for (const pBranch of pastedBranches) {
            if (getStartNetworkId(pBranch) && getEndNetworkId(pBranch)) {
                if (typeof (pBranch as any).tryRegisterReactor === 'function') {
                    (pBranch as any).tryRegisterReactor(docId);
                }
                if (typeof (pBranch as any).updateFromOwners === 'function') {
                    (pBranch as any).updateFromOwners();
                }
                needsRegen = true;
            }
        }

        if (needsRegen) {
            Engine.pcanvas?.regen(true);
        }
    }

    startListeners(): () => void {
        const eventManager = CadEventManager.getInstance();

        // --- Debounced EntityAdded for topology rebuild after paste ---
        const addedHandler = (args: any) => {
            const entities: EntityBase[] = args?.entities ? args.entities :
                args?.entity ? [args.entity] : [];
            for (const entity of entities) {
                if (isNetworkNode(entity) || isNetworkBranch(entity)) {
                    this.pendingAddedEntities.push(entity);
                }
            }
            if (this.pendingAddedEntities.length > 0) {
                if (this.rebuildTimer) clearTimeout(this.rebuildTimer);
                this.rebuildTimer = setTimeout(() => {
                    const pending = [...this.pendingAddedEntities];
                    this.pendingAddedEntities = [];
                    this.rebuildTimer = null;
                    this.rebuildTopology(pending);
                }, 150);
            }
        };
        eventManager.on(CadEvents.EntityAdded, addedHandler);
        eventManager.on(CadEvents.EntitiesAdded, addedHandler);
        this.cleanups.push(() => {
            eventManager.off(CadEvents.EntityAdded, addedHandler);
            eventManager.off(CadEvents.EntitiesAdded, addedHandler);
        });

        // --- EntitiesErased / EntityErased: cascade delete ---
        const erasedHandler = (args: any) => {
            if (this.cascadeProcessing) return;

            const entityList: EntityBase[] = args?.entities ? args.entities :
                args?.entity ? [args.entity] : [];
            if (entityList.length === 0) return;

            let queued = false;
            for (const entity of entityList) {
                if (isNetworkNode(entity)) {
                    this.erasedNodes.push(entity);
                    queued = true;
                } else if (isNetworkBranch(entity)) {
                    this.erasedBranches.push(entity);
                    queued = true;
                }
            }

            if (queued && !this.cascadeTimer) {
                this.cascadeTimer = setTimeout(() => {
                    this.cascadeTimer = null;
                    this.processCascadeDelete();
                }, 0);
            }
        };
        eventManager.on(CadEvents.EntitiesErased, erasedHandler);
        eventManager.on(CadEvents.EntityErased, erasedHandler);
        this.cleanups.push(() => {
            eventManager.off(CadEvents.EntitiesErased, erasedHandler);
            eventManager.off(CadEvents.EntityErased, erasedHandler);
        });

        return () => {
            for (const fn of this.cleanups) fn();
            this.cleanups = [];
            if (this.rebuildTimer) { clearTimeout(this.rebuildTimer); this.rebuildTimer = null; }
            if (this.cascadeTimer) { clearTimeout(this.cascadeTimer); this.cascadeTimer = null; }
            this.pendingAddedEntities = [];
            this.erasedNodes = [];
            this.erasedBranches = [];
        };
    }

    private processCascadeDelete(): void {
        this.cascadeProcessing = true;
        try {
            const deletedNodeNetIds = new Set(this.erasedNodes.map(n => getNetworkId(n)));
            const deletedBranchNodeNetIds = new Set<string>();
            for (const b of this.erasedBranches) {
                const sid = getStartNetworkId(b);
                const eid = getEndNetworkId(b);
                if (sid) deletedBranchNodeNetIds.add(sid);
                if (eid) deletedBranchNodeNetIds.add(eid);
            }
            this.erasedNodes = [];
            this.erasedBranches = [];

            // Phase 1: delete branches connected to erased nodes
            if (deletedNodeNetIds.size > 0) {
                const aliveBranches = Engine.getEntities(e => isAliveNetworkBranch(e));
                const branchesToDelete = aliveBranches.filter(b => {
                    const sid = getStartNetworkId(b);
                    const eid = getEndNetworkId(b);
                    return deletedNodeNetIds.has(sid) || deletedNodeNetIds.has(eid);
                });
                if (branchesToDelete.length > 0) {
                    for (const b of branchesToDelete) {
                        const sid = getStartNetworkId(b);
                        const eid = getEndNetworkId(b);
                        if (sid) deletedBranchNodeNetIds.add(sid);
                        if (eid) deletedBranchNodeNetIds.add(eid);
                    }
                    Engine.eraseEntities(branchesToDelete);
                }
            }

            // Phase 2: delete orphaned nodes
            if (deletedBranchNodeNetIds.size > 0) {
                const remainingBranches = Engine.getEntities(e => isAliveNetworkBranch(e));

                const stillReferencedNetIds = new Set<string>();
                for (const b of remainingBranches) {
                    const sid = getStartNetworkId(b);
                    const eid = getEndNetworkId(b);
                    if (sid) stillReferencedNetIds.add(sid);
                    if (eid) stillReferencedNetIds.add(eid);
                }
                const candidateNetIds = [...deletedBranchNodeNetIds].filter(
                    id => !stillReferencedNetIds.has(id) && !deletedNodeNetIds.has(id)
                );
                if (candidateNetIds.length > 0) {
                    const allNodes = Engine.getEntities(e => isAliveNetworkNode(e));
                    const orphanNetIdSet = new Set(candidateNetIds);
                    const orphanNodes = allNodes.filter(n => orphanNetIdSet.has(getNetworkId(n)));
                    if (orphanNodes.length > 0) {
                        Engine.eraseEntities(orphanNodes);
                    }
                }
            }
        } finally {
            this.cascadeProcessing = false;
        }
    }
}

let serviceInstance: NetworkService | null = null;
export function getNetworkService(): NetworkService {
    if (!serviceInstance) {
        serviceInstance = new NetworkService();
    }
    return serviceInstance;
}
