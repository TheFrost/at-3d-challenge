vec3 transformNormal(vec3 n, vec4 orientation) {
    vec3 nn = n + 2.0 * cross(orientation.xyz, cross(orientation.xyz, n) + orientation.w * n);
    return nn;
}

vec3 transformPosition(vec3 position, vec3 offset, vec3 scale, vec4 orientation) {
    vec3 pos = position;
    pos *= scale;

    pos = pos + 2.0 * cross(orientation.xyz, cross(orientation.xyz, pos) + orientation.w * pos);
    pos += offset;
    return pos;
}

vec3 transformPosition(vec3 position, vec3 offset, vec4 orientation) {
    vec3 pos = position;

    pos = pos + 2.0 * cross(orientation.xyz, cross(orientation.xyz, pos) + orientation.w * pos);
    pos += offset;
    return pos;
}

vec3 transformPosition(vec3 position, vec3 offset, float scale, vec4 orientation) {
    return transformPosition(position, offset, vec3(scale), orientation);
}

vec3 transformPosition(vec3 position, vec3 offset) {
    return position + offset;
}

vec3 transformPosition(vec3 position, vec3 offset, float scale) {
    vec3 pos = position * scale;
    return pos + offset;
}

vec3 transformPosition(vec3 position, vec3 offset, vec3 scale) {
    vec3 pos = position * scale;
    return pos + offset;
}