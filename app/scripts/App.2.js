// example import asset
// import imgPath from './assets/img.jpg';

// TODO : add Dat.GUI
// TODO : add Stats

let OrbitControls = require("three-orbit-controls")(THREE);
import Geo from "./Geo";

import saphyr from "../../assets/textures/saphir/Sapphire_001_COLOR.jpg";
import saphyrNormal from "../../assets/textures/saphir/Sapphire_001_NORM.jpg";
import saphyrDisp from "../../assets/textures/saphir/Sapphire_001_DISP.png";
import saphyrRough from "../../assets/textures/saphir/Sapphire_001_ROUGH.jpg";
import saphyrOcclusion from "../../assets/textures/saphir/Sapphire_001_OCC.jpg";

import n from "../../assets/skybox/sky-partieHaute.png";
import e from "../../assets/skybox/sky-partieDroite1.png";
import w from "../../assets/skybox/sky-partieGauche.png";
import s from "../../assets/skybox/sky-partieBasse.png";
import e2 from "../../assets/skybox/sky-partieDroite2.png";
import c from "../../assets/skybox/sky-centre.png";

export default class App {
  constructor() {
    this.time = 0;
    this.container = document.querySelector("#main");
    document.body.appendChild(this.container);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
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
    this.r = 2;
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

    let textureLoader = new THREE.TextureLoader();
    this.texture = textureLoader.load(saphyr);
    this.textureNormal = textureLoader.load(saphyrNormal);
    this.textureDisp = textureLoader.load(saphyrDisp);
    this.textureRough = textureLoader.load(saphyrRough);
    this.textureOcclusion = textureLoader.load(saphyrOcclusion);

    this.geos.push(
      new Geo(
        [],
        this.texture,
        this.textureNormal,
        this.textureDisp,
        this.textureRough,
        this.textureOcclusion,
        this.refractionCube,
        this.reflectionCube
      )
    );
    this.geos.forEach(geo => {
      this.scene.add(geo.mesh);
    });

    //cubemap
    //https://threejs.org/examples/textures/cube/SwedishRoyalCastle/px.jpg
    var path = "https://threejs.org/examples/textures/cube/SwedishRoyalCastle/";
    var format = ".jpg";
    // var urls = [
    //   path + "px" + format,
    //   path + "nx" + format,
    //   path + "py" + format,
    //   path + "ny" + format,
    //   path + "pz" + format,
    //   path + "nz" + format
    // ];

    var urls = [ e,w, n, s,  c,e2];

    this.reflectionCube = new THREE.CubeTextureLoader().load(urls);
    this.reflectionCube.format = THREE.RGBFormat;
    this.refractionCube = new THREE.CubeTextureLoader().load(urls);
    this.refractionCube.mapping = THREE.CubeRefractionMapping;
    this.refractionCube.format = THREE.RGBFormat;
    this.scene.background = this.reflectionCube;

    this.light = new THREE.PointLight(0x0000ff, 1, 100);
    this.light.position.set(50, 50, 50);
    this.scene.add(this.light);
    let light = new THREE.HemisphereLight(0xffffbb, 0x9494ff, 1);
    this.scene.add(light);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    // this.spheres = [];
    // for (let l = 0; l < 2; l++) {
    //   let circleGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    //   let circleMaterial = new THREE.MeshNormalMaterial({ wireframe: true });
    //   let circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
    //   this.spheres.push(circleMesh);
    //   this.scene.add(circleMesh);
    // }

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
            // Should we break? (shiffman comment)
            // console.log("--------------------------------------------------");
            // console.log(this.ordered,this.ordered[this.ordered.length - 1]);

            this.geos.forEach(geo => {
              let child = geo.update(
                this.ordered,
                this.ordered[this.ordered.length - 1],
                this.scene
              );
              if (child.length > 0) {
                this.geos.push(
                  new Geo(
                    child,
                    this.texture,
                    this.textureNormal,
                    this.textureDisp,
                    this.textureRough,
                    this.textureOcclusion,
                    this.refractionCube,
                    this.reflectionCube
                  )
                );
                this.scene.add(this.geos[this.geos.length - 1].mesh);
              }
            });
            break;
          }
        }
      }
      if (!found) {
        this.active.splice(activRandom, 1);
      }
    }

    // console.log(this.geos);
  }

  render() {
    this.time += 0.1;

    this.triggerPoint();

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
