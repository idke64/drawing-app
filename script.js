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

function draw(e) {
    if (drawing) {
        context.lineTo(e.offsetX, e.offsetY);
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

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);

function displayElement(){

}

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
            console.log("Something went wrong!");
        });
}

//mediapipe stuff
import {
    GestureRecognizer,
    FilesetResolver,
    DrawingUtils
} from "/DrawingApp/nodemodules/mediapipe/tasks-vision/vision_bundle.js";

let gestureRecognizer = null;
let runningMode = "IMAGE";

const createGestureRecognizer = async () => {
    const vision = await FilesetResolver.forVisionTasks(
        "/DrawingApp/nodemodules/mediapipe/tasks-vision/wasm"
    );
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath:
                "/DrawingApp/static/gesture_recognizer.task",
            delegate: "GPU"
        },
        runningMode: runningMode
    });
};
createGestureRecognizer();

let lastVideoTime = -1;
let results = undefined;
let resultsText = document.getElementById("resultsText");

async function predictVideo() {

    if (!gestureRecognizer) {
        console.log('waiting for gesture recognizer to load...');
        return;
    }

    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await gestureRecognizer.setOptions({ runningMode: "VIDEO" });
    }

    let nowInMs = Date.now();
    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        results = gestureRecognizer.recognizeForVideo(video, nowInMs);
    }

    if (results.gestures.length > 0) {
        const categoryName = results.gestures[0][0].categoryName;
        const categoryScore = parseFloat(results.gestures[0][0].score * 100).toFixed(2);
        resultsText.innerHTML = `i see ${categoryName} with ${categoryScore}% confidence`;
    }
    else {
        resultsText.innerHTML = `i don't see a hand gesture`;
    }
    

}

setInterval(predictVideo, 50);
