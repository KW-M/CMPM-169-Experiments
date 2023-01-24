// casey conchinha - @kcconch ( https://github.com/kcconch )
// louise lessel - @louiselessel ( https://github.com/louiselessel )
// more p5.js + shader examples: https://itp-xstory.github.io/p5js-shaders/
// this is a modification of a shader by adam ferriss
// https://github.com/aferriss/p5jsShaderExamples/tree/gh-pages/5_shapes/5-3_polygon

precision mediump float;

// https://p5js.org/examples/3d-shader-using-webcam.html
// https://editor.p5js.org/p5/sketches/Dom:_Video_Pixels
// https://editor.p5js.org/KW-M/sketches/wdNXkzrkP


// these are known as preprocessor directive
// essentially we are just declaring some variables that wont change
// you can think of them just like const variables

#define PI 3.14159265359
#define TWO_PI 6.28318530718

// we need the sketch resolution to perform some calculations
uniform vec2 resolution;
uniform float time;
uniform float mousex;
uniform float mousey;
uniform bool mousedown;


// grab texcoords from vert shader
varying vec2 vTexCoord;

// our texture coming from p5
uniform sampler2D tex0;

// this is a function that turns an rgb value that goes from 0 - 255 into 0.0 - 1.0
vec3 rgb(float r, float g, float b){
    return vec3(r / 255.0, g / 255.0, b / 255.0);
}

vec2 rotateUV(vec2 uv, vec2 center, float angle) {
    return vec2(
        (uv.x - center.x) * cos(angle) + (uv.y - center.y) * sin(angle) + center.x,
        (uv.x - center.x) * sin(angle) - (uv.y - center.y) * cos(angle) + center.y
    );
}

vec4 poly(float x, float y, float size, float sides, float rotation, vec3 col){
    // get our coordinates
    vec2 coord = gl_FragCoord.xy;

    // move the coordinates to where we want to draw the shape
    vec2 pos = vec2(x,y) - coord;

    // calculate the angle of a pixel relative to our position
    float angle = atan( pos.x, pos.y) + PI + rotation;

    // calculate the size of our shape
    float radius = TWO_PI / sides;

    // this is the function that controls our shapes appearance
    // i pulled it from the book of shaders shapes page https://thebookofshaders.com/07/
    // essentially what we are doing here is computing a circle with length(pos) and manipulating it's shape with the cos() function
    // this technique is really powerful and can be used to create all sorts of different shapes
    // for instance, try changing cos() to sin()
    float d = cos(floor(0.5 + angle / radius) * radius - angle) * length(pos);

    // restrict our shape to black and white and set it's size
    // we use the smoothstep function to get a nice soft edge
    d = 1.0 - smoothstep(size*0.5, size*0.5+1.0, d);

    // return the color with the shape as the alpha channel
    return vec4(col, d);
}


void main() {

    float mouseCenterProximity = abs(mousex - 0.5) + abs(mousey - 0.5);

    // Load the video texture:
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y; // the texture is loaded upside down and backwards by default so lets flip it
    uv.x = 1.0 - uv.x; // the texture is loaded upside down and backwards by default so lets flip it

    vec4 tex = texture2D(tex0, uv);
    float gray = (tex.r + tex.g + tex.b) / 3.0;

    // Sample the camera feed texture at the mouse position:
    // vec4 tex1 = texture2D(tex0, uv +  vec2(0,resolution.x));
    // vec4 tex2 = texture2D(tex0, uv + vec2(resolution.y,0));

    vec2 uvRot = rotateUV(uv, vec2(mousex,mousey) * (1.0- mouseCenterProximity), mod(time, TWO_PI) * (1.0- mouseCenterProximity));
    vec4 tex1 = texture2D(tex0,vec2(mousex,uvRot.y));
    vec4 tex2 = texture2D(tex0, vec2(uvRot.x,mousey));
    // vec4 tex1 = texture2D(tex0,rotateUV(uv, vec2(0.5,0.5)));
    // vec4 tex2 = texture2D(tex0, rotateUV(uv,vec2(0.5,0.5)));




    // if mousedown:
    if (mousedown == true) {
    // tex += float(mousedown) * (-tex1 - tex2);
    // tex *= float(mousedown) * 2.0 + 1.0;
        tex -= tex1;
        tex -= tex2;
        tex *= 3.0;
        mouseCenterProximity *= -1.0;
        mouseCenterProximity += 1.0;
    } else {
        tex = tex + tex1 * 2.0 + tex2 * 2.0;
        tex *= 1.0 / 3.0;
    }




    vec2 center = resolution * 1.0; // draw the shape at the center of the screen
    float size = resolution.y * mouseCenterProximity; // make the shape a quarter of the screen height
    float sides = mod(floor(mousex * 10.0), 7.0) + 3.0; // slowly increase the sides, when it reaches 10 sides, go back down to 3
    float rotation = time; // rotation is in radians, but for time it doesnt really matter

    // lets make our shape in the center of the screen. We have to subtract half of it's width and height just like in p5
    float x = mousex * resolution.x * 2.0;
    float y = (1.0 - mousey) * resolution.y * 2.0;

    // a color for the shape
    vec3 grn = rgb(200.0, 240.0, 200.0);

    // call our shape function with poly(x, y, sz, sides, rotation, color);
    vec4 poly = poly(x, y, size, sides, rotation, grn);

    // mix the polygon with the opposite of the green color according to the shapes alpha
    poly.rgb = mix(tex.rgb, 1.0 - tex.rgb, poly.a);

    // render to screen
    gl_FragColor = vec4(poly.rgb, 1.0); // poly.rgb
}
