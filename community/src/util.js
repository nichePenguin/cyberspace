export { fetchByKey, parseCsv, tarotToPng };

function parseCsv(text) {
    return text
      .trim()
      .split('\n')
      .map((line) => line.split(','));
}

function fetchByKey(key, funct) {
    //fetch("https://pub.colonq.computer/~nichepenguin/cgi-bin/fetch-helper?" + key)
    fetch("../cgi-bin/fetch-helper?" + key)
      .then((response) => response.text().then(
        (text) => funct(text)
    ));
}

const tarotToPng = {
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
