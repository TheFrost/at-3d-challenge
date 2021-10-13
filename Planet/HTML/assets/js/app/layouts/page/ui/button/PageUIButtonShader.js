Class(function PageUIButtonShader(_mesh, _shader, _group, _input) {
    Inherit(this, Component);

    var _this = this;

    //*** Constructor
    (function() {
        _shader.addUniforms({
            tMap: {value: null},
            uButtonColor: {value: new Color('#eeefd2')},
            uTextColor1: {value: new Color('#eeefd2')},
            uTextColor2: {value: new Color('#000000')},
            uVerticalTransition: {value: 0.0, ignoreUIL: true},
            uOutlineTransition: {value: 1.0, ignoreUIL: true},
        });
    })();

    //*** Event handlers

    //*** Public methods
});