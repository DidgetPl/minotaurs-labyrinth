import { PLAYER_HEIGHT } from "../controls.js";
import { buildBridge } from "./bridges.js";
import { BRIDGES, CELL_SIZE, COLS, HEIGHT_MAP, MAP, MAX_WALL_H, MIN_WALL_H, ROWS } from "./map.js";

export function buildTerrain(scene, pellets, objects){
    /*const floorGeom = new THREE.PlaneGeometry(COLS*CELL_SIZE*3, ROWS*CELL_SIZE*3);
    const floorMat = new THREE.MeshPhongMaterial({color:0x8BAE66});
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI/2;
    floor.position.set((COLS-1)/2*CELL_SIZE + CELL_SIZE/2 - COLS*CELL_SIZE*0.5, -PLAYER_HEIGHT, (ROWS-1)/2*CELL_SIZE + CELL_SIZE/2 - COLS*CELL_SIZE*0.5);
    scene.add(floor);*/

    const wallMat = new THREE.MeshPhongMaterial({color:0x517030});
    const pelletGeom = new THREE.SphereGeometry(1.2,8,8);
    const pelletMat = new THREE.MeshPhongMaterial({color:0xEBD5AB});
    const plateMat = new THREE.MeshPhongMaterial({color:0x8BAE66});

    for(let r=0;r<ROWS;r++){
        for(let c=0;c<COLS;c++){
        const wx = c*CELL_SIZE;
        const wz = r*CELL_SIZE;
        if(MAP[r][c] === 1){
            let isThereBridge = false
            BRIDGES.forEach(bridge =>{
                if((bridge.from.x === c && bridge.from.y === r) || (bridge.to.x === c && bridge.to.y === r))
                    isThereBridge = true;
            });

            if(!isThereBridge){
                const h = MIN_WALL_H + Math.random() * (MAX_WALL_H - MIN_WALL_H) + HEIGHT_MAP[r][c];
                const wallGeom = new THREE.BoxGeometry(CELL_SIZE, h, CELL_SIZE);
                const wall = new THREE.Mesh(wallGeom, wallMat);

                wall.position.set(wx + CELL_SIZE/2, h/2 - 12, wz + CELL_SIZE/2); //ZNACZNIK
                scene.add(wall);
                objects.push(wall);
            }
        } else {
            if (MAP[r+1][c] + MAP[r-1][c] + MAP[r][c+1] + MAP[r][c-1]){
                const pellet = new THREE.Mesh(pelletGeom, pelletMat);
                pellet.position.set(wx + CELL_SIZE/2, 2-PLAYER_HEIGHT + HEIGHT_MAP[r][c], wz + CELL_SIZE/2); //ZNACZNIK
                pellet.userData = {gridX:c, gridY:r};
                scene.add(pellet);
                pellets.push(pellet);
            }

            //tu dodaję podłoże
            const h = HEIGHT_MAP[r][c]+1;
            const plateGeom = new THREE.BoxGeometry(CELL_SIZE, h, CELL_SIZE);
            const plate = new THREE.Mesh(plateGeom, plateMat);
            plate.position.set(wx + CELL_SIZE/2, h/2 - 13, wz + CELL_SIZE/2); //ZNACZNIK
            scene.add(plate);
            objects.push(plate);
        }
        }
    }

    BRIDGES.forEach(bridge => {
        buildBridge(bridge, scene);
    });
}