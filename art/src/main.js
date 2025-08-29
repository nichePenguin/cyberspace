var metadata = null;
var min = 0.0;
var max = 100.0;

var initialMouseX = null;
var initialX = null;
var lastFromX = null;
var lastToX = null;
var fromX = 120;
var toX = 260;
var dragging = null;

const sliderMin = 0;
const sliderMax = 280;
const toDelta = 90; 

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('slidee-1').addEventListener('mousedown', drag);
  document.getElementById('slidee-2').addEventListener('mousedown', drag);
  readJson("res/metadata.json", metaLoaded);
});

function drag(e) {
  dragging = e.currentTarget.parentNode;
  e = e || window.event;
  e.preventDefault();
  initialMouseX = e.clientX;
  if (!dragging.style.left) {
    if (dragging.id == "slidee-container-1") {
      dragging.style.left = fromX + "px";
      dragging.querySelector("#drag-me-1").style.opacity = 0;
    } else {
      dragging.style.left = toX - toDelta + "px";
      dragging.querySelector("#drag-me-2").style.opacity = 0;
    }
  }
  initialX = parseInt(dragging.style.left, 10);
  document.addEventListener("mouseup", mouseUp);
  document.addEventListener("mousemove", mouseMove);
}

function mouseMove(e) {
  e = e || window.event;
  e.preventDefault();
  var value = initialX + e.clientX - initialMouseX;
  if (dragging.id == "slidee-container-1") {
    if (value <= sliderMin) {
      value = sliderMin;
    }
    if (value >= toX - 5) {
      value = toX - 5;
    }
    fromX = value;
  } else {
    if (value >= sliderMax - toDelta) {
      value = sliderMax - toDelta;
    }
    if (value <= fromX + 5 - toDelta) {
      value = fromX + 5 - toDelta;
    }
    toX = value + toDelta;
  }
  dragging.style.left = value + "px";
  loadImages();
}

function mouseUp(e) {
  document.removeEventListener("mouseup", mouseUp);
  document.removeEventListener("mousemove", mouseMove);
  initialMouseX = null;
  initialX = null;
  dragging = null;
}

function metaLoaded(err, data) {
  if (err != null) {
    console.log("Empty, so empty...");
    console.log(err);
    return;
  } 
  metadata = data;
  metadata.sort(function(a, b) {
    return b["score"] - a["score"];
  });
  loadImages();
}

function loadImages() {
  if (metadata == null) return;
  if (fromX == lastFromX && toX == lastToX) {
    return;
  }
  lastFromX = fromX;
  lastToX = toX;
  const grid = document.querySelector('.masonry-container');
  grid.innerHTML = '';
  const min = fromX * (100.0 / sliderMax);
  const max = (toX ) * (100.0 / sliderMax);
  for (var i = 0; i < metadata.length; i ++) {
    const entry = metadata[i];
    if (entry["score"] < min || entry["score"] > max) {
      continue;
    }
    const el = document.createElement('div');
    el.className = 'masonry-item';
    el.innerHTML = item("res/" + entry.image);
    grid.appendChild(el);
  }
  if (90.91 < max && 90.69 > min && grid.childElementCount == 3) {
    document.getElementById('head').style["background-image"] = "url('res/head_excited.png')";
  } else {
    document.getElementById('head').style["background-image"] = "url('res/head.png')";
  }
}

function readJson(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

function item(image) {
  return `
          <img src="${image}"><img>
`;
}
