precision mediump float;

varying vec2 vTexCoord;

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

// Get the color texture
uniform sampler2D uHeightTexture;

// Get the framecount uniform
uniform float uFrameCount;


void main() {

    // Get depth in world coordinates
    // float depth = linearize_depth(gl_FragCoord.z, uNear, uFar) + uNear - camDistance; // divide by far for demonstration .
    vec3 color = texture2D(uColorTexture, fract(vTexCoord)).rgb;
    vec3 pulseIncrease = texture2D(uHeightTexture,fract(vTexCoord)).rgb * 0.5 * sin(uFrameCount / 36.0 + fract(vTexCoord).y * 15.0 + fract(vTexCoord).x * 24.0) * cos(uFrameCount / 36.0 + fract(vTexCoord).y * 25.0 + fract(vTexCoord).x * 14.0);
    // Lets just draw the texcoords to the screen
    gl_FragColor.rgb = color + color * pulseIncrease + pulseIncrease * 0.2;
}
