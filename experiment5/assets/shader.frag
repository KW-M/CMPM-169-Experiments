precision mediump float;

varying vec2 vTexCoord;

// Get the normal from the vertex shader
varying vec3 vNoise;

// Get the normal from the vertex shader
varying vec3 vNormal;

// Get the near plane distance uniform
uniform float uNear;

// Get the far plane distance uniform
uniform float uFar;

// Get the height;
uniform float height;

// Get the width;
uniform float width;

// Get the sphere size;
uniform float sphereRadius;

// Get the distance from the camera to  the center of the sphere;
uniform float camDistance;

// Get the color texture
uniform sampler2D uColorTexture;

// float LinearizeDepth(float depth)
// {
//     float z = depth * 2.0 - 1.0; // back to NDC
//     return (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear));
// }

float linearize_depth(float d,float zNear,float zFar)
{
    return zNear * zFar / (zFar + d * (zNear - zFar));
}

void main() {

    // Get depth in world coordinates
    float depth = linearize_depth(gl_FragCoord.z, uNear, uFar) + uNear - camDistance; // divide by far for demonstration
    if (depth > -sphereRadius * 0.8) discard;

    // vec3 color = (texture2D(uColorTexture, fract(vTexCoord)).rgb * 0.6 + vNormal * 0.4) * vec3(max(min(depth + sphereRadius * 0.83,0.0) / 6.0, -1.0)) + dot(vNormal, vec3(-1.0,-1.0,-1.0)) * 0.1;
    float fade = -1.0 * max(min(depth + sphereRadius * 0.79,0.0) / 10.0, -1.0);
    vec3 color = (texture2D(uColorTexture, fract(vTexCoord)).rgb * 0.6 + vNormal * 0.4) * fade * 0.8 + (vec3(max(0.0,dot(vNormal, vec3(-1.0,-1.0,-1.0)))) / 5.0 + 1.0) * fade * 0.5;


    // if (depth < 50000.0) discard; // don't render if depth is less than 0.0

    // Lets just draw the texcoords to the screen
    gl_FragColor = vec4(color,0.5);
}
