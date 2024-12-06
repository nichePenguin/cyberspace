import * as imgUtil from "./img_utils.js";

function getBit(data, x, y, width) {
  return imgUtil.getPixel(data, x, y, width)[0] > 128 
    ? 1
    : 0;
}

function monochromize(canvas, outputCanvas, grayscale, threshold, invert) {
  let data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
  let output = new Uint8ClampedArray(canvas.width * canvas.height * 4);
  for (let y = 0; y < canvas.height; y++){
    for (let x = 0; x < canvas.width; x++) {
      const pixel = imgUtil.getPixel(data, x, y, canvas.width);
      const newPixel = imgUtil.threshold(pixel, grayscale, threshold);
      for (let i = 0; i < 4; i++){
        let value = newPixel[i];
        if (i != 3 && invert) {
          value = 255 - value;
        }
        output[imgUtil.pixelIndex(x, y, canvas.width) + i] = value;
      }
    }
  }
  let newData = new ImageData(output, canvas.width, canvas.height);
  outputCanvas.width = canvas.width;
  outputCanvas.height = canvas.height;
  outputCanvas.getContext("2d").putImageData(newData, 0, 0);
}

// assuming thresholded
function braille(canvas, mode) {
  let output = "";
  const data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
  for (let y = 0; y < canvas.height; y += 4) {
    for (let x = 0; x < canvas.width; x += 2) {
      // thank you prodzpod
      let codePoint = 0x2800 +
        (getBit(data, x, y, canvas.width) << 0) +
        (getBit(data, x, y+1, canvas.width) << 1) +
        (getBit(data, x, y+2, canvas.width) << 2) +
        (getBit(data, x+1, y, canvas.width)  << 3) +
        (getBit(data, x+1, y+1, canvas.width) << 4) +
        (getBit(data, x+1, y+2, canvas.width) << 5) +
        (getBit(data, x, y+3, canvas.width) << 6) +
        (getBit(data, x+1, y+3, canvas.width) << 7);
      output += String.fromCodePoint(codePoint);
    }
    if (mode == 'as-is') {
      output += '\n'
    }
  }
  let preview = output;
  if (mode == 'as-is') {
    preview = output.replace(/\n/g, "<br>");
    return [output, preview];
  }
  if (mode == 'tiling') {
    output = tile(output, canvas.width/2); 
    preview = output.repeat(128*57/output.length + 1).substring(0, 128*57)
    output = [...Array(Math.ceil(500/128))].map((_, index) => output.slice(index * 128, (index + 1)*128)).join('\n');
  } else {
    output = [...Array(57)].map((_, index) => output.slice(index * 128, (index + 1)*128)).join('\n');
  }
  preview = [...Array(57)].map((_, index) => preview.slice(index * 128, (index + 1)*128)).join('<br>');
  return [output, preview];
}

function tile(input, width) {
  const segments = input.length/width;
  const perLine = 128/width;
  let result = Array(segments);
  for (let i = 0; i < segments; i++) {
    // 4 is Math.ceil(500/128) - max rows per sequence
    const index = (i%4)*perLine + Math.floor(i/4)
    result[index] = input.substring(i*width, (i+1)*width);
  }
  return result.join('');
}

export { braille, monochromize };
