(() => {
  const Detector = window.Detector; // import hacks;
  const THREE    = window.THREE;
  const Stats    = window.Stats;
  const io       = window.io;
  const $        = window.$;

  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
  }

  const objects = [];
  const keysdown = {};

  const clock = new THREE.Clock();

  let autoRotate = true;

  let angle = 0;
  let zoom = 1;

  THREE.ImageUtils.crossOrigin = '';

  let width = window.innerWidth;
  let height = window.innerHeight;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
  // camera.position.set( 200, 320, 640 );
  camera.lookAt(new THREE.Vector3());

  // fog
  scene.fog = new THREE.FogExp2(0xffffff, 0.0005);

  // rollover

  const rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
  const rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0x1B5C5A, opacity: 0.5, transparent: true });
  const rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
  rollOverMesh.visible = false;
  scene.add(rollOverMesh);

  // cubes

  const cubeGeo = new THREE.BoxGeometry(50, 50, 50);
  const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xfeb74c, shading: THREE.FlatShading });

  // grid

  const size = 10000;
  const step = 50;

  let geometry = new THREE.Geometry();

  for (let i = - size; i <= size; i += step) {
    geometry.vertices.push(new THREE.Vector3(- size, 0, i));
    geometry.vertices.push(new THREE.Vector3(size, 0, i));

    geometry.vertices.push(new THREE.Vector3(i, 0, - size));
    geometry.vertices.push(new THREE.Vector3(i, 0, size));
  }

  const material = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.2, transparent: true });

  const line = new THREE.LineSegments(geometry, material);
  scene.add(line);

  //

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-1, -1);

  geometry = new THREE.PlaneBufferGeometry(10000, 10000);
  geometry.rotateX(- Math.PI / 2);

  const plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
  scene.add(plane);

  objects.push(plane);

  // Lights

  const ambientLight = new THREE.AmbientLight(0x606060);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  scene.add(directionalLight);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0px';

  const stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.right = '0px';
  stats.domElement.style.bottom = '0px';
  stats.domElement.style.zIndex = 100;
  stats.domElement.style.visibility = 'hidden';

  window.addEventListener('resize', onWindowResize, false);

  document.addEventListener('mousemove', onDocumentMouseMove, false);
  renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
  // renderer.domElement.addEventListener( 'touchstart', onDocumentTouchStart, false );
  // renderer.domElement.addEventListener( 'touchend', onDocumentTouchEnd, false);
  document.addEventListener('keydown', onDocumentKeyDown, false);
  document.addEventListener('keyup', onDocumentKeyUp, false);

  document.body.appendChild(stats.domElement);
  $("#demo").append(renderer.domElement);

  const blocks = {};

  const socket = io.connect("https://craft.kube.zihao.ca");
  socket.on('init', (data) => {
    serverClearBlocks();
    for (const pos of Object.keys(data)) {
      serverInsertBlock.apply(null, pos.split(',').map(Number));
    }
  });
  socket.on('insert', (data) => {
    serverInsertBlock.apply(null, data);
  });
  socket.on('delete', (data) => {
    serverDeleteBlock.apply(null, data);
  });
  socket.on('clear', () => {
    serverClearBlocks();
  });

  animate();

  function onDocumentMouseMove(event) {
    mouse.set((event.clientX / width) * 2 - 1, - (event.clientY / height) * 2 + 1);
  }

  function onDocumentMouseDown(event) {
    mouse.set((event.clientX / width) * 2 - 1, - (event.clientY / height) * 2 + 1);

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
      const intersect = intersects[0];
        // delete cube
      if (event.ctrlKey || event.metaKey) {
        if (intersect.object !== plane) {
          const position = new THREE.Vector3().copy(intersect.object.position).divideScalar(50).floor();
          deleteBlock(position.x, position.y, position.z);
        }
        // create cube
      }
      else {
        const position = new THREE.Vector3().copy(intersect.point).add(intersect.face.normal).divideScalar(50).floor();
        insertBlock(position.x, position.y, position.z);
      }
    }
  }

  // let clickTimer = null;
  // let lastTap = 0;

  // function onDocumentTouchStart(event) {
  //   // event.preventDefault()
  //   return; // Does not work!
  //   let pointer = getPointerEvent(event);
  //   let currX = pointer.pageX;
  //   let currY = pointer.pageY;

  //   mouse.set((currX / width) * 2 - 1, - (currY / height) * 2 + 1);

  //   raycaster.setFromCamera(mouse, camera);

  //   let intersects = raycaster.intersectObjects(objects);

  //   if (intersects.length > 0) {
  //     let intersect = intersects[0];
  //     if (clickTimer == null) {
  //       clickTimer = setTimeout(function () {
  //         clickTimer = null;
  //         let position = new THREE.Vector3().copy(intersect.point).add(intersect.face.normal).divideScalar(50).floor();
  //         insertBlock(position.x, position.y, position.z);
  //       }, 300);
  //     } else {
  //       clearTimeout(clickTimer);
  //       clickTimer = null;

  //       if (intersect.object != plane) {
  //         let position = new THREE.Vector3().copy(intersect.object.position).divideScalar(50).floor();
  //         deleteBlock(position.x, position.y, position.z);
  //       }
  //     }
  //   }
  // }

  // function onDocumentTouchEnd(event) {
  //   // event.preventDefault();
  // }

  function onDocumentKeyDown(event) {
    const code = event.which || event.keyCode;
    const char = String.fromCharCode(code);

    keysdown[code] = true;

    switch (char) {
      case 'A':
        autoRotate = false;
        break;
      case 'D':
        autoRotate = false;
        break;
      case 'Q':
        if (stats.domElement.style.visibility === 'hidden') {
          stats.domElement.style.visibility = 'visible';
        }
        else {
          stats.domElement.style.visibility = 'hidden';
        }
        break;
      case 'C':
        clearBlocks();
        break;
      case 'G':
        generateMap();
        break;
      default:
    }
  }

  function onDocumentKeyUp(event) {
    const code = event.which || event.keyCode;
    const char = String.fromCharCode(code);

    keysdown[code] = false;

    switch (char) {
      case ' ':
        autoRotate = !autoRotate;
        break;
      default:
    }
  }

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (mouse.x !== -1 && mouse.y !== -1) {
      rollOverMesh.visible = true;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(objects);

      if (intersects.length > 0) {
        const intersect = intersects[0];

        rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
        rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
      }
    }

    if (autoRotate) {
      angle += delta * 0.1;
    }

    if (keysdown[65]) { // a
      angle += delta;
    }

    if (keysdown[68]) { // d
      angle -= delta;
    }

    if (keysdown[83]) { // s
      zoom = Math.min(2, zoom * 1.01);
    }

    if (keysdown[87]) { // w
      zoom = Math.max(1, zoom / 1.01);
    }

    camera.position.x = Math.cos(angle) * 700 * zoom;
    camera.position.y = 800 * zoom;
    camera.position.z = Math.sin(angle) * 700 * zoom;
    camera.lookAt(new THREE.Vector3());

    renderer.render(scene, camera);

    stats.update();
  }

  function onWindowResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function insertBlock(x, y, z) {
    serverInsertBlock(x, y, z);
    socket.emit('insert', [x, y, z]);
  }

  function serverInsertBlock(x, y, z) {
    if (!([x, y, z] in blocks)) {
      const voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
      voxel.position.set(x, y, z).multiplyScalar(50).addScalar(25);
      scene.add(voxel);
      objects.push(voxel);
      blocks[[x, y, z]] = voxel;
    }
  }

  function deleteBlock(x, y, z) {
    serverDeleteBlock(x, y, z);
    socket.emit('delete', [x, y, z]);
  }

  function serverDeleteBlock(x, y, z) {
    if ([x, y, z] in blocks) {
      scene.remove(blocks[[x, y, z]]);
      objects.splice(objects.indexOf(blocks[[x, y, z]]), 1);
      delete blocks[[x, y, z]];
    }
  }

  function clearBlocks() {
    serverClearBlocks();
    socket.emit('clear');
  }

  function serverClearBlocks() {
    for (const pos of Object.keys(blocks)) {
      serverDeleteBlock.apply(null, pos.split(',').map(Number));
    }
  }

  function generateMap() {
    socket.emit('generate');
  }
})();
