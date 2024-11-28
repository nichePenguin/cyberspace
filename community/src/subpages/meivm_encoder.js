import { wand } from '../anim.js';

const HEADER = "F6E4";
const PROGRAM = "F245 A104 B504 CF9B FC45 8B16 9A04 FE05 D804 D78C ED26 E937 82BB E904 EA89 E39B E414 FE09 FE55 A309 C409 EC04 E39B FE09 FE65 FE75";
const OFFSET = "0000 0000 0000";
const REGISTERS = "0000 0000 0000 0000 0100 0100 0100 0100 0001 0000 0000 0000 0041 0000 0000 0000 0064 0000 0000 0000 0003 0003 0003 0003";

let INPUT = null;

function init() {
  document.getElementById("initial-copy").addEventListener('click', (event) => copy("initial-text"));
  document.getElementById("secondary-copy").addEventListener('click', (event) => copy("secondary-text"));
  document.getElementById("encode").addEventListener('click', (event) => encode());
  document.getElementById("browse").addEventListener('click', (event) => browse());
  document.addEventListener('paste', encoder_paste);
}
function uninit() {
  document.removeEventListener('paste', encoder_paste);
}

function browse() {
  const file_input = document.getElementById("file");
  const file_fake = document.getElementById('file-fake');
  if (!file_input.hasAttribute('listener')) {
    file_input.addEventListener('change', ((source) => {
      source.currentTarget.setAttribute('listener', true);
      file_fake.value = file_input.files[0].name;
      open_file(file_input.files[0])
    }));
  }
  file_input.click();
}

function load_image(data) {
  INPUT = data.split("base64,")[1];
  document.getElementById("image-input").src = data;
  document.getElementById("encode").disabled = false;
}

function open_file(file) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => load_image(reader.result);
  reader.onerror = (error) => console.log(error);
}


function encoder_paste(event) {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items;
  for (let index in items) {
    const item = items[index];
    if (item.kind === 'file') open_file(item.getAsFile());
  }
}

function encode() {
  if (INPUT == null) {
    return
  }
  document.getElementById("image-output").src = "res/wait.gif";
  var data = JSON.stringify({
    "image": INPUT,
    "slot": Number(document.getElementById("slot").value) - 1,
    "black_background": document.getElementById("black-bkg").checked,
  });
  //fetch("https://pub.colonq.computer/~nichepenguin/cgi-bin/meivm-encoder", {
  fetch("../cgi-bin/meivm-encoder", {
    method: "POST",
    body: data
  }).then(response => {
    const content_type = response.headers.get("content-type");
    if (content_type) {
      if (content_type == "application/json") {
        return response.json();
      } else if (content_type == "text/plain") {
        response.text().then(set_error);
      } else {
        console.log("Error output is not in text/plain, the guy probably panicked");
        console.log(response.text());
      }
    }
    set_error("Failed to encode: See console log")
    Promise.reject('Failed to encode');
  })
  .then(load);
}

function set_error(errorMessage){
  document.getElementById("error").style["display"] = "block";
  document.getElementById("error-message").innerText = errorMessage
}

function load(json) {
  if (!json) return;
  document.getElementById("image-output").src = "data:image/png;base64," + json.image;
  const initial =
    "!vm write "
    + json.palette + " "
    + json.slot_address + " "
    + REGISTERS
    + " ! code "
    + HEADER + " "
    + json.encoded + " "
    + OFFSET + " "
    + PROGRAM
    + " ! run";

  const secondary =
    "!vm write "
    + json.palette + " "
    + json.slot_address
    + " ! code "
    + HEADER + " "
    + json.encoded
    + " ! restart";

  document.getElementById("initial-text").innerHTML = initial;
  document.getElementById("secondary-text").innerHTML = secondary;
}

function copy(id) {
  var textarea = document.getElementById(id); 
  wand(textarea.parentElement, 0, 0);
  setTimeout(() => {
    textarea.select();
    textarea.setSelectionRange(0, 501);
    navigator.clipboard.writeText(textarea.value);
  }, 150);
}

export { init, uninit };
