import ch from "geo-convex-hull";
import vertex from "./shaders/shader.vert";
import fragment from "./shaders/shader.frag";
export default class Geo {
  constructor(ownedVertice) {
    this.finalConvex = [];
    this.vert = [];
    this.indice = [];
    this.finalDots = [];
    this.maxVertice = 20;
    this.ownedVertice = ownedVertice || [];
    this.childDots = [];
    this.childMoy = 0;
    this.minVerticeX = null;
    this.maxVerticeX = ownedVertice
      ? this.bigger(ownedVertice.map(vertice => vertice.x))
      : null;

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
        color: { value: new THREE.Color(0x0000ff) }
      },
      vertexShader: vertex,
      fragmentShader: fragment
    });
    this.mesh = new THREE.Mesh(geometry, material);
  }
  moyenne(numbers) {
    let total = 0;
    numbers.forEach(number => {
      total = total + number;
    });
    return total / numbers.length;
  }
  smaller(numbers) {
    let smaller = numbers[0];
    numbers.forEach(number => {
      smaller = number < smaller ? number : smaller;
    });
    return smaller;
  }
  bigger(numbers) {
    let bigger = numbers[0];
    numbers.forEach(number => {
      bigger = number < bigger ? number : bigger;
    });
    return bigger;
  }
  update(wholeDots, lastDot) {
    this.childDots = [];

    if (this.ownedVertice.length < 1) {
      this.finalDots = wholeDots;
    } else {
      this.finalDots = this.ownedVertice;
      console.log("this.minVerticeX", this.minVerticeX, "lastDot", lastDot);
      console.log(lastDot)
      if (this.minVerticeX && lastDot.x > this.minVerticeX) {
        console.log("trop petit");
      } else if (this.maxVerticeX && lastDot.x < this.maxVerticeX) {
        console.log("trop grand");
      } else {
        this.finalDots.push(lastDot);
      }
    }

    if (this.finalDots.length > this.maxVertice) {
      console.log("finaldots",this.finalDots.length,"maxVertice",this.maxVertice);
    }
    if (this.finalDots.length > this.maxVertice-1) {
      this.childMoy = this.moyenne(
        this.finalDots.map(dot => {
          return dot.x;
        })
      );
console.log("moy",this.childMoy)
let removedDot = 0;
      for (let i = 0; i < this.finalDots.length+removedDot; i++) {
        console.log(i,this.finalDots.length)
        if (this.finalDots[i-removedDot].x < this.childMoy) {
          this.childDots.push(this.finalDots[i-removedDot]);
          this.finalDots.splice(i-removedDot, 1);
          removedDot++
        }
      }
      this.mesh.material.uniforms.color.value = new THREE.Color(0xdd88a5);
      this.minVerticeX = this.smaller(this.finalDots.map(dot => dot.x));
      this.ownedVertice = this.finalDots;
    }

    this.finalConvex = ch(
      this.finalDots.map(sampl => {
        return { latitude: sampl.x / 2, longitude: sampl.y / 2 };
      })
    );

    this.vert.splice(0, this.vert.length);
    this.indice.splice(0, this.indice.length);

    for (var i = 0; i < this.finalConvex.length; i++) {
      if (this.finalDots[i]) {
        this.vert.push(
          this.finalConvex[i].latitude,
          this.finalConvex[i].longitude,
          0
        );
      }
    }
    console.log("this.vert.length", this.vert.length);
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

    return this.childDots;
  }
}
