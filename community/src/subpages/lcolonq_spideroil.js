function init() {
  const data = document.getElementById('spider-oils');
  //fetch("https://pub.colonq.computer/~nichepenguin/cgi-bin/find_oil")
  fetch("../cgi-bin/find_oil")
    .then((response) => response.text().then(
      (text) => data.innerHTML = text
    ));
}

function uninit() {
}

export { init, uninit }
