#!ATTRIBUTES
attribute vec3 animation;

#!UNIFORMS
uniform sampler2D tMap;
uniform vec3 uColor;
uniform float uAlpha;
uniform vec3 uTranslate;
uniform vec3 uRotate;
uniform float uTransition;
uniform float uWordCount;
uniform float uLineCount;
uniform float uLetterCount;
uniform float uByWord;
uniform float uByLine;
uniform float uPadding;
uniform vec3 uBoundingMin;
uniform vec3 uBoundingMax;

#!VARYINGS
varying float vTrans;
varying vec2 vUv;
varying vec3 vPos;

#!SHADER: Vertex

#require(range.glsl)
#require(eases.glsl)
#require(rotation.glsl)
#require(conditionals.glsl)

void main() {
    vUv = uv;
    vTrans = 1.0;

    vec3 pos = position;

    if (uTransition < 5.0) {
        float padding = uPadding;
        float letter = (animation.x + 1.0) / uLetterCount;
        float word = (animation.y + 1.0) / uWordCount;
        float line = (animation.z + 1.0) / uLineCount;

        float letterTrans = crange(uTransition, letter - padding, letter + padding, 0.0, 1.0);
        float wordTrans = crange(uTransition, word - padding, word + padding, 0.0, 1.0);
        float lineTrans = crange(uTransition, line - padding, line + padding, 0.0, 1.0);

        vTrans = mix(cubicOut(letterTrans), cubicOut(wordTrans), uByWord);
        vTrans = mix(vTrans, cubicOut(lineTrans), uByLine);

        float invTrans = (1.0 - vTrans);
        vec3 nRotate = normalize(uRotate);
        vec3 axisX = vec3(1.0, 0.0, 0.0);
        vec3 axisY = vec3(0.0, 1.0, 0.0);
        vec3 axisZ = vec3(0.0, 0.0, 1.0);
        vec3 axis = mix(axisX, axisY, when_gt(nRotate.y, nRotate.x));
        axis = mix(axis, axisZ, when_gt(nRotate.z, nRotate.x));
        pos = vec3(vec4(position, 1.0) * rotationMatrix(axis, radians(max(max(uRotate.x, uRotate.y), uRotate.z) * invTrans)));
        pos += uTranslate * invTrans;
    }

    vPos = pos;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

#!SHADER: Fragment

#require(range.glsl)
#require(msdf.glsl)
#require(simplenoise.glsl)

vec2 getBoundingUV() {
    vec2 uv;
    uv.x = crange(vPos.x, uBoundingMin.x, uBoundingMax.x, 0.0, 1.0);
    uv.y = crange(vPos.y, uBoundingMin.y, uBoundingMax.y, 0.0, 1.0);
    return uv;
}

void main() {
    float alpha = msdf(tMap, vUv);

    //float noise = 0.5 + smoothstep(-1.0, 1.0, cnoise(vec3(vUv*50.0, time* 0.3))) * 0.5;

    gl_FragColor.rgb = uColor;
    gl_FragColor.a = alpha * uAlpha * vTrans;
}
