float range(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
    float oldRange = oldMax - oldMin;
    float newRange = newMax - newMin;
    return (((oldValue - oldMin) * newRange) / oldRange) + newMin;
}

float crange(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
    return clamp(range(oldValue, oldMin, oldMax, newMin, newMax), min(newMax, newMin), max(newMin, newMax));
}

vec2 crange(vec2 oldValue, vec2 oldMin, vec2 oldMax, vec2 newMin, vec2 newMax) {
    vec2 v;
    v.x = crange(oldValue.x, oldMin.x, oldMax.x, newMin.x, newMax.x);
    v.y = crange(oldValue.y, oldMin.y, oldMax.y, newMin.y, newMax.y);
    return v;
}

vec2 range(vec2 oldValue, vec2 oldMin, vec2 oldMax, vec2 newMin, vec2 newMax) {
    vec2 v;
    v.x = range(oldValue.x, oldMin.x, oldMax.x, newMin.x, newMax.x);
    v.y = range(oldValue.y, oldMin.y, oldMax.y, newMin.y, newMax.y);
    return v;
}

vec3 crange(vec3 oldValue, vec3 oldMin, vec3 oldMax, vec3 newMin, vec3 newMax) {
    vec3 v;
    v.x = crange(oldValue.x, oldMin.x, oldMax.x, newMin.x, newMax.x);
    v.y = crange(oldValue.y, oldMin.y, oldMax.y, newMin.y, newMax.y);
    v.z = crange(oldValue.z, oldMin.z, oldMax.z, newMin.z, newMax.z);
    return v;
}

vec3 range(vec3 oldValue, vec3 oldMin, vec3 oldMax, vec3 newMin, vec3 newMax) {
    vec3 v;
    v.x = range(oldValue.x, oldMin.x, oldMax.x, newMin.x, newMax.x);
    v.y = range(oldValue.y, oldMin.y, oldMax.y, newMin.y, newMax.y);
    v.z = range(oldValue.z, oldMin.z, oldMax.z, newMin.z, newMax.z);
    return v;
}