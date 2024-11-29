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

function dither(canvas, threshold, grayscale, type) {
  let diffusionMatrix = null;
  let diffusionDenominator = null;
  switch (type) {
    case 'floys-steinberg':
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

  const data = new Uint8ClampedArray(
    canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data
  );

  function quantize(pixel, grayscale, threshold) {
    const value = grayscale(pixel.slice(0, 3)) > threshold ? 255 : 0;
    const error = pixel.map((v) => v - value);
    const result = new Uint8Clampedarray(4).fill(value);
    // ignore alpha
    error[3] = 0;
    result[3] = 255;
    return (result, error);
  }

  function pixelIndex(x, y) {
    return (x + y * canvas.width) * 4;
  }

  function addError(data, x, y, error) {
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
      return;
    }
    for (let i = 0; i < 4; i++) {
      data[pixelIndex(x, y) + i] = error[i];
    }
  }

  function diffuseError(data, matrix, denominator, x, y, error) {
    const xOffset = matrix[0].filter(x => x == null).length;
    for (const [dy, row] in matrix.entries()) {
      for (const [dx, numerator] in row.entries()) {
        const weightedError = error.map(x => x * numerator / denominator);
        console.log(weightedError);
        addError(data, x + dx - xOffset, y + dy, weightedError)
      }
    }
  }

  for (let y = 0; y < canvas.height; y++){
    for (let x = 0; x < canvas.width; x++) {
      const index = pixelIndex(x,y);
      const pixel = data.slice(index, 4);
      const [newPixel, error] = quantize(pixel, grayscale, threshold);
      for (let i = 0; i <  4; i++){
        data[index + i] = newPixel[i];
      }
      diffuseError(data, diffusionMatrix, diffusionDenominator, x, y, error);
    }
  }
}

export { dither };
