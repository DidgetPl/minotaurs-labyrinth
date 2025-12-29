export const playerState = {
  hp: 3,
  maxHp: 3,

  invulnerable: false,
  invulnTimer: 0
};

export const INVULN_TIME = 1.0;
export const BOAR_FREEZE_TIME = 0.8;

export function updatePlayerState(delta) {
    if (playerState.invulnerable) {
    playerState.invulnTimer -= delta;
    if (playerState.invulnTimer <= 0) {
      playerState.invulnerable = false;
      playerState.invulnTimer = 0;
    }
  }
}

export function handlePlayerHit(enemy, ps, hpEl) {
  if (ps.invulnerable) return;

  ps.hp -= enemy.type.damage;
  ps.hp = Math.max(0, ps.hp);
  hpEl.textContent = ps.hp;

  console.log("HP:", ps.hp);

  if (enemy.type.damage === 1) {
    ps.invulnerable = true;
    ps.invulnTimer = INVULN_TIME;
  }

  if (enemy.type.freezesOnHit) {
    enemy.frozen = true;
    enemy.freezeTimer = BOAR_FREEZE_TIME;
  }
}

export function isPlayerHit(enemy, player) {
  return player.position.distanceTo(enemy.mesh.position) < 4;
}