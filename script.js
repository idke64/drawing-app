const canvas = document.querySelector("canvas");
const style = getComputedStyle(canvas);

var drawing = false;

var context = canvas.getContext("2d");

function updateCanvas(){
    canvas.width = parseInt(style.width);
    canvas.height = parseInt(style.height);

    context.fillStyle="#fff";
    context.fillRect(0,0,canvas.width,canvas.height);
}

updateCanvas()
window.addEventListener("resize",updateCanvas());

function draw(posX, posY) {
    if (drawing) {
        context.lineTo(posX, posY);
        context.stroke();
    }
}

function startDrawing() {
    drawing = true;
    context.beginPath();
    context.lineWidth = 3;
    context.strokeStyle = "black";
}

function stopDrawing() {
    drawing = false;
}

//canvas.addEventListener("mousedown", startDrawing);
//canvas.addEventListener("mousemove", draw);
//canvas.addEventListener("mouseup", stopDrawing);

// video things
const video = document.createElement("video");
video.autoplay = true;
video.id = 'videoElement';
var overlay = document.getElementById("cameraContainer");
var cameraNotFound = document.getElementById("cameraNotFound");

if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            video.srcObject = stream;
            overlay.appendChild(video);
            cameraNotFound.style.display = "none";
        })
        .catch(function (err0r) {
            console.log(err0r);
        });
}

//mediapipe stuff
import {
    FilesetResolver,
    HandLandmarker
} from "/nodemodules/mediapipe/tasks-vision/vision_bundle.js";

let gestureRecognizer = null;
let runningMode = "VIDEO";
let handLandmarker = undefined;

const createHandLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks(
        "/nodemodules/mediapipe/tasks-vision/wasm"
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath:
                "/static/hand_landmarker.task",
            delegate: "GPU"
        },
        runningMode: runningMode,
        numHands: 2
    });
}
createHandLandmarker();

var lastVideoTime = -1;
var results = undefined;

async function predict() {

    if (!handLandmarker){
        console.log('not loaded');
        
    }

    let startTime = performance.now();
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        results = await handLandmarker.detectForVideo(video, startTime);
    }

    if (results.landmarks) {
        if (!drawing){
            startDrawing();
        }
        for (const landmarks of results.landmarks) {
            
            let x = (1-landmarks[8].x) * canvas.width;
            let y = (1-landmarks[8].y) * canvas.height;
            console.log(x + " " + y);
            draw(x,y);
        }
    }
    else{
        if (drawing){
            stopDrawing();
        }
        return;
    }
    
}

setInterval(predict, 50);