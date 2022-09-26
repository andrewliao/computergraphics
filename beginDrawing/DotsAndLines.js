//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// MultiPoint.js (c) 2012 matsuda
// MultiPointJT.js  MODIFIED for EECS 351-1, Northwestern Univ. Jack Tumblin
//						(converted to 2D->4D; 3 verts --> 6 verts; draw as
//						gl.POINTS and as gl.LINE_LOOP, change color.
// 

// Vertex shader program; SIMD program written in GLSL; runs only on GPU.
//  Each instance computes all the on-screen values for just one VERTEX,
//  how to draw the vertex as part of a drawing primitive (point, line, etc)
//  depicted in the CVV coord. system (+/-1, +/-1, +/-1) that fills our HTML5
//  'canvas' object.
// Each time the shader program runs, the GPU sets values for its 'attribute' 
// variable(s) (e.g.	a_Position) from a single vertex stored in the VBO.
var VSHADER_SOURCE =
  `attribute vec4 a_Position;
   void main() {
     gl_Position = a_Position;
     gl_PointSize = 10.0;
   }`
// !!Wait-Wait-Wait!!  TEXTBOOK uses single-line strings for shader programs,
//	then adds 'newline' and connects them together like this:
//	var VSHADER_SOURCE =
//	  'attribute vec4 a_Position;\n' +
//	  'void main() {\n' +
//	  '  gl_Position = a_Position;\n' +
//	  '  gl_PointSize = 10.0;\n' +
//	  '}\n';
//	That's *VERY* TEDIOUS!  
//  Instead, use Javascript's multi-line strings -- 
//	   They begin and end with back-tick (`) char,
//		 Where is it? just left of digit 1 on your US keyboard.

// Fragment shader program
//  Each instance computes all the on-screen attributes for just one PIXEL
var FSHADER_SOURCE =
 `void main() {
    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
  }`

function main() {
//==============================================================================
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Create an array of vertices, send it to GPU, and connect it to shaders
  var n = initVertexBuffers(gl);	
  if (n < 0) {
    console.log('Failed to load vertices into the GPU');
    return;
  }

  // Specify the color for clearing <canvas>: (Northwestern purple)
  gl.clearColor(78/255, 42/255, 132/255 , 1.0);	// R,G,B,A (A==opacity)
  // NOTE: 0.0 <= RGBA <= 1.0 

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw connect-the-dots for 6 vertices (never 'vertexes'!!).
  // see http://www.khronos.org/opengles/sdk/docs/man/xhtml/glDrawArrays.xml
 gl.drawArrays(gl.LINE_LOOP, 0, n); // gl.drawArrays(mode, first, count)
			//mode: sets drawing primitive to use. WebGL offers these choices: 
						// gl.POINTS
						// gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, 
						// gl.TRIANGLES, gl.TRIANGLES_STRIP, gl.TRIANGLE_FAN
			// first: index of 1st element of array.
			// count; number of elements to read from the array.

  // That went well. Let's draw the dots themselves!
  gl.drawArrays(gl.POINTS, 0, n); // gl.drawArrays(mode, first, count)
	// what happens if you draw triangles now?
	
	// STOP. Do nothing else. (What happens
}


function initVertexBuffers(gl) {
//==============================================================================
// first, create a JavaScript array with all our vertex attribute values:
  var vertices = new Float32Array([
     0.0,  0.5, 0.0, 1.0,	// CAREFUL! I made these into 4D points/ vertices: x,y,z,w.
    -0.2,  0.0, 0.0, 1.0,	// new point!  (? What happens if I make w=0 instead of 1.0?)
    -0.5, -0.5, 0.0, 1.0, // new point! (note we need a trailing commas here)  
     0.0, -0.2, 0.0, 1.0, 	
     0.5, -0.5, 0.0, 1.0,	
     0.2,  0.0, 0.0, 1.0, 
  ]);
  var n = 6; // The number of vertices

  // Then in the GPU, create a vertex buffer object (VBO) to hold vertex data:
  var VBOloc = gl.createBuffer();	// get it's 'handle'
  if (!VBOloc) {
    console.log('Failed to create the vertex buffer object');
    return -1;
  }

  // In the GPU, bind the vertex buffer object to 'target' -(the vertex shaders)
  gl.bindBuffer(gl.ARRAY_BUFFER, VBOloc);
  // COPY data from Javascript 'vertices' array into VBO in the GPU:
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Set up 'attributes' -- the Vertex and Shader vars that get filled from VBO:
  var a_PositionID = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_PositionID < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Set how the GPU fills the a_Position variable with data from the GPU 
  gl.vertexAttribPointer(a_PositionID, 4, gl.FLOAT, false, 0, 0);
  // vertexAttributePointer(index, x,y,z,w size=4, type=FLOAT, 
  // NOT normalized, NO stride)

  // Enable the GPU to fill the a_Position variable from the VBO.
  gl.enableVertexAttribArray(a_PositionID);

  return n;	// tell us the number of vertices in the GPU
}
