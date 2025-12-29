import { cellHasBridge, getBridgeHeight, getCellCenter, getCellHeight, isCellFree } from "./map/map.js";

export const MOVE_SPEED = 24;
let input = { forward:false, back:false, left:false, right:false };
let playerLayer = "ground";

export function getPlayerTile(playerPos) {
    return {
        x: Math.round(playerPos.x / 10),
        y: Math.round(playerPos.z / 10)
    };
}

export function getPlayerData(gameObject, layer="ground"){
    return {
        position: gameObject.position,
        gridX: Math.round(gameObject.position.x / 10) - 1,
        gridY: Math.round(gameObject.position.z / 10) - 1,
        layer: layer
    };
}

/*
export function tryMove(dir, pos){
  const grid = worldToGrid(pos);

  let targetX = grid.x;
  let targetY = grid.y;

  if(dir === 'up') targetY -= 1;
  if(dir === 'down') targetY += 1;
  if(dir === 'left') targetX -= 1;
  if(dir === 'right') targetX += 1;

  if(!isCellFree(targetX, targetY)) return;

  const targetWorld = getCellCenter(targetX, targetY);
  return {dir: dir, targetPos: targetWorld};
}*/

export function tryMove(dir, player) {
  let targetX = player.gridX;// - 1; przeniosłem to odejmowanie do getPlayerData, bo chyba tam był błąd
  let targetY = player.gridY;// - 1;

  if (dir === 'up') targetY -= 1;
  if (dir === 'down') targetY += 1;
  if (dir === 'left') targetX -= 1;
  if (dir === 'right') targetX += 1;

  if (targetX < 0 || targetY < 0) return null;

  if (canStandOn(targetX, targetY, playerLayer)) {
    return moveSameLayer(player, targetX, targetY);
  }

  if (
    playerLayer === 'ground' &&
    cellHasBridge(targetX, targetY)
  ) {
    return climbUp(player, targetX, targetY);
  }

  if (
    playerLayer === 'bridge' &&
    isCellFree(targetX, targetY)
  ) {
    return climbDown(player, targetX, targetY);
  }

  return null;
}

function canStandOn(x, y, layer) {
  if (layer === 'ground') {
    return isCellFree(x, y);
  }

  if (layer === 'bridge') {
    return cellHasBridge(x, y);
  }

  return false;
}

function climbUp(player, targetX, targetY) {
  const targetPos = getCellCenter(targetX, targetY);
  targetPos.y = getBridgeHeight(targetX, targetY);

  playerLayer = 'bridge';

  return {
    targetPos,
    onArrive: () => {
      player.gridX = targetX;
      player.gridY = targetY;
    }
  };
}

function climbDown(player, targetX, targetY) {
  const targetPos = getCellCenter(targetX, targetY);
  targetPos.y = getCellHeight(targetX, targetY);

  playerLayer = 'ground';

  return {
    targetPos,
    onArrive: () => {
      player.gridX = targetX;
      player.gridY = targetY;
    }
  };
}

function moveSameLayer(player, targetX, targetY) {
  const targetPos = getCellCenter(targetX, targetY);

  if (playerLayer === 'bridge') {
    targetPos.y = getBridgeHeight(targetX, targetY);
  } else {
    targetPos.y = getCellHeight(targetX, targetY);
  }

  return {
    targetPos,
    onArrive: () => {
      player.gridX = targetX;
      player.gridY = targetY;
    }
  };
}

//cellhasbridge, getBridgeHeight

function getFacingDirection(rot) {
  const yaw = rot.y;

  let angle = yaw % (Math.PI * 2);
  if (angle < 0) angle += Math.PI * 2;

  if (angle >= Math.PI * 7/4 || angle < Math.PI * 1/4) return 'right';
  if (angle >= Math.PI * 1/4 && angle < Math.PI * 3/4) return 'down';
  if (angle >= Math.PI * 3/4 && angle < Math.PI * 5/4) return 'left';
  if (angle >= Math.PI * 5/4 && angle < Math.PI * 7/4) return 'up';
}

export function setupInput(){
  document.addEventListener('keydown', e=>{
    switch(e.code){
      case 'KeyW': case 'ArrowUp': input.forward = true; break;
      case 'KeyS': case 'ArrowDown': input.back = true; break;
      case 'KeyA': case 'ArrowLeft': input.left = true; break;
      case 'KeyD': case 'ArrowRight': input.right = true; break;
    }
  });
  document.addEventListener('keyup', e=>{
    switch(e.code){
      case 'KeyW': case 'ArrowUp': input.forward = false; break;
      case 'KeyS': case 'ArrowDown': input.back = false; break;
      case 'KeyA': case 'ArrowLeft': input.left = false; break;
      case 'KeyD': case 'ArrowRight': input.right = false; break;
    }
  });
}

export function getMoveDirectionFromInput(rot) {
  const face = getFacingDirection(rot);
  if (input.forward){
    if (face === 'up') return 'right';
    if (face === 'down') return 'left';
    if (face === 'left') return 'down';
    if (face === 'right') return 'up';
  }
  if (input.back) {
    if (face === 'up') return 'left';
    if (face === 'down') return 'right';
    if (face === 'left') return 'up';
    if (face === 'right') return 'down';
  }

  if (input.left) {
    if (face === 'up') return 'up';
    if (face === 'down') return 'down';
    if (face === 'left') return 'right';
    if (face === 'right') return 'left';
  }

  if (input.right) {
    if (face === 'up') return 'down';
    if (face === 'down') return 'up';
    if (face === 'left') return 'left';
    if (face === 'right') return 'right';
  }

  return null;
}