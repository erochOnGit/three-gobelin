// example import asset
// import imgPath from './assets/img.jpg';

// TODO : add Dat.GUI
// TODO : add Stats
let OrbitControls = require("three-orbit-controls")(THREE);
import Sound from "./Sound";
import GrowingMesh from "./GrowingMesh";

// import crystal from "../../assets/textures/Crystal_Metal_001_SD/Crystal_Metal_001_COLOR.jpg";
// import crystalNormal from "../../assets/textures/Crystal_Metal_001_SD/Crystal_Metal_001_NORM.jpg";
// import crystalDisp from "../../assets/textures/Crystal_Metal_001_SD/Crystal_Metal_001_DISP.png";
// import crystalRough from "../../assets/textures/Crystal_Metal_001_SD/Crystal_Metal_001_ROUGH.jpg";
// import crystalOcclusion from "../../assets/textures/Crystal_Metal_001_SD/Crystal_Metal_001_OCC.jpg";
// import crystalMask from "../../assets/textures/Crystal_Metal_001_SD/Crystal_Metal_001_MASK.png";

import saphyr from "../../assets/textures/saphir/Sapphire_001_COLOR.jpg";
import saphyrNormal from "../../assets/textures/saphir/Sapphire_001_NORM.jpg";
import saphyrDisp from "../../assets/textures/saphir/Sapphire_001_DISP.png";
import saphyrRough from "../../assets/textures/saphir/Sapphire_001_ROUGH.jpg";
import saphyrOcclusion from "../../assets/textures/saphir/Sapphire_001_OCC.jpg";

export default class App {
  constructor() {
    this.deltaTime = 0;
    this.thisTime = 0;
    this.lastTime = Date.now();
    this.container = document.querySelector("#main");
    document.body.appendChild(this.container);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.z = 5;
    this.camera.position.y = 2;
    this.musics = [
      "/assets/musics/RISE.mp3",
      "/assets/musics/Warriors.mp3",
      "/assets/musics/LegendsNeverDie.mp3"
    ];

    this.sound = new Sound(
      this.musics[Math.floor(Math.random() * Math.floor(this.musics.length))],
      100,
      0,
      () => {
        this.sound.play();
      },
      true
    );

    // control of the camera by the user
    // and all its configuration
    //
    this.controls = new OrbitControls(this.camera);
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.enableRotate = true;

    this.controls.minDistance;
    this.controls.maxDistance;

    this.controls.minPolarAngle;
    this.controls.maxPolarAngle;

    this.scene = new THREE.Scene();
    let textureLoader = new THREE.TextureLoader();
    let texture = textureLoader.load(saphyr);
    let textureNormal = textureLoader.load(saphyrNormal);
    let textureDisp = textureLoader.load(saphyrDisp);
    let textureRough = textureLoader.load(saphyrRough);
    let textureOcclusion = textureLoader.load(saphyrOcclusion);
    // let textureMask = textureLoader.load(crystalMask);
    let growingMesh = new GrowingMesh(
      { x: 1, y: 1 },
      texture,
      textureNormal,
      textureDisp,
      textureRough,
      textureOcclusion
    );
    this.growingMeshes = [];
    this.growingMeshes.push(growingMesh);
    this.scene.add(growingMesh.mesh);

    let kick = this.sound.createKick({
      frequency: [20, 100],
      threshold: 200,
      decay: 0.6,
      onKick: () => {
        this.growingMeshes.forEach(growingMesh => {
          growingMesh.update(this.scene, this.growingMeshes);
        });

        // this.camera.position.z += 0.1;
        // this.camera.position.y += 0.1;
      },
      offKick: null
    });
    kick.on();

    this.light = new THREE.PointLight(0x0000ff, 1, 100);
    this.light.position.set(50, 50, 50);
    this.scene.add(this.light);
    let light = new THREE.HemisphereLight(0xffffbb, 0x9494ff, 1);
    this.scene.add(light);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    window.addEventListener("resize", this.onWindowResize.bind(this), false);
    this.onWindowResize();

    this.renderer.animate(this.render.bind(this));
  }

  render() {
    // if (this.sound.isLoaded) {
    //   this.sound.play();
    // }
    this.thisTime = Date.now();
    this.deltaTime += this.thisTime - this.lastTime;
    this.lastTime = this.thisTime;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
