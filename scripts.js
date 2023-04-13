//----------------Loading Images----------------
const annotationsFolder = './annotations/'
const imagesFolder = './images/';
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
const imageFiles = [];

images = [];

fetch(imagesFolder)
  .then(response => response.text())
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.querySelectorAll('a');

    links.forEach(link => {
      const href = link.getAttribute('href');
      const extension = href.split('.').pop();

      if (imageExtensions.includes(extension)) {
        const src = imagesFolder + href.split("/").pop()
        imageFiles.push(src);
        
        let image = new Image();
        image.src = src;
        images.push(image);
      }
    });

    loadCurrentImage().then(
      () => load_annotations(imageFiles[currentImageIndex])
      .then(() => redraw()));
  });

//---------------Getting canvas-----------------
const imageContainer = document.getElementById("main_image_container")
const canvas = document.getElementById("main_canvas");
const ctx = canvas.getContext('2d');

canvas.width = imageContainer.clientWidth;
canvas.height = imageContainer.clientHeight;

//----------Viewing Images----------
let currentImageIndex = 0;

let img_width = null;
let img_height = null;

function loadCurrentImage() {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.onload = function() {

      const aspectRatioImg = image.width / image.height;
      const aspectRatioCanvas = canvas.width / canvas.height;
      
      img_width = canvas.width;
      img_height = canvas.height;
      if (aspectRatioImg > aspectRatioCanvas) {
        img_height = canvas.width / aspectRatioImg;
      } else {
        img_width = canvas.height * aspectRatioImg;
      }


      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, img_width, img_height);

      resolve();
    };
    image.src = imageFiles[currentImageIndex];
  });
}

function handleArrowKeys(event) {
  if (event.keyCode === 37) {
    currentImageIndex--;
    
  }else if (event.keyCode === 39) {
    currentImageIndex++;
  }else{
    return;
  }

  currentImageIndex = (currentImageIndex + imageFiles.length) % imageFiles.length;
  clearBBoxs();
  loadCurrentImage().then(
    () => load_annotations(imageFiles[currentImageIndex])
    .then(() => redraw()));
}

// Add an event listener for arrow key events
document.addEventListener('keydown', handleArrowKeys);

//-------------Getting points----------------
pointPile = [];

canvas.addEventListener('click', (event) => {
  var rect = canvas.getBoundingClientRect();
  const x = event.pageX - rect.left;
  const y = event.pageY - rect.top;

  var scaleX = canvas.width / rect.width,
  scaleY = canvas.height / rect.height;
  pointPile.push({x: x * scaleX, y: y * scaleY});

  const point = document.createElement("div");
  point.className = "point";
  point.style.left = x + "px";
  point.style.top = y + "px";

  imageContainer.appendChild(point);

  if(pointPile.length == 3){
    // drawShape();
    makeBox();
  }
});

//--------Drawing shapes----------
function drawBox(box) {
  ctx.strokeStyle = "#689F38";
  ctx.lineWidth = 2;

  // Draw the lines
  ctx.beginPath();
  ctx.moveTo(box.p1.x, box.p1.y);
  ctx.lineTo(box.p2.x, box.p2.y);
  ctx.lineTo(box.p3.x, box.p3.y);
  ctx.lineTo(box.p4.x, box.p4.y);
  ctx.lineTo(box.p1.x, box.p1.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(box.p1.x, box.p1.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = 'yellow';
  ctx.fill();
}

function drawFilledBox(box) {
  ctx.strokeStyle = "green";
  ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
  ctx.lineWidth = 2;

  // Draw the lines
  ctx.beginPath();
  ctx.moveTo(box.p1.x, box.p1.y);
  ctx.lineTo(box.p2.x, box.p2.y);
  ctx.lineTo(box.p3.x, box.p3.y);
  ctx.lineTo(box.p4.x, box.p4.y);
  ctx.lineTo(box.p1.x, box.p1.y);
  ctx.stroke();
  ctx.fill();

  ctx.beginPath();
  ctx.arc(box.p1.x, box.p1.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = 'yellow';
  ctx.fill();
}

function clearDraws() {
  const children = imageContainer.childNodes;
  for (let i = children.length - 1; i >= 0; i--) {
    if (children[i].nodeName !== 'CANVAS') {
      imageContainer.removeChild(children[i]);
    }
  }
}

//--------------Bounding Boxes--------------
const sidebarboxes = document.getElementById("side_bar_rectangles");
var bboxs = []
var bbox_count = 0;
var selected_boxs = [];

var BoundingBoxes = [];
function makeBox(){
  var box = {};

  // box.p1 = pointPile[0];
  // box.p2 = pointPile[1];

  // var x1 = box.p1.x - box.p2.x;
  // var y1 = box.p1.y - box.p2.y;

  // var x2 = pointPile[2].x - box.p2.x;
  // var y2 = pointPile[2].y - box.p2.y;

  // var sc = (x1 * x2 + y1 * y2) / (x1 * x1 + y1 * y1);

  // pointPile[2].x -= x1 * sc;
  // pointPile[2].y -= y1 * sc;

  // box.p3 = pointPile[2];

  // box.p4 = {x: box.p3.x + x1, y: box.p3.y + y1};

  box.p1 = pointPile[0];
  box.p2 = pointPile[1];

  var midx = (box.p1.x - box.p2.x) / 2 + box.p2.x;
  var midy = (box.p1.y - box.p2.y) / 2 + box.p2.y;

  // ctx.beginPath();
  // ctx.arc(box.p1.x, box.p1.y, 2, 0, 2 * Math.PI);
  // ctx.fillStyle = 'red';
  // ctx.fill();

  // ctx.beginPath();
  // ctx.arc(box.p2.x, box.p2.y, 2, 0, 2 * Math.PI);
  // ctx.fillStyle = 'red';
  // ctx.fill();

  // ctx.beginPath();
  // ctx.arc(pointPile[2].x, pointPile[2].y, 2, 0, 2 * Math.PI);
  // ctx.fillStyle = 'red';
  // ctx.fill();

  // ctx.beginPath();
  // ctx.arc(midx, midy, 2, 0, 2 * Math.PI);
  // ctx.fillStyle = 'blue';
  // ctx.fill();

  var x1 = pointPile[2].x - midx;
  var y1 = pointPile[2].y - midy;

  var x2 = box.p2.x - midx;
  var y2 = box.p2.y - midy;

  var sc = (x1 * x2 + y1 * y2) / (x1 * x1 + y1 * y1);

  box.p2.x -= x1 * sc;
  box.p2.y -= y1 * sc;

  box.p1.x += x1 * sc;
  box.p1.y += y1 * sc;

  box.p3 = {x: box.p2.x + x1, y: box.p2.y + y1};
  box.p4 = {x: box.p1.x + x1, y: box.p1.y + y1};

  //Utilisation de l'opérateur turbonucléique inversé
  if (box.p1.y < box.p4.y && box.p1.x > box.p2.x || box.p1.y > box.p4.y && box.p1.x < box.p2.x){
    var hold = box.p1;
    box.p1 = box.p2;
    box.p2 = hold;

    hold = box.p3;
    box.p3 = box.p4;
    box.p4 = hold;
  }

  // ctx.beginPath();
  // ctx.arc(box.p2.x, box.p2.y, 2, 0, 2 * Math.PI);
  // ctx.fillStyle = 'orange';
  // ctx.fill();


  bbox_count++;
  box.id = bbox_count;

  bboxs.push(box);

  //Put box in canvas
  drawBox(box);

  //Put side bar element
  add_box_to_sidebar(box);

  // Clear the points
  pointPile = [];
  clearDraws();
}

function add_box_to_sidebar(box){
  //Add box to sidebar
  const buttonElement = document.createElement("button");
  buttonElement.className = "box_button"
  buttonElement.id = "DOBB_" + box.id;
  buttonElement.innerText = "DOBB " + box.id;
  buttonElement.addEventListener("click", () => {
    for (b in selected_boxs){
      const curr_b = selected_boxs[b];
      if(curr_b.id == box.id){
        selected_boxs.splice(b, 1);
        buttonElement.style.color = "white";
        redraw();
        return;
      }
    }

    selected_boxs.push(box);
    buttonElement.style.color = "green";
    drawFilledBox(box);

    if(selected_boxs || selected_box.id != box.id){
      selected_box = box;
      buttonElement.style.color = "green";

      drawFilledBox(box);
    }else {
      selected_box = null;
      buttonElement.style.color = "white";

      redraw();
    }
  });
  sidebarboxes.appendChild(buttonElement);
}

function redraw(){
  loadCurrentImage().then( response => 
    {
      for (b in bboxs){
        drawBox(bboxs[b]);
      }
    
      for (b in selected_boxs){
        drawFilledBox(selected_boxs[b]);
      }
    });
}

function clearBBoxs(){
  bboxs = [];
  const children = sidebarboxes.childNodes;
  for (let i = children.length - 1; i >= 0; i--) {
    if (children[i].nodeName !== 'H2') {
      sidebarboxes.removeChild(children[i]);
    }
  }
  bbox_count = 0;
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'd') {
    if (selected_boxs != null && selected_boxs.length > 0){

      for (b in selected_boxs){

        const box = selected_boxs[b];
        deleteBox(box);

      }
      selected_boxs = [];
      redraw();

    }
  }
});

function deleteBox(box){
  var doc = document.getElementById("DOBB_" + box.id);
  if (doc != null) { doc.remove(); }

  for (b2 in bboxs) {
    if(bboxs[b2].id == box.id){
      bboxs.splice(b2, 1);
      break;
    }
  }
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'a') {
    if (pointPile.length == 0){
      deleteBox(bboxs[bboxs.length - 1]);
      redraw();
    }else{
    pointPile.pop();
    const last = imageContainer.lastChild;
    if (last) { imageContainer.removeChild(last); }
    }
  }
});

//-------------Saving annotations-------------
function save_annotations(){
  const filename = `${imageFiles[currentImageIndex].split('/').pop().split('.')[0]}.txt`;

  data = ''
  
  for (b in bboxs) {
    var box = bboxs[b];
    data += `${box.p1.x / img_width},${box.p1.y / img_height},${box.p2.x / img_width},${box.p2.y / img_height},${box.p3.x / img_width},${box.p3.y / img_height},${box.p4.x / img_width},${box.p4.y / img_height},0,1\n`
  }

  saveTextToFile(data, filename);
}

function saveTextToFile(text, filename) {
  const blob = new Blob([text], {type: "text/plain;charset=utf-8"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function dowload(){
  save_annotations();
}
document.getElementById("download_button").addEventListener("click", () => save_annotations());

//-----------Loading annotations------------
function load_annotations(file) {
  const txtfile = annotationsFolder + file.split('/').pop().split('.')[0] + '.txt';
  return new Promise((resolve, reject) => {
    fetch(txtfile)
      .then(response => {if (response.ok){ return response.text(); } else { resolve(); }})
      .then(text => {

        if(img_height == null || img_width == null){
          resolve();
          return;
        }

        // Split the text into individual annotations
        const annotations = text.trim().split('\n');
        
        // Convert each annotation into an array of coordinates
        const coords = annotations.map(annotation => {
          const coordinates = annotation.split(',').map(coord => parseFloat(coord));
          return coordinates;
        });

        for (c in coords){
          let coord = coords[c];
          let box = {};
          box.p1 = {x: coord[0] * img_width, y: coord[1] * img_height};
          box.p2 = {x: coord[2] * img_width, y: coord[3] * img_height};
          box.p3 = {x: coord[4] * img_width, y: coord[5] * img_height};
          box.p4 = {x: coord[6] * img_width, y: coord[7] * img_height};

          bbox_count++;
          box.id = bbox_count;

          bboxs.push(box);

          add_box_to_sidebar(box)
        }

        resolve();
      }).catch(error => { return; });
  });
}