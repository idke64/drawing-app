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

function draw(e){
    if (drawing){
        context.lineTo(e.offsetX, e.offsetY);
        context.stroke();
    }
}

function startDrawing(e){
    console.log(e.offsetX + " eses")
    console.log(e.offsetX + " sss")
    drawing = true;
    context.beginPath();
    context.lineWidth=3;
    context.strokeStyle = "black";
}

function stopDrawing(){
    drawing = false;
}

canvas.addEventListener("mousedown",startDrawing);
canvas.addEventListener("mousemove",draw);
canvas.addEventListener("mouseup",stopDrawing);

function displayElement(){

}

// video things
var video = document.createElement("video");
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