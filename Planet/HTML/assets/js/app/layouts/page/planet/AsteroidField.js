Class(function AsteroidField() {
  Inherit(this, Object3D);
  const _this = this;

  let _asteroids;

  //*** Constructor
  (async function() {
    await initSubject();
    initShaders();
    _this.flag('loaded', true);
  })();

  async function initSubject () {
    const layout = _this.initClass(SceneLayout, 'asteroid_field_layout');
    const layers = await layout.getAllLayers();
    _asteroids = layers.field;
    _asteroids.position.z = -1;
  }

  function initShaders () {
    _asteroids.shader.uniforms.uOpacity.value = 0
  }

  //*** Event handlers

  //*** Public methods
  this.animateIn = (_time = 2000, _ease = 'easeInOutCubic') => {
    tween(_asteroids.position, { z: 0 }, _time, _ease);
    _asteroids.shader.tween('uOpacity', 1.0, _time, _ease);
  }

  this.ready = () => this.wait('loaded')
});