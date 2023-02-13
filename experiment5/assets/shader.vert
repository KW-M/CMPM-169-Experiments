
// Get the position attribute of the geometry
attribute vec3 aPosition;

// Get the texture coordinate attribute from the geometry
attribute vec2 aTexCoord;

// Get the vertex normal attribute from the geometry
attribute vec3 aNormal;

// When we use 3d geometry, we need to also use some builtin variables that p5 provides
// Most 3d engines will provide these variables for you. They are 4x4 matrices that define
// the camera position / rotation, and the geometry position / rotation / scale
// There are actually 3 matrices, but two of them have already been combined into a single one
// This pre combination is an optimization trick so that the vertex shader doesn't have to do as much work

// uProjectionMatrix is used to convert the 3d world coordinates into screen coordinates
uniform mat4 uProjectionMatrix;

// uModelViewMatrix is a combination of the model matrix and the view matrix
// The model matrix defines the object position / rotation / scale
// Multiplying uModelMatrix * vec4(aPosition, 1.0) would move the object into it's world position

// The view matrix defines attributes about the camera, such as focal length and camera position
// Multiplying uModelViewMatrix * vec4(aPosition, 1.0) would move the object into its world position in front of the camera
uniform mat4 uModelViewMatrix;

// Get the framecount uniform
uniform float uFrameCount;

// Get the noise texture
uniform sampler2D uHeightTexture;

varying vec2 vTexCoord;
varying vec3 vNoise;
varying vec3 vNormal;


void main() {

  // Sample the sphere texture
  // fract(aTexCoord * tile + uFrameCount * speed)
  vec4 noise = texture2D(uHeightTexture, fract(aTexCoord));

  // Send the noise color to the fragment shader
  vNoise = noise.rgb;

  // Send the normal to the fragment shader
  vNormal = aNormal;

  // copy the position data into a vec4, using 1.0 as the w component
  vec4 positionVec4 = vec4(aPosition, 1.0);


// ---- NOISE -----
  // Frequency and Amplitude will determine the look of the displacement
  float noiseFrequencyX = 18.0;
  float noiseFrequencyY = 13.0;
  float noiseAmplitude = 0.9;

  // Displace the x position withe the sine of the x + time. Multiply by the normal to move it in the correct direction
  // You could add more distortions to the other axes too.
  float distortion = (sin(positionVec4.x * noiseFrequencyX + uFrameCount * 0.03) + cos(positionVec4.z * noiseFrequencyY + uFrameCount * 0.05))*noiseAmplitude;
// ---- NOISE -----

  // Amplitude will determine the amount of the terrrain displacement
  float amplitude = 0.15;

  // add the noise to the position, and multiply by the normal to move along it.
  positionVec4.xyz += ((noise.rgb - 0.5) + (noise.rgb - 0.5) * distortion + (-distortion / 3.5)) * aNormal * amplitude ;



  // Move our vertex positions into screen space
  // The order of multiplication is always projection * view * model * position
  // In this case model and view have been combined so we just do projection * modelView * position
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;

  // Send the texture coordinates to the fragment shader
  vTexCoord = aTexCoord;
}
