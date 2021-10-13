Class(function PageUIHeading() {
  Inherit(this, Object3D);
  const _this = this;

  let _heading;
  
  //*** Constructor
  (async function () {
    await initScene();
    initShaders();
    addHandlers();

    _this.startRender(loop);
  })();

  async function initScene () {
    const layout = _this.initClass(SceneLayout, 'page_ui_heading_layout');
    const layers = await layout.getAllLayers();
    _heading = layers.text;

    await _heading.ready();
  }

  function initShaders () {
    _heading.shader.addUniforms({
      uVerticalTransition: { value: 0 },
      uHorizontalTransition: { value: 1 },
      uOpacity: { value: 0 }
    })
  }

  function loop () {
    let target = 0;

    if (_this.flag('isOver')) target = 1

    _heading.shader.uniforms.uVerticalTransition.value = Math.lerp(target, _heading.shader.uniforms.uVerticalTransition.value, 0.12);
  }
  
  //*** Event handlers
  function addHandlers () {
    _this.events.sub(PageUIButton.OVER, handlerOver);
    _this.events.sub(PageUIButton.OUT, handlerOut);
  }

  function handlerOver () {
    _this.flag('isOver', true);
  }

  function handlerOut () {
    _this.flag('isOver', false);
  }
  
  //*** Public methods
  
});