Class(function PageUIButton(_input) {
  Inherit(this, Object3D);
  const _this = this;

  let _button, _text;
  
  //*** Constructor
  (async function () {
    await initUI()
    initShaders()
    addHandlers()

    _this.startRender(loop);
  })();

  async function initUI () {
    const layout = _this.initClass(SceneLayout, 'page_ui_button_layout');
    const layers = await layout.getAllLayers();

    _button = layers.button;
    _text = layers.text;

    await _text.ready();
  }

  function initShaders () {
    _text.shader.addUniforms({
      uColor1: { value: new Color('#eeefd2') },
      uColor2: { value: new Color('#000000') },
      uHorizontalTransition: { value: 1 },
      uColorTransition: { value: 0 },
      uOpacity: { value: 0 }
    });

    _button.shader.addUniforms({
      uOpacity: { value: 0 },
      uVerticalTransition: { value: 0 }
    })
  }

  function loop () {
    let target = 0;

    if (_this.flag('isOver')) target = 1

    _button.shader.uniforms.uVerticalTransition.value = Math.lerp(target, _button.shader.uniforms.uVerticalTransition.value, 0.12);
  }
  
  //*** Event handlers
  function addHandlers () {
    Interaction3D.find(World.CAMERA).add(_button, hover, click)
  }

  function hover (e) {
    switch(e.action) {
      case 'over':
        handlerOver();
        break;
      case 'out':
        handlerOut();
        break;
    }
  }

  function handlerOver () {
    console.log('over')
    _this.flag('isOver', true);
    _text.shader.tween('uColorTransition', 1.0, 250);
    _this.events.fire(PageUIButton.OVER);
  }

  function handlerOut () {
    console.log('out')
    _this.flag('isOver', false);
    _text.shader.tween('uColorTransition', 0.0, 250);
    _this.events.fire(PageUIButton.OUT);
  }

  function click (e) {
    console.log(e.action)
  }
  
  //*** Public methods
  
}, _ => {
  PageUIButton.OVER = 'pageuibuttonover';
  PageUIButton.OUT = 'pageuibuttonout';
});