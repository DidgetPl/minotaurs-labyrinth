import { worldToGrid } from "./map.js";

export function findNearestPellet(player, pellets) {
  let best = null;
  let bestDist = Infinity;

  for (const pellet of pellets) {
    const p = worldToGrid(pellet.position);
    const dx = p.x - player.gridX;
    const dy = p.y - player.gridY;
    const d = dx * dx + dy * dy;

    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }

  return best;
}

export function worldDirectionToAngle(dx, dy) {
  return Math.atan2(dy, dx);
}

export function facingToAngle(facing) {
  switch (facing) {
    case 'right': return -Math.PI / 2;
    case 'down':  return Math.PI;
    case 'left':  return Math.PI / 2;
    case 'up':    return 0;
  }
}

export function computeCompassAngle(player, pellets) {
  const target = findNearestPellet(player, pellets);
  if (!target) return null;

  const dx = target.x - player.gridX;
  const dy = target.y - player.gridY;

  const worldAngle = worldDirectionToAngle(dx, dy);
  const playerAngle = -player.rotation.y - Math.PI/2;

  return worldAngle - playerAngle;
}

const arrow = document.getElementById("compass-arrow");

export function updateCompass(player, pellets) {
  const angle = computeCompassAngle(player, pellets);
  if (angle === null) {
    arrow.style.display = "none";
    return;
  }

  arrow.style.display = "block";
  arrow.style.top = "10%";
  arrow.style.transform =
    `rotate(${angle}rad)`;
}