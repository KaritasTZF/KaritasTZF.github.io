var canvas;
var gl;

var numVertices  = 36;

var points = [];
var normalsArray = [];

var movement = false;     // Do we rotate?
var spinX = 20;
var spinY = 30;
var origX;
var origY;

// Phong lighting

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.6, 0.2, 1.0 );
var materialDiffuse = vec4( 1.0, 0.6, 0.2, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 350.0;

var ambientColor, diffuseColor, specularColor;

// Projection
var mv, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var normalMatrixLoc;

var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var fovy = 50.0;
var near = 0.2;
var far = 10.0;

//control size
var height = 1.0; //half
var outerWidth = 0.05;
var innerWidth = 0.02;
var halfHeight = height/2.0;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    cube();

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);


    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    projectionMatrix = perspective( fovy, 1.0, near, far );

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (origX - e.offsetX) ) % 360;
            spinX = ( spinX + (origY - e.offsetY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    
    render();
}

function cube()
{
    quad( 1, 0, 3, 2, 0 );
    quad( 2, 3, 7, 6, 1 );
    quad( 3, 0, 4, 7, 2 );
    quad( 6, 5, 1, 2, 3 );
    quad( 4, 5, 6, 7, 4 );
    quad( 5, 4, 0, 1, 5 );
}

function quad(a, b, c, d, n) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];
    
    var faceNormals = [
        vec4( 0.0, 0.0,  1.0, 0.0 ),  // front
        vec4(  1.0, 0.0, 0.0, 0.0 ),  // right
        vec4( 0.0, -1.0, 0.0, 0.0 ),  // down
        vec4( 0.0,  1.0, 0.0, 0.0 ),  // up
        vec4( 0.0, 0.0, -1.0, 0.0 ),  // back
        vec4( -1.0, 0.0, 0.0, 0.0 )   // left
    ];


    //vertex color assigned by the index of the vertex
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        normalsArray.push(faceNormals[n]);
    }
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mv = lookAt( vec3(0.0, 0.0, 2.0), at, up);
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );

    var mvsArray = [mv, mv, mv, mv, mv, mv];

    // Build the furniture...
    // First the right wall
    mvsArray[0] = mult( mv, translate( -halfHeight, 0.0, 0.0 ) );
    mvsArray[0] = mult( mvsArray[0], scalem( outerWidth, height, halfHeight ) );
    // Then the left wall
    mvsArray[1] = mult( mv, translate( halfHeight, 0.0, 0.0 ) );
    mvsArray[1] = mult( mvsArray[1], scalem( outerWidth, height, halfHeight ) );
    // top wall
    mvsArray[2] = mult( mv, translate( 0.0, halfHeight, 0.0 ) );
    mvsArray[2] = mult( mvsArray[2], scalem( height+outerWidth, outerWidth, halfHeight ) );
    // bottom wall
    mvsArray[3] = mult( mv, translate( 0.0, -halfHeight, 0.0 ) );
    mvsArray[3] = mult( mvsArray[3], scalem( height+outerWidth, outerWidth, halfHeight ) );

    // now the inside walls
    // horizontal
    mvsArray[4] = mult( mv, scalem( height, innerWidth, halfHeight - outerWidth ) );
    // vertical
    mvsArray[5] = mult( mv, scalem( innerWidth, height, halfHeight  - outerWidth ) );

    for (let i = 0; i<6; i++) {  
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mvsArray[i]) );
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
        var normalMatrix = [
            vec3(mvsArray[i][0][0], mvsArray[i][0][1], mvsArray[i][0][2]),
            vec3(mvsArray[i][1][0], mvsArray[i][1][1], mvsArray[i][1][2]),
            vec3(mvsArray[i][2][0], mvsArray[i][2][1], mvsArray[i][2][2])
        ];
	    normalMatrix.matrix = true;

        gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );
        gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    }

    requestAnimFrame( render );
}

