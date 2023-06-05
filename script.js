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
    GestureRecognizer,
    FilesetResolver,
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
let lastPosX = -1, lastPosY = -1;
let lastGesture = "None";

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

        let posX = 0, posY = 0;
        for (let i = 0; i < 20; i++) {
            posX += results.landmarks[0][i].x;
            posY += results.landmarks[0][i].y;
        }
        posX /= 20;
        posY /= 20;

        if (lastGesture !== "Open_Palm" && categoryName === "Open_Palm") {
            startDrawing();
        }
        else if (categoryName === "Open_Palm" && Math.abs(lastPosX - posX) > 0.002 && Math.abs(lastPosY - posY) > 0.002) {
            let x = canvas.width * (1 - posX);
            let y = canvas.height * posY;
            draw(x, y);
        }
        else if (categoryName !== "Open_Palm") {
            stopDrawing();
        }

        lastGesture = categoryName;
        lastPosX = posX;
        lastPosY = posY;
        resultsText.innerHTML = `i see ${categoryName} with ${categoryScore}% confidence at ${posX.toFixed(2)}, ${posY.toFixed(2)}`;
        
    }
    else {
        resultsText.innerHTML = `i don't see a hand gesture`;
    }
    

}

setInterval(predictVideo, 50);