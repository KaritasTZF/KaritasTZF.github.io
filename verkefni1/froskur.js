var canvas;
var gl;

var maxX = 1.0; //plusminus
var maxY = 1.0; //plusminus

// Upphafsstaða frosksins
var verticesFrog = new Float32Array([-0.05,-0.05, 0.05,-0.05, 0,0.05]);

// akgreinar hnit
var verticesLanes = new Float32Array([
    1.0,0.6, -1.0,0.6, 
    1.0,0.2, -1.0,0.2, 
    1.0,-0.2, -1.0,-0.2, 
    1.0,-0.6, -1.0,-0.6 
]);

// Hnit bíla
var verticesCars;
var carX; // changes
var carY = new Float32Array([0.4, 0.0, -0.4, 0.0]); // middle of lane
var carSpeed = [0.03, 0.02, 0.01, 0.02];
var carFj = 4; // Fjöldi bíla
var carHalfHeight = (0.4 -0.1)/2;
var carHalfLength = carHalfHeight*1.8;

// buffers
var bufferLanes;
var bufferCars;

var locColor;
var locPosition;
var locOffset;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.4, 0.4, 0.4, 1.0 );

    //
    // Initialize starting values of variables
    //
    carX = new Float32Array([Math.random()*2.0-1.0, Math.random()*0.46+carHalfLength, Math.random()*2.0-1.0, Math.random()*0.45-1.0-carHalfLength]);

    var helpHnit = new Array(carFj*4);
    for (var i = 0; i < carFj; ++i ) {
        helpHnit[i] = [
            vec2( - carHalfLength, - carHalfHeight),
            vec2( - carHalfLength, + carHalfHeight),
            vec2( + carHalfLength, + carHalfHeight),
            vec2( + carHalfLength, - carHalfHeight),
        ];
    }
    verticesCars = flatten(helpHnit.flat(Infinity));

    //
    // Load shaders
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Buffers
    bufferLanes = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferLanes);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesLanes), gl.STATIC_DRAW);

    bufferCars = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCars);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesCars), gl.DYNAMIC_DRAW);

    // Breytur
    locColor = gl.getUniformLocation( program, "fColor" );
    locPosition = gl.getAttribLocation( program, "vPosition" );
    locOffset = gl.getUniformLocation( program, "offset" );
    gl.enableVertexAttribArray( locPosition );

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Setjum litinn sem hvítann og teiknum akgreinanna
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferLanes);
    gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, flatten(vec4(1.0, 1.0, 1.0, 1.0)) );
    gl.uniform2fv( locOffset, flatten(vec2(0.0,0.0)) );
    gl.drawArrays(gl.LINES, 0, 4*2);

    // Setjum litinn sem fjólubláann og teiknum bílanna
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCars);
    gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
    // for each car, update x position
    for (var i = 0; i < carFj; ++i ) {
        // check out of bounds
        if (-(carX[i] + carSpeed[i]) > maxX + carHalfLength) carX[i] = 1.0 + carHalfLength;

        // update car x position
        carX[i] -= carSpeed[i];
        var offset = new Float32Array([carX[i], carY[i]]);
        gl.uniform2fv( locOffset, offset );

        gl.uniform4fv( locColor, flatten(vec4(0.75, 0.0+i*0.2, 1.0-i*0.2, 1.0)) );
        gl.drawArrays(gl.TRIANGLE_FAN, i*4, 4);
    }

    // Setjum litinn sem grænan og teiknum froskinn
    //gl.uniform4fv( locColor, flatten(vec4(0.0, 1.0, 0.0, 1.0)) );
    
    window.requestAnimFrame(render);
}