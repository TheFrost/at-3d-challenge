Class(function Planet(_input) {
  Inherit(this, Object3D);
  const _this = this;

  let _planet;
  
  //*** Constructor
  (async function () {
    await initSubject();
    initShaders();

    _this.startRender(loop)
  })();

  async function initSubject () {
    const _name = _input?.get('wildcard') || 'mars';
    const layout = _this.initClass(SceneLayout, `planet_${_name}`);
    const layers = await layout.getAllLayers();
    _planet = layers.planet;
  }

  function initShaders () {
    _planet.shader.addUniforms({
      uOpacity: { value: 0 }
    })
  }

  function loop () {
    _planet.rotation.y += 0.002;
  }
  
  //*** Event handlers
  
  //*** Public methods
});