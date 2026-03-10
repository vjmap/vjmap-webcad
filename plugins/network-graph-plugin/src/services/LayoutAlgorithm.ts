export type LayoutAlgorithmType = 'force' | 'circular' | 'hierarchical';

export interface LayoutOptions {
    algorithm: LayoutAlgorithmType;
    nodeSpacing: number;
    iterations?: number;
}

interface LayoutNode {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
}

interface LayoutEdge {
    source: string;
    target: string;
}

/**
 * Compute layout positions for a set of nodes and edges.
 * Returns a map of nodeId -> {x, y}.
 */
export function computeLayout(
    nodeIds: string[],
    edges: LayoutEdge[],
    options: LayoutOptions
): Map<string, { x: number; y: number }> {
    switch (options.algorithm) {
        case 'force': return forceDirectedLayout(nodeIds, edges, options);
        case 'circular': return circularLayout(nodeIds, options);
        case 'hierarchical': return hierarchicalLayout(nodeIds, edges, options);
        default: return forceDirectedLayout(nodeIds, edges, options);
    }
}

/**
 * Fruchterman-Reingold force-directed layout.
 */
function forceDirectedLayout(
    nodeIds: string[],
    edges: LayoutEdge[],
    options: LayoutOptions
): Map<string, { x: number; y: number }> {
    const n = nodeIds.length;
    if (n === 0) return new Map();
    if (n === 1) return new Map([[nodeIds[0], { x: 0, y: 0 }]]);

    const spacing = options.nodeSpacing || 150;
    const area = spacing * spacing * n;
    const k = Math.sqrt(area / n);
    const iterations = options.iterations || 100;

    const nodes: LayoutNode[] = nodeIds.map((id, i) => ({
        id,
        x: spacing * Math.cos(2 * Math.PI * i / n) + (Math.random() - 0.5) * 10,
        y: spacing * Math.sin(2 * Math.PI * i / n) + (Math.random() - 0.5) * 10,
        vx: 0, vy: 0
    }));

    const nodeMap = new Map<string, LayoutNode>();
    for (const node of nodes) nodeMap.set(node.id, node);

    let temperature = spacing * 2;
    const coolingFactor = temperature / (iterations + 1);

    for (let iter = 0; iter < iterations; iter++) {
        // Reset velocities
        for (const node of nodes) { node.vx = 0; node.vy = 0; }

        // Repulsive forces between all node pairs
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const u = nodes[i], v = nodes[j];
                let dx = u.x - v.x;
                let dy = u.y - v.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 0.01) { dx = (Math.random() - 0.5) * 0.1; dy = (Math.random() - 0.5) * 0.1; dist = 0.1; }

                const force = k * k / dist;
                const fx = dx / dist * force;
                const fy = dy / dist * force;
                u.vx += fx; u.vy += fy;
                v.vx -= fx; v.vy -= fy;
            }
        }

        // Attractive forces along edges
        for (const edge of edges) {
            const u = nodeMap.get(edge.source);
            const v = nodeMap.get(edge.target);
            if (!u || !v) continue;

            const dx = u.x - v.x;
            const dy = u.y - v.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.01) dist = 0.01;

            const force = dist * dist / k;
            const fx = dx / dist * force;
            const fy = dy / dist * force;
            u.vx -= fx; u.vy -= fy;
            v.vx += fx; v.vy += fy;
        }

        // Apply forces with temperature clamping
        for (const node of nodes) {
            const disp = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
            if (disp > 0) {
                const clamp = Math.min(disp, temperature) / disp;
                node.x += node.vx * clamp;
                node.y += node.vy * clamp;
            }
        }

        temperature -= coolingFactor;
        if (temperature < 0.1) temperature = 0.1;
    }

    // Center the layout at origin
    let cx = 0, cy = 0;
    for (const node of nodes) { cx += node.x; cy += node.y; }
    cx /= n; cy /= n;

    const result = new Map<string, { x: number; y: number }>();
    for (const node of nodes) {
        result.set(node.id, { x: node.x - cx, y: node.y - cy });
    }
    return result;
}

/**
 * Circular layout: nodes evenly distributed on a circle.
 */
function circularLayout(
    nodeIds: string[],
    options: LayoutOptions
): Map<string, { x: number; y: number }> {
    const n = nodeIds.length;
    if (n === 0) return new Map();
    if (n === 1) return new Map([[nodeIds[0], { x: 0, y: 0 }]]);

    const radius = (options.nodeSpacing || 150) * n / (2 * Math.PI);
    const result = new Map<string, { x: number; y: number }>();

    for (let i = 0; i < n; i++) {
        const angle = 2 * Math.PI * i / n - Math.PI / 2;
        result.set(nodeIds[i], {
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle)
        });
    }
    return result;
}

/**
 * Hierarchical layout: BFS layers from nodes with fewest incoming edges.
 */
function hierarchicalLayout(
    nodeIds: string[],
    edges: LayoutEdge[],
    options: LayoutOptions
): Map<string, { x: number; y: number }> {
    const n = nodeIds.length;
    if (n === 0) return new Map();
    if (n === 1) return new Map([[nodeIds[0], { x: 0, y: 0 }]]);

    const spacing = options.nodeSpacing || 150;
    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();

    for (const id of nodeIds) {
        inDegree.set(id, 0);
        adjacency.set(id, []);
    }
    for (const edge of edges) {
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
        adjacency.get(edge.source)?.push(edge.target);
    }

    // BFS from nodes with zero or minimal in-degree
    const visited = new Set<string>();
    const layers: string[][] = [];

    // Start with zero in-degree nodes, or the minimum if none
    let roots = nodeIds.filter(id => inDegree.get(id) === 0);
    if (roots.length === 0) {
        const minDeg = Math.min(...nodeIds.map(id => inDegree.get(id) || 0));
        roots = nodeIds.filter(id => inDegree.get(id) === minDeg);
    }

    let queue = [...roots];
    for (const id of queue) visited.add(id);

    while (queue.length > 0) {
        layers.push(queue);
        const nextQueue: string[] = [];
        for (const id of queue) {
            for (const neighbor of (adjacency.get(id) || [])) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    nextQueue.push(neighbor);
                }
            }
        }
        queue = nextQueue;
    }

    // Add any unvisited nodes as a final layer
    const remaining = nodeIds.filter(id => !visited.has(id));
    if (remaining.length > 0) layers.push(remaining);

    const result = new Map<string, { x: number; y: number }>();
    for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
        const layer = layers[layerIdx];
        const layerHeight = (layer.length - 1) * spacing;
        for (let i = 0; i < layer.length; i++) {
            result.set(layer[i], {
                x: layerIdx * spacing,
                y: i * spacing - layerHeight / 2
            });
        }
    }
    return result;
}
