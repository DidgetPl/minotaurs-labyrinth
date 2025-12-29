export const PLAYER_HEIGHT = 10;

export class SimplePointerLockControls {
  constructor(camera){
    this.camera = camera;
    camera.rotation.set(0,0,0);
    this.pitchObject = new THREE.Object3D();
    this.pitchObject.add(camera);
    this.yawObject = new THREE.Object3D();
    this.yawObject.position.y = PLAYER_HEIGHT;
    this.yawObject.add(this.pitchObject);

    this.enabled = false;

    this._onMouseMove = this._onMouseMove.bind(this);
    this._PI_2 = Math.PI/2;
    this._pitch = this.pitchObject.rotation;
    this._yaw = this.yawObject.rotation;

    document.addEventListener('mousemove', this._onMouseMove, false);
  }

  _onMouseMove(event){
    if(!this.enabled) return;
    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    this._yaw.y -= movementX * 0.002;
    this._pitch.x -= movementY * 0.002;
    this._pitch.x = Math.max(-this._PI_2, Math.min(this._PI_2, this._pitch.x));
  }

  getObject(){ return this.yawObject; }

  // musi być wywoływane, nawet jeśli nic nie robi
  update(delta){
    // na przyszłość
  }

  getDirection(v){
    v = v || new THREE.Vector3();
    const rotation = new THREE.Euler( this._pitch.x, this._yaw.y, 0, 'YXZ' );
    v.copy(new THREE.Vector3(0,0,-1)).applyEuler(rotation);
    return v;
  }
}