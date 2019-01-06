const WEBGL = window.WEBGL; // import hacks;
const THREE = window.THREE;
const Stats = window.Stats;
const io = window.io;
const $ = window.$;

const NODECRAFT_BACKEND = "https://nodecraft.cloud.zihao.me";
const BLOCK_SIZE = 50;
const PLANE_SIZE = 10000;
const BLOCK_COLOR = 0xfeb74c;
const ROLL_OVER_COLOR = 0x1b5c5a;

class Blocks {
  constructor(scene, plane) {
    this.scene = scene;
    this.objects = [plane]; // for collison
    this.blocks = {};

    // cubes
    this.cubeGeo = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    this.cubeMaterial = new THREE.MeshLambertMaterial({
      color: BLOCK_COLOR,
      flatShading: true
    });
  }

  delete(x, y, z) {
    if ([x, y, z] in this.blocks) {
      this.scene.remove(this.blocks[[x, y, z]]);
      this.objects.splice(this.objects.indexOf(this.blocks[[x, y, z]]), 1);
      delete this.blocks[[x, y, z]];
    }
  }

  insert(x, y, z) {
    if (!([x, y, z] in this.blocks)) {
      const voxel = new THREE.Mesh(this.cubeGeo, this.cubeMaterial);
      voxel.position
        .set(x, y, z)
        .multiplyScalar(BLOCK_SIZE)
        .addScalar(BLOCK_SIZE / 2);
      this.scene.add(voxel);
      this.objects.push(voxel);
      this.blocks[[x, y, z]] = voxel;
    }
  }

  clear() {
    for (const pos of Object.keys(this.blocks)) {
      this.delete(...pos.split(",").map(Number));
    }
  }
}

class Craft {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.clock = new THREE.Clock();
    this.error = () => { };

    this.width = null;
    this.height = null;
    this.scene = null;
    this.raycaster = null;
    this.camera = null;
    this.mouse = null;

    this.blocks = null;
    this.plane = null;
    this.rollOverMesh = null;

    this.keysdown = {};
    this.autoRotate = true;
    this.angle = 0;
    this.zoom = 1;

    this.renderer = null;
    this.stats = null;
  }

  onDocumentMouseMove(event) {
    var x = event.pageX - this.rootElement.offset().left;
    var y = event.pageY - this.rootElement.offset().top;

    this.mouse.set((x / this.width) * 2 - 1, -(y / this.height) * 2 + 1);
  }

  onDocumentMouseDown(event) {
    var x = event.pageX - this.rootElement.offset().left;
    var y = event.pageY - this.rootElement.offset().top;

    this.mouse.set((x / this.width) * 2 - 1, -(y / this.height) * 2 + 1);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.blocks.objects);

    if (intersects.length > 0) {
      const intersect = intersects[0];

      if (event.ctrlKey || event.metaKey) {
        // delete cube
        if (intersect.object !== this.plane) {
          const position = new THREE.Vector3()
            .copy(intersect.object.position)
            .divideScalar(BLOCK_SIZE)
            .floor();
          this.deleteBlock(position.x, position.y, position.z);
        }
      } else {
        // create cube
        const position = new THREE.Vector3()
          .copy(intersect.point)
          .add(intersect.face.normal)
          .divideScalar(BLOCK_SIZE)
          .floor();
        this.insertBlock(position.x, position.y, position.z);
      }
    }
  }

  onDocumentKeyDown(event) {
    const code = event.which || event.keyCode;
    const char = String.fromCharCode(code);

    this.keysdown[code] = true;

    switch (char) {
      case "A":
        this.autoRotate = false;
        break;
      case "D":
        this.autoRotate = false;
        break;
      default:
    }
  }

  onDocumentKeyPress(event) {
    const code = event.which || event.keyCode;
    this.keysdown[code] = true;

    const char = String.fromCharCode(code).toUpperCase();
    switch (char) {
      case "Q":
        if (this.stats.domElement.style.visibility === "hidden") {
          this.stats.domElement.style.visibility = "visible";
        } else {
          this.stats.domElement.style.visibility = "hidden";
        }
        break;
      case "C":
        this.clearBlocks();
        break;
      case "G":
        this.generateMap();
        break;
      case " ":
        this.autoRotate = !this.autoRotate;
        event.preventDefault();
        break;
      default:
    }
  }

  onDocumentKeyUp(event) {
    const code = event.which || event.keyCode;
    this.keysdown[code] = false;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();

    if (this.mouse.x !== -1 && this.mouse.y !== -1) {
      this.rollOverMesh.visible = true;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      const intersects = this.raycaster.intersectObjects(this.blocks.objects);

      if (intersects.length > 0) {
        const intersect = intersects[0];

        this.rollOverMesh.position
          .copy(intersect.point)
          .add(intersect.face.normal);
        this.rollOverMesh.position
          .divideScalar(BLOCK_SIZE)
          .floor()
          .multiplyScalar(BLOCK_SIZE)
          .addScalar(BLOCK_SIZE / 2);
      }
    }

    if (this.autoRotate) {
      this.angle += delta * 0.1;
    }

    // a
    if (this.keysdown[65]) {
      this.angle += delta;
    }

    // d
    if (this.keysdown[68]) {
      this.angle -= delta;
    }

    // s
    if (this.keysdown[83]) {
      this.zoom = Math.min(2, this.zoom * 1.01);
    }

    // w
    if (this.keysdown[87]) {
      this.zoom = Math.max(1, this.zoom / 1.01);
    }

    this.camera.position.x = Math.cos(this.angle) * 700 * this.zoom;
    this.camera.position.y = 800 * this.zoom;
    this.camera.position.z = Math.sin(this.angle) * 700 * this.zoom;
    this.camera.lookAt(new THREE.Vector3());

    this.renderer.render(this.scene, this.camera);

    this.stats.update();
  }

  onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  insertBlock(x, y, z) {
    this.blocks.insert(x, y, z);
    this.socket.emit("insert", [x, y, z]);
  }

  deleteBlock(x, y, z) {
    this.blocks.delete(x, y, z);
    this.socket.emit("delete", [x, y, z]);
  }

  clearBlocks() {
    this.blocks.clear();
    this.socket.emit("clear");
  }

  generateMap() {
    this.socket.emit("generate");
  }

  run() {
    if (!WEBGL.isWebGLAvailable()) {
      this.error();
      return;
    }

    THREE.ImageUtils.crossOrigin = "";

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      1,
      10000
    );
    // camera.position.set( 200, 320, 640 );
    this.camera.lookAt(new THREE.Vector3());

    // fog
    this.scene.fog = new THREE.FogExp2(0xffffff, 0.0005);

    // rollover
    const rollOverGeo = new THREE.BoxGeometry(
      BLOCK_SIZE,
      BLOCK_SIZE,
      BLOCK_SIZE
    );
    const rollOverMaterial = new THREE.MeshBasicMaterial({
      color: ROLL_OVER_COLOR,
      opacity: 0.5,
      transparent: true
    });
    this.rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    this.rollOverMesh.visible = false;
    this.scene.add(this.rollOverMesh);

    // grid
    const size = PLANE_SIZE;
    const step = BLOCK_SIZE;

    const lineGeo = new THREE.Geometry();
    for (let i = -size; i <= size; i += step) {
      lineGeo.vertices.push(new THREE.Vector3(-size, 0, i));
      lineGeo.vertices.push(new THREE.Vector3(size, 0, i));

      lineGeo.vertices.push(new THREE.Vector3(i, 0, -size));
      lineGeo.vertices.push(new THREE.Vector3(i, 0, size));
    }
    const line = new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({
        color: 0x000000,
        opacity: 0.2,
        transparent: true
      })
    );
    this.scene.add(line);

    const planeGeo = new THREE.PlaneBufferGeometry(PLANE_SIZE, PLANE_SIZE);
    planeGeo.rotateX(-Math.PI / 2);
    this.plane = new THREE.Mesh(
      planeGeo,
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.scene.add(this.plane);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-1, -1);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x606060);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    this.scene.add(directionalLight);

    this.blocks = new Blocks(this.scene, this.plane);

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.domElement.style.position = "absolute";
    this.renderer.domElement.style.top = "0px";

    this.stats = new Stats();
    this.stats.domElement.style.position = "absolute";
    this.stats.domElement.style.right = "0px";
    this.stats.domElement.style.bottom = "0px";
    this.stats.domElement.style.zIndex = 100;
    this.stats.domElement.style.visibility = "hidden";

    this.connectSocket();
    this.setupEvents();
    this.animate();

    this.rootElement.append(this.stats.domElement);
    this.rootElement.append(this.renderer.domElement);
  }

  setupEvents() {
    window.addEventListener("resize", this.onWindowResize.bind(this), false);

    this.rootElement.on("mousemove", this.onDocumentMouseMove.bind(this));
    this.rootElement.on("mousedown", this.onDocumentMouseDown.bind(this));
    // this.renderer.domElement.addEventListener( 'touchstart', onDocumentTouchStart, false );
    // this.renderer.domElement.addEventListener( 'touchend', onDocumentTouchEnd, false);
    $(document).on("keydown", this.onDocumentKeyDown.bind(this));
    $(document).on("keypress", this.onDocumentKeyPress.bind(this));
    $(document).on("keyup", this.onDocumentKeyUp.bind(this));
  }

  connectSocket() {
    this.socket = io.connect(NODECRAFT_BACKEND);
    this.socket.on("init", data => {
      this.blocks.clear();
      for (const pos of Object.keys(data)) {
        this.blocks.insert(...pos.split(",").map(Number));
      }
    });
    this.socket.on("insert", data => {
      this.blocks.insert(...data);
    });
    this.socket.on("delete", data => {
      this.blocks.delete(...data);
    });
    this.socket.on("clear", () => {
      this.blocks.clear();
    });
    this.socket.on("connect_error", () => {
      this.error();
    });
  }

  // onDocumentTouchStart(event) {
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

  //  onDocumentTouchEnd(event) {
  //   // event.preventDefault();
  // }
}

export default Craft;
