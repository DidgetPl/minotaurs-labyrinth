import { updateBoarAnimation } from "./enemies/boar.js";
import { createEnemy, spawnEnemy, updateEnemy } from "./enemies/enemy.js";
import { ENEMY_TYPES } from "./enemies/enemyTypes.js";
import { updateMinotaurAnimation } from "./enemies/minotaur.js";
import { updateCompass } from "./map/compass.js";
import { COLS, getCellCenter, getCellHeight, MAP, ROWS } from "./map/map.js";
import { MiniMap } from "./map/minimap.js";
import { buildTerrain } from "./map/terrain.js";
import { SimplePointerLockControls } from "./player/controls.js";
import { getMoveDirectionFromInput, getPlayerData, getPlayerTile, MOVE_SPEED, setupInput, tryMove, tryShoot } from "./player/movement.js";
import { handlePlayerHit, isPlayerHit, playerState, updatePlayerState } from "./player/playerState.js";

const minimap = new MiniMap(MAP);

let moveQueue = null;

let camera, scene, renderer, clock, controls;
let objects = [];
let pellets = [];
let pelletCount = 0;
let pelletsRemaining = 0;
let scoreEl = document.getElementById('score');
let maxPelletsEl = document.getElementById('maxPellets');
let hpEl = document.getElementById('hp');
let amEl = document.getElementById('am');
let blocker = document.getElementById('blocker');
let instructions = document.getElementById('instructions');
let message = document.getElementById('message');
let restartDiv = document.getElementById('restart');
let btnRestart = document.getElementById('btnRestart');
let gameOver = false;
let enemies = [];
let projectiles = [];

init();

function init(){
  clock = new THREE.Clock();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 0, 500);

  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(1,2,1);
  scene.add(dir);
  scene.add(new THREE.AmbientLight(0x606060));

  buildTerrain(scene, pellets, objects);

  pelletCount = pellets.length;
  pelletsRemaining = pelletCount;
  scoreEl.textContent = 0;
  maxPelletsEl.textContent = pellets.length;
  hpEl.textContent = playerState.hp;

  controls = new SimplePointerLockControls(camera);
  scene.add(controls.getObject());


  const minotaur = createEnemy(ENEMY_TYPES.MINOTAUR, ROWS - 2, COLS - 2);
  spawnEnemy(scene, minotaur);
  enemies.push(minotaur);

  for (let i = 0; i < 5; i++){
    const x = Math.floor(Math.random() * (ROWS-5)) + 5;
    const y = Math.floor(Math.random() * (COLS-5)) + 5;
    const boar = createEnemy(ENEMY_TYPES.BOAR, x, y);
    spawnEnemy(scene, boar);
    enemies.push(boar);
  }

  const start = findFirstEmpty();
  const startWorld = getCellCenter(start.x, start.y);
  const plObj = controls.getObject();
  plObj.position.set(startWorld.x, getCellHeight(start.x, start.y), startWorld.z);

  renderer = new THREE.WebGLRenderer({antialias:true, alpha: true});
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  const element = document.body;
  instructions.addEventListener('click', ()=>{ instructions.style.display='none'; element.requestPointerLock(); }, false);
  document.addEventListener('pointerlockchange', ()=>{
    controls.enabled = (document.pointerLockElement === element);
    if(controls.enabled) blocker.style.display = 'none'; else blocker.style.display = 'flex';
  }, false);

  window.addEventListener('resize', ()=>{ camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); }, false);
  btnRestart.addEventListener('click', ()=>location.reload());

  setupInput();
}

function findFirstEmpty(){
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(MAP[r][c] === 0) return {x:c,y:r};
  return {x:1,y:1};
}

function updatePlayer(delta){
  if(!controls.enabled || gameOver) return;

  controls.update(delta);

if (!moveQueue) {
  const dir = getMoveDirectionFromInput(controls.yawObject.rotation);
  if (dir && !moveQueue) moveQueue = tryMove(dir, getPlayerData(controls.getObject()));
}

  if(moveQueue){
    const obj = controls.getObject();
    const dirVec = new THREE.Vector3().subVectors(moveQueue.targetPos, obj.position);
    const dist = dirVec.length();
    if(dist < 0.01){ 
      obj.position.copy(moveQueue.targetPos);
      moveQueue = null;
    } else {
      dirVec.normalize();
      const step = MOVE_SPEED * delta;
      if(step >= dist){ 
        obj.position.copy(moveQueue.targetPos);
        moveQueue = null;
      } else {
        obj.position.add(dirVec.multiplyScalar(step));
      }
    }
  }

  checkPelletPickup();

  enemies.forEach(e => {
    if(e.mesh)
        if (isPlayerHit(e, getPlayerData(controls.getObject()))) {
          handlePlayerHit(e, playerState, hpEl);
      }
  });
}

function checkPelletPickup(){
  const pos = controls.getObject().position;
  for(let i=pellets.length-1;i>=0;i--){
    const p = pellets[i];
    const d2 = pos.distanceToSquared(p.position);
    if(d2 < 100){
      if (p.userData.type === "ammo"){
        playerState.ammo++;
        amEl.textContent = playerState.ammo;
      }
      scene.remove(p);
      pellets.splice(i,1);
      pelletsRemaining--;
      scoreEl.textContent = pelletCount - pelletsRemaining;
      if(pelletsRemaining <= 0) winGame();
    }
  }
}

export function destroyProjectile(projectile, scene) {
  if (!projectile || !projectile.alive) return;

  projectile.alive = false;

  if (projectile.mesh) {
    scene.remove(projectile.mesh);

    if (projectile.mesh.geometry) projectile.mesh.geometry.dispose();
    if (projectile.mesh.material) projectile.mesh.material.dispose();

    projectile.mesh = null;
  }
}


function winGame(){ gameOver = true; controls.enabled = false; message.style.display='block'; message.innerHTML = 'Wygrałeś! Zebrano wszystkie punkty.'; restartDiv.style.display='block'; }
function loseGame(){ gameOver = true; controls.enabled = false; message.style.display='block'; message.innerHTML = 'Przegrałeś! Straciłeś wszystkie życia.'; restartDiv.style.display='block'; }


function animate(){
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const playerTile = getPlayerTile(controls.getObject().position);
  const enemyTiles = [];
  enemies.forEach(e => {
    const txtColor = "#" + e.type.color.toString(16).padStart(6, "0");
    enemyTiles.push({x:  e.gridX, y:  e.gridY, color: txtColor});

    switch(e.type.name){
      case "minotaur":
        updateMinotaurAnimation(e, renderer, scene, camera);
      case "boar":
        updateBoarAnimation(e, renderer, scene, camera);
    }
  });
  const pelletTiles = []
  pellets.forEach(p => {
    pelletTiles.push({x:  Math.round(p.position.x / 10) - 1, y:  Math.round(p.position.z / 10) - 1});
  });

  minimap.render(playerTile, enemyTiles, pelletTiles);

  tryShoot(getPlayerData(controls.getObject()), enemies, playerState.ammo, scene);

  updatePlayer(delta);
  updateCompass(getPlayerData(controls.getObject()), pellets);
  updatePlayerState(delta);
  if (playerState.hp <= 0) loseGame();
  checkPelletPickup();
  enemies.forEach(e => {
    updateEnemy(e, delta, getPlayerData(controls.getObject()));
  });
  renderer.render(scene, camera);
}

animate();