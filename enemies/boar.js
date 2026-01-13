export function createBoarModel(scene, enemy) {
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a });
  const snoutMat = new THREE.MeshStandardMaterial({ color: 0x704020 });

  const boar = new THREE.Group();
  scene.add(boar);

  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.9, 2.4),
    bodyMat
  );
  torso.position.y = 0.7;
  boar.add(torso);

  enemy.headGroup = new THREE.Group();
  enemy.headGroup.position.set(0, 0.95, 1.4);
  boar.add(enemy.headGroup);

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.8, 1.0),
    bodyMat
  );
  enemy.headGroup.add(head);

  const snout = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.3, 0.5),
    snoutMat
  );
  snout.position.set(0, -0.15, 0.75);
  head.add(snout);

  function createLeg(x, z) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.6, 0.3),
      bodyMat
    );
    leg.position.set(x, 0.3, z);
    return leg;
  }

  enemy.leftLeg  = createLeg(-0.5,  0.8);
  enemy.rightLeg = createLeg( 0.5,  0.8);
  enemy.leftArm   = createLeg(-0.5, -0.8);
  enemy.rightArm  = createLeg( 0.5, -0.8);

  boar.add(
    enemy.leftLeg,
    enemy.rightLeg,
    enemy.leftArm,
    enemy.rightArm
  );

  boar.scale.set(3, 3, 2);
  return boar;
}

export function updateBoarAnimation(enemy, renderer, scene, camera) {
    if (!enemy.frozen){
      enemy.time += enemy.type.animationSpeed;

      enemy.headGroup.rotation.y = Math.sin(enemy.time) * 0.1;
      enemy.leftArm.rotation.x = Math.sin(enemy.time) * 0.4;
      enemy.rightArm.rotation.x = -Math.sin(enemy.time ) * 0.4;
      enemy.rightLeg.rotation.x = Math.sin(enemy.time) * 0.4;
      enemy.leftLeg.rotation.x = -Math.sin(enemy.time ) * 0.4;
    }

    renderer.render(scene, camera);
}