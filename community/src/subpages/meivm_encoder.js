import { wand } from '../anim.js';
import { compress } from '../meivm/runic.js'

const HEADER = "F6E4";
const PROGRAM = "F245 A104 B504 CF9B FC45 8B16 9A04 FE05 D804 D28C ED26 E917 9309 82BB E904 EA89 E39B E414 FE09 FE55 A309 C409 EC04 E39B FE09 FE65 FE75";
const REGISTERS = "0003 0003 0003 0003 0100 0100 0100 0100 0001 0000 0000 0000 0041 0000 0000 0000 0061 0000 0000 0000";

let INPUT = null;
let RESULT = null;

function init() {
  document.getElementById("initial-copy").addEventListener('click', (event) => copy("initial-text"));
  document.getElementById("secondary-copy").addEventListener('click', (event) => copy("secondary-text"));
  document.getElementById("encode").addEventListener('click', encode);
  document.getElementById("browse").addEventListener('click', browse);
  document.getElementById("runic").addEventListener('click', handleRunic)
  document.addEventListener('paste', encoderPaste);
}
function uninit() {
  document.removeEventListener('paste', encoderPaste);
}

function handleRunic(event) {
  const label = document.getElementById('runic-label')
  if (event.currentTarget.checked) {
    label.className = "runic-label";
  } else {
    label.className = null;
  }
  if (RESULT) {
    writeCode(RESULT);
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

function loadImage(data) {
  INPUT = data.split("base64,")[1];
  document.getElementById("image-input").src = data;
  document.getElementById("encode").disabled = false;
}

function openFile(file) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => loadImage(reader.result);
  reader.onerror = (error) => console.log(error);
}

function encoderPaste(event) {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items;
  for (let index in items) {
    const item = items[index];
    if (item.kind === 'file') openFile(item.getAsFile());
  }
}

function encode() {
  if (INPUT == null) {
    return
  }
  document.getElementById("image-output").src = "res/wait.gif";
  const data = JSON.stringify({
    "image": INPUT,
    "slot": Number(document.getElementById("slot").value) - 1,
    "black_background": document.getElementById("black-bkg").checked,
  });
  //fetch("https://pub.colonq.computer/~nichepenguin/cgi-bin/meivm-encoder", {
  fetch("../cgi-bin/meivm-encoder", {
    method: "POST",
    body: data
  }).then(response => {
    const contentType = response.headers.get("content-type");
    if (contentType) {
      if (contentType == "application/json") {
        return response.json();
      } else if (contentType== "text/plain") {
        response.text().then(setError);
      } else {
        console.log("Error output is not in text/plain, the guy probably panicked");
        console.log(response.text());
      }
    }
    setError("Failed to encode: See console log")
    Promise.reject('Failed to encode');
  })
  .then(load);
}

function setError(errorMessage){
  document.getElementById("error").style["display"] = "block";
  document.getElementById("error-message").innerText = errorMessage
}

function writeCode(json) {
  let secondary_write = `${json.palette} ${json.slot_address}`;
  let secondary_code = `${HEADER} ${json.encoded}`;
  let initial_write = `${secondary_write} ${REGISTERS}`;
  let initial_code = `${secondary_code} ${PROGRAM}`
  if (document.getElementById('runic').checked) {
    secondary_write = compress(secondary_write, true);
    secondary_code = compress(secondary_code, true); 
    initial_write = compress(initial_write, true);
    initial_code = compress(initial_code, true);
  } 
  
  const initial = `!vm write ${json.palette} ${json.slot_address} ${REGISTERS} ! code ${HEADER} ${json.encoded} ${PROGRAM} ! run`;
  const secondary = `!vm write ${json.palette} ${json.slot_address} ! code ${HEADER} ${json.encoded} ! restart`;

  document.getElementById("initial-text").innerHTML = `!vm write ${initial_write} ! code ${initial_code} ! run`;
  document.getElementById("secondary-text").innerHTML = `!vm write ${secondary_write} ! code ${secondary_code} ! restart`;
}

function load(json) {
  if (!json) return;
  RESULT = json;
  document.getElementById("image-output").src = "data:image/png;base64," + json.image;
  writeCode(json);
}

function copy(id) {
  const textarea = document.getElementById(id); 
  wand(textarea.parentElement, 0, 0);
  setTimeout(() => {
    textarea.select();
    textarea.setSelectionRange(0, 501);
    navigator.clipboard.writeText(textarea.value);
  }, 150);
}

export { init, uninit };
