#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tMap;
uniform float uHorizontalTransition;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uColorTransition;
uniform vec3 uBoundingMax;
uniform vec3 uBoundingMin;
uniform float uOpacity;

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
#require(msdf.glsl)
#require(range.glsl)
void main() {
    float fill = msdf(tMap, vUv);

    float x = crange(vPos.x, uBoundingMin.x, uBoundingMax.x + uBoundingMax.x / 2.0, 0.0, 1.0);
    float y = crange(vPos.y, uBoundingMin.y, uBoundingMax.y, 0.05, -0.95);
    float horizontalTransition = smoothstep(uHorizontalTransition, uHorizontalTransition - 0.2, x);

    vec3 color = mix(uColor1, uColor2, uColorTransition);
    gl_FragColor.rgb = color;
    gl_FragColor.a = fill * horizontalTransition * uOpacity;
}