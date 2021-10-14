Class(function Planet(_input) {
  Inherit(this, Object3D);
  const _this = this;

  let _planet;
  
  //*** Constructor
  (async function () {
    await initSubject();
    initShaders();
    _this.startRender(loop)
    _this.flag('loaded', true);
  })();

  async function initSubject () {
    const _name = _input?.get('wildcard') || 'mars';
    const layout = _this.initClass(SceneLayout, `planet_${_name}`);
    const layers = await layout.getAllLayers();

    _planet = layers.planet;
    _planet.position.z = -1;
  }

  function initShaders () {
    _planet.shader.uniforms.uOpacity.value = 0
  }

  function loop () {
    _planet.rotation.y += 0.002;
  }
  
  //*** Event handlers
  
  //*** Public methods
  this.animateIn = (_time = 2000, _ease = 'easeInOutCubic') => {
    tween(_planet.position, { z: 0 }, _time, _ease);
    _planet.shader.tween('uOpacity', 1.0, _time, _ease);
  }

  this.ready = () => this.wait('loaded')
});