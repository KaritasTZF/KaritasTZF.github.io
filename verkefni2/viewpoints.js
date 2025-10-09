////////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//    Byggt á sýnisforriti í C fyrir OpenGL, höfundur óþekktur.
//
//     Bíll sem keyrir í hringi í umhverfi með húsum.  Hægt að
//    breyta sjónarhorni áhorfanda með því að slá á 1, 2, ..., 8.
//    Einnig hægt að breyta hæð áhorfanda með upp/niður örvum.
//    Leiðrétt útgáfa fyrir réttan snúning í MV.js
//
//    Hjálmtýr Hafsteinsson, september 2025
////////////////////////////////////////////////////////////////////
var canvas;
var gl;

// position of the track
var TRACK_RADIUS = 100.0;
var TRACK_INNER = 90.0;
var TRACK_OUTER = 110.0;
var TRACK_PTS = 100;

var BLUE = vec4(0.0, 0.0, 1.0, 1.0);
var RED = vec4(0.76, 0.18, 0.15, 1.0);
var GRAY = vec4(0.5, 0.45, 0.4, 1.0);
var DARK_GRAY = vec4(0.35, 0.225, 0.2, 1.0);
var WHITE = vec4(0.8, 0.8, 0.6, 1.0);
var DARK_RED = vec4(0.47, 0.0, 0.09, 1.0);
var YELLOW = vec4(0.97, 0.71, 0.22, 1.0);
var ORANGE_Y = vec4(0.86, 0.49, 0.15, 1.0);
var ORANGE_R = vec4(0.86, 0.34, 0.16, 1.0);
var BROWN = vec4(0.5, 0.2, 0.1, 1.0); 
var GREEN = vec4(0.1, 0.45, 0.0, 1.0);
var DARK_GREEN = vec4(0.1, 0.5, 0.1, 1.0); //WIP

var numCubeVertices  = 36;
var numIsoVertices = 18;
var numRightVertices = 18;
var numTrackVertices  = 2*TRACK_PTS + 2;


// variables for moving cars
var car1Direction = 0.0;
var car1XPos = 100.0;
var car1YPos = 0.0;
var car2Direction = 0.0;
var car2XPos = -100.0;
var car2YPos = 0.0;
var height = 0.0;

// variables for person
var personDirection = 0.0;
var personXPos = 0.0;
var personYPos = 0.0;
var origX;
var movement;

// current viewpoint
var view = 1;

var colorLoc;
var mvLoc;
var pLoc;
var proj;

var cubeBuffer;
var isoBuffer;
var rightBuffer;
var trackBuffer;
var vPosition;

// the 36 vertices of the cube
var cVertices = [
    // front side:
    vec3( -0.5,  0.5,  0.5 ), vec3( -0.5, -0.5,  0.5 ), vec3(  0.5, -0.5,  0.5 ),
    vec3(  0.5, -0.5,  0.5 ), vec3(  0.5,  0.5,  0.5 ), vec3( -0.5,  0.5,  0.5 ),
    // right side:
    vec3(  0.5,  0.5,  0.5 ), vec3(  0.5, -0.5,  0.5 ), vec3(  0.5, -0.5, -0.5 ),
    vec3(  0.5, -0.5, -0.5 ), vec3(  0.5,  0.5, -0.5 ), vec3(  0.5,  0.5,  0.5 ),
    // bottom side:
    vec3(  0.5, -0.5,  0.5 ), vec3( -0.5, -0.5,  0.5 ), vec3( -0.5, -0.5, -0.5 ),
    vec3( -0.5, -0.5, -0.5 ), vec3(  0.5, -0.5, -0.5 ), vec3(  0.5, -0.5,  0.5 ),
    // top side:
    vec3(  0.5,  0.5, -0.5 ), vec3( -0.5,  0.5, -0.5 ), vec3( -0.5,  0.5,  0.5 ),
    vec3( -0.5,  0.5,  0.5 ), vec3(  0.5,  0.5,  0.5 ), vec3(  0.5,  0.5, -0.5 ),
    // back side:
    vec3( -0.5, -0.5, -0.5 ), vec3( -0.5,  0.5, -0.5 ), vec3(  0.5,  0.5, -0.5 ),
    vec3(  0.5,  0.5, -0.5 ), vec3(  0.5, -0.5, -0.5 ), vec3( -0.5, -0.5, -0.5 ),
    // left side:
    vec3( -0.5,  0.5, -0.5 ), vec3( -0.5, -0.5, -0.5 ), vec3( -0.5, -0.5,  0.5 ),
    vec3( -0.5, -0.5,  0.5 ), vec3( -0.5,  0.5,  0.5 ), vec3( -0.5,  0.5, -0.5 )
];

// roof vertices, a 3d isosceles triangle. can skip the bottom
var isoVertices = [
    // Front
    vec3(0.0, 0.5, 0.5), vec3(-0.5, 0.5, -0.5), vec3(0.5, 0.5, -0.5),
    // right side:
    vec3(-0.5, 0.5, -0.5), vec3(0.0, 0.5, 0.5), vec3(0.0, -0.5, 0.5),
    vec3(-0.5, 0.5, -0.5), vec3(0.0, -0.5, 0.5), vec3(-0.5, -0.5, -0.5),
    // left side:
    vec3(0.0, 0.5, 0.5), vec3(0.5, 0.5, -0.5), vec3(0.0, -0.5, 0.5),
    vec3(0.0, -0.5, 0.5), vec3(0.5, 0.5, -0.5), vec3(0.5, -0.5, -0.5),
    // Back
    vec3(-0.5, -0.5, -0.5), vec3(0.0, -0.5, 0.5), vec3(0.5, -0.5, -0.5),
];
var rightVertices = [
    // Front
    vec3(-0.5, 0.5, 0.5), vec3(-0.5, 0.5, -0.5), vec3(0.5, 0.5, -0.5),
    // right side:
    vec3(-0.5, 0.5, -0.5), vec3(-0.5, 0.5, 0.5), vec3(-0.5, -0.5, 0.5),
    vec3(-0.5, 0.5, -0.5), vec3(-0.5, -0.5, 0.5), vec3(-0.5, -0.5, -0.5),
    // left side:
    vec3(-0.5, 0.5, 0.5), vec3(0.5, 0.5, -0.5), vec3(-0.5, -0.5, 0.5),
    vec3(-0.5, -0.5, 0.5), vec3(0.5, 0.5, -0.5), vec3(0.5, -0.5, -0.5),
    // Back
    vec3(-0.5, -0.5, -0.5), vec3(-0.5, -0.5, 0.5), vec3(0.5, -0.5, -0.5),
];


// vertices of the track
var tVertices = [];


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.75, 0.45, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    createTrack();
    
    // VBO for the track
    trackBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, trackBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(tVertices), gl.STATIC_DRAW );

    // VBO for the cube
    cubeBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cubeBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cVertices), gl.STATIC_DRAW );

    //VBO for the roofs, isoscoles triangle
    isoBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, isoBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(isoVertices), gl.STATIC_DRAW );
    //VBO for the roofs/overpass, right triangle
    rightBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, rightBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(rightVertices), gl.STATIC_DRAW );


    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLoc = gl.getUniformLocation( program, "fColor" );
    
    mvLoc = gl.getUniformLocation( program, "modelview" );

    // set projection
    pLoc = gl.getUniformLocation( program, "projection" );
    proj = perspective( 50.0, 1.0, 1.0, 500.0 );
    gl.uniformMatrix4fv(pLoc, false, flatten(proj));

    document.getElementById("Viewpoint").innerHTML = "1: Fjarlægt sjónarhorn";
    document.getElementById("Height").innerHTML = "Viðbótarhæð: "+ height;

    // Event listener for keyboard
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 49:	// 1: distant and stationary viewpoint
                view = 1;
                document.getElementById("Viewpoint").innerHTML = "1: Fjarlægt sjónarhorn";
                break;
            case 50:	// 2: panning camera inside the track
                view = 2;
                document.getElementById("Viewpoint").innerHTML = "2: Horfa á bílinn innan úr hringnum";
                break;
            case 51:	// 3: panning camera inside the track
                view = 3;
                document.getElementById("Viewpoint").innerHTML = "3: Horfa á bílinn fyrir utan hringinn";
                break;
            case 52:	// 4: driver's point of view
                view = 4;
                document.getElementById("Viewpoint").innerHTML = "4: Sjónarhorn ökumanns";
                break;
            case 53:	// 5: drive around while looking at a house
                view = 5;
                document.getElementById("Viewpoint").innerHTML = "5: Horfa alltaf á eitt hús innan úr bílnum";
                break;
            case 54:	// 6: Above and behind the car
                view = 6;
                document.getElementById("Viewpoint").innerHTML = "6: Fyrir aftan og ofan bílinn";
                break;
            case 55:	// 7: from another car in front
                view = 7;
                document.getElementById("Viewpoint").innerHTML = "7: Horft aftur úr bíl fyrir framan";
                break;
            case 56:	// 8: from beside the car
                view = 8;
                document.getElementById("Viewpoint").innerHTML = "8: Til hliðar við bílinn";
                break;
            case 48:	// 0: walking on the ground
                view = 0;
                document.getElementById("Viewpoint").innerHTML = "0: Gangandi á jörðu";
                break;
            
            case 38:    // up arrow
                height += 2.0;
                document.getElementById("Height").innerHTML = "Viðbótarhæð: "+ height;
                break;
            case 40:    // down arrow
                height -= 2.0;
                document.getElementById("Height").innerHTML = "Viðbótarhæð: "+ height;
                break;
            
            case 65: // A, left
                personXPos -= Math.cos(radians(personDirection));
                personYPos += Math.sin(radians(personDirection));
                break;
            case 68: // D, right
                personXPos += Math.cos(radians(personDirection));
                personYPos -= Math.sin(radians(personDirection));
                break;
            case 83: // S, backwards
                personXPos -= Math.sin(radians(personDirection));
                personYPos -= Math.cos(radians(personDirection));
                break;
            case 87: // W, forward
                personXPos += Math.sin(radians(personDirection));
                personYPos += Math.cos(radians(personDirection));
                break;
        }
    } );

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        e.preventDefault();         // Disable drag and drop
    } );
    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement){
            personDirection = ( personDirection + (origX - e.offsetX) /8.0) % 360;
            if(personDirection<0) personDirection += 360;
            origX = e.offsetX;
        }
    });

    render();
}


// create the vertices that form the car track
function createTrack() {

    var theta = 0.0;
    for( var i=0; i<=TRACK_PTS; i++ ) {
        var p1 = vec3(TRACK_OUTER*Math.cos(radians(theta)), TRACK_OUTER*Math.sin(radians(theta)), 0.0);
        var p2 = vec3(TRACK_INNER*Math.cos(radians(theta)), TRACK_INNER*Math.sin(radians(theta)), 0.0) 
        tVertices.push( p1 );
        tVertices.push( p2 );
        theta += 360.0/TRACK_PTS;
    }
}


// draw a house of type 1 in location (x, y) of size size
function house1( x, y, size, mv, Hcolor, Rcolor ) {   
    // House
    gl.uniform4fv( colorLoc, Hcolor ); 
    var mvH = mult( mv, translate( x, y, size/2 ) );
    mvH = mult( mvH, scalem( size, size, size ) );

    gl.bindBuffer( gl.ARRAY_BUFFER, cubeBuffer );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvH));
    gl.drawArrays( gl.TRIANGLES, 0, numCubeVertices );

    // Roof  
    gl.uniform4fv( colorLoc, Rcolor ); 
    var mvR = mult( mv, translate( x, y, 5*size/4 ) );
    mvR = mult( mvR, scalem( size, size, size*0.5 ) );

    gl.bindBuffer( gl.ARRAY_BUFFER, isoBuffer );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvR));
    gl.drawArrays( gl.TRIANGLES, 0, numIsoVertices);
}

function house2( x, y, size, mv, Hcolor, Rcolor ) {
    // House
    gl.uniform4fv( colorLoc, Hcolor );
    var mvH = mult( mv, translate( x, y, size*0.4 ) );
    mvH = mult( mvH, scalem( size, size*1.5, size*0.8 ) );

    gl.bindBuffer( gl.ARRAY_BUFFER, cubeBuffer );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvH));
    gl.drawArrays( gl.TRIANGLES, 0, numCubeVertices );
    
    // Roof  
    gl.uniform4fv( colorLoc, Rcolor ); 
    var mvR = mult( mv, translate( x, y, size ) );
    mvR = mult(mvR, rotateZ(90));
    mvR = mult( mvR, scalem( size*1.5, size, size*0.4 ) );

    gl.bindBuffer( gl.ARRAY_BUFFER, isoBuffer );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvR));
    gl.drawArrays( gl.TRIANGLES, 0, numIsoVertices)
}

function house3( x, y, size, mv, Hcolor, Rcolor ) {
    var xoffset = 0.3;
    // House
    gl.uniform4fv( colorLoc, Hcolor );
    var mvH1 = mult( mv, translate( x-size*xoffset, y, size/2 ) );
    mvH1 = mult( mvH1, scalem( size*(1.0-xoffset), size*1.4, size ) );
    var mvH2 = mult( mv, translate( x, y, size*0.25 ) );
    mvH2 = mult( mvH2, scalem( size, size*1.4, size*0.5 ) );

    gl.bindBuffer( gl.ARRAY_BUFFER, cubeBuffer );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvH1));
    gl.drawArrays( gl.TRIANGLES, 0, numCubeVertices );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvH2));
    gl.drawArrays( gl.TRIANGLES, 0, numCubeVertices );
    
    // Roof  
    gl.uniform4fv( colorLoc, Rcolor ); 
    var mvR1 = mult( mv, translate( x-size*xoffset, y, size*1.2 ) );
    mvR1 = mult(mvR1, rotateZ(90));
    mvR1 = mult( mvR1, scalem( size*1.5, size*(1.0-xoffset), size*0.4 ) );
    var mvR2 = mult( mv, translate( x+size*xoffset, y, size*0.6 ) );
    mvR2 = mult(mvR2, rotateZ(90));
    mvR2 = mult( mvR2, scalem( size*1.5, size*xoffset, size*0.2 ) );

    gl.bindBuffer( gl.ARRAY_BUFFER, isoBuffer );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvR1));
    gl.drawArrays( gl.TRIANGLES, 0, numIsoVertices);
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvR2));
    gl.drawArrays( gl.TRIANGLES, 0, numIsoVertices);
}

function tree( x, y, size, mv, color ) {
    // leaves are two cubes, one rotated
    var mvL1 = mult( mv, translate( x, y, size*1.2 ) );
    var mvL2 = mult( mvL1, scalem( size, size, size ) );
    mvL1 = mult( mvL1, rotateY(45));
    mvL1 = mult( mvL1, rotateZ(45));
    mvL1 = mult( mvL1, scalem( size, size, size ) );
    // root / body of tree
    var mvR = mult( mv, translate(x,y,size/2));
    mvR = mult(mvR, scalem(1.0, 1.0, size));

    gl.bindBuffer( gl.ARRAY_BUFFER, cubeBuffer );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.uniform4fv( colorLoc, color );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvL1));
    gl.drawArrays( gl.TRIANGLES, 0, numCubeVertices );
    gl.uniform4fv( colorLoc, color );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvL2));
    gl.drawArrays( gl.TRIANGLES, 0, numCubeVertices );
    gl.uniform4fv( colorLoc, BROWN );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvR));
    gl.drawArrays( gl.TRIANGLES, 0, numCubeVertices );
}

function overpass(mv) {
    gl.uniform4fv(colorLoc, BROWN);
    var h = 6.0;
    var width = 10;
    var ramplength = 25.0;
    // mv to location, aligned perpendicular to track
    mv = mult(mv, translate(-70.7, 70.7, h/2));
    mv = mult(mv, rotateZ(-45));

    // build overpass cubes
    var mvTop = mult(mv, translate(0.0, 0.0, h/2-0.5));
    mvTop = mult(mvTop, scalem(23.0, width, 1.0));
    var mvLeft = mult(mv, translate(11.0, 0.0, 0.0));
    mvLeft = mult(mvLeft, scalem(1.0, width, h));
    var mvRight = mult(mv, translate(-11.0, 0.0, 0.0));
    mvRight = mult(mvRight, scalem(1.0, width, h));
    // overpass ramps of right triangles
    var mv1 = mult(mv, translate(11.5+ramplength/2.0, 0.0, 0.0));
    mv1 = mult(mv1, scalem(ramplength, width, h));
    var mv2 = mult(mv, translate(-11.5-ramplength/2.0, 0.0, 0.0));
    mv2 = mult(mv2, rotateZ(180));
    mv2 = mult(mv2, scalem(ramplength, width, h));

    gl.bindBuffer(gl.ARRAY_BUFFER, rightBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv1));
    gl.drawArrays(gl.TRIANGLES, 0, numRightVertices);
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv2));
    gl.drawArrays(gl.TRIANGLES, 0, numRightVertices);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvTop));
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvLeft));
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvRight));
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);
}

// draw the circular track and a few houses (i.e. red cubes)
function drawScenery( mv ) {

    // draw track
    gl.uniform4fv( colorLoc, GRAY );
    gl.bindBuffer( gl.ARRAY_BUFFER, trackBuffer );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, numTrackVertices );

    // draw overpass
    overpass(mv);

    // draw houses and trees  

    //inside hringbraut left-right
    tree(60.0, -60.0, 8.0, mv, GREEN);
    house1(10.0, -60.0, 10.0, mv, WHITE, DARK_RED);
    tree(-5.0, -60.0, 6.5, mv, GREEN);
    house1(-30.0, -50.0, 7.0, mv, WHITE, DARK_GRAY);

    house2(20.0, -10.0, 8.0, mv, DARK_RED, ORANGE_Y);
    tree(0.0, -5.0, 8.5, mv, ORANGE_R);
    tree(10.0, 5.0, 6.5, mv, GREEN);
    tree(9.0, 20.0, 7.0, mv, GREEN);

    house1(-20.0, 50.0, 5.0, mv, WHITE, ORANGE_R);
    tree(30.0, 60.0, 7.5, mv, GREEN);
    house2(0.0, 70.0, 9.0, mv, DARK_GRAY, YELLOW);
    house1(-20.0, 75.0, 8.0, mv, WHITE, DARK_RED);

    // outside hringbraut, clockwise by view 1

    // top center
    tree(-130.0, -15.0, 7.0, mv, GREEN);
    house3(-130.0, 0.0, 15.0, mv, DARK_RED, WHITE);
    tree(-130.0, 20.0, 7.5, mv, GREEN);
    tree(-120.0, 30.0, 6.0, mv, GREEN);

    // top right
    tree(-40.0, 120.0, 5.5, mv, GREEN);
    tree(-50.0, 135.0, 9.0, mv, GREEN);
    house1(-40.0, 140.0, 10.0, mv, WHITE, DARK_RED);
    tree(-35.0, 150.0, 7.5, mv, ORANGE_R);

    // bottom right
    tree(45.0, 135.0, 8.0, mv, GREEN);
    house2(45.0, 120.0, 10.0, mv, DARK_GRAY, YELLOW);
    tree(60.0, 110.0, 7.0, mv, GREEN);
    tree(75.0, 100.0, 5.0, mv, GREEN);
    house2(115.0, 55.0, 5.0, mv, DARK_GRAY, ORANGE_Y);

    // bottom left
    house1(140.0, -50.0, 10.0, mv, WHITE, RED);
    tree(130.0, -65.0, 8.0, mv, GREEN);
    house2(115.0, -65.0, 10.0, mv, DARK_GRAY, YELLOW);

    house3(90.0, -90.0, 8.0, mv, WHITE, DARK_GRAY);
    tree(75.0, -105.0, 7.0, mv, GREEN);
    tree(85.0, -105.0, 6.0, mv, ORANGE_R);

    // top left
    house2(-65.0, -115.0, 10.0, mv, DARK_GRAY, YELLOW);
    tree(-75.0, -100.0, 10.0, mv, GREEN);
    tree(-95.0, -85.0, 7.0, mv, GREEN);
    tree(-90.0, -105.0, 7.5, mv, ORANGE_R);
}


// draw car as two cubes
function drawCar( mv, color ) {

    // set color
    gl.uniform4fv( colorLoc, color );
    
    gl.bindBuffer( gl.ARRAY_BUFFER, cubeBuffer );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );

    var mv1 = mv;
    // lower body of the car
    mv = mult( mv, scalem( 10.0, 3.0, 2.0 ) );
    mv = mult( mv, translate( 0.0, 0.0, 0.5 ) );

    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.drawArrays( gl.TRIANGLES, 0, numCubeVertices );

    // upper part of the car
    mv1 = mult( mv1, scalem( 4.0, 3.0, 2.0 ) );
    mv1 = mult( mv1, translate( -0.2, 0.0, 1.5 ) );

    gl.uniformMatrix4fv(mvLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, numCubeVertices );
}
    

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    car1Direction += 1.5;
    if ( car1Direction > 360.0 ) car1Direction = 0.0;
    car2Direction -= 0.5;
    if ( car2Direction > 360.0 ) car2Direction = 0.0;

    car1XPos = (TRACK_RADIUS+5) * Math.sin( radians(car1Direction) );
    car1YPos = (TRACK_RADIUS+5) * Math.cos( radians(car1Direction) );
    car2XPos = (TRACK_RADIUS-5) * Math.sin( radians(car2Direction) );
    car2YPos = (TRACK_RADIUS-5) * Math.cos( radians(car2Direction) );

    var mv = mat4();
    switch( view ) {
    case 0:
        mv = lookAt(vec3(0.0, 0.0, 4.0+height), vec3(0.0, 100.0, 4.0), vec3(0.0,0.0,1.0));
        mv = mult( mv, rotateZ(personDirection));
        mv = mult( mv, translate(-personXPos, -personYPos, 0.0));
        drawScenery(mv);
	    var mv1 = mult( mv, translate( car1XPos, car1YPos, 0.0 ) );
	    mv1 = mult( mv1, rotateZ( -car1Direction ) ) ;
	    var mv2 = mult( mv, translate( car2XPos, car2YPos, 0.0 ) );
	    mv2 = mult( mv2, rotateZ( 180-car2Direction ) ) ;
	    drawCar( mv1, RED);
        drawCar( mv2, YELLOW);
        break;
    case 1:
        // Distant and stationary viewpoint
	    mv = lookAt( vec3(250.0, 0.0, 100.0+height), vec3(0.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0) );
	    drawScenery( mv );
	    var mv1 = mult( mv, translate( car1XPos, car1YPos, 0.0 ) );
	    mv1 = mult( mv1, rotateZ( -car1Direction ) ) ;
	    var mv2 = mult( mv, translate( car2XPos, car2YPos, 0.0 ) );
	    mv2 = mult( mv2, rotateZ( 180-car2Direction ) ) ;
	    drawCar( mv1, RED);
        drawCar( mv2, YELLOW);
	    break;
	case 2:
	    // Static viewpoint inside the track; camera follows car
	    mv = lookAt( vec3(75.0, 0.0, 5.0+height), vec3(car1XPos, car1YPos, 0.0), vec3(0.0, 0.0, 1.0 ) );
	    drawScenery( mv );
	    var mv1 = mult( mv, translate( car1XPos, car1YPos, 0.0 ) );
	    mv1 = mult( mv1, rotateZ( -car1Direction ) ) ;
	    var mv2 = mult( mv, translate( car2XPos, car2YPos, 0.0 ) );
	    mv2 = mult( mv2, rotateZ( 180-car2Direction ) ) ;
	    drawCar( mv1, RED);
        drawCar( mv2, YELLOW);
	    break;
	case 3:
	    // Static viewpoint outside the track; camera follows car
	    mv = lookAt( vec3(125.0, 0.0, 5.0+height), vec3(car1XPos, car1YPos, 0.0), vec3(0.0, 0.0, 1.0 ) );
	    drawScenery( mv );
	    var mv1 = mult( mv, translate( car1XPos, car1YPos, 0.0 ) );
	    mv1 = mult( mv1, rotateZ( -car1Direction ) ) ;
	    var mv2 = mult( mv, translate( car2XPos, car2YPos, 0.0 ) );
	    mv2 = mult( mv2, rotateZ( 180-car2Direction ) ) ;
	    drawCar( mv1, RED);
        drawCar( mv2, YELLOW);
	    break;
	case 4:
	    // Driver's point of view.
	    mv = lookAt( vec3(-3.0, 0.0, 5.0+height), vec3(12.0, 0.0, 2.0+height), vec3(0.0, 0.0, 1.0 ) );
	    drawCar( mv, RED );
	    mv = mult( mv, rotateZ( car1Direction ) );
	    mv = mult( mv, translate(-car1XPos, -car1YPos, 0.0) );
	    drawScenery( mv );
	    var mv2 = mult( mv, translate( car2XPos, car2YPos, 0.0 ) );
	    mv2 = mult( mv2, rotateZ( 180-car2Direction ) ) ;
        drawCar( mv2, YELLOW);
	    break;
	case 5:
	    // Drive around while looking at a house at (40, 120)
	    mv = rotateY( -car1Direction );
	    mv = mult( mv, lookAt( vec3(3.0, 0.0, 5.0+height), vec3(40.0-car1XPos, 120.0-car1YPos, 0.0), vec3(0.0, 0.0, 1.0 ) ) );
	    drawCar( mv, RED );
	    mv = mult( mv, rotateZ( car1Direction ) );
	    mv = mult( mv, translate(-car1XPos, -car1YPos, 0.0) );
	    drawScenery( mv );
	    var mv2 = mult( mv, translate( car2XPos, car2YPos, 0.0 ) );
	    mv2 = mult( mv2, rotateZ( 180-car2Direction ) ) ;
        drawCar( mv2, YELLOW);
	    break;
	case 6:
	    // Behind and above the car
	    mv = lookAt( vec3(-12.0, 0.0, 6.0+height), vec3(15.0, 0.0, 4.0), vec3(0.0, 0.0, 1.0 ) );
	    drawCar( mv, RED );
	    mv = mult( mv, rotateZ( car1Direction ) );
	    mv = mult( mv, translate(-car1XPos, -car1YPos, 0.0) );
	    drawScenery( mv );
	    var mv2 = mult( mv, translate( car2XPos, car2YPos, 0.0 ) );
	    mv2 = mult( mv2, rotateZ( 180-car2Direction ) ) ;
        drawCar( mv2, YELLOW);
	    break;
	case 7:
	    // View backwards looking from another car
	    mv = lookAt( vec3(25.0, 5.0, 5.0+height), vec3(0.0, 0.0, 2.0), vec3(0.0, 0.0, 1.0 ) );
	    drawCar( mv, RED );
	    mv = mult( mv, rotateZ( car1Direction ) );
	    mv = mult( mv, translate(-car1XPos, -car1YPos, 0.0) );
	    drawScenery( mv );
	    var mv2 = mult( mv, translate( car2XPos, car2YPos, 0.0 ) );
	    mv2 = mult( mv2, rotateZ( 180-car2Direction ) ) ;
        drawCar( mv2, YELLOW);
	    break;
	case 8:
	    // View from beside the car
	    mv = lookAt( vec3(2.0, 15.0, 5.0+height), vec3(2.0, 0.0, 2.0), vec3(0.0, 0.0, 1.0 ) );
	    drawCar( mv, RED );
	    mv = mult( mv, rotateZ( car1Direction ) );
	    mv = mult( mv, translate(-car1XPos, -car1YPos, 0.0) );
	    drawScenery( mv );
	    var mv2 = mult( mv, translate( car2XPos, car2YPos, 0.0 ) );
	    mv2 = mult( mv2, rotateZ( 180-car2Direction ) ) ;
        drawCar( mv2, YELLOW);
	    break;
	    
    }
    
    
    requestAnimFrame( render );
}

