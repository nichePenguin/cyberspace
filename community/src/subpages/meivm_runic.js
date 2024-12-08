import { compress } from '../meivm/runic.js';
import { wand } from '../anim.js';

function init() {
//  document.addEventListener('paste', handlePaste);
  document.getElementById('runic-output-copy').addEventListener('click', handleCopy);
  document.getElementById('runic-input').addEventListener('change', compressInput);
  document.getElementById('full-runic').addEventListener('click', compressInput);
}

function handleCopy(event) {
  const value = document.getElementById('runic-output').value;
  navigator.clipboard.write(value);
}

function compressInput() {
  const input = document.getElementById('runic-input').value;
  if (!input || input.length == 0) {
    return;
  }
  const outputArea = document.getElementById('runic-output');
  wand(outputArea.parentElement);
  outputArea.value = compress(input, document.getElementById('full-runic').checked);
}

function uninit() { }

export { init, uninit }
