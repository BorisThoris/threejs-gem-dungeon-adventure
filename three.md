# Three.js Procedural Dungeon – AI Execution Blueprint

> **Goal:** Build a deterministic, seed‑driven procedural dungeon system in **React + Three.js (react‑three‑fiber)** using **Zustand** for state, and instantiate rooms with **existing 3D Editor biome assets** (prefabs/tiles/props) already in the project. This document is written so an AI (or engineer) can follow step‑by‑step and deliver a working implementation.

---

## 0) High‑Level Architecture

**Phases**
1. **Layout Phase (Graph)** – Generate an abstract dungeon graph (rooms + corridors + sockets).
2. **Room Interior Phase** – For each room, run a local generator to produce tiles/props/markers using biome rules.
3. **Instantiation Phase (3D)** – Resolve graph into world‑space by snapping prefabs via sockets; stream meshes; build navmesh.
4. **Decoration Phase** – Apply materials/lighting/props based on biome; optional WFC/tile passes for micro‑details.
5. **Runtime Phase** – Navigation, spawning, interaction, streaming, and save/load.

**Key Ideas**
- Treat the layout as **graph + sockets**.
- Each room node owns a **local generation state** (grid, props, markers) driven by **RoomGenRules**.
- Snap prefabs by matching **typed sockets** (e.g., `Door::2m`, `Stairs::Up`).
- Determinism via **seed** and PRNG wrapper.

---

## 1) Tech Stack & Libraries
- **React 18**, **react‑three‑fiber** (R3F) for scene.
- **three** for core 3D.
- **Zustand** for global store.
- **three-stdlib** utilities (BufferGeometryUtils, GLTFLoader, etc.).
- **@react-three/drei** for helpers (KeyboardControls, useGLTF, etc.).
- **Optional**: Recast.js (navmesh), Pathfinding library.
- **Optional**: lodash-es, nanoid, zod (schema validation), immer (immutability helpers).

---

## 2) Directory Structure (Proposed)
```
src/
  ai/
    tasks/                  # structured tasks for AI agents
  assets/
    biomes/                 # your existing 3D Editor biome prefabs (glTF + metadata)
  core/
    math/
      rng.ts
      grid.ts
      aabb.ts
    prng/
      mulberry32.ts
    schemas/
      dungeon.ts           # zod schemas & TypeScript types
    generation/
      layout/
        bsp.ts
        mst.ts
        corridors.ts
        constraints.ts
      room/
        rules.ts
        tiles.ts
        props.ts
        markers.ts
        sockets.ts
      pipeline.ts          # end-to-end orchestration
  runtime/
    instantiate/
      sockets.ts           # socket alignment & snapping
      placement.ts         # overlap checks, AABB grid/voxel
      navmesh.ts
      merge.ts             # geometry merging/instancing
    biomes/
      registry.ts          # maps biome keys to prefabs & rules
      materials.ts
  store/
    dungeonStore.ts        # Zustand global store
    selectors.ts
  ui/
    panels/
      DungeonPanel.tsx     # controls: seed, size, regen, freeze
      RoomPanel.tsx        # per-room config
    overlays/
      DebugOverlays.tsx
  scene/
    DungeonScene.tsx
    RoomInstance.tsx
    CorridorInstance.tsx
  app.tsx
```

---

## 3) Data Schemas (TypeScript)

```ts
// core/schemas/dungeon.ts
export type Seed = number;
export type Deg = 0 | 90 | 180 | 270;

export type SocketType =
  | "Door::2m"
  | "Door::3m"
  | "Stairs::Up"
  | "Stairs::Down";

export type RoomKind =
  | "Generic"
  | "Treasure"
  | "Boss"
  | "Hub"
  | "Shop"
  | "Puzzle";

export interface Socket {
  id: string;
  type: SocketType;
  // local (room) coordinates in world units
  localPos: [number, number, number];
  facingY: Deg;
}

export interface RoomGenRules {
  tileSize: number;         // world units per grid cell
  gridW: number;            // X in cells
  gridH: number;            // Z in cells
  theme: string;            // biome key
  kindsAllowed: RoomKind[];
  weights?: Partial<Record<RoomKind, number>>;
  propDensity: number;      // 0..1
  enemyDensity: number;     // 0..1
  floorPlan: "open" | "pillars" | "clustered" | "mazelets" | "wfc";
  keepDoorClearRadius: number; // in cells
  minClearArea: number;     // required largest open blob (cells)
  propSets: string[];       // keys into biome registry
  tileSet: string;          // biome tileset key
}

export interface RoomLocalState {
  seed: Seed;
  tiles: string[][];        // e.g., "FloorA", "Wall", "Pit"
  props: Array<{ id: string; kind: string; pos: [number,number,number]; rotY: Deg }>;
  markers: Array<{ type: string; pos: [number,number,number] }>;
  navmeshPatch?: unknown;
  frozen?: boolean;
}

export interface RoomNode {
  id: string;
  kind: RoomKind;
  worldPos: [number, number, number];
  rotY: Deg;
  sockets: Socket[];
  genConfig: RoomGenRules;
  state: RoomLocalState;
}

export interface CorridorEdge {
  id: string;
  from: string; // room id
  to: string;   // room id
  path: [number, number, number][]; // polyline (world coords)
  width: number; // world units
  sockets?: [Socket, Socket];
}

export interface DungeonGraph {
  seed: Seed;
  rooms: RoomNode[];
  corridors: CorridorEdge[];
  entrance?: { roomId: string; socketId: string };
  exit?: { roomId: string; socketId: string };
}

export interface InstancedModule {
  id: string;
  prefab: string; // biome prefab key, e.g., "Catacomb_Room_8x8_v2"
  position: [number, number, number];
  rotationY: Deg;
  sockets: Socket[]; // world-space sockets after placement
}

export interface RuntimeLevel {
  seed: Seed;
  modules: InstancedModule[];
  navmesh?: unknown;
}
```

---

## 4) Zustand Store Design

```ts
// store/dungeonStore.ts
import create from 'zustand';
import { DungeonGraph, RoomNode, Seed, RuntimeLevel } from '@/core/schemas/dungeon';

interface DungeonState {
  seed: Seed;
  graph: DungeonGraph | null;
  runtime: RuntimeLevel | null;
  selectedRoomId?: string;
  ops: {
    setSeed: (seed: Seed) => void;
    generateLayout: (params?: Partial<{ roomCount: number; algo: 'bsp'|'poisson'; }>) => void;
    regenRoom: (roomId: string, opts?: Partial<{ seedOffset: number; rules: Partial<RoomNode['genConfig']> }>) => void;
    instantiateGraph: () => Promise<void>;
    freezeRoom: (roomId: string, frozen: boolean) => void;
    saveLevel: () => Promise<void>;
    loadLevel: (json: unknown) => void;
  };
}

export const useDungeonStore = create<DungeonState>((set, get) => ({
  seed: 12345,
  graph: null,
  runtime: null,
  ops: {
    setSeed: (seed) => set({ seed }),
    generateLayout: (params) => {
      // call core/generation/pipeline.layout(seed, params)
      // set({ graph })
    },
    regenRoom: (roomId, opts) => {
      // find room, mutate genConfig with opts.rules, call room generator
      // then set({ graph: updated })
    },
    instantiateGraph: async () => {
      // call runtime/instantiate placement + biome registry
      // set({ runtime })
    },
    freezeRoom: (roomId, frozen) => {
      // toggle room.state.frozen
    },
    saveLevel: async () => { /* serialize runtime + graph */ },
    loadLevel: (json) => { /* de-serialize */ },
  },
}));
```

**Notes**
- Keep **graph** (abstract) and **runtime** (placed modules) separate.
- Write selectors for UI panels (seed, room list, presets, etc.).

---

## 5) Biome & Prefab Registry

Map your existing 3D Editor assets to **biome entries** with metadata: socket positions, footprint, allowed neighbors, tags.

```ts
// runtime/biomes/registry.ts
export interface PrefabDef {
  key: string;                // "Catacomb_Room_8x8_v2"
  gltf: string;               // path to GLTF/GLB
  footprint: { w: number; h: number; y: number }; // world units
  sockets: Array<{ id: string; type: SocketType; localPos: [number,number,number]; facingY: Deg }>;
  tags: string[];             // ["Room","Catacombs","8x8"]
  allowedNeighbors?: string[]; // optional constraints
}

export interface BiomeDef {
  key: string;                // "Catacombs"
  roomPrefabs: PrefabDef[];
  corridorPrefabs: PrefabDef[];
  propSets: Record<string, string[]>; // setName -> prefab keys
  tilesets: Record<string, { materialKeys: string[]; rules?: unknown }>;
  rulesDefaults: Partial<RoomGenRules>;
}

export const BIOMES: Record<string, BiomeDef> = { /* fill from Editor assets */ };
```

> **Action:** For each Editor prefab, export a small JSON sidecar (or embed in GLTF extras) describing **sockets** and **footprint**.

---

## 6) Generation Pipeline (End‑to‑End)

```ts
// core/generation/pipeline.ts
export async function generateDungeon(seed: Seed, params: { roomCount: number }) {
  const graph = await generateLayout(seed, params);         // Phase 1
  const withRooms = await fillRooms(graph);                 // Phase 2
  return withRooms;                                         // still abstract
}

export async function instantiateDungeon(graph: DungeonGraph, biomeKey: string) {
  const modules = await placePrefabs(graph, biomeKey);      // Phase 3
  const decorated = await decorateModules(modules, biomeKey);// Phase 4
  const navmesh = await buildNavmesh(decorated);            // optional
  return { seed: graph.seed, modules: decorated, navmesh };
}
```

**Phase 1: Layout**
- Place candidate rooms (BSP or Poisson disk + rejection).
- Connect with **MST** (minimum spanning tree), add loop edges (p%) for cycles.
- Route corridors (orthogonal L‑shapes or A*) along free space.
- Create sockets at each room ↔ corridor boundary.

**Phase 2: Room Interiors**
- For each room, if `state.frozen !== true`, run `generateRoomState(genConfig, sockets, seed)`.
- Ensure **keepDoorClearRadius**, **minClearArea**.

**Phase 3: Instantiation**
- For each room/corridor, pick a compatible prefab from biome registry by **size, tags, sockets**.
- Solve placement: translate/rotate to align matched socket pairs. Validate with AABB/voxel occupancy.
- Backtrack if overlap; otherwise commit.

**Phase 4: Decoration**
- Spawn props by density rules + blue‑noise sampler (respect door clear zones).
- Apply materials/tileset.
- Generate lights from light sockets or spacing rules.

---

## 7) Room Interior Algorithms (Deterministic)

```ts
export function generateRoomState(rules: RoomGenRules, sockets: Socket[], seed: Seed, libs: { tiles: any; props: any; }): RoomLocalState {
  const rng = mulberry32(seed);
  const grid = makeBaseGrid(rules.gridW, rules.gridH, 'FloorA');

  carvePerimeterWalls(grid);
  carveDoorAisles(grid, sockets, { widthCells: 2 });

  switch (rules.floorPlan) {
    case 'pillars': addPillarsBlueNoise(grid, rng, { density: 0.05 }); break;
    case 'clustered': addClusters(grid, rng, { clusters: 3, radius: 2 }); break;
    case 'mazelets': addMiniMazelets(grid, rng, { count: 2, size: 4 }); break;
    case 'wfc': applyMicroWFC(grid, rules.tileSet, rng); break;
    default: /* open */
  }

  enforceLargestClearBlob(grid, rules.minClearArea);
  const props = scatterProps(grid, rng, rules.propDensity, sockets, rules.keepDoorClearRadius);
  const markers = buildMarkers(grid, rng, rules.enemyDensity);

  return { seed, tiles: grid, props, markers, frozen: false };
}
```

---

## 8) Socket Snapping & Placement (3D)

**Algorithm**
1. Maintain world‑space **occupancy grid** or BVH of placed modules.
2. Pick a start room; place at `(0,0,0)`.
3. BFS over graph edges; for each connection, try matching a prefab whose **socket type** and **relative orientation** can meet the parent socket.
4. Compute transform: `T = ParentWorld * Align(ChildSocket → ParentSocket)`.
5. Overlap test (AABB / voxel). If fail, try another prefab or rotate 90° increments; if still fail, backtrack.

```ts
// runtime/instantiate/sockets.ts
export function alignSocketTransforms(parent: Socket, child: Socket) {
  // Return a matrix that moves child so its socket matches parent
}
```

---

## 9) Three.js / R3F Implementation Notes

- Load prefab GLTF once, cache geometry + materials.
- Use **InstancedMesh** for repeated props (crates, torches, pillars).
- Merge static geometry per material to reduce draw calls.
- Partition world into **chunks/cells** (e.g., 32×32m) and only render nearby.
- Optional **portal culling** using doorways.
- Generate/navmesh after instantiation; stitch across door volumes.

**Scene Components**
- `<DungeonScene />` – subscribes to `runtime.modules`, maps to `<ModuleInstance />`.
- `<ModuleInstance />` – loads prefab, applies transform, spawns child props/lights.
- `<DebugOverlays />` – draws sockets, AABBs, room grids.

---

## 10) Save/Load & Determinism

- Serialize `{ seed, graph (with room.state), runtime.modules minimal, biomeKey }`.
- Rebuild transient data (merged meshes, navmesh) on load as needed.
- Use a single PRNG per phase; avoid `Math.random()`.

---

## 11) Editor Integration (Biomes)

- **Source of truth**: `BIOMES` registry.
- Each Editor asset must expose:
  - `prefab.key`, `gltf` path
  - `footprint { w, h, y }`
  - `sockets[]` (id, type, localPos, facingY)
  - optional `tags`, `allowedNeighbors`
- Provide a small conversion script to **export socket empties** from the Editor to JSON.

---

## 12) UI Panels (Minimal)

- **DungeonPanel**
  - Seed (number)
  - Room count, algorithm (BSP/Poisson)
  - Buttons: Generate Layout, Instantiate, Decorate, Build Navmesh, Save JSON
- **RoomPanel**
  - Selected room id/kind/theme
  - Width/Height (grid cells)
  - Floor plan (open/pillars/clustered/mazelets/wfc)
  - Prop density, Enemy density
  - Buttons: Re‑roll, Re‑roll Props, Freeze/Unfreeze

---

## 13) Performance Checklist

- [ ] Merge static meshes by material.
- [ ] InstancedMesh for repeats.
- [ ] Texture atlases per biome.
- [ ] Chunked rendering + frustum culling.
- [ ] Optional portal/occlusion culling.
- [ ] Avoid per‑frame allocations; memoize geometry.
- [ ] Use `useGLTF.preload()` for common prefabs.

---

## 14) Testing Strategy

- **Unit**: PRNG determinism; layout constraints; socket alignment math.
- **Snapshot**: given a seed → room tiles/props stable.
- **Integration**: overlap tests with randomized prefab sequences.
- **Visual**: Debug overlays for sockets, occupancy, navmesh portals.

---

## 15) Example Tasks for an AI Agent

1. **Scaffold** directories (Section 2) and add placeholder files.
2. Implement `mulberry32(seed)` and a PRNG wrapper; ban `Math.random()` in generators.
3. Implement `generateLayout(seed, { roomCount })` using BSP + MST + corridor routing.
4. Implement `generateRoomState(rules, sockets, seed)` with floor‑plan strategies and constraints.
5. Build `BIOMES` registry from existing Editor assets (export socket JSONs).
6. Implement socket alignment + placement with AABB occupancy grid.
7. Implement decoration pass (props, lights) with blue‑noise scatter.
8. Implement R3F `<DungeonScene />` that renders runtime modules (merged + instanced).
9. Add Zustand store and basic UI panels; wire buttons to ops.
10. Optional: Recast.js navmesh build and stitching.
11. Ship a `save/load` JSON flow.

---

## 16) Acceptance Criteria (Definition of Done)

- Given a seed, **Generate Layout** yields a room/corridor graph with sockets and no disconnected components.
- **Instantiate** places compatible prefabs without overlaps (backtracking succeeds for >95% seeds; failure is retried up to N times).
- Each room’s **interior** matches its rules and respects door clear zones and min clear area.
- Biome props and tiles are pulled from existing Editor assets and appear in rooms as expected.
- The scene renders at 60 fps on a mid‑range GPU with chunking enabled for a medium dungeon.
- **Save/Load** reproduces the same level.

---

## 17) Example JSON (Minimal Runtime Level)

```json
{
  "seed": 734129,
  "modules": [
    {
      "id": "room_A1",
      "prefab": "Catacomb_Room_8x8_v2",
      "position": [0,0,0],
      "rotationY": 90,
      "sockets": [
        {"id":"sA","type":"Door::2m","localPos":[4,0,0],"facingY":0}
      ]
    },
    {
      "id": "corr_AB",
      "prefab": "Catacomb_Corridor_2w_6l",
      "position": [8,0,0],
      "rotationY": 0,
      "sockets": []
    }
  ]
}
```

---

## 18) Pseudocode – Layout to Runtime

```ts
// 1) Layout
const graph = generateDungeon(seed, { roomCount: 16 });

// 2) Fill rooms
for (const room of graph.rooms) {
  if (!room.state || room.state.frozen !== true) {
    room.state = generateRoomState(room.genConfig, room.sockets, room.state?.seed ?? seed + hash(room.id), libs);
  }
}

// 3) Instantiate
const runtime = await instantiateDungeon(graph, 'Catacombs');

// 4) Render
<DungeonScene modules={runtime.modules} />
```

---

## 19) Troubleshooting

- **Overlaps detected repeatedly**: Increase prefab diversity; add smaller fallback rooms; relax corridor widths; increase backtracking depth.
- **Dead‑ends without sockets**: Ensure corridor routing always punches sockets into adjacent room perimeters.
- **Props block doors**: Increase `keepDoorClearRadius`; run a post pass to prune blocking props.
- **Non‑deterministic results**: Audit for stray `Math.random()`; seed all RNG users.

---

## 20) Next Steps (Quick Wins)
- Export socket metadata from current Editor prefabs to populate `BIOMES`.
- Implement BSP + MST layout with simple L‑corridors.
- Prototype one room floor plan (`open` + `pillars`).
- Implement socket snapping and visualize sockets in‑scene.
- Wire up Zustand store + UI to re‑roll a single room.

---

**End of Blueprint**

