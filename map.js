export const ROWS = 7;
export const COLS = 7;

export const MAP = generateRandomMaze(ROWS, COLS);

export const CELL_SIZE = 10;

export const MIN_WALL_H = 3;
export const MAX_WALL_H = 18;

export function getCellCenter(col, row){
  return new THREE.Vector3(col*CELL_SIZE + CELL_SIZE/2, 0, row*CELL_SIZE + CELL_SIZE/2);
}

export function worldToGrid(pos){
  return { x: Math.floor(pos.x / CELL_SIZE), y: Math.floor(pos.z / CELL_SIZE) };
}

export function isCellFree(col, row){
  if(col < 0 || row < 0 || col >= COLS || row >= ROWS) return false;
  return MAP[row][col] === 0;
}
export function generateRandomMaze(width, height, extraConnections = 10) {
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

  return maze;
}
