// starting variables
// walls
const minX = -3.0;
const maxX = 3.0;
const minZ = -3.0;
const maxZ = 3.0;
const minY = -10.0;
const maxY = 10.0;
// stikun
const boxRad = 0.5;
const rot = Math.PI/2.0; // 90 deg í radíana

// Three.js materials and geometry
const basicGeometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
const basicMaterial = new THREE.MeshPhongMaterial( { color: 0x44aa88 } );
const redMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
const greenMaterial = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
const blueMaterial = new THREE.MeshPhongMaterial( { color: 0x0000ff } );

// Skilgreina canvas, camera, controls, render
const canvas = document.querySelector('#c');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 50, canvas.clientWidth/canvas.clientHeight, 0.1, 1000 );
const controls = new THREE.OrbitControls( camera, canvas );
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});

// helper for our deadLayers groups
function constructGroup(elem,index) {
  var group = new THREE.Group();
  group.position.set(0.0, index+boxRad-10.0, 0.0);
  scene.add(group);
  return group;
}

// geyma dauðir kassar í hverri hæð (20 hæðir). Hvert stak í fylki er Group object
var deadLayers = new Array(20).fill(null).map(constructGroup);
var currentTronimo = new THREE.Group();

// clock and time
var clock = new THREE.Clock();
var time = 0; // keeps track of elapsed time - resets at 1 second
var speed = 1.0; // steps per second
var pause = false;
var contactFlag = false;

// html
document.getElementById("points").innerHTML = "0 stig."
var points = 0;

// ----------------------------------------------------------------------------
// Controls

document.addEventListener("keydown", (event) => {
  contactFlag = false;
  var pos = new THREE.Vector3();
  var newpos = new THREE.Vector3();
  switch (event.key) {
    case "ArrowUp":
      currentTronimo.children.forEach(function(cube) {
        cube.getWorldPosition(pos);
        checkSpaceBlocked(new THREE.Vector3(0.0,0.0,1.0).add(pos));
      });
      if (!contactFlag) currentTronimo.position.z += 1.0;
      break;
    case "ArrowDown":
      currentTronimo.children.forEach(function(cube) {
        cube.getWorldPosition(pos);
        checkSpaceBlocked(new THREE.Vector3(0.0,0.0,-1.0).add(pos));
      });
      if (!contactFlag) currentTronimo.position.z -= 1.0;
      break;
    case "ArrowLeft":
      currentTronimo.children.forEach(function(cube) {
        cube.getWorldPosition(pos);
        checkSpaceBlocked(new THREE.Vector3(1.0,0.0,0.0).add(pos));
      });
      if (!contactFlag) currentTronimo.position.x += 1.0;
      break;
    case "ArrowRight":
      currentTronimo.children.forEach(function(cube) {
        cube.getWorldPosition(pos);
        checkSpaceBlocked(new THREE.Vector3(-1.0,0.0,0.0).add(pos));
      });
      if (!contactFlag) currentTronimo.position.x -= 1.0;
      break;

    case " ": // fall, hold to go all the way
      onStep();
      break;

    case "a" : // rotate around x, check y (floor) and z
      // first child is center - for other cubes, calculate position after rotation and check boundaries
      currentTronimo.children.slice(1).forEach(function(cube) {
        cube.getWorldPosition(pos);
        newpos = new THREE.Vector3(0,-pos.x+currentTronimo.position.x, pos.y-currentTronimo.position.y)
                                .add(currentTronimo.position);
        checkSpaceBlocked(newpos);
      });
      if (!contactFlag) currentTronimo.rotation.x += rot;
      break;

    case "z" : // rotate around x, check y (floor) and z
      // first child is center - for other cubes, calculate position after rotation and check boundaries
      currentTronimo.children.slice(1).forEach(function(cube) {
        cube.getWorldPosition(pos);
        newpos = new THREE.Vector3(0,pos.x-currentTronimo.position.x, -pos.y+currentTronimo.position.y)
                                .add(currentTronimo.position);
        checkSpaceBlocked(newpos);
      });
      if (!contactFlag) currentTronimo.rotation.x -= rot;
      break;

    case "x" : // rotate around y, check x and z
      // first child is center - for other cubes, calculate position after rotation and check boundaries
      currentTronimo.children.slice(1).forEach(function(cube) {
        cube.getWorldPosition(pos);
        newpos = new THREE.Vector3(-pos.z+currentTronimo.position.z,0, pos.x-currentTronimo.position.x)
                                .add(currentTronimo.position);
        checkSpaceBlocked(newpos);
      });
      if (!contactFlag) currentTronimo.rotation.y += rot;
      break;

    case "s" : // rotate around y, check x and z
      // first child is center - for other cubes, calculate position after rotation and check boundaries
      currentTronimo.children.slice(1).forEach(function(cube) {
        cube.getWorldPosition(pos);
        newpos = new THREE.Vector3(pos.z-currentTronimo.position.z,0, -pos.x+currentTronimo.position.x)
                                .add(currentTronimo.position);
        checkSpaceBlocked(newpos);
      });
      if (!contactFlag) currentTronimo.rotation.y -= rot;
      break;

    case "d" : // rotate around z, check x and y (floor) 
      // first child is center - for other cubes, calculate position after rotation and check boundaries
      currentTronimo.children.slice(1).forEach(function(cube) {
        cube.getWorldPosition(pos);
        newpos = new THREE.Vector3(-pos.y+currentTronimo.position.y, pos.x-currentTronimo.position.x,0)
                                .add(currentTronimo.position);
        checkSpaceBlocked(newpos);
      });
      if (!contactFlag) currentTronimo.rotation.z += rot;
      break;

    case "c" : // rotate around z, check x and y (floor) 
      // first child is center - for other cubes, calculate position after rotation and check boundaries
      currentTronimo.children.slice(1).forEach(function(cube) {
        cube.getWorldPosition(pos);
        newpos = new THREE.Vector3(pos.y-currentTronimo.position.y, -pos.x+currentTronimo.position.x,0)
                                .add(currentTronimo.position);
        checkSpaceBlocked(newpos);
      });
      if (!contactFlag) currentTronimo.rotation.z -= rot;
      break;

    case "q" : 
      pause = true;
      console.log("pause");
      break;
    case "w" :
      pause = false;
      console.log("continue");
      break;
      
  }
});

// check whether the space at pos (world coord) is clear and within boundaries
// returns true if move to pos is illegal, false if the space is free and within boundaries
function checkSpaceBlocked(pos) {
  if (pos.x < minX || pos.x > maxX || pos.y < minY || pos.z < minZ || pos.z > maxZ  ) {
          console.log("returning true");
    contactFlag = true;
  } else {
    var h = Math.max(Math.round(pos.y-boxRad+10),0); // get height layer
    deadLayers[h].children.forEach( function(deadCube) {
      console.log(`checking layer ${h}, deadcube at x ${deadCube.position.x} z ${deadCube.position.z}`);
      console.log(`difference is ${Math.abs(pos.x - deadCube.position.x)} and ${Math.abs(pos.z - deadCube.position.z)}`);
      if (Math.abs(pos.x - deadCube.position.x) < boxRad 
        && Math.abs(pos.z - deadCube.position.z) < boxRad) {
          console.log("returning true");
        contactFlag = true;
      } else{
          console.log("no set");
      }
    });
  }
}

// ----------------------------------------------------------------------------
// define functions of construction

function init() {
  camera.position.set(0.0, 18.0, -18.0);
    
  // Skilgreina ljósgjafa og bæta honum í sviðsnetið
  const light1 = new THREE.DirectionalLight(0xFFFFFF, 1);
  const light2 = new THREE.AmbientLight(0x303030, 1);
  light1.position.set(5, 10, -8);
  scene.add(light1);
  scene.add(light2);

  // big cube shows boundaries
  const lineGeometry = new THREE.BoxGeometry(6.0, 20, 6.0);
  const bigMaterial = new THREE.MeshStandardMaterial({wireframe: true});
  const bigcube = new THREE.Mesh( lineGeometry, bigMaterial );
  scene.add( bigcube );

  const planeGeo = new THREE.PlaneGeometry(60, 60);
  const planeMaterial = new THREE.MeshPhongMaterial({color: 0xa0a0a0});
  const plane = new THREE.Mesh(planeGeo, planeMaterial);
  plane.rotation.x = -rot;
  plane.position.set(0.0, -10.0, 0.0);
  scene.add(plane);

  newTromino();
  initState(); //mostly for testing - start in a state
}

function initState() {
  for (let i = 0; i < 33; i++) {
    const basicCube0 = new THREE.Mesh( basicGeometry, redMaterial );
    basicCube0.position.set(boxRad+2.0, 0.0, boxRad+2.0);
    const basicCube1 = new THREE.Mesh( basicGeometry, redMaterial );
    basicCube1.position.set(boxRad+2.0, 0.0, boxRad+2.0);
    //deadLayers[0].add(basicCube0);
    //deadLayers[1].add(basicCube1);
  }
  scene.add(deadLayers[0]);
  scene.add(deadLayers[1]);
}

function newCube(x, y, z, mat) {
  // Búa til tening með Phong áferð (Phong material) og bæta í sviðsnetið
  const basicCube = new THREE.Mesh( basicGeometry, mat );
  basicCube.position.set(x, y, z);
  return basicCube;
}

function newTromino() {
  currentTronimo.children = [];
  currentTronimo.position.set(boxRad, maxY -boxRad, boxRad);
  currentTronimo.add(newCube(0.0, 0.0, 0.0, basicMaterial));
  currentTronimo.add(newCube(1.0, 0.0, 0.0, greenMaterial));
  currentTronimo.add(newCube(-1.0, 0.0, 0.0, blueMaterial));
  scene.add(currentTronimo);
}

// ----------------------------------------------------------------------------
// functions for handling collision and layer clear

// returns true if contact is made.

function contact() {
  var activeLayers = new Set();
  var pos = new THREE.Vector3();
  // kill each cube dead
  for (let i = 0; i<3; i++){
    // we go in reverse order because a Three.Object3d can only be part
    // of 1 group, so when we add to deadLayers its removed from currentTronimo
    // Therefore we make sure to start at the end of the children array.
    var cube = currentTronimo.children[2-i]; 
    cube.getWorldPosition(pos); //cube.position is relative to group
    var h = Math.round(pos.y-boxRad+10);

    //check if at top - game over
    if (pos.y >= maxY) {
      gameOver();
    } 
    // else move it from current to dead
    else {
      cube.position.y = 0.0; // set y position relative to deadLayer group to 0
      // set xz to world coords (deadLayer.xz is 0.0,0.0, so relative coords are the same as world coords)
      cube.position.x = pos.x; 
      cube.position.z = pos.z; 
      cube.material = redMaterial;
      deadLayers[h].add(cube);
      activeLayers.add(h);
    }
  }
  currentTronimo.children = [];

  // check if any layers need to be cleared
  checkAndClearLayers(activeLayers);

  newTromino();
}

function checkAndClearLayers(layersSet) {
  layersSet.forEach(function (l) {
    // if there are 36 cubes in this height layer, delete each cube
    if (deadLayers[l].children.length >= 36) {
      
      deadLayers[l].children.forEach(function(deadCube) {
        deadCube = undefined;
      });
      scene.remove(deadLayers[l]);
      // move all above blocks down by 1
      for (let i=l+1; i<20; i++) {
        deadLayers[i].position.y -= 1.0;
      }
      deadLayers.splice(l,1); // remove layer from array
      deadLayers.push(constructGroup(null,20)); // add new layer to the top

      points += 1;
      document.getElementById("points").innerHTML = points + " stig.";
    }
  });
}

function onStep() {
  contactFlag = false;
  var pos = new THREE.Vector3();

  currentTronimo.children.forEach(function(cube) {
    // get world position
    cube.getWorldPosition(pos);
    checkSpaceBlocked(new THREE.Vector3(0.0,-1.0,0.0).add(pos)); // sets flag true if space is occupied
  });

  if (contactFlag) {
    contact();
  } else {
    currentTronimo.position.y = Math.round(currentTronimo.position.y - 1.0)-boxRad;
  }
}

// ----------------------------------------------------------------------------
// Run

let animationId;

function gameOver() {
  cancelAnimationFrame(animationId);
  console.log("game over");
}

init();

// Hreyfifall
const animate = function () {
  animationId=requestAnimationFrame( animate );
  // Every second, let the current tetronimo fall by 1
  time += clock.getDelta();
  if (time >= 1.0/speed) { 
    if (!pause) onStep();
    time = 0;
  };
  controls.update();
  renderer.render( scene, camera );
};

animate();