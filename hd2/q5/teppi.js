"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 4;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2(  -1,  1 ),
        vec2(  1,  1 ),
        vec2(  1, -1 ),
        vec2( -1, -1 )
    ];

    divideSquare( vertices[0], vertices[1], vertices[2], vertices[3],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function square( a, b, c, d )
{
    points.push( 
        a, b, c, 
        c, d, a
    );
}

// a is top left and rest are clockwise
function divideSquare( a, b, c, d, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        square( a, b, c, d );
    }
    else {

        //get the edge points
        // assuming a is top left, b is top right, c is bottom right, d is bottom left
        // horizontal
        var ab1 = mix( a, b, 1.0/3.0 );
        var ab2 = mix( a, b, 2.0/3.0 );
        var dc1 = mix( d, c, 1.0/3.0 );
        var dc2 = mix( d, c, 2.0/3.0 );
        //vertical
        var bc1 = mix( b, c, 1.0/3.0 );
        var bc2 = mix( b, c, 2.0/3.0 );
        var ad1 = mix( a, d, 1.0/3.0 );
        var ad2 = mix( a, d, 2.0/3.0 );

        // get inside points (m for middle)
        var am = vec2(ab1[0], ad1[1]);
        var bm = vec2(ab2[0], bc1[1]);
        var cm = vec2(dc2[0], bc2[1]);
        var dm = vec2(dc1[0], ad2[1]);

        --count;

        // eight new squares
        divideSquare( a, ab1, am, ad1, count );
        divideSquare( ab1, ab2, bm, am, count );
        divideSquare( ab2, b, bc1, bm, count );
        divideSquare( bm, bc1, bc2, cm, count );
        divideSquare( cm, bc2, c, dc2, count );
        divideSquare( dm, cm, dc2, dc1, count );
        divideSquare( ad2, dm, dc1, d, count );
        divideSquare( ad1, am, dm, ad2, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
