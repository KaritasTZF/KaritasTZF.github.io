var canvas;
var gl;

var maxX = 1.0; //plusminus
var maxY = 1.0; //plusminus

var laneFj = 5; // Fjöldi akgreina
var laneSize; // stærð akgreina á canvas, 1 grid size
var objRad; // stærð bíla & frosks 

var carFj = 6; // Fjöldi bíla
var carX = new Float32Array(carFj); // x-hnit bíla, changes
var carY = new Float32Array(carFj); // y-hnit bíla, middle of lane
var carSpeed = new Float32Array(carFj);
var controlCarSpeed = 0.003;
var carColor = new Array(carFj);
var carHalfHeight;
var carHalfLength;

var frogRad;
var frogPos;
var frogDirection;

var stig;

// buffers
var bufferLanes;
var bufferCars;
var bufferFrog;

var locColor;
var locPosition;
var locOffset;
var locTheta;

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
    stig = 0;
    laneSize  = 2.0/(laneFj+2.0);
    objRad = laneSize*(1.0-0.1)/2;
    carHalfHeight = objRad;
    carHalfLength = objRad*1.5;
    frogRad = objRad*0.9;
    frogPos = vec2(0.0, (laneSize/2.0)-maxY);
    frogDirection = 0.0;
    var verticesFrog = new Float32Array([-frogRad,-frogRad, frogRad,-frogRad, 0,frogRad]);
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

    bufferFrog = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferFrog);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesFrog), gl.DYNAMIC_DRAW);

    // Breytur
    locColor = gl.getUniformLocation( program, "fColor" );
    locPosition = gl.getAttribLocation( program, "vPosition" );
    locOffset = gl.getUniformLocation( program, "offset" );
    locTheta = gl.getUniformLocation( program, "theta" );
    gl.enableVertexAttribArray( locPosition );

    window.addEventListener("keyup", function(e){ 
        switch( e.key ) {
            case "ArrowUp":
                if (frogPos[1] + laneSize < maxY) frogPos[1] += laneSize;
                frogDirection = 0.0;
                break;
            case "ArrowDown":
                if (frogPos[1] - laneSize > -maxY) frogPos[1] -= laneSize;
                frogDirection = Math.PI;
                break;
            case "ArrowLeft":
                if (frogPos[0] - laneSize > -maxX) frogPos[0] -= laneSize;
                frogDirection = Math.PI/2.0;
                break;
            case "ArrowRight":
                if (frogPos[0] + laneSize < maxX) frogPos[0] += laneSize;
                frogDirection = 3.0*Math.PI/2.0;
                break;
        }
    });

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
        carSpeed[i] = controlCarSpeed*(lane*0.8+1.0);
        carX[i] = Math.random()*2.0-1.0;
        carY[i] = (lane-((laneFj-1.0)/2.0))*laneSize;
        carColor[i] = vec4(0.6 + i*0.6/carFj , i*0.7/carFj, 0.8 - i*0.8/carFj, 1.0);

        // teikna kassa
        helpHnit[i] = [
            - carHalfLength, - carHalfHeight,
            - carHalfLength, + carHalfHeight,
            + carHalfLength, + carHalfHeight,
            + carHalfLength, - carHalfHeight
        ];
    }
    return new Float32Array(helpHnit.flat());
}

function die() {
    frogPos = vec2(0.0, (laneSize/2.0)-maxY);
    stig = 0;
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    var frogColor = vec4(0.0, 0.8, 0.0, 1.0);

    // stigagjöf
    var collisionY = (frogPos[1] - frogRad) < (maxY - laneSize);
    if ((stig % 2 ==0 && (frogPos[1] - frogRad) > (maxY - laneSize)) ||
        (stig % 2 ==1 && (frogPos[1] + frogRad) < (-maxY + laneSize)) ) {
            ++stig;
    }


    // Setjum litinn sem hvítann og teiknum akgreinanna
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferLanes);
    gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, flatten(vec4(0.6, 0.6, 0.6, 1.0)) );
    gl.uniform2fv( locOffset, flatten(vec2(0.0,0.0)) );
    gl.uniform1f( locTheta, 0.0 );
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, (laneFj+1)*2);

    // Setjum litinn sem fjólubláann og teiknum bílanna
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCars);
    gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform1f( locTheta, 0.0 );
    // for each car, update x position
    for (var i = 0; i < carFj; ++i ) {
        // Collision w/ frog
        var collisionY = (frogPos[1] - frogRad) < (carY[i] + carHalfHeight) && 
                    (frogPos[1] + frogRad) > (carY[i] - carHalfHeight);
        var collisionX =(frogPos[0] - frogRad) < (carX[i] + carHalfLength) && 
                    (frogPos[0] + frogRad) > (carX[i] - carHalfLength);
        if (collisionY && collisionX) {
            die();
        }

        // check out of bounds, reset
        if (-(carX[i] + carSpeed[i]) > maxX + carHalfLength) carX[i] = 1.0 + carHalfLength;

        // update car x position
        carX[i] -= carSpeed[i];
        var offset = new Float32Array([carX[i], carY[i]]);
        gl.uniform2fv( locOffset, offset );

        gl.uniform4fv( locColor, flatten(carColor[i]) );
        gl.drawArrays(gl.TRIANGLE_FAN, i*4, 4);
    }

    // Setjum litinn sem grænan og teiknum froskinn
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferFrog);
    gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, flatten(frogColor) );
    gl.uniform2fv( locOffset, flatten(frogPos) );
    gl.uniform1f( locTheta, frogDirection );
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    
    window.requestAnimFrame(render);
}