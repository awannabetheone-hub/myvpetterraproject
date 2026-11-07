import "./App.css";
import * as THREE from 'three'; 
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import nipplejs from "nipplejs";

const box= document.querySelector("#box-tutup");
const world = document.querySelector("#world");

const petStats={hunger:60, happiness:55, energy:90};
const petMessage=document.querySelector("#pet-message");
const petMeters={
    hunger:document.querySelector("#pet-hunger"),
    happiness:document.querySelector("#pet-happiness"),
    energy:document.querySelector("#pet-energy")
};

function updatePetMeters(){
    for(const[need,meter] of Object.entries(petMeters))
        meter.value=petStats[need];

}

document.querySelectorAll("[data-care]").forEach((button) => {
    button.addEventListener("click",()=>{
        if(button.dataset.care==="feed") {
            petStats.hunger=Math.max(0,petStats.hunger-40,);
               petMessage.textContent="not bad";
    }   else if(button.datadet.care === "play"){
        petStats.happiness=Math.min(100,petStats.happiness+20);
        petStats.energy=Math.max(0,petStats.energy-10);
        petMessage.textContent="wonderful";
    } else if(button.dataset.care=="rest"){
        petStats.energy=Math.min(100,petStats.energy+15);
        petMessage.textContent="perfect";
    }
    updatePetMeters();

    });
});

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
const movementSpeed=2;

const floorY=0.35;
const gravity=10;
const jumpSpeed=2.5;
let verticalVelocity=0;

function jump(){
    if(camera.position.y <= floorY + 0.01){
        verticalVelocity= jumpSpeed;
    }
}

document.querySelector("#jump-button").addEventListener("pointerdown", (event) =>{
    event.preventDefault();
    jump();
})

const joystickInput= {forward:0, sideways:0 };
let joystick;

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
   
    if(event.code=== "Space"){
        event.preventDefault();
        jump();
        return;
    }
   
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
    "/asset/the%20world/floor2.png"
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

const dollTexture = textureLoader.load("/asset/the%20world/doll3.png");
dollTexture.colorSpace=THREE.SRGBColorSpace;

const doll = new THREE.Sprite(new THREE.SpriteMaterial ({
    map: dollTexture,
    transparent: true,
    depthWrite: false
}));

doll.scale.set(1,0.5,0);
doll.position.set(-2.84,0.2,1.5);
scene.add(doll);

const musicboxTexture=textureLoader.load("/asset/the%20world/music-box.png");
musicboxTexture.colorSpace=THREE.SRGBColorSpace;

const musicbox = new THREE.Sprite(new THREE.SpriteMaterial({
    map:musicboxTexture,
    transparent:true,
    depthWrite:false
    
}));

musicbox.scale.set(0.4,0.4,1);
musicbox.position.set(0.5,0.2,0.8);
scene.add(musicbox)

const musicTracks=[
    "/asset/music/lili-dream.mp3",
    "/asset/music/music1.mp3",
    "/asset/music/music2.mp3"
];

const musicboxAudio = new Audio ();
let currentTrackIndex=-1;
const musicboxBaseScale=0.4;
let breathTime=0;

const raycaster= new THREE.Raycaster();
const pointer= new THREE.Vector2();

renderer.domElement.addEventListener("click", async(event)=>{
    const rect= renderer.domElement.getBoundingClientRect();

    pointer.x=((event.clientX-rect.left)/rect.width) * 2-1;
    pointer.y=-((event.clientY-rect.top)/rect.height) * 2+1;

    raycaster.setFromCamera(pointer, camera);

    if (raycaster.intersectObject(musicbox).length===0) return;

    currentTrackIndex=(currentTrackIndex+1)% musicTracks.length;
    musicboxAudio.src= musicTracks[currentTrackIndex];
    musicboxAudio.currentTime=0;

try{
    await musicboxAudio.play();
}catch(error){
            console.error("Could not play music:", error);
        }
     
});

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

if (window.matchMedia("(max-width: 768px)").matches){
    try {
        await document.documentElement.requestFullscreen();
        await screen.orientation.lock("landscape");
    } catch {
        //This browser or device may not support orientation locking.
    }
}

if (!isOpen){
    popSound.currentTime= 0;
    popSound.play();
    box.src= "/asset/box/boxbuka.png";
    box.alt="open toy box";
    isOpen=true;
    return;
}
world.style.display= "block";

joystick = nipplejs.create({
    zone: document.querySelector("#joystick"),
    mode: "static",
    position: { left: "50%", top: "50%" },
    color: "hsl(23, 92%, 76%)"
});

joystick.on("move", (event, data) => {
    console.log(data.vector, data.force); 
    if (!data.vector) return;
    const force = Math.min(data.force, 1);
    joystickInput.sideways = data.vector.x * force;
    joystickInput.forward = data.vector.y * force;
});

joystick.on("end", () => {
    joystickInput.forward = 0;
    joystickInput.sideways = 0;
});

    
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

    if (!musicboxAudio.paused && !musicboxAudio.ended){
        breathTime+=delta;
        const pulse = 1+0.08 * Math.sin((breathTime * 2 * Math.PI)/ 3.2);
        musicbox.scale.set(
            musicboxBaseScale * pulse,
            musicboxBaseScale * pulse,
            1
        );
    } else {
        musicbox.scale.set(musicboxBaseScale, musicboxBaseScale,1);
    }

const forward =
Number(movementKeys.has("w"))-
Number(movementKeys.has("s"))+
joystickInput.forward;

const sideways=
Number(movementKeys.has("d"))-
Number(movementKeys.has("a"))+
joystickInput.sideways

   
    const inputLenght= Math.hypot(forward,sideways) || 1;

controls.moveForward((forward/inputLenght)*movementSpeed * delta);
controls.moveRight((sideways/inputLenght)*movementSpeed * delta);
camera.position.x= THREE.MathUtils.clamp(camera.position.x, -2.7,2.7);

verticalVelocity-= gravity * delta;
camera.position.y += verticalVelocity* delta;
if(camera.position.y<= floorY){
    camera.position.y=floorY;
    verticalVelocity=0;
}
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
 
 