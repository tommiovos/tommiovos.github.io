precision mediump float;

// grab texcoords from the vertex shader
varying vec2 vTexCoord;

// our texture coming from p5
uniform sampler2D tex0;
uniform sampler2D tex1;
uniform vec3 color;
uniform float threshold;
uniform float tolerance;

// this is a common glsl function of unknown origin to convert rgb colors to luminance
// it performs a dot product of the input color against some known values that account for our eyes perception of brighness
// i pulled this one from here https://github.com/hughsk/glsl-luma/blob/master/index.glsl
// float luma(vec3 color) {
//   return dot(color, vec3(0.299, 0.587, 0.114));
// }

float dist(vec3 a, vec3 b){
  return length(a-b);
}

float smoothRel(float d,float c){
  return d;
}

void main() {

  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv.y = 1.0 - uv.y;
  
  // get the webcam as a vec4 using texture2D
  vec4 bg = texture2D(tex0, uv);
  vec4 tex = texture2D(tex1, uv);

  
  float dist = dist(tex.rgb , color);
  float relDist = clamp((1.0-(threshold+tolerance-dist)/(2.0*tolerance)),0.0,1.0);

  if( dist>threshold+tolerance){
    relDist = 1.0;
  }
  
  tex.a = relDist;
  gl_FragColor = tex;//mix(bg,tex,relDist);//vec4(tex.xyz, thresh, thresh, 1.0);
}