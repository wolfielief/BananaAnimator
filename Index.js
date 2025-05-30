const drawingCanvas = document.getElementById("canvas");
const ScreenCanvas = document.getElementById("screenCanvas");
const sizeCanvas = document.getElementById("SizeCanvas");
const onionSkinningCanvas = document.getElementById("OnionSkinningCanvas");
var Width = window.innerWidth;
var Height = window.innerHeight;
drawingCanvas.width = 512;
drawingCanvas.height = 288;
onionSkinningCanvas.width = 512;
onionSkinningCanvas.height = 288;
sizeCanvas.width = 120;
sizeCanvas.height = 120;

const c = drawingCanvas.getContext("2d");
const screenc = ScreenCanvas.getContext("2d");
const onionSkinningC = onionSkinningCanvas.getContext("2d");

var frames = []

var isPainting = false;
var startX;
var startY;
var erasing = false;
var LineWidth = 5;
var mouseX;
var mouseY;
var showTool = true;
var CurrentFrame = 0;
document.getElementById("Frame#").innerHTML = CurrentFrame + 1;
var playing = false;
var FPS = 10;

var OnionSkinningBefore;
var OnionSkinningAfter;

function Fill(fill) {
    if (fill == 0) {
        c.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    } else {
        c.beginPath();
        c.fillStyle = document.getElementById("ColorWheel").value;
        c.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    }
}

function play() {
    playing = !playing;
    if (playing) {
        document.getElementById("play").innerHTML = "<img src='stop-button.png' width='15px'>"
        IncreaseFrame(1, true);
    } else {
        document.getElementById("play").innerHTML = "<img src='play-button.png' width='15px'>"
    }
}

function newFrame(id) {
    if (id===0) {
        save(CurrentFrame);
        CurrentFrame = frames.length;
        load(CurrentFrame);
        IncreaseFrame(1);
    } else if (id===1) {
        save(CurrentFrame)
        save(frames.length)
        CurrentFrame = frames.length - 1;
        load(CurrentFrame);
        document.getElementById("Frame#").innerHTML = CurrentFrame + 1;
    }
}

function DeleteFrame() {
    if (frames.length <= 1) {
        return;
    }
    if (CurrentFrame == 0) {
        return;
    }
    frames.splice(CurrentFrame, 1);
    CurrentFrame = CurrentFrame - 1;
    load(CurrentFrame);
    document.getElementById("Frame#").innerHTML = CurrentFrame + 1;
}

function IncreaseFrame(Incremental, Jumped=false) {
    save(CurrentFrame);
    CurrentFrame += Incremental;
    if (CurrentFrame < 0) {
        CurrentFrame = 0
    }
    if (CurrentFrame > frames.length - 1) {
        CurrentFrame = frames.length - 1;
        if (Jumped) {
            CurrentFrame = 0;
        }
    }
    if (load(CurrentFrame, !Jumped)) {
        CurrentFrame = 0;
        load(CurrentFrame);
    }
    document.getElementById("Frame#").innerHTML = CurrentFrame + 1;
    if (playing && Jumped) {
        setTimeout(() => IncreaseFrame(1, true), 1000 / FPS);
    }
}

function ResizeScreenCanvas() {
    ScreenCanvas.width = window.innerWidth;
    ScreenCanvas.height = window.innerHeight;
}

ResizeScreenCanvas();
window.addEventListener("resize", ResizeScreenCanvas);

function eraseCircle(centerX, centerY, Radius) {

    for (let r = 1; r <= Radius; r += 1) {
        const omtrek = 2 * Math.PI * r;
        const amount = Math.floor(omtrek / (5 * 1.1));

        for (let i = 0; i < amount; i++) {
            const angle = (2 * Math.PI / amount) * i;
            const x = centerX + Math.cos(angle) * r - 5 / 2;
            const y = centerY + Math.sin(angle) * r - 5 / 2;

            c.clearRect(x, y, 5, 5);
        }
    }
}

function toggleErase() {
    erasing = !erasing;
    if (erasing) {
        document.getElementById("eraseToggle").innerHTML = "<img src='pen.png' width='10px'>"
    } else {
        document.getElementById("eraseToggle").innerHTML = "<img src='eraser.png' width='10px'>"
    }
}

function save(frame=0) {
    let data = drawingCanvas.toDataURL("image.png");
    if (frames.length >= frame) {
        frames[frame] = data;
        return;
    }
    frames.push(data);   
}

function load(frame=0, ClearIfNone=true, Context=c) {
    let data = frames[frame];
    if (data) {
        loadImage(data, Context);
    } else if (ClearIfNone) {
        Context.clearRect(0, 0, canvas.width, canvas.height);
    } else {
        return true;
    }
    return false;
}

function loadImage(url) {
  const img = new Image();
  img.onload = function () {
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  img.src = url;
}

function draw(e) {
    if (!isPainting) {
        return;
    }
    if (playing) {
        return;
    }
    
    if (erasing) {
        eraseCircle(e.offsetX, e.offsetY, LineWidth / 2.3);
        return;
    }
    c.strokeStyle = document.getElementById("ColorWheel").value;

    c.lineWidth = LineWidth;
    c.lineCap = "round";
    
    c.lineTo(e.offsetX, e.offsetY);
    c.stroke();
}

function StartDraw(e) {
    isPainting = true;
    startX = e.offsetX;
    startY = e.offsetY;
    c.beginPath();
    draw(e);
}
drawingCanvas.addEventListener("mousedown", StartDraw);
drawingCanvas.addEventListener("touchstart", function(e) {
    e.preventDefault();
    var offsetX;
    var offsetY;
    const rect = canvas.getBoundingClientRect();
    offsetX = e.touches[0].clientX - rect.left;
    offsetY = e.touches[0].clientY - rect.top;
    
    StartDraw({offsetX: offsetX, offsetY: offsetY});
    showTool = true;
});

function EndDraw(e) {
    if(!isPainting) {
        return;
    }
    isPainting = false;
    c.stroke();
    c.closePath();
    c.beginPath();
}
window.addEventListener("mouseup", EndDraw);
window.addEventListener("touchend", function(e) {
    showTool = false;
    EndDraw(e);
})

function GetTransparency(i) {
    
    if (i==1) {
        return 0.4;
    } else if (i==2) {
        return 0.35;
    } else if (i==3) {
        return 0.3;
    } else if (i==4) {
        return 0.28;
    } else if (i==5) {
        return 0.25;
    } else if (i==6) {
        return 0.2;
    } else if (i==7) {
        return 0.15;
    } else if (i==8) {
        return 0.1;
    } else if (1==9) {
        return 0.075;
    } else if (i>9) {
        return 0.05
    }
}

function UpdateOnionSkinning() {
    var i = 1;
    while (i <= OnionSkinningBefore) {
        const CheckingFrame = CurrentFrame - i;
        const url = frames[CheckingFrame];
        if (url) {
            const img = new Image();
            img.src = url;
            const alpha = GetTransparency(i);
            onionSkinningC.globalAlpha = alpha;
            onionSkinningC.drawImage(img, 0, 0,  onionSkinningCanvas.width, onionSkinningCanvas.height);
        }
        i += 1;
    }
    i = 1;
    while (i <= OnionSkinningAfter) {
        const CheckingFrame = CurrentFrame + i;
        const url = frames[CheckingFrame];
        if (url) {
            const img = new Image();
            img.src = url;
            const alpha = 0.5;
            onionSkinningC.globalAlpha = alpha;
            onionSkinningC.drawImage(img, 0, 0,  onionSkinningCanvas.width, onionSkinningCanvas.height);
        }
        i += 1;
    }
}

const ToolDisplay = document.getElementById("CurrentTool");

function update() {
    requestAnimationFrame(update);
    LineWidth = document.getElementById("Width").value;
    document.getElementById("SizeLabel").innerHTML = LineWidth;
    
    FPS = document.getElementById("FPS").value;
    document.getElementById("FPSLabel").innerHTML = FPS;

    Width = window.innerWidth;
    Height = window.innerHeight;

    screenc.clearRect(0, 0, ScreenCanvas.width, ScreenCanvas.height);
    ToolDisplay.width = "20";
    ToolDisplay.style.top = mouseY + "px";
    ToolDisplay.style.left = mouseX + "px";
    if (showTool) {
        ToolDisplay.style.opacity = 1;
    } else {
        ToolDisplay.style.opacity = 0;
    }
    
    const SizeC = sizeCanvas.getContext("2d");
    SizeC.clearRect(0, 0, 120, 120);
    SizeC.beginPath();
    SizeC.arc(60, 60, LineWidth / 2, 0, Math.PI * 2, false)
    SizeC.stroke();
    SizeC.closePath();
    if (erasing) {
        ToolDisplay.src = "eraser.png";
        screenc.beginPath();
        screenc.arc(mouseX, mouseY, LineWidth / 2, 0, Math.PI * 2, false)
        screenc.stroke();
        screenc.closePath();
    } else {
        ToolDisplay.src = "pen.png";
    }

    //Onion Skinning
    OnionSkinningBefore = document.getElementById("OnionSkinningBefore").value;
    OnionSkinningAfter = document.getElementById("OnionSkinningAfter").value;
    document.getElementById("OnionSkinningBeforeLabel").innerHTML = OnionSkinningBefore;
    document.getElementById("OnionSkinningAfterLabel").innerHTML = OnionSkinningAfter;
    onionSkinningC.clearRect(0, 0, onionSkinningCanvas.width, onionSkinningCanvas.height);
    if (!playing) {
        UpdateOnionSkinning();
    }
}


update();
var ScreenCanvasMouseX;
var ScreenCanvasMouseY;

function mouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}
document.addEventListener("mousemove", mouseMove)
document.addEventListener("touchmove", function(e) {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
})

drawingCanvas.addEventListener("mousemove", draw)
drawingCanvas.addEventListener("touchmove", function(e) {
    var offsetX;
    var offsetY;
    const rect = canvas.getBoundingClientRect();
    offsetX = e.touches[0].clientX - rect.left;
    offsetY = e.touches[0].clientY - rect.top;
    draw({offsetX: offsetX, offsetY: offsetY});
})
