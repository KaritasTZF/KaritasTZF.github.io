var canvas;
var gl;

var maxX = 1.0; //plusminus
var maxY = 1.0; //plusminus

var carFj = 3; // Fjöldi bíla
var carX = new Float32Array(carFj); // x-hnit bíla, changes
var carY = new Float32Array(carFj); // y-hnit bíla, middle of lane
var carSpeed = new Float32Array(carFj);
var carHalfHeight = (0.4 -0.1)/2;
var carHalfLength = carHalfHeight*1.0;

var laneFj = 3; // Fjöldi akgreina
var laneSize = 2.0/(laneFj+2.0); // stærð akgreina á canvas

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
    // vertices
    var verticesFrog = new Float32Array([-0.05,-0.05, 0.05,-0.05, 0,0.05]);
    var verticesCars = generateCars();
    var verticesLanes = generateLanes();

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

// Generates lane vertices for TRIANGLE_STRIP using laneFj
function generateLanes() {
    var helpHnit = new Array(laneFj+1);
    var y = 0;
    for (var i = 0; i <= laneFj; ++i ) {
        y = maxY-laneSize*(i+1);
        helpHnit[i] = [-maxX,y, +maxX, y];
    }
    return new Float32Array(helpHnit.flat(Infinity));
}

// Sets variables for cars, random start etc using carFj
// returns vertices
function generateCars() {
    var helpHnit = new Array(carFj*4);
    var lane;
    for (var i = 0; i < carFj; ++i ) {
        lane = i % laneFj;
        carSpeed[i] = 0.005*(lane+1.0);
        carX[i] = Math.random()*2.0-1.0;
        carY[i] = (lane-((laneFj-1.0)/2.0))*laneSize;
        helpHnit[i] = [
            vec2( - carHalfLength, - carHalfHeight),
            vec2( - carHalfLength, + carHalfHeight),
            vec2( + carHalfLength, + carHalfHeight),
            vec2( + carHalfLength, - carHalfHeight),
        ];
    }
    return new Float32Array(helpHnit.flat(Infinity));
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Setjum litinn sem hvítann og teiknum akgreinanna
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferLanes);
    gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, flatten(vec4(0.6, 0.6, 0.6, 1.0)) );
    gl.uniform2fv( locOffset, flatten(vec2(0.0,0.0)) );
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, (laneFj+1)*2);

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