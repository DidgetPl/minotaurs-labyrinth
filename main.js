import { SimplePointerLockControls } from "./controls.js";
import { enemy, spawnEnemy, updateEnemy } from "./enemy.js";
import { updateCompass } from "./map/compass.js";
import { COLS, getCellCenter, MAP, ROWS } from "./map/map.js";
import { MiniMap } from "./map/minimap.js";
import { buildTerrain } from "./map/terrain.js";
import { getMoveDirectionFromInput, getPlayerData, getPlayerTile, MOVE_SPEED, setupInput, tryMove } from "./movement.js";

const minimap = new MiniMap(MAP);
//const pelletsMap = [...MAP]

let moveQueue = null;

let camera, scene, renderer, clock, controls;
let objects = [];
let pellets = [];
let pelletCount = 0;
let pelletsRemaining = 0;
let scoreEl = document.getElementById('score');
let blocker = document.getElementById('blocker');
let instructions = document.getElementById('instructions');
let message = document.getElementById('message');
let restartDiv = document.getElementById('restart');
let btnRestart = document.getElementById('btnRestart');
let gameOver = false;

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

  controls = new SimplePointerLockControls(camera);
  scene.add(controls.getObject());

  const start = findFirstEmpty();
  const startWorld = getCellCenter(start.x, start.y);
  const plObj = controls.getObject();
  plObj.position.set(startWorld.x, 0, startWorld.z);

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

  if(controls.getObject().position.distanceTo(enemy.mesh.position) < 4) loseGame();
}

function checkPelletPickup(){
  const pos = controls.getObject().position;
  for(let i=pellets.length-1;i>=0;i--){
    const p = pellets[i];
    const d2 = pos.distanceToSquared(p.position);
    if(d2 < 100){
      scene.remove(p);
      pellets.splice(i,1);
      pelletsRemaining--;
      scoreEl.textContent = pelletCount - pelletsRemaining;
      if(pelletsRemaining <= 0) winGame();
    }
  }
}

function winGame(){ gameOver = true; controls.enabled = false; message.style.display='block'; message.innerHTML = 'Wygrałeś! Zebrano wszystkie punkty.'; restartDiv.style.display='block'; }
function loseGame(){ gameOver = true; controls.enabled = false; message.style.display='block'; message.innerHTML = 'Przegrałeś! Minotaur cię złapał.'; restartDiv.style.display='block'; }


spawnEnemy(scene);

function animate(){
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const playerTile = getPlayerTile(controls.getObject().position);
  const enemyTile = {x: enemy.gridX, y: enemy.gridY};
  //const pelletsTiles

  minimap.render(playerTile, enemyTile);

  updatePlayer(delta);
  updateCompass(getPlayerData(controls.getObject()), pellets);
  checkPelletPickup();
  updateEnemy(delta, controls.getObject().position);
  renderer.render(scene, camera);
}

animate();