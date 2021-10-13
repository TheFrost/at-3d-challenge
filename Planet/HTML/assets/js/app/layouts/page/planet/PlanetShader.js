Class(function PlanetShader(_mesh, _shader, _group, _input) {
    Inherit(this, Component);

    var _this = this;

    //*** Constructor
    (function() {
        _shader.addUniforms({
            tMap: {value: null, getTexture: Utils3D.getRepeatTexture},
            tNormal: {value: null, getTexture: Utils3D.getRepeatTexture},

            uBias: {value: 0.76},
            uScale: {value: 0.7},
            uOffset: {value: new Vector3(1, 1, 1)},
            uFresnelColor: {value: new Color('#4F3C38')},

            uLightDir: {value: new Vector3(0.75, -0.75, 1.0)},
            uSpecIntensity: {value: 0.014},
            uSpecRange: {value: 12},
            uSpecColor: {value: new Color('#ffffff')},
            uDiffIntensity: {value: 0.4},
            uDiffColor: {value: new Color('#ffc9b2')}
            
        });
    })();

    //*** Event handlers

    //*** Public methods
});