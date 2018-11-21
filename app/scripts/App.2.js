// example import asset
// import imgPath from './assets/img.jpg';

// TODO : add Dat.GUI
// TODO : add Stats

let OrbitControls = require("three-orbit-controls")(THREE);
import Geo from "./Geo";

export default class App {
  constructor() {
    this.time = 0;
    this.container = document.querySelector("#main");
    document.body.appendChild(this.container);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 200;
    this.camera.position.y = 5;

    this.controls = new OrbitControls(this.camera);
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.enableRotate = true;

    this.controls.minDistance;
    this.controls.maxDistance;

    this.controls.minPolarAngle;
    this.controls.maxPolarAngle;

    this.scene = new THREE.Scene();
    this.vert = [];

    this.width = 80;
    this.height = 80;
    this.r = 3;
    this.k = 30; //quitTrial
    this.w = this.r / Math.sqrt(2);
    this.grid = [];
    this.active = [];
    this.ordered = [];
    this.finalConvex = [];
    this.geos = [];

    // STEP 0
    this.cols = Math.floor(this.width / this.w);
    this.rows = Math.floor(this.height / this.w);
    for (let i = 0; i < this.cols * this.rows; i++) {
      this.grid[i] = undefined;
    }

    // STEP 1
    let x = this.width / 2;
    let y = this.height / 2;
    let i = Math.floor(x / this.w);
    let j = Math.floor(y / this.w);
    let pos = new THREE.Vector2(x, y);
    this.grid[i + j * this.cols] = pos;
    this.active.push(pos);

    this.geos.push(new Geo());
    this.geos.forEach(geo => {
      this.scene.add(geo.mesh);
    });

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    this.spheres = [];
    for (let l = 0; l < this.grid.length; l++) {
      let circleGeometry = new THREE.SphereGeometry(0.2, 32, 32);
      let circleMaterial = new THREE.MeshNormalMaterial({ wireframe: true });
      let circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
      this.spheres.push(circleMesh);
      this.scene.add(circleMesh);
    }

    window.addEventListener("resize", this.onWindowResize.bind(this), false);
    this.onWindowResize();
    this.triggerPoint();
    this.triggerPoint();
    this.triggerPoint();
    this.renderer.animate(this.render.bind(this));
  }

  triggerPoint() {
    if (this.active.length > 0) {
      let activRandom = Math.floor(Math.random() * this.active.length);
      let posi = this.active[activRandom];
      var found = false;
      for (let n = 0; n < this.k; n++) {
        let angle = Math.random() * Math.PI * 2;
        let offX = Math.cos(angle);
        let offY = Math.sin(angle);
        let sample = new THREE.Vector2(offX, offY);

        // multiplyScalar
        let magnitude = Math.random() * (2 * this.r) + this.r;
        sample.multiplyScalar(magnitude);
        sample.add(posi);
        let col = Math.floor(sample.x / this.w);
        let row = Math.floor(sample.y / this.w);

        if (
          col > -1 &&
          row > -1 &&
          col < this.cols &&
          row < this.rows &&
          !this.grid[col + row * this.cols]
        ) {
          let ok = true;
          for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
              var index = col + i + (row + j) * this.cols;
              var neighbor = this.grid[index];
              if (neighbor) {
                var d = sample.distanceTo(neighbor);
                if (d < this.r) {
                  ok = false;
                }
              }
            }
          }
          if (ok) {
            found = true;
            this.grid[col + row * this.cols] = sample;
            this.active.push(sample);
            this.ordered.push(sample);
            // Should we break?
            break;
          }
        }
      }
      if (!found) {
        this.active.splice(activRandom, 1);
      }
    }

    this.geos.forEach(geo => {
      let child = geo.update(
        this.ordered,
        this.ordered[this.ordered.length - 1]
      );
      if (child.length > 0) {
        this.geos.push(new Geo(child));
        this.scene.add(this.geos[this.geos.length - 1].mesh);
      }
    });
    console.log(this.geos);
  }

  render() {
    this.time += 0.1;

    //this.triggerPoint()

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
