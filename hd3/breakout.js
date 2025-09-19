var canvas;
var gl;

var boxPos = vec2( 0.0, 0.0 );
var spadiPos = vec2(0.0, -0.88);

// Stefna (og hraði) fernings
var dX;
var dY;

// Svæðið er frá -maxX til maxX og -maxY til maxY
var maxX = 1.0;
var maxY = 1.0;

// Hálf breidd/hæð ferningsins
var boxRad = 0.05;

var mouseX;             // Old value of x-coordinate  
var movement = false;   // Do we move the paddle?

var bufferBox;
var bufferSpadi;

var locColor;
var locPos;

var verticesSpadi = new Float32Array([
    -0.1, -0.02, 
    -0.1, 0.02, 
    0.1, 0.02, 
    0.1, -0.02
]);
var verticesBox = new Float32Array([
    -0.05, -0.05, 
    0.05, -0.05, 
    0.05, 0.05, 
    -0.05, 0.05
]);

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
    // Gefa ferningnum slembistefnu í upphafi
    dX = Math.random()*0.1-0.05;
    dY = Math.random()*0.1-0.05;

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    bufferBox = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferBox);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesBox), gl.DYNAMIC_DRAW);

    bufferSpadi = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferSpadi);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesSpadi), gl.DYNAMIC_DRAW);

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    locPos = gl.getUniformLocation( program, "pos" );
    locColor = gl.getUniformLocation( program, "fColor" );

    // Event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        mouseX = e.offsetX;
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
            var xmove = 2*(e.offsetX - mouseX)/canvas.width;
            mouseX = e.offsetX;
            spadiPos[0] += xmove;
        }
    } );

    render();
}


function render() {
    
    // Láta ferninginn skoppa af veggjunum
    if (Math.abs(boxPos[0] + dX) > maxX - boxRad) dX = -dX;
    if (Math.abs(boxPos[1] + dY) > maxY - boxRad) dY = -dY;

    // Uppfæra staðsetningu
    boxPos[0] += dX;
    boxPos[1] += dY;
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    

    gl.bindBuffer( gl.ARRAY_BUFFER, bufferSpadi);
    gl.uniform2fv( locPos, flatten(spadiPos) );
    gl.uniform4fv( locColor, flatten(vec4(0.0, 0.0, 0.0, 1.0)) );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    gl.bindBuffer( gl.ARRAY_BUFFER, bufferBox );
    gl.uniform2fv( locPos, flatten(boxPos) );
    gl.uniform4fv( locColor, flatten(vec4(1.0, 0.0, 0.0, 1.0)) );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
    
    window.requestAnimFrame(render);
}
