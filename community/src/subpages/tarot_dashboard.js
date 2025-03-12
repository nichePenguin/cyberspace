export { init, uninit }

function init() {

  fetchByKey("gfp", loadGfp);
}

function uninit() {
}

function fetchByKey(key, funct) {
    //fetch("https://pub.colonq.computer/~nichepenguin/cgi-bin/fetch-helper?" + key)
    fetch("../cgi-bin/fetch-helper?" + key)
      .then((response) => response.text().then(
        (text) => funct(text)
    ));
}

function parseCsv(text) {
    return text
      .trim()
      .split('\n')
      .map((line) => line.split(','));
}

const card_to_image = {
    "0: The Fool": "major_arcana_fool.png",
    "I: Magician": "major_arcana_magician.png",
    "II: High Priestess": "major_arcana_priestess.png",
    "III: Empress": "major_arcana_empress.png",
    "IV: Emperor": "major_arcana_emperor.png",
    "V: Hierophant": "major_arcana_hierophant.png",
    "VI: Lovers": "major_arcana_lovers.png",
    "VII: Chariot": "major_arcana_chariot.png",
    "VIII: Strength": "major_arcana_strength.png",
    "IX: Hermit": "major_arcana_hermit.png",
    "X: Wheel of Fortune": "major_arcana_fortune.png",
    "XI: Justice": "major_arcana_justice.png",
    "XII: The Hanged Man": "major_arcana_hanged.png",
    "XIII: Death": "major_arcana_death.png",
    "XIV: Temperance": "major_arcana_temperance.png",
    "XV: Devil": "major_arcana_devil.png",
    "XVI: The Tower": "major_arcana_tower.png",
    "XVII: The Star": "major_arcana_star.png",
    "XVIII: The Moon": "major_arcana_moon.png",
    "XIX: The Sun": "major_arcana_sun.png",
    "XX: Judgement": "major_arcana_judgement.png",
    "XXI: The World": "major_arcana_world.png"
}

function loadGfp(gfp_raw) {
    let gfp = parseCsv(gfp_raw);
    if (gfp === undefined || gfp.length == 0) {
      console.error("Unable to fetch gfp!")
      return;
    }
    if (gfp.length != 3) {
      console.error("Gfp had wrong amount of elements. Expected 3 got: " + gfp.length);
      return;
    }
    let cards = document.querySelectorAll(".gfp-card");
    for (const [i, e] of cards.entries()) {
      let delay = (i+1)*300;
      gfpCardEntry(e, delay, gfp[i]);
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
      image.src = "res/tarot/" + card_to_image[gfpEntry[1]];
      image.style.transform = "rotate3d(0, 1, 0, 0deg)";
      e.querySelector(".gfp-text").style.opacity = 1.0;
    }, delay + 600);
}
