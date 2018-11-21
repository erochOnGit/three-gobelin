// example import asset
// import imgPath from './assets/img.jpg';

// TODO : add Dat.GUI
// TODO : add Stats

let OrbitControls = require("three-orbit-controls")(THREE);
export default class App {
  constructor() {
    this.container = document.querySelector("#main");
    document.body.appendChild(this.container);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      10
    );
    this.camera.position.z = 1;

    this.controls = new OrbitControls(this.camera);
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.enableRotate = true;

    this.controls.minDistance;
    this.controls.maxDistance;

    this.controls.minPolarAngle;
    this.controls.maxPolarAngle;

    this.scene = new THREE.Scene();

    // let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);

    // let geometry = new THREE.Geometry();

    // geometry.vertices.push(
    //   new THREE.Vector3(-0.5, -0.5, 0),
    //   new THREE.Vector3(0.5, -0.5, 0),
    //   new THREE.Vector3(0, 0.5, 0),
    //   new THREE.Vector3(-1, -1.5, 0),
    //   new THREE.Vector3(0, -1.5, 0),
    //   new THREE.Vector3(1, -1.5, 0)
    // );

    // for (let x = 0; x < 5; x++) {
    //   for (let y = 0; y < 5; y++) {
    //     geometry.vertices.push(
    //       new THREE.Vector3(
    //         Math.random() * 2 - 1,
    //         Math.random() * 2 - 1,
    //         Math.random() * 2 - 1
    //       )
    //     );
    //   }
    // }

    // // geometry.faces.push(new THREE.Face3(0, 1, 2));
    // // geometry.faces.push(new THREE.Face3(0, 3, 4));
    // // geometry.faces.push(new THREE.Face3(1, 4, 5));
    // for (let j = 0; j < 25; j++) {
    //   geometry.faces.push(new THREE.Face3(j, j + 1, j + 2));
    // }
    let vert = [];
    let geometry = new THREE.BufferGeometry();
    // let vertices = new Float32Array([
    //   -0.5,
    //   -0.5,
    //   0,
    //   0.5,
    //   -0.5,
    //   0,
    //   0,
    //   0.5,
    //   0,
    //   -1,
    //   -1.5,
    //   0,
    //   0,
    //   -1.5,
    //   0,
    //   1,
    //   -1.5,
    //   0
    // ]);
    for (let x = 0; x < 6; x++) {
      vert.push(Math.random() * 2 - 1);
      vert.push(Math.random() * 2 - 1);
      vert.push(0);
    }
    let vertices = new Float32Array(vert);
    geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
    let indices = new Uint32Array([0, 1, 2, 0, 3, 4, 1, 4, 5]);
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    let material = new THREE.MeshBasicMaterial();
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    window.addEventListener("resize", this.onWindowResize.bind(this), false);
    this.onWindowResize();

    this.renderer.animate(this.render.bind(this));
  }

  render() {
    // this.mesh.rotation.x += 0.01;
    // this.mesh.rotation.y += 0.02;

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
