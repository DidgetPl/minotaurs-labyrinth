export const ENEMY_TYPES = {
  MINOTAUR: {
    name: "minotaur",
    speed: 22,
    sightRange: 8,
    damage: 3,
    canChase: true,
    color: 0xaa0000,
    freezesOnHit: false,
    animationSpeed: 0.02
  },

  BOAR: {
    name: "boar",
    speed: 12,
    sightRange: 5,
    damage: 1,
    canChase: false,
    color: 0x775533,
    freezesOnHit: true,
    animationSpeed: 0.1
  }
};