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
    let r = 1;
    let geometry = new THREE.BufferGeometry();
    vert.push(0, 0, 0);
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        let theta = (Math.PI * ((360 / 25) * (x * 5 + y))) / 180;
        // let vx = r * Math.cos(y) * Math.sin(x);
        // let vy = r * Math.sin(y) * Math.sin(x);
        // let vz = r * Math.cos(x);
        vert.push(
          Math.cos(theta), //r * Math.cos(y) * Math.sin(x)
          Math.sin(theta), //r * Math.sin(y) * Math.sin(x)
          0 // r * Math.cos(x)
        );
      }
    }
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
    // for (let x = 0; x < 6; x++) {
    //   vert.push(Math.random() * 2 - 1);
    //   vert.push(Math.random() * 2 - 1);
    //   vert.push(0);
    // }
    let vertices = new Float32Array(vert);
    geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
    let indice = [];
    // indice.push(0, 1, 2);
    // indice.push(0, 2, 3);
    // indice.push(0, 3, 4);
    // indice.push(0, 4, 5);
    // indice.push(0, 5, 6);
    // indice.push(0, 6, 7);
    for (let k = 1; k < 25; k += 1) {
      indice.push(0, k, k + 1);
    }
    indice.push(0, 25, 1);
    console.log(indice);
    let indices = new Uint32Array(indice);
    // let indices = new Uint32Array([0, 1, 2, 0, 3, 4, 1, 4, 5]);
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

    window.addEventListener("resize", this.onWindowResize.bind(this), false);
    this.onWindowResize();

    this.renderer.animate(this.render.bind(this));
  }

  render() {
    this.time += 0.1;
    // this.mesh.rotation.x += 0.01;
    // this.mesh.rotation.y += 0.02;
    // this.mesh.geometry.attributes.position.array[0] = Math.sin(this.time) * 0.7;
    // this.mesh.geometry.attributes.position.needsUpdate = true;
    this.mesh.material.uniforms.color.value = {
      r: Math.sin(this.time),
      g: Math.cos(this.time),
      b: 1
    };
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
