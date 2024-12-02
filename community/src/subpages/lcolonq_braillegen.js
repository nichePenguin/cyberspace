import { dither } from '../braillegen/dither.js';
import { braille, monochromize} from '../braillegen/braille.js';

let INPUT = null;
let CANVAS = null;

function init() {
  document.addEventListener('paste', handlePaste);
  document.getElementById('browse').addEventListener('click', browse);
  document.getElementById("braillegen-copy").addEventListener('click', (event) => copy("braillegen-output"));  
//  document.getElementById('full').addEventListener('click', handleModeSelect);
//  document.getElementById('tiling').addEventListener('click', handleModeSelect);
  document.getElementById('threshold').addEventListener('change', redraw);
  document.getElementById('dither-type').addEventListener('change', handleDitherChange);
  document.getElementById('grayscale').addEventListener('change', redraw);
  document.getElementById('invert').addEventListener('click', redraw);
  CANVAS = document.getElementById('preview');
}

function handleDitherChange(event) {
  let note = document.getElementById('dither-threshold-note');
  if (event.currentTarget.value == "none") {
    note.style.display = 'none' 
  } else {
    note.style.display = 'inline';
  }
  redraw();
}

function uninit() {
  document.removeEventListener('paste', handlePaste);
}

function copy(id) {
  const div = document.getElementById(id); 
  navigator.clipboard.writeText(div.innerHTML);
}

function getGrayscaleFunction(grayscaleType) {
  switch (document.getElementById('grayscale').value) {
    case 'luminosity':
      return (pixel) => 0.2126*pixel[0] + 0.7152*pixel[1] + 0.0722*pixel[2];
      break;
    case 'red':
      return (pixel) => pixel[0];
      break;
    case 'green':
      return (pixel) => pixel[1];
      break;
    case 'blue':
      return (pixel) => pixel[2];
      break;
    default:
      console.log(`Unknown grayscale type: ${grayscaleType}`);
      return null;
  }
}

function redraw() {
  if (INPUT == null) return;
  CANVAS.getContext("2d").drawImage(INPUT, 0, 0, CANVAS.width, CANVAS.height);
  const grayscaleFunction = getGrayscaleFunction(); 
  const ditherType = document.getElementById('dither-type').value;
  const threshold = Number(document.getElementById('threshold').value);
  const invert = document.getElementById('invert').checked;
  if (ditherType != "none") {
    dither(CANVAS, CANVAS, threshold, grayscaleFunction, ditherType, invert);
  } else {  
    monochromize(CANVAS, CANVAS, grayscaleFunction, threshold, invert);
  }
  document.getElementById("braillegen-output").innerHTML = braille(CANVAS); 
}

function openFile(file) {
  createImageBitmap(file).then((image) => {
    INPUT = image;
    redraw()
  });
}

function handlePaste(event) {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items;
  for (let index in items) {
    const item = items[index];
    if (item.kind === 'file') openFile(item.getAsFile());
  }
}

function browse() {
  const fileInput = document.getElementById("file");
  const fileFake = document.getElementById('file-fake');
  if (!fileInput.hasAttribute('listener')) {
    fileInput.addEventListener('change', ((source) => {
      source.currentTarget.setAttribute('listener', true);
      fileFake.value = fileInput.files[0].name;
      openFile(fileInput.files[0])
    }));
  }
  fileInput.click();
}

export { init, uninit }
