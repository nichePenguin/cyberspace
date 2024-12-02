import * as imgUtil from "./img_utils.js";

/// type = ["floyd-steinberg", "atkinson", "jarvis-judice-ninke"];
/// threshold = 0..256
/// grayscale = function(pixel) -> u8 where pixel = [u8; 3]

// floyd-steinberg (16)
//- # 7
//3 5 1

// atkinson (8)
//- # 1 1
//1 1 1 -
//- 1 - -

// jarvis-judice-ninke (48)
//- - # 7 5
//3 5 7 5 3
//1 3 5 3 1
function quantize(pixel, grayscale, threshold) {
  const result = imgUtil.threshold(pixel, grayscale, threshold);
  const error = [...pixel].map((v) => v - result[0]);
  // ignore alpha
  error[3] = 0;
  return [result, error];
}

function addError(data, x, y, width, height, error) {
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return;
  }
  for (let i = 0; i < 4; i++) {
    data[imgUtil.pixelIndex(x, y, width)+i] += error[i];
  }
}

function diffuseError(data, matrix, denominator, x, y, width, height, error) {
  const xOffset = matrix[0].filter(x => x == null).length - 1;
  for (const [dy, row] of matrix.entries()) {
    for (const [dx, numerator] of row.entries()) {
      if (numerator == null) continue;
      const weightedError = error.map(x => x * numerator / denominator);
      addError(data, x + dx - xOffset, y + dy, width, height, weightedError)
    }
  }
}

function dither(canvas, outputCanvas, threshold, grayscale, type, invert) {
  let diffusionMatrix = null;
  let diffusionDenominator = null;
  switch (type) {
    case 'floyd-steinberg':
      diffusionDenominator = 16;
      diffusionMatrix = [
        [null, null, 7],
        [3, 5, 1]
      ];
      break;
    case 'atkinson':
      diffusionDenominator = 8;
      diffusionMatrix = [
        [null, null, 1, 1],
        [1, 1, 1, null],
        [null, 1,null, null]
      ];
      break;
    case 'jarvis-judice-ninke':
      diffusionDenominator = 48;
      diffusionMatrix = [
        [null, null, null, 7, 5],
        [3, 5, 7, 5, 3],
        [1, 3, 5, 3, 1],
      ];
      break;
    default:
      console.error(`Unknown dithering matrix type: ${type}`);
      return null;
  }

  const data = [...new Uint8ClampedArray(
    canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data
  )];
 
  const output = new Uint8ClampedArray(canvas.width * canvas.height * 4);
  for (let y = 0; y < canvas.height; y++){
    for (let x = 0; x < canvas.width; x++) {
      const pixel = imgUtil.getPixel(data, x, y, canvas.width); 
      const [newPixel, error] = quantize(pixel, grayscale, threshold);
      diffuseError(data, diffusionMatrix, diffusionDenominator, x, y, canvas.width, canvas.height, error);
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

export { dither };
