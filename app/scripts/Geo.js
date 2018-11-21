import ch from "geo-convex-hull";
import vertex from "./shaders/shader.vert";
import fragment from "./shaders/shader.frag";
export default class Geo {
  constructor() {
    this.finalConvex = [];
    this.vert = [];
    this.indice = [];
    this.finalDots = [];
    this.maxVertice = 8;
    this.childDots = [];

    let geometry = new THREE.BufferGeometry();
    this.vert.push(0, 0, 0);
    this.vert.push(0.5, 0.5, 0);
    this.vert.push(0, 0.5, 0);

    let vertices = new Float32Array(this.vert);
    geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));

    this.indice = [];
    for (let a = 1; a < this.vert.length / 3 - 1; a += 1) {
      this.indice.push(0, a, a + 1);
    }

    geometry.setIndex(
      new THREE.BufferAttribute(new Uint32Array(this.indice), 1)
    );

    let material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0x00ff00) }
      },
      vertexShader: vertex,
      fragmentShader: fragment
    });
    this.mesh = new THREE.Mesh(geometry, material);
  }

  update(wholeDots, forbidenDots) {
    this.finalDots = wholeDots.filter(dot => {
      let unforbiden = true;
      for (let i = 0; i < forbidenDots.length; i++) {
        if (dot.x == forbidenDots[i].x && dot.y == forbidenDots[i].y);
        unforbiden = false;
      }
      return unforbiden;
    });
    //console.log(wholeDots, this.finalDots);
    this.childDots = [];
    if (this.finalDots.length > this.maxVertice) {
      for (let i = 0; i < this.finalDots.length / 2; i++) {
        this.childDots.push(this.finalDots[i]);
        this.finalDots.splice(i, 1);
      }
    }

    this.vert.splice(0, this.vert.length);

    this.finalConvex = ch(
      wholeDots.map(sampl => {
        return { latitude: sampl.x / 2, longitude: sampl.y / 2 };
      })
    );

    for (var i = 0; i < this.finalConvex.length; i++) {
      if (wholeDots[i]) {
        this.vert.push(
          this.finalConvex[i].latitude,
          this.finalConvex[i].longitude,
          0
        );

        // this.spheres[i].position.x = this.finalConvex[i].latitude;
        // this.spheres[i].position.y = this.finalConvex[i].longitude;
      }
    }

    for (let j = 1; j < this.vert.length / 3 - 1; j += 1) {
      this.indice.push(0, j, j + 1);
    }
    this.mesh.geometry.addAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(this.vert), 3)
    );
    this.mesh.geometry.setIndex(
      new THREE.BufferAttribute(new Uint32Array(this.indice), 1)
    );

    return this.childDots
  }
}
