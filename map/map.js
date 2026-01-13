export const ROWS = 21;
export const COLS = 21;

export const MAP = generateRandomMaze(ROWS, COLS);
export const HEIGHT_MAP = generateHeightMap(ROWS, COLS);
export const BRIDGES = generateBridges(MAP, HEIGHT_MAP);

export const CELL_SIZE = 10;

export const MIN_WALL_H = 3;
export const MAX_WALL_H = 18;

export function getCellCenter(col, row){
  const h = HEIGHT_MAP[row][col];
  return new THREE.Vector3(
    col * CELL_SIZE + CELL_SIZE / 2,
    h,
    row * CELL_SIZE + CELL_SIZE / 2
  );
}

export function worldToGrid(pos){
  return { x: Math.floor(pos.x / CELL_SIZE), y: Math.floor(pos.z / CELL_SIZE) };
}

export function isCellFree(col, row){
  if(col < 0 || row < 0 || col >= COLS || row >= ROWS) return false;
  return MAP[row][col] === 0;
}

export function generateRandomMaze(width, height, extraConnections = -1) {
  if (extraConnections === -1) extraConnections = Math.sqrt(width * height)/1
  if (width % 2 === 0) width++;
  if (height % 2 === 0) height++;

  const maze = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 1)
  );

  const dirs = [
    { x: 2, y: 0 },
    { x: -2, y: 0 },
    { x: 0, y: 2 },
    { x: 0, y: -2 }
  ];

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function carve(x, y) {
    maze[y][x] = 0;
    const d = [...dirs];
    shuffle(d);

    for (const dir of d) {
      const nx = x + dir.x;
      const ny = y + dir.y;

      if (
        nx > 0 && nx < width &&
        ny > 0 && ny < height &&
        maze[ny][nx] === 1
      ) {
        maze[y + dir.y / 2][x + dir.x / 2] = 0;
        carve(nx, ny);
      }
    }
  }

  carve(1, 1);

  for (let i = 0; i < extraConnections; i++) {
    const x = 2 + Math.floor(Math.random() * (width - 4));
    const y = 2 + Math.floor(Math.random() * (height - 4));

    if (maze[y][x] === 1) {
      let corridors = 0;

      if (maze[y][x - 1] === 0) corridors++;
      if (maze[y][x + 1] === 0) corridors++;
      if (maze[y - 1][x] === 0) corridors++;
      if (maze[y + 1][x] === 0) corridors++;

      if (corridors >= 2) {
        maze[y][x] = 0;
      }
    }
  }

  const openAreaCount = Math.floor(Math.sqrt(width * height) / 6);
  carveOpenAreas(maze, openAreaCount);

  return maze;
}

function smoothStep(t) {
  return t * t * (3 - 2 * t);
}

export function generateHeightMap(rows, cols) {
  const heightMap = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0)
  );

  const hillCount = Math.floor((rows * cols) / 80);

  for (let i = 0; i < hillCount; i++) {
    const cx = Math.floor(Math.random() * cols);
    const cy = Math.floor(Math.random() * rows);

    const radius = 4 + Math.random() * 5;
    const height = 4 + Math.random() * 10;

    for (let y = Math.floor(cy - radius); y <= cy + radius; y++) {
      for (let x = Math.floor(cx - radius); x <= cx + radius; x++) {
        if (x < 0 || y < 0 || x >= cols || y >= rows) continue;

        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > radius) continue;

        const t = 1 - dist / radius;
        const smooth = smoothStep(t);

        heightMap[y][x] += smooth * height;
      }
    }
  }

  return heightMap;
}

export function generateBridges(map, heightMap, count = -1) {
  if (count === -1) count = Math.sqrt(ROWS * COLS)/2
  const bridges = [];
  let attempts = 0;

  while (bridges.length < count && attempts < count * 20) {
    attempts++;

    const horizontal = Math.random() < 0.5;

    let x1, y1, x2, y2;

    if (horizontal) {
      y1 = y2 = 2 + Math.floor(Math.random() * (ROWS - 4));
      x1 = 2 + Math.floor(Math.random() * (COLS - 8));
      x2 = x1 + 4 + Math.floor(Math.random() * 4);
    } else {
      x1 = x2 = 2 + Math.floor(Math.random() * (COLS - 4));
      y1 = 2 + Math.floor(Math.random() * (ROWS - 8));
      y2 = y1 + 4 + Math.floor(Math.random() * 4);
    }

    if (
      x1 <= 0 || y1 <= 0 || x2 <= 0 || y2 <= 0 ||
      x1 >= COLS - 1 || y1 >= ROWS - 1 ||
      x2 >= COLS - 1 || y2 >= ROWS - 1
    ) continue;

    if (map[y1][x1] !== 1 || map[y2][x2] !== 1) continue;

    let clear = true;

    const dx = Math.sign(x2 - x1);
    const dy = Math.sign(y2 - y1);

    let cx = x1 + dx;
    let cy = y1 + dy;

    while (cx !== x2 || cy !== y2) {
      if (map[cy][cx] === 1) {
        clear = false;
        break;
      }
      cx += dx;
      cy += dy;
    }

    if (!clear) continue;

    bridges.push({
      from: { x: x1, y: y1 },
      to:   { x: x2, y: y2 },
      height: 40 + Math.floor(Math.random() * 3) * 10
    });
  }

  return bridges;
}

export function getBridgeAt(col, row) {
  return BRIDGES.find(b =>
    (b.from.x === col && b.from.y === row) ||
    (b.to.x === col && b.to.y === row)
  );
}

export function getCellHeight(col, row) {
  const bridge = getBridgeAt(col, row);
  if (bridge) return bridge.height;
  return HEIGHT_MAP[row][col];
}

export function getBridgeHeight(x, y) {
  for (const bridge of BRIDGES) {
    const { from, to, height } = bridge;

    if (from.y === to.y && y === from.y) {
      if (isBetween(x, from.x, to.x)) {
        return height;
      }
    }

    if (from.x === to.x && x === from.x) {
      if (isBetween(y, from.y, to.y)) {
        return height;
      }
    }
  }

  console.warn(`getBridgeHeight called for (${x}, ${y}) but no bridge found`);
  return 0;
}

export function hasBridgeAt(x, y) {
  for (const bridge of BRIDGES) {
    const { from, to } = bridge;

    if (from.y === to.y && y === from.y) {
      if (isBetween(x, from.x, to.x)) {
        return true;
      }
    }

    if (from.x === to.x && x === from.x) {
      if (isBetween(y, from.y, to.y)) {
        return true;
      }
    }
  }

  return false;
}

export function cellHasBridge(x, y) {
  return hasBridgeAt(x, y);
}

function isBetween(v, a, b) {
  return v >= Math.min(a, b) && v <= Math.max(a, b);
}

function carveOpenAreas(maze, count = 3) {
  const height = maze.length;
  const width = maze[0].length;

  for (let i = 0; i < count; i++) {
    const cx = 2 + Math.floor(Math.random() * (width - 4));
    const cy = 2 + Math.floor(Math.random() * (height - 4));

    const radius = 2 + Math.floor(Math.random() * 2);

    for (let y = cy - radius; y <= cy + radius; y++) {
      for (let x = cx - radius; x <= cx + radius; x++) {

        if (
          x <= 0 || y <= 0 ||
          x >= width - 1 || y >= height - 1
        ) continue;

        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > radius) continue;

        if (Math.random() < 0.85) {
          maze[y][x] = 0;
        }
      }
    }
  }
}
