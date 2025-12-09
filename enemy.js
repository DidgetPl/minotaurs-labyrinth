import { COLS, ROWS, getCellCenter, isCellFree } from "./map.js";

export let enemy = {
  gridX: COLS - 2,
  gridY: ROWS - 2,
  mesh: null,
  targetPos: null,
  speed: 15,
  moving: false
};

export function spawnEnemy(scene){
  const gGeo = new THREE.SphereGeometry(3,12,12);
  const gMat = new THREE.MeshPhongMaterial({color:0xff4444});
  enemy.mesh = new THREE.Mesh(gGeo, gMat);
  const pos = getCellCenter(enemy.gridX, enemy.gridY);
  enemy.mesh.position.set(pos.x, 5, pos.z);
  enemy.targetPos = pos.clone();
  scene.add(enemy.mesh);
}

export function updateEnemy(delta, playerGrid){
  if(!enemy.mesh) return;

  if(!enemy.moving){
    let dx = playerGrid.x - enemy.gridX;
    let dy = playerGrid.y - enemy.gridY;
    let stepX = 0, stepY = 0;

    if(Math.abs(dx) > Math.abs(dy)) stepX = Math.sign(dx); else stepY = Math.sign(dy);

    if(isCellFree(enemy.gridX + stepX, enemy.gridY + stepY)){
      enemy.gridX += stepX;
      enemy.gridY += stepY;
    } else if(stepX !== 0 && isCellFree(enemy.gridX + stepX, enemy.gridY)){
      enemy.gridX += stepX;
    } else if(stepY !== 0 && isCellFree(enemy.gridX, enemy.gridY + stepY)){
      enemy.gridY += stepY;
    } else {
      const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
      for(let i=0;i<4;i++){
        const d = dirs[Math.floor(Math.random()*4)];
        if(isCellFree(enemy.gridX + d[0], enemy.gridY + d[1])){
          enemy.gridX += d[0];
          enemy.gridY += d[1];
          break;
        }
      }
    }

    enemy.targetPos = getCellCenter(enemy.gridX, enemy.gridY);
    enemy.targetPos.y = 5;
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
  }
}
