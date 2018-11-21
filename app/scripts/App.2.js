// example import asset
// import imgPath from './assets/img.jpg';

// TODO : add Dat.GUI
// TODO : add Stats

let OrbitControls = require("three-orbit-controls")(THREE);
import vertex from "./shaders/shader.vert";
import fragment from "./shaders/shader.frag";
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
    this.camera.position.z = 7;

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
    this.r = 4;
    this.k = 30; //quitTrial
    this.w = this.r / Math.sqrt(2);
    this.grid = [];
    this.active = [];
    this.ordered = [];

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

    //same

    let geometry = new THREE.BufferGeometry();
    this.vert.push(0, 0, 0);
    this.vert.push(0.5, 0.5, 0);
    this.vert.push(0, 0.5, 0);

    let vertices = new Float32Array(this.vert);
    geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));

    let indice = [];
    for (let a = 1; a < this.vert.length / 3 - 1; a += 1) {
      indice.push(0, a, a + 1);
    }

    let indices = new Uint32Array(indice);
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    let material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0x00ff00) }
      },
      vertexShader: vertex,
      fragmentShader: fragment
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    this.mesh.geometry.attributes.position.array[0] = Math.sin(this.time) * 0.7;
    this.mesh.geometry.attributes.position.needsUpdate = true;

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

    this.renderer.animate(this.render.bind(this));
  }

  render() {
    this.time += 0.1;
    // console.log("grid", this.grid.length);
    for (var total = 0; total < 25; total++) {
      if (this.active.length > 0) {
        // console.log("activeLength", this.active.length);
        let activRandom = Math.floor(Math.random() * this.active.length);
        // console.log(activRandom);
        let posi = this.active[activRandom];
        var found = false;
        for (let n = 0; n < this.k; n++) {
          let angle = Math.random() * Math.PI * 2;
          let offX = Math.cos(angle);
          let offY = Math.sin(angle);
          let sample = new THREE.Vector2(offX, offY);

          // multiplyScalar
          // console.log(sample);
          let magnitude = Math.random() * (2 * this.r) + this.r;
          // console.log("alone", sample, "magnitude", magnitude);
          sample.multiplyScalar(magnitude);
          // console.log("mag", sample);
          sample.add(posi);
          // console.log(sample);
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
    }
    console.log(this.ordered);
    // for (let gr = 0; gr < this.grid.length; gr++) {
    //   // console.log(this.spheres[gr]);
    //   if (this.grid[gr] != -1) {
    //     // console.log(sphere);
    //     this.spheres[gr].material.wireframe = false;
    //     this.spheres[gr].position.x = this.grid[gr].x / this.k;
    //     this.spheres[gr].position.y = this.grid[gr].y / this.k;
    //   }
    // }
    // for (let act = 0; act < this.active.length; act++) {
    //   this.spheres[act].material.opacity = 0.5;
    //   this.spheres[act].position.x = this.active[act].x;
    //   this.spheres[act].position.y = this.active[act].y;
    // }
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}