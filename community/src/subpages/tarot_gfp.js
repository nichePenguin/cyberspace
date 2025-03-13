import { typingAnim } from '../anim.js';
import { fetchByKey, parseCsv, tarotToPng } from '../util.js';
export { init, uninit }

var gfpPollId = undefined;
var pollEnabled = true;

function init() {
  gfpPollId = undefined;
  pollEnabled = true;
  fetchByKey("gfp", (gfp_raw) => {
    let gfp = parseCsv(gfp_raw);
    loadGfp(gfp);
    poll(gfp[0][0]);
  });
}

function uninit() {
  pollEnabled = false;
  if (gfpPollId !== undefined) {
    clearTimeout(gfpPollId);
    gfpPollId = undefined;
  }
}

function loadGfp(gfp) {
    if (gfp === undefined || gfp.length == 0) {
      console.error("[GFP] Unable to fetch gfp!")
      return;
    }
    if (gfp.length != 3) {
      console.error("[GFP] Gfp had wrong amount of elements. Expected 3 got: " + gfp.length);
      return;
    }

    prefetchImages(gfp);

    let cards = document.querySelectorAll(".gfp-card");
    for (const [i, e] of cards.entries()) {
      let delay = (i+1)*300;
      gfpCardEntry(e, delay, gfp[i]);
    }

    setTimeout(() => {
      let calc = document.querySelector("#gfp-calc");
      let date = document.querySelector("#gfp-date");

      let a = gfp[0][2];
      let b = gfp[1][2];
      let c = gfp[2][2];
      let out = (parseInt(a) + parseInt(b) + parseInt(c) + 150.0) / 300.0;
      calc.setAttribute("text", `(${affinity_signed(a)} ${affinity_signed(b)} ${affinity_signed(c)} + 150) / 300 = ${out}`);

      date.setAttribute("text", `Draw time: ${new Date(parseInt(gfp[0][0]) * 1000).toLocaleString()} UTC`);
      typingAnim(date, 1);
      typingAnim(calc, 1);
    }, 1500);
}

function affinity_signed(value) {
  if (value.includes("-")) {
    return `- ${value.substring(1)}`;
  } else {
    return `+ ${value}`;
  }
}

function prefetchImages(gfp) {
  for (var i = 0; i < gfp.length; i++) {
    let line = gfp[i];
    let image = new Image();
    image.src = "res/tarot/" + tarotToPng[line[1]];
  }
}

function gfpCardEntry(e, delay, gfpEntry) {
    let image = e.querySelector("img");
    let title = e.querySelector(".gfp-title");
    let affinity = e.querySelector(".gfp-affinity");
    title.innerHTML = gfpEntry[1];
    affinity.innerHTML = gfpEntry[2];
    if (gfpEntry[2].includes("-")) {
      affinity.style.color = "#BB0000";
    } else {
      affinity.style.color = "#00BB00";
    }
    image.src = "res/tarot/back.png";
    e.style["transition-delay"] = delay + "ms";
    e.style.opacity = 1.0;
    e.style.transform = "translate(0.0, 0.0)";
    setTimeout(() => {
      image.style.transform = "rotate3d(0, 1, 0, 90deg)";
    }, delay + 300);
    setTimeout(() => {
      image.src = "res/tarot/" + tarotToPng[gfpEntry[1]];
      image.style.transform = "rotate3d(0, 1, 0, 0deg)";
      e.querySelector(".gfp-text").style.opacity = 1.0;
    }, delay + 600);
}

function poll(lastTimestamp) {
  if (!pollEnabled) {
    return;
  }
  console.log("[GFP] Polling in 3s...")
  gfpPollId = setTimeout( () => {
    fetchByKey("gfp", (gfp_raw) => { checkUpdate(parseCsv(gfp_raw), lastTimestamp) })
  }, 3 * 1000);
}

function checkUpdate(gfp, lastTimestamp) {
  let newTimestamp = gfp[0][0];
  if (newTimestamp !== undefined && newTimestamp != lastTimestamp) {
    console.log(`[GFP] New draw time: ${newTimestamp}`)
    clearLayout();
    setTimeout(() => {
      loadGfp(gfp);
      poll(newTimestamp);
    }, 2000);
  } else {
    console.log(`[GFP] No updates`);
    poll(lastTimestamp);
  }
}

function clearLayout() {
    let cards = document.querySelectorAll(".gfp-card");
    for (const [i, e] of cards.entries()) {
      e.style.opacity = 0.0;
      e.style.transform= "translate(0.0, 100%)";
      e.querySelector(".gfp-text").style.opacity = 0.0;
    }
    typingAnim(document.querySelector("#gfp-calc"), -1);
    typingAnim(document.querySelector("#gfp-date"), -1);

}
