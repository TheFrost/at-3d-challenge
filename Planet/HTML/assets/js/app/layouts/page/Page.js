Class(function Page() {
  Inherit(this, Object3D);
  const _this = this;

  let _camera, _planet, _asteroids, _heading, _button;
  let _cameraOrigin = new Vector3();
  
  //*** Constructor
  (async function () {
    await init();
    initCamera();
    addHandlers();
    _this.startRender(loop);
    animateIn();
  })();

  async function init () {
    const layout = _this.initClass(SceneLayout, 'page_layout');
    const layers = await layout.getAllLayers();

    _planet = layers.planet;
    _asteroids = layers.asteroids;
    _heading = layers.heading;
    _button = layers.button;
    _camera = layers.camera;

    await _planet.ready();
    await _asteroids.ready();
    await _heading.ready();
    await _button.ready();
  }

  function initCamera () {
    _cameraOrigin = _camera.group.position.clone();
    _camera.lock();
  }

  async function animateIn () {
    _planet.animateIn(5000);
    _asteroids.animateIn(5000);
    await _this.wait(3000);
    _heading.animateIn(2000);
    await _this.wait(1000);
    _button.animateIn(2000);
  }
  
  //*** Event handlers
  function addHandlers () {
    _this.events.sub(PageUIButton.OVER, handlerOver);
    _this.events.sub(PageUIButton.OUT, handlerOut);
  }

  function handlerOver () {
    _this.flag('isHovered', true)
  }

  function handlerOut () {
    _this.flag('isHovered', false)
  }

  function loop () {
    let cameraTarget = _cameraOrigin.z;

    if (_this.flag('isHovered')) {
      cameraTarget = _cameraOrigin.z - 1.0;
    }

    _camera.group.position.z = Math.lerp(cameraTarget, _camera.group.position.z, 0.04);
  }
  
  //*** Public methods
  
});