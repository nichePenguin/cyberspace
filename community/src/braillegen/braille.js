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
        const value = newPixel[i];
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
function braille(canvas) {
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
    output += "\n";
  }
  return output;
}

export { braille, monochromize };
