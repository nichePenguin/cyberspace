import { dither } from '../braillegen/dither.js';
import { braille, monochromize} from '../braillegen/braille.js';

let INPUT = null;
let CANVAS = null;
let MODE = 'full';
let BRAILLE = null;

function init() {
  document.addEventListener('paste', handlePaste);
  document.getElementById('browse').addEventListener('click', browse);
  document.getElementById("braillegen-copy").addEventListener('click', (event) => copy("braillegen-output"));  
  document.getElementById('threshold').addEventListener('change', redraw);
  document.getElementById('dither-type').addEventListener('change', handleDitherChange);
  document.getElementById('grayscale').addEventListener('change', redraw);
  document.getElementById('invert').addEventListener('click', redraw);
  
  document.getElementById('full').addEventListener('click', handleModeSelect);
  document.getElementById('tiling').addEventListener('click', handleModeSelect);
  document.getElementById('as-is').addEventListener('click', handleModeSelect);
  document.getElementById('dimensions').addEventListener('change', handleDimensionsChange);

  document.getElementById('width').addEventListener('change', handleScaleChange);
  document.getElementById('height').addEventListener('change', handleScaleChange);
  document.getElementById('aspect-ratio').addEventListener('click', handleScaleChange);

  document.getElementById('reset-size').addEventListener('click', handleSizeReset);

  CANVAS = document.getElementById('preview');
}

function handleSizeReset(event) {
  document.getElementById('width').value = INPUT.width;
  document.getElementById('height').value = INPUT.height;
  updateCanvasDimensions('as-is');
  redraw();
}

function handleScaleChange(event) {
  if (document.getElementById('aspect-ratio').checked) {
    const width = document.getElementById('width');
    const height = document.getElementById('height');
    if (event.currentTarget.id == "height") {
      width.value = Math.round((height.value / INPUT.height) * INPUT.width);
    } else {
      height.value = Math.round((width.value / INPUT.width) * INPUT.height);
    }
  }
  updateCanvasDimensions('as-is');
  redraw();
}

function handleDimensionsChange(event) {
  updateCanvasDimensions('tiling');
  redraw();
}

function handleModeSelect(event) {
  const newMode = event.currentTarget.value;
  if (newMode == MODE) {
    return;
  }
  MODE = newMode;
  updateCanvasDimensions(newMode);
  const tilingSettings = document.getElementById('tiling-settings');
  const asIsSettings = document.getElementById('as-is-settings');
  switch (newMode) {
    case 'tiling':
      tilingSettings.style['display'] = 'block';
      asIsSettings.style['display'] = 'none';
      break;
    case 'as-is': 
      asIsSettings.style['display'] = 'block';
      tilingSettings.style['display'] = 'none';
      document.getElementById('braillegen-copy').innerHTML = "Copy";
      break;
    case 'full':
      tilingSettings.style['display'] = 'none';
      asIsSettings.style['display'] = 'none';
      document.getElementById('braillegen-copy').innerHTML = "Copy";
      break;
    default:
      console.error(`Unknown mode:${newMode}`)
      return;
  }
  redraw();
}
function updateCanvasDimensions(mode) {
  switch (mode) {
    case 'full':
      CANVAS.width = 256;
      CANVAS.height = 228;
      CANVAS.style.width = "256px";
      CANVAS.style.height = "228px";
      break;
    case 'tiling':
      const width = Number(document.getElementById('dimensions').value);
      const height = Math.floor(500/width);
      CANVAS.width = width*2;
      CANVAS.height = height*4;
      CANVAS.style.width = width*2 + "px"
      CANVAS.style.height = height*4 + "px"
      document.getElementById('braillegen-copy').innerHTML = `Copy (${width*height} characters)`;
      break;
    case 'as-is':
      if (INPUT) {
        CANVAS.width = document.getElementById('width').value;
        CANVAS.height = document.getElementById('height').value;
      }
      CANVAS.style.width = "256px";
      CANVAS.style.height = "228px";
      break;
    default:
      console.error(`Unknown mode:${newMode}`)
      return;
  }
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
  navigator.clipboard.writeText(BRAILLE);
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
  const [result, preview] = braille(CANVAS, MODE); 
  BRAILLE = result;
  document.getElementById("braillegen-output").innerHTML = preview;
}

// 128 x 64
// 500
// 1: 128 x 3   |  256x12   | 
// 2: 64 x 7    |  128x28   | 
// 4: 32 x 15   |  64x60    | 
// 8: 16 x 30   |  32x120   | 

function openFile(file) {
  createImageBitmap(file).then((image) => {
    INPUT = image;
    document.getElementById('height').value = INPUT.height;
    document.getElementById('width').value = INPUT.width;
    updateCanvasDimensions(MODE);
    redraw()
  });
}

function handlePaste(event) {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items;
  for (let index in items) {
    const item = items[index];
    if (item.kind === 'file') {
      openFile(item.getAsFile());
      return;
    }
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

