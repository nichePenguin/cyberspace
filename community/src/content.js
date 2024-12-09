import { wand } from './anim.js';
import * as meivmEncoder from "./subpages/meivm_encoder.js";
import * as meivmDetails from './subpages/meivm_details.js';
import * as meivmRunic from './subpages/meivm_runic.js';
import * as lcolonqBraillegen from './subpages/lcolonq_braillegen.js';
import * as lcolonqSpideroil from './subpages/lcolonq_spideroil.js';

let SUBPAGES = {
  "meivm-encoder": meivmEncoder,
  "meivm-details": meivmDetails,
  "meivm-runic": meivmRunic,
  "lcolonq-braillegen": lcolonqBraillegen,
  "lcolonq-spideroil": lcolonqSpideroil, 
};


let CURRENT_CONTENT = null;

function loadContentByKey(key) {
  if (!(key in SUBPAGES)) {
    console.error("Content by key \"" + key + "\" unknown or not registered");
    return false;
  }
  if (key == CURRENT_CONTENT) {
    return false;
  }
  window.location.hash = "#" + key;
  wand(document.getElementById("wand-content"), 0, 0);

  const contentElement = document.getElementById("content");
  contentElement.style["transform"] = "scaleY(0)";
  const data = document.querySelector("#" + key + "-template").innerHTML;
  
  if (!data) {
    console.error("No template load for key \"" + key + "\"");
    return false;
  }

  if (CURRENT_CONTENT) {
    SUBPAGES[CURRENT_CONTENT].uninit();
  }
  setTimeout(() => {
    contentElement.innerHTML = data;
  }, 700);
  
  setTimeout(() => {
    contentElement.style["transform"] = "scaleY(1)";
    SUBPAGES[key].init();
  }, 750);

  CURRENT_CONTENT = key;
  return true;
}

export { loadContentByKey }
