/**
 * Coordinate transformation for mapping CAD coordinates to 3D scene coordinates.
 * Handles large-coordinate normalization so that both very large and very small
 * CAD drawings render at a comfortable 3D scale.
 *
 * CAD (x, y, z) -> Three.js (x, z, -y):
 *   Three.js X =  CAD X
 *   Three.js Y =  CAD Z  (elevation becomes up-axis)
 *   Three.js Z = -CAD Y
 */

const TARGET_SIZE = 50;

export interface BBox3d {
    min: [number, number, number];
    max: [number, number, number];
}

export class CoordTransform {
    centerX = 0;
    centerY = 0;
    centerZ = 0;
    scale = 1;
    scaleZ = 1;

    computeFromBBox(bbox: BBox3d, scaleZ = 1): void {
        this.scaleZ = scaleZ;
        this.centerX = (bbox.min[0] + bbox.max[0]) / 2;
        this.centerY = (bbox.min[1] + bbox.max[1]) / 2;
        this.centerZ = (bbox.min[2] + bbox.max[2]) / 2;

        const dx = bbox.max[0] - bbox.min[0];
        const dy = bbox.max[1] - bbox.min[1];
        const dz = (bbox.max[2] - bbox.min[2]) * scaleZ;
        const maxDim = Math.max(dx, dy, dz, 1e-6);
        this.scale = TARGET_SIZE / maxDim;
    }

    /**
     * CAD (x,y,z) -> Three.js (x, z*scaleZ, -y)
     * with center offset and uniform scale applied.
     */
    toWorld(x: number, y: number, z: number): [number, number, number] {
        const wx = (x - this.centerX) * this.scale;
        const wy = ((z - this.centerZ) * this.scaleZ) * this.scale;
        const wz = -(y - this.centerY) * this.scale;
        return [wx, wy, wz];
    }

    /**
     * Three.js (wx, wy, wz) -> CAD (x, y, z)
     */
    fromWorld(wx: number, wy: number, wz: number): [number, number, number] {
        const x = wx / this.scale + this.centerX;
        const y = -wz / this.scale + this.centerY;
        const z = wy / (this.scaleZ * this.scale) + this.centerZ;
        return [x, y, z];
    }

    getCameraDistance(): number {
        return TARGET_SIZE * 1.5;
    }
}
