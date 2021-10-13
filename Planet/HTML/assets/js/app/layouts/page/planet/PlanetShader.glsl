#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tMap;
uniform sampler2D tNormal;

uniform float uBias;
uniform float uScale;
uniform vec3 uOffset;
uniform vec3 uFresnelColor;

uniform vec3 uLightDir;
uniform float uSpecIntensity;
uniform float uSpecRange;
uniform vec3 uSpecColor;
uniform float uDiffIntensity;
uniform vec3 uDiffColor;

#!VARYINGS
varying vec2 vUv;
varying vec3 vViewDir;
varying vec3 vNormal;

#!SHADER: Vertex
void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    vViewDir = normalize(-mvPosition.xyz);
    vUv = uv;
    vNormal = normalMatrix * -normal;
}

#!SHADER: Fragment
#require(range.glsl)
#require(normalmap.glsl)
void main() {
    vec2 st = vUv;

    vec3 texture = texture2D(tMap, st).rgb;

    float bias = uBias;
    float scale = uScale;
    float power = 1.0;
    float fresnel = bias + scale * pow(1.0 + dot(vViewDir + uOffset, vNormal * vec3(1.0, -1.0, 1.0)), power);
    fresnel = pow(fresnel, 2.0);

    vec3 norm = unpackNormal(vViewDir, vNormal, tNormal, 2.0, 1.0, st);
    vec3 lightDir = vec3(1.0, 0.5, 0.5);
    vec3 reflectDir = reflect(uLightDir, norm);  

    float diff = max(dot(norm, uLightDir), 0.0);
    float spec = pow(max(dot(vViewDir, reflectDir), 0.0), uSpecRange);

    vec3 color = texture * vec3(diff * uDiffIntensity * uDiffColor + spec * uSpecIntensity * uSpecColor + fresnel * uFresnelColor);

    gl_FragColor.rgb = color;
    gl_FragColor.a = 1.0;
}