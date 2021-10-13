#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tMap;
uniform vec3 uButtonColor;
uniform vec3 uTextColor1;
uniform vec3 uTextColor2;
uniform float uVerticalTransition;
uniform float uOutlineTransition;

#!VARYINGS
varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

#!SHADER: Vertex
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vNormal = normal;
    vUv = uv;
    vPos = position;
}

#!SHADER: Fragment
#require(range.glsl)
void main() {
    vec4 texture = texture2D(tMap, vUv);
    
    float outlineTransition = texture.b;
    float outlineMask = texture.r * 1.5 * step(1.0 - uOutlineTransition, outlineTransition);
    float y = crange(vUv.y, 0.0, 1.0, 1.0, 0.0);
    float transition = crange(uVerticalTransition, 0.0, 1.0, 1.0, 0.0);
    float fillMask = texture.g * smoothstep(transition- 0.01, transition + 0.01, y);

    gl_FragColor.rgb = uButtonColor;
    gl_FragColor.a = max(outlineMask, fillMask);
}