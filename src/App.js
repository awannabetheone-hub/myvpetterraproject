import "./App.css";

import * as THREE from 'three'; 

const box= document.querySelector("#box-tutup");
const world = document.querySelector("#world");

// Create the 3D scene
const scene = new THREE.Scene();
scene.background= new THREE.Color("#ffffff");

//Camera
const camera = new THREE.PerspectiveCamera(75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(0,1.6,3);

//Renderer
const renderer= new THREE.WebGLRenderer({
    antialias : true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
world.appendChild(renderer.domElement);

//Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

// Floor
const floor= new THREE.Mesh(
    new THREE.PlaneGeometry(12,12),
    new THREE.MeshStandardMaterial ({color : "#d9c6ad"})
);

floor.rotation.x= -Math.PI / 2;
floor.position.y= 0 ;
scene.add(floor);

// Back wall
const wallMaterial = new THREE.MeshStandardMaterial({
    color: "#f5e9dc",

});

function createWall(width,height,x,y,z) {
    const wall = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        wallMaterial
    );
    wall.position.set(x, y, z);
    scene.add(wall);
}

createWall(12, 5,0,2.5,-6);

//Left wall
createWall(12,5,-6,2.5,0);
scene.children[scene.children.length -1].rotation.y = Math.PI/2;

//Enter the world
const popSound= new Audio ("./asset/box/pop.mp3");
let isOpen=false; 
box.addEventListener("click",() => {
if (!isOpen){
    popSound.currentTime= 0;
    popSound.play();
    box.src= "/asset/box/boxbuka.png";
    box.alt="open toy box";
    isOpen=true;
    return;
}

    document.querySelector("main").style.display= "none";

    world.style.display="block";
    animate();

});

//Render loop
function animate()
{ requestAnimationFrame(animate);
    renderer.render(scene,camera);
}

//Resize
window.addEventListener("resize", ()=> {
    camera.aspect= window.innerWidth /
    window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth,
        window.innerHeight);

    

});
 
 