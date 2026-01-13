export function createMinotaurModel(scene, enemy){
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8b3847 });
    const hornMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });

    const minotaur = new THREE.Group();
    scene.add(minotaur);

    const torso = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 2, 0.8), //
        bodyMat
    );
    torso.position.y = 1.5;
    minotaur.add(torso);

    enemy.headGroup = new THREE.Group();
    enemy.headGroup.position.y = 3;
    minotaur.add(enemy.headGroup);

    const head = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1, 1),
        bodyMat
    );
    enemy.headGroup.add(head);

    const snout = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.4, 0.6),
        bodyMat
    );
    snout.position.set(0, -0.1, 0.8);
    head.add(snout);

    function createHorn(x) {
        const horn = new THREE.Mesh(
            new THREE.TorusGeometry(0.35, 0.1, 8, 16, Math.PI),
            hornMat
        );
        horn.rotation.y = x < 0 ? 0 : Math.PI;
        horn.rotation.z = Math.PI / 2;
        horn.position.set(x, 0.4, -0.2);
        return horn;
    }

    head.add(createHorn(-0.6));
    head.add(createHorn(0.6));

    function createArm(x) {
        const armGroup = new THREE.Group();
        armGroup.position.set(x, 2.2, 0);

        const upper = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 1, 0.4),
            bodyMat
        );
        upper.position.y = -0.5;
        armGroup.add(upper);

        return armGroup;
    }

    enemy.leftArm = createArm(-1);
    enemy.rightArm = createArm(1);
    minotaur.add(enemy.leftArm);
    minotaur.add(enemy.rightArm);

    function createLeg(x) {
        const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 1.2, 0.5),
            bodyMat
        );
        leg.position.set(x, 0.6, 0);
        return leg;
    }

    enemy.leftLeg = createLeg(-0.4);
    enemy.rightLeg = createLeg(0.4);

    minotaur.add(enemy.leftLeg);
    minotaur.add(enemy.rightLeg);
    minotaur.scale.set(3, 3, 3);

    return minotaur;
}

export function updateMinotaurAnimation(enemy, renderer, scene, camera) {
    if (!enemy.frozen){
        enemy.time += enemy.type.animationSpeed;

        enemy.headGroup.rotation.y = Math.sin(enemy.time) * 0.3;
        enemy.leftArm.rotation.x = Math.sin(enemy.time) * 0.8;
        enemy.rightArm.rotation.x = -Math.sin(enemy.time ) * 0.8;
        enemy.rightLeg.rotation.x = Math.sin(enemy.time) * 0.3;
        enemy.leftLeg.rotation.x = -Math.sin(enemy.time ) * 0.3;
    }

    renderer.render(scene, camera);
}