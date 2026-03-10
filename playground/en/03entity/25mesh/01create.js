window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建三维网格--MeshEnt基本创建示例（立方体、金字塔、地形网格）
        const { MainView, initCadContainer, MeshEnt, Engine, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // --- Example 1: Cube wireframe (8 vertices, 12 triangles) ---
        const cubeVerts = [
            0,0,0,  100,0,0,  100,100,0,  0,100,0,   // bottom face z=0
            0,0,100, 100,0,100, 100,100,100, 0,100,100  // top face z=100
        ];
        const cubeIndices = [
            // bottom
            0,1,2, 0,2,3,
            // top
            4,6,5, 4,7,6,
            // front
            0,1,5, 0,5,4,
            // back
            2,3,7, 2,7,6,
            // left
            0,3,7, 0,7,4,
            // right
            1,2,6, 1,6,5
        ];
        
        const cube = new MeshEnt();
        cube.fromDb({
            type: "MESH",
            sourceType: "3DSOLID",
            vertices: cubeVerts,
            indices: cubeIndices,
            color: 5 // blue
        });
        cube.setDefaults();
        cube.color = 5;
        
        // --- Example 2: Pyramid (5 vertices, 6 triangles) ---
        const pyrVerts = [
            200,0,0,  300,0,0,  300,100,0,  200,100,0, // base
            250,50,80  // apex
        ];
        const pyrIndices = [
            // base
            0,1,2, 0,2,3,
            // sides
            0,1,4, 1,2,4, 2,3,4, 3,0,4
        ];
        
        const pyramid = new MeshEnt();
        pyramid.fromDb({
            type: "MESH",
            sourceType: "3DSOLID",
            vertices: pyrVerts,
            indices: pyrIndices,
            color: 1 // red
        });
        pyramid.setDefaults();
        pyramid.color = 1;
        
        // --- Example 3: Terrain grid (4x4 grid with varying Z) ---
        const terrainVerts = [];
        const terrainIndices = [];
        const gridSize = 4;
        const cellSize = 30;
        const baseX = 400, baseY = 0;
        
        for (let row = 0; row <= gridSize; row++) {
            for (let col = 0; col <= gridSize; col++) {
                const x = baseX + col * cellSize;
                const y = baseY + row * cellSize;
                const z = Math.sin(col * 0.8) * Math.cos(row * 0.8) * 20;
                terrainVerts.push(x, y, z);
            }
        }
        
        const cols = gridSize + 1;
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const i = row * cols + col;
                terrainIndices.push(i, i + 1, i + cols);
                terrainIndices.push(i + 1, i + cols + 1, i + cols);
            }
        }
        
        const terrain = new MeshEnt();
        terrain.fromDb({
            type: "MESH",
            sourceType: "POLYMESH",
            vertices: terrainVerts,
            indices: terrainIndices,
            meshSize: [gridSize + 1, gridSize + 1],
            color: 3 // green
        });
        terrain.setDefaults();
        terrain.color = 3;
        
        Engine.addEntities([cube, pyramid, terrain]);
        Engine.zoomExtents();
        
        console.log("三维网格已创建");
        console.log("立方体:", cube.vertexCount, "顶点,", cube.triangleCount, "面");
        console.log("金字塔:", pyramid.vertexCount, "顶点,", pyramid.triangleCount, "面");
        console.log("地形:", terrain.vertexCount, "顶点,", terrain.triangleCount, "面");
        
        message.info("三维网格：蓝=立方体, 红=金字塔, 绿=地形网格");
        
    } catch (e) {
        console.error(e);
        if (typeof vjcad !== 'undefined' && vjcad.message) {
            vjcad.message.error({
                content: "catch error: " + (e.message || e.response || JSON.stringify(e).substr(0, 80)),
                duration: 60,
                key: "err"
            });
        }
    }
};
