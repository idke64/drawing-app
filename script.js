const canvas = document.querySelector("canvas");

var drawing = false;

var context = canvas.getContext("2d");

function onLoad(){
    canvas.width = window.innerWidth * .75
    canvas.height = window.innerHeight * .75
    context.fillStyle="#fff";
    context.fillRect(0,0,canvas.width,canvas.height);
}

window.addEventListener("load",onLoad());

function draw(e){
    if (drawing){
        context.lineTo(e.offsetX, e.offsetY);
        console.log(e.offsetX);
        context.stroke();
    }
}

function startDrawing(){
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
