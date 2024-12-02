function pixelIndex(x, y, width) {
  return (x + y * width) * 4;
}

function getPixel(data, x, y, width) {
  const index = pixelIndex(x, y, width);
  return data.slice(index, index + 4);
}

function threshold(pixel, grayscale, threshold) {
  let value = grayscale(pixel.slice(0, 3)) > threshold ? 255 : 0;
  const result = new Uint8ClampedArray(4).fill(value);
  result[3] = 255; 
  return result;
}

export { pixelIndex, getPixel, threshold };
