Class(function AsteroidField() {
  Inherit(this, Object3D);
  const _this = this;

  let _asteroids;

  //*** Constructor
  (async function() {
    await initSubject();
    initShaders();
  })();

  async function initSubject () {
    const layout = _this.initClass(SceneLayout, 'asteroid_field_layout');
    const layers = await layout.getAllLayers();
    _asteroids = layers.field;
  }

  function initShaders () {
    _asteroids.shader.addUniforms({
      uOpacity: { value: 0 }
    })
  }

  //*** Event handlers
});