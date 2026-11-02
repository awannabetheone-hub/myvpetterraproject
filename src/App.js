import "./App.css";
import * as THREE from 'three'; 
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

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

camera.position.set(0,0.35,1.4);

//Renderer
const renderer= new THREE.WebGLRenderer({
    antialias : true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
world.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);
controls.pointerSpeed= 0.9;

const movementKeys = new Set();
const clock=new THREE.Clock();
const movementSpeed=3;

let isDragging= false;
let lastX= null;
let lastY=null;
let yaw=0;
let pitch=0;

camera.rotation.order="YXZ";
renderer.domElement.style.touchAction="none";

renderer.domElement.addEventListener("pointerdown",(event)=>{
    isDragging=true;
    lastX= event.clientX;
    lastY= event.clientY;
    renderer.domElement.setPointerCapture(event.pointerId);

});

renderer.domElement.addEventListener("pointermove", (event)=>{
    if(!isDragging && event.pointerType !== "mouse") return;

    if (lastX === null || lastY === null){
        lastX= event.clientX;
        lastY= event.clientY;
        return;
    }

    const deltaX= event.clientX - lastX;
    const deltaY = event.clientY - lastY;
    lastX = event.clientX;
    lastY= event.clientY;

    yaw-= deltaX * 0.004;
    
        pitch -= deltaY * 0.004;
        
        
    
    camera.rotation.set(pitch,yaw,0);
});

function stopDragging(){
    isDragging= false;
}

renderer.domElement.addEventListener("pointerup", stopDragging);
renderer.domElement.addEventListener("pointercancel", stopDragging)

window.addEventListener("keydown", (event)=>{
    const key= event.key.toLowerCase();
    if (!["w","a","s","d"].includes(key)) return;
    event.preventDefault();
    movementKeys.add(key);

});

window.addEventListener("keyup", (event)=>{
    movementKeys.delete(event.key.toLowerCase());
});

//Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const textureLoader = new THREE.TextureLoader();
const floorTexture=textureLoader.load(
    "/asset/the%20world/floor.png"
);
floorTexture.colorSpace=THREE.SRGBColorSpace;

const wallTexture=textureLoader.load(
    "/asset/the%20world/wall.png"
);
wallTexture.colorSpace=THREE.SRGBColorSpace;

const ceilingTexture =textureLoader.load("/asset/the%20world/ceiling.png");
ceilingTexture.colorSpace= THREE.SRGBColorSpace;

// Floor
const floor= new THREE.Mesh(
    new THREE.PlaneGeometry(6,3.5),
    new THREE.MeshStandardMaterial ({map: floorTexture})
);

floor.rotation.x= -Math.PI / 2;
floor.position.y= 0 ;
scene.add(floor);

//Ceiling
const ceiling= new THREE.Mesh(
    new THREE.PlaneGeometry(6,3.5),
    new THREE.MeshStandardMaterial ({map : ceilingTexture})
);
ceiling.rotation.x= Math.PI / 2;
ceiling.position.y=3;
scene.add(ceiling);

// Back wall
const wallMaterial = new THREE.MeshStandardMaterial({
    map:wallTexture,

});

function createWall(width,height,x,y,z) {
    const wall = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        wallMaterial
    );
    wall.position.set(x, y, z);
    scene.add(wall);
}

createWall(6, 3,0,1.5,-1.75);

//Left wall
createWall(3.5,3,-3,1.5,0);
scene.children[scene.children.length -1].rotation.y = Math.PI/2;

//Right wall
createWall(3.5,3,3,1.5,0);
scene.children[scene.children.length -1].rotation.y=-Math.PI/2;

// Front wall
createWall(6,3,0,1.5,1.75);
scene.children[scene.children.length -1].rotation.y=Math.PI;

//Enter the world
const popSound= new Audio ("./asset/box/pop.mp3");
let isOpen=false; 
box.addEventListener("click", async () => {
if (!isOpen){
    popSound.currentTime= 0;
    popSound.play();
    box.src= "/asset/box/boxbuka.png";
    box.alt="open toy box";
    isOpen=true;
    return;
}

if (window.matchMedia("(max-width: 768px)").matches){
    try {
        await document.documentElement.requestFullscreen();
        await screen.orientation.lock("landscape");
    } catch {
        //This browser or device may not support orientation locking.
    }
}

    world.style.display= "block";
    animate();
    
    requestAnimationFrame(()=>{
        box.classList.add("sucked-in");
        world.classList.add("visible");
    });

    box.addEventListener("transitionend", ()=>{
        document.querySelector("main").style.display= "none";
    }, {once:true});

})

//Render loop
function animate()
{ requestAnimationFrame(animate);
    const delta = clock.getDelta();



    const forward = Number(movementKeys.has("w"))-Number(movementKeys.has("s"));
    const sideways= Number(movementKeys.has("d"))-Number(movementKeys.has("a"));
    const inputLenght= Math.hypot(forward,sideways) || 1;

controls.moveForward((forward/inputLenght)*movementSpeed * delta);
controls.moveRight((sideways/inputLenght)*movementSpeed * delta);
camera.position.x= THREE.MathUtils.clamp(camera.position.x, -2.7,2.7);
camera.position.y=0.35;
camera.position.z = THREE.MathUtils.clamp(camera.position.z, -1.5,1.5);


renderer.render(scene, camera);
}

//Resize
window.addEventListener("resize", ()=> {
    camera.aspect= window.innerWidth /
    window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth,
        window.innerHeight);

    

});
 
 