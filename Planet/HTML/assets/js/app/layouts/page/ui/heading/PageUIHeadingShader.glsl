#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tMap;
uniform vec3 uColor;
uniform float uVerticalTransition;
uniform float uHorizontalTransition;
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
    float stroke = 0.4;
    float padding = 0.4;
    float outline = strokemsdf(tMap, vUv, stroke, padding);

    float edgeFade = (1.0 - strokemsdf(tMap, vUv, 0.05, 0.15));
    float fill = msdf(tMap, vUv);
    fill *= edgeFade;

    float x = crange(vPos.x, uBoundingMin.x, uBoundingMax.x + uBoundingMax.x / 2.0, 0.0, 1.0);
    float y = crange(vPos.y, uBoundingMin.y, uBoundingMax.y, 0.05, -0.95);
    float verticalTransition = 1.0 - smoothstep(-uVerticalTransition + 0.05, -uVerticalTransition - 0.01 + 0.05, y);
    float horizontalTransition = smoothstep(uHorizontalTransition, uHorizontalTransition - 0.2, x);

    fill *= verticalTransition;

    vec3 color = uColor;
    gl_FragColor.rgb = color;
    gl_FragColor.a = max(fill, outline) * horizontalTransition * uOpacity;
}