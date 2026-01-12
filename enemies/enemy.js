import { getCellCenter, getCellHeight, isCellFree } from "../map/map.js";
import { createBoarModel } from "./boar.js";
import { createMinotaurModel } from "./minotaur.js";

export function createEnemy(type, x, y) {
  return {
    type,

    gridX: x,
    gridY: y,
    mesh: null,
    targetPos: null,

    speed: type.speed,
    sightRange: type.sightRange,

    moving: false,
    frozen: false,
    state: "wander",

    dir: null,
    stepsLeft: 0,

    path: [],
    pathCooldown: 0,

    freezeTimer: 0,

    leftLeg: null,
    rightLeg: null,
    leftArm: null,
    rightArm: null,
    headGroup: null,

    time: 0,
  };
}


//0xff4444
export function spawnEnemy(scene, enemy) {
  /*const gGeo = new THREE.CapsuleGeometry(2, 8, 8, 16);
  const gMat = new THREE.MeshPhongMaterial({ color: enemy.type.color });

  enemy.mesh = new THREE.Mesh(gGeo, gMat);*/

  enemy.mesh = enemy.type.name == "minotaur" ? createMinotaurModel(scene, enemy) : createBoarModel(scene, enemy);
  const pos = getCellCenter(enemy.gridX, enemy.gridY);
  enemy.mesh.position.set(pos.x, 0, pos.z);
  enemy.targetPos = pos.clone();
  scene.add(enemy.mesh);
}

export function updateEnemy(enemy, delta, player){
  if(!enemy.mesh) return;

  if (enemy.frozen) {
    enemy.freezeTimer -= delta;
    if (enemy.freezeTimer <= 0) {
      enemy.frozen = false;
      enemy.freezeTimer = 0;
    }
    return;
  }

  if (!enemy.moving) {
    const seesPlayer = canSeePlayer(enemy, player);

    if (seesPlayer && enemy.type.canChase) {
      enemy.state = "chase";

      enemy.pathCooldown -= delta;
      if (enemy.path.length === 0 || enemy.pathCooldown <= 0) {
        enemy.path = findPath(
          { x: enemy.gridX, y: enemy.gridY },
          { x: player.gridX, y: player.gridY }
        ) || [];
        enemy.pathCooldown = 0.5;
      }

      if (enemy.path.length > 0) {
        const next = enemy.path.shift();
        enemy.gridX = next.x;
        enemy.gridY = next.y;
      } else {
        return;
      }

    } else {
      enemy.state = "wander";
      const step = chooseWanderDirection(enemy);
      if (!step) return;
      enemy.gridX += step.x;
      enemy.gridY += step.y;
    }


      enemy.targetPos = getCellCenter(enemy.gridX, enemy.gridY);
      enemy.targetPos.y = getCellHeight(enemy.gridX, enemy.gridY) - (enemy.type.name == "minotaur" ? 10 : 10);

      enemy.moveDir = new THREE.Vector3()
        .subVectors(enemy.targetPos, enemy.mesh.position)
        .setY(0)
        .normalize();

      enemy.moving = true;
    }

  if(enemy.moving){
    const dirVec = new THREE.Vector3().subVectors(enemy.targetPos, enemy.mesh.position);
    const dist = dirVec.length();
    if(dist < 0.01){
      enemy.mesh.position.copy(enemy.targetPos);
      enemy.moving = false;
    } else {
      dirVec.normalize();
      const step = enemy.speed * delta;
      if(step >= dist){
        enemy.mesh.position.copy(enemy.targetPos);
        enemy.moving = false;
      } else {
        enemy.mesh.position.add(dirVec.multiplyScalar(step));
      }
    }

    if (enemy.moveDir) {
      const angle = Math.atan2(enemy.moveDir.x, enemy.moveDir.z);
      enemy.mesh.rotation.y = angle;
    }

  }
}

function canSeePlayer(enemy, player) {
  const dx = player.gridX - enemy.gridX;
  const dy = player.gridY - enemy.gridY;

  if (Math.abs(dx) + Math.abs(dy) <= enemy.sightRange) {
    return true;
  }

  if (enemy.gridY === player.gridY) {
    const step = Math.sign(dx);
    for (let x = enemy.gridX + step; x !== player.gridX; x += step) {
      if (!isCellFree(x, enemy.gridY)) return false;
    }
    return true;
  }

  if (enemy.gridX === player.gridX) {
    const step = Math.sign(dy);
    for (let y = enemy.gridY + step; y !== player.gridY; y += step) {
      if (!isCellFree(enemy.gridX, y)) return false;
    }
    return true;
  }

  return false;
}

function chooseWanderDirection(enemy) {
  const dirs = [
    [1,0], [-1,0], [0,1], [0,-1]
  ];

  if (enemy.dir && enemy.stepsLeft > 0) {
    const [dx, dy] = enemy.dir;
    if (isCellFree(enemy.gridX + dx, enemy.gridY + dy)) {
      enemy.stepsLeft--;
      return { x: dx, y: dy };
    }
  }

  const shuffled = dirs.sort(() => Math.random() - 0.5);
  for (const d of shuffled) {
    if (isCellFree(enemy.gridX + d[0], enemy.gridY + d[1])) {
      enemy.dir = d;
      enemy.stepsLeft = 2 + Math.floor(Math.random() * 4);
      return { x: d[0], y: d[1] };
    }
  }

  return null;
}

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function findPath(start, goal) {
  const open = [];
  const closed = new Set();

  const key = (x, y) => `${x},${y}`;

  open.push({
    x: start.x,
    y: start.y,
    g: 0,
    h: heuristic(start, goal),
    parent: null
  });

  while (open.length > 0) {
    open.sort((a, b) => (a.g + a.h) - (b.g + b.h));
    const current = open.shift();

    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      let c = current;
      while (c.parent) {
        path.unshift({ x: c.x, y: c.y });
        c = c.parent;
      }
      return path;
    }

    closed.add(key(current.x, current.y));

    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ];

    for (const n of neighbors) {
      if (!isCellFree(n.x, n.y)) continue;
      if (closed.has(key(n.x, n.y))) continue;

      const g = current.g + 1;
      const existing = open.find(o => o.x === n.x && o.y === n.y);

      if (!existing || g < existing.g) {
        const node = {
          x: n.x,
          y: n.y,
          g,
          h: heuristic(n, goal),
          parent: current
        };

        if (!existing) open.push(node);
        else Object.assign(existing, node);
      }
    }
  }

  return null;
}
