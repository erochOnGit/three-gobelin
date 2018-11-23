import ch from "geo-convex-hull";
import vertex from "./shaders/shader.vert";
import fragment from "./shaders/shader.frag";

export default class Geo {
  constructor(
    ownedVertice,
    texture,
    textureNormal,
    textureDisp,
    textureRough,
    textureOcclusion,
    refractionCube,
    reflectionCube
  ) {
    this.time = 0;
    this.texture = texture;
    this.textureNormal = textureNormal;
    this.textureDisp = textureDisp;
    this.textureRough = textureRough;
    this.textureOcclusion = textureOcclusion;
    this.refractionCube = refractionCube;
    this.reflectionCube = reflectionCube;

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
    if(this.ownedVertice && this.ownedVertice.length>0){
      for (let i = 0; i < this.ownedVertice.length; i++) {
       this.vert.push(this.ownedVertice[i].x,this.ownedVertice[i].y,0)
      }
    }else{
      this.vert.push(0, 0, 0);
      this.vert.push(0.5, 0.5, 0);
      this.vert.push(0, 0.5, 0);
    }

    let vertices = new Float32Array(this.vert);
    geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));

    this.indice = [];
    for (let a = 1; a < this.vert.length / 3 - 1; a += 1) {
      this.indice.push(0, a, a + 1);
    }

    geometry.setIndex(
      new THREE.BufferAttribute(new Uint32Array(this.indice), 1)
    );

    this.shape = new THREE.Shape();
    this.shape.moveTo(this.vert[0], this.vert[1]);
    for (let s = 0; s < this.vert.length; s += 3) {
      this.shape.lineTo(this.vert[s], this.vert[s + 1]);
    }
    this.shape.lineTo(this.vert[0], this.vert[1]);
    this.extrudeSettings = {
      steps: 10,
      amount: 5,
      bevelEnabled: true,
      bevelThickness: 5,
      bevelSize: 0.1,
      bevelSegments: 5
    };
    this.geometry2 = new THREE.ExtrudeBufferGeometry(
      this.shape,
      this.extrudeSettings
    );

    // this.material = new THREE.MeshPhongMaterial({
    //   // color: 0x00ff00,
    //   // emissive: 0x00ff00,
    //   map: this.texture,
    //   normalMap: this.textureNormal,
    //   displacementMap: this.textureDisp,
    //   aoMap: this.textureOcclusion,
    //   // lightMap: textureMask,
    //   specular: 0xffffff,
    //   specularMap: this.textureRough,
    //   lightMapIntensity: 5,

    //   //wireframe: true,
    //   aoMapIntensity: 5,
    //   emissiveIntensity: 5,
    //   displacementScale: 0.05
    // });

    //materials
    var cubeMaterial3 = new THREE.MeshLambertMaterial({
      color: 0xff6600,
      envMap: this.reflectionCube,
      combine: THREE.MixOperation,
      reflectivity: 0.3
    });
    // var cubeMaterial2
    this.material = new THREE.MeshLambertMaterial({
      color: 0xff00ee,
      envMap: this.refractionCube,
      refractionRatio: 0.95
    });
    var cubeMaterial1 = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      envMap: this.reflectionCube
    });

    // this.material.transparent = true;
    // this.material.opacity = 0.7;

    this.mesh = new THREE.Mesh(this.geometry2, this.material);
    this.mesh.rotation.x = 5;
    this.mesh.rotation.y = Math.random() * 10;
    
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
  update(wholeDots, lastDot, scene) {
    this.time++
    this.childDots = [];
    if (this.ownedVertice.length < 1) {
      this.finalDots = wholeDots;
    } else {
      this.finalDots = this.ownedVertice;
      if (this.finalDots[this.finalDots.length - 1] == lastDot) {
        this.finalDots.pop();
      }
      //  console.log(
      //   "this.ownedVertice",
      //   this.ownedVertice,
      //   "this.minVerticeX",
      //   this.minVerticeX,
      //   "lastDot",
      //   lastDot.x,
      //   "finaldots",
      //   this.finalDots[this.finalDots.length - 1].x
      // );
      if (this.minVerticeX && lastDot.x < this.minVerticeX) {
        // console.log("trop petit");
      } else if (this.maxVerticeX && lastDot.x > this.maxVerticeX) {
        // console.log("trop grand");
      } else {
        // console.log("added anyway");
        this.finalDots.push(lastDot);
      }
    }

    // console.log("finaldots", this.finalDots);

    if (this.finalDots.length > this.maxVertice) {
      console.log(
        "finaldotslength",
        this.finalDots.length,
        "maxVertice",
        this.maxVertice
      );
    }
    if (this.finalDots.length > this.maxVertice - 1) {
      this.childMoy = this.moyenne(
        this.finalDots.map(dot => {
          return dot.x;
        })
      );
      //       var geometry = new THREE.BoxGeometry( 1, 1, 1 );
      // var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
      // var cube = new THREE.Mesh( geometry, material );
      // cube.position.x = this.childMoy
      // cube.scale.y = 100;
      //       scene.add(cube)
      //console.log("moy",this.childMoy)

      let removedDot = 0;
      for (let i = 0; i < this.finalDots.length + removedDot; i++) {
        if (this.finalDots[i - removedDot].x < this.childMoy) {
          this.childDots.push(this.finalDots[i - removedDot]);
          this.finalDots.splice(i - removedDot, 1);
          removedDot++;
        }
      }
      //this.mesh.material.uniforms.color.value = new THREE.Color(0xdd88a5);
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
    //console.log("this.vert.length", this.vert.length);
    for (let j = 1; j < this.vert.length / 3 - 1; j += 1) {
      this.indice.push(0, j, j + 1);
    }

    // shape.lineTo( 0, width );
    // shape.lineTo( length, width );
    // shape.lineTo( length, 0 );
    // shape.lineTo( 0, 0 );

    this.mesh.geometry.addAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(this.vert), 3)
    );

    this.mesh.geometry.setIndex(
      new THREE.BufferAttribute(new Uint32Array(this.indice), 1)
    );

    this.shape = new THREE.Shape();
    this.shape.moveTo(this.vert[0], this.vert[1]);
    for (let s = 0; s < this.vert.length; s += 3) {
      this.shape.lineTo(this.vert[s], this.vert[s + 1]);
    }
    this.shape.lineTo(this.vert[0], this.vert[1]);

    this.extrudeSettings = {
      steps: 10,
      amount: Math.floor(this.time /5) +0.1,
      bevelEnabled: true,
      bevelThickness: Math.floor(this.time /10) +0.1,
      bevelSize: Math.floor(this.time /10) +0.1,
      bevelSegments: 5
    };
    //console.log(this.shape);

    if (this.shape.curves.length > 3) {
      this.geometry2 = new THREE.ExtrudeBufferGeometry(
        this.shape,
        this.extrudeSettings
      );

      // this.material = new THREE.ShaderMaterial({
      //   uniforms: {
      //     color: { value: new THREE.Color(0x0000ff) }
      //   },
      //   vertexShader: vertex,
      //   fragmentShader: fragment
      // });

      this.mesh.geometry = this.geometry2;
      this.mesh.position.x = this.mesh.position.x + Math.cos(this.time/200) 
      this.mesh.position.y = this.mesh.position.y + Math.cos(this.time/200) 
      //    console.log(this.mesh)
      //this.mesh = new THREE.Mesh(this.geometry2, this.material);
    }

    return this.childDots;
  }
}
