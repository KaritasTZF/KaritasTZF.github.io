
// walls
const minX = -3.0;
const maxX = 3.0;
const minZ = -3.0;
const maxZ = 3.0;
const minY = -10.0;
const maxY = 10.0;
// stikun
const boxRad = 0.5;
const step = 1.0;
const rot = Math.PI/2.0;

const basicGeometry = new THREE.BoxGeometry(step, step, step);
const basicMaterial = new THREE.MeshPhongMaterial( { color: 0x44aa88 } );
const redMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000 } );

// geyma dauðir kassar í hverri hæð (20 hæðir), 0-36 filled per hæð.
var deadCubes = new Array(20).fill(new Array());
var currentTronimo = new Array(3); // list of 3 cubes

// Skilgreina canvas, camera, controls, render
const canvas = document.querySelector('#c');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, canvas.clientWidth/canvas.clientHeight, 0.1, 1000 );
const controls = new THREE.OrbitControls( camera, canvas );
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
camera.position.set(4.0, 10.0, 14.0);
// Skilgreina ljósgjafa og bæta honum í sviðsnetið
const light = new THREE.DirectionalLight(0xFFFFFF, 1);
light.position.set(-5, 7, 21);
scene.add(light);

// clock
var clock = new THREE.Clock();
var time = 0;
var speed = 1.0;

// Búa til tening með Phong áferð (Phong material) og bæta í sviðsnetið
const bigGeometry = new THREE.BoxGeometry(6.0, 20, 6.0);
const bigMaterial = new THREE.MeshStandardMaterial( { wireframe : true } );
const bigcube = new THREE.Mesh( bigGeometry, bigMaterial );
scene.add( bigcube );

// Búa til Tronimo
newTromino();

function cube(x, y, z) {
  // Búa til tening með Phong áferð (Phong material) og bæta í sviðsnetið
  const basicCube = new THREE.Mesh( basicGeometry, basicMaterial );
  basicCube.position.set(x, y, z);
  scene.add( basicCube );
  currentTronimo.push(basicCube);
}

function newTromino() {
  cube(boxRad, maxY -boxRad, boxRad);
  cube(boxRad+1.0, maxY -boxRad, boxRad);
  cube(boxRad-1.0, maxY -boxRad, boxRad);
}

function checkContact() {
  var contactFlag = false;

  currentTronimo.forEach(function(cube) {
    // check if at bottom
    if (cube.position.y <= minY + step) {
      contactFlag = true;
    } 
    else {
      // get dead layer below this cube, check if on top of another cube
      deadCubes[cube.position.y-boxRad+9].forEach( function(deadCube) {
        if (cube.position.y == deadCube.position.y +1.0) {
          contactFlag = true;
        }
      })
    }
  });

  if (contactFlag) {
    contactFlag = false;
    contact();
  } else {
    currentTronimo.forEach(function(cube) {
      cube.position.y -= step;
    });
  }
}

function contact() {
  var activeLayers = new Set();
  // kill each cube dead
  currentTronimo.forEach(function(cube) {
    var h = cube.position.y-boxRad+10;
    deadCubes[h].push(cube);
    activeLayers.add(h);
  });
  currentTronimo = [];

  // check if any layers cleared
  activeLayers.forEach(function (l) {
    console.log("checking layer ",l);
    // if there are 36 cubes in this height layer, delete each cube
    if (deadCubes[l].length >= 36) {
      console.log("erasing layer",l);
      console.log("layer has cubes: ",deadCubes[l].length);
      deadCubes[l].forEach(function(deadCube) {
        scene.remove(deadCube);
        deadCube = undefined;
      });
      deadCubes.splice(l,1); // remove layer from array
      //TODO: move all above cubes down 1
      deadCubes.push(new Array()); // add new layer to the top
    }
  });

  newTromino();
}

// Hreyfifall
const animate = function () {
  requestAnimationFrame( animate );
  // Every second, let the current tetronimo fall by 1
  time += clock.getDelta();
  if (time >= 1.0) { 
    checkContact();
    time = 0;
  };
  controls.update();
  renderer.render( scene, camera );
};

animate();
