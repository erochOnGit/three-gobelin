class GrowingMesh {
  constructor(
    position,
    texture,
    textureNormal,
    textureDisp,
    textureRough,
    textureOcclusion
  ) {
    this.position = position;
    this.texture = texture;
    this.textureNormal = textureNormal;
    this.textureDisp = textureDisp;
    this.textureRough = textureRough;
    this.textureOcclusion = textureOcclusion;
    this.geometry = new THREE.SphereGeometry(0.2, 50, 50);
    this.material = new THREE.MeshPhongMaterial({
      // color: 0x00ff00,
      // emissive: 0x00ff00,
      map: this.texture,
      normalMap: this.textureNormal,
      displacementMap: this.textureDisp,
      aoMap: this.textureOcclusion,
      // lightMap: textureMask,
      specular: 0xffffff,
      specularMap: this.textureRough,
      lightMapIntensity: 1,

      // wireframe: true,
      aoMapIntensity: 0.9,
      emissiveIntensity: 1,
      displacementScale: 0.05
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.x = position.x;
    this.mesh.position.y = position.y;
    this.split = 1;
  }
  getMesh() {
    return this.mesh;
  }
  update(scene, meshes) {
    this.mesh.scale.x += 0.1;
    this.mesh.scale.y += 0.1;
    this.mesh.scale.z += 0.01;
    this.split += 1;
    if (this.split % 16 == 0) {
      this.mesh.scale.x -= 0.4;
      this.mesh.scale.y -= 0.4;
      let son = new GrowingMesh(
        {
          x: Math.random() * this.position.x + this.position.x,
          y: Math.random() * this.position.y + this.position.y
        },
        this.texture,
        this.textureNormal,
        this.textureDisp,
        this.textureRough,
        this.textureOcclusion
      );
      scene.add(son.mesh);
      meshes.push(son);
    }
  }
}
export default GrowingMesh;
