import { CELL_SIZE } from "./map.js";

export function buildBridgePillar(col, row, height, scene) {
  const geo = new THREE.BoxGeometry(CELL_SIZE, height, CELL_SIZE);
  const mat = new THREE.MeshPhongMaterial({ color: 0x777777 });

  const mesh = new THREE.Mesh(geo, mat);

  mesh.position.set(
    col * CELL_SIZE + CELL_SIZE / 2,
    height / 2 - 15,
    row * CELL_SIZE + CELL_SIZE / 2
  );

  scene.add(mesh);
}

export function buildBridge(bridge, scene) {
  buildBridgePillar(bridge.from.x, bridge.from.y, bridge.height, scene);
  buildBridgePillar(bridge.to.x, bridge.to.y, bridge.height, scene);
  buildBridgeDeck(bridge.from, bridge.to, bridge.height, scene);
}

export function buildBridgeDeck(from, to, height, scene) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.abs(dx + dy) * CELL_SIZE;

  const geo = new THREE.BoxGeometry(
    dx !== 0 ? length : CELL_SIZE,
    1,
    dy !== 0 ? length : CELL_SIZE
  );

  const mat = new THREE.MeshPhongMaterial({ color: 0x996633 });
  const deck = new THREE.Mesh(geo, mat);

  const midX = (from.x + to.x + 1) / 2 * CELL_SIZE;
  const midZ = (from.y + to.y + 1) / 2 * CELL_SIZE;

  deck.position.set(midX, height-15, midZ);
  scene.add(deck);
}

