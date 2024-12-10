function init() {
  //fetch("https://pub.colonq.computer/~nichepenguin/cgi-bin/find_oil")
  fetch("../cgi-bin/find_oil")
    .then((response) => response.text().then(
      (text) => parseOils(text)
    ));
}

function unreachableIcon() {
  return '<img class="oil-icon" src="res/unreachable.png"></img>'
}

function unspawnableIcon() {
  return '<img class="oil-icon" src="res/unspawnable.png"></img>'
}

function attainableIcon() {
  return '<img class="oil-icon" src="res/attainable.png"></img>'
}

const attainable = {
  "/home/bytomancer/public_html/index.sp": "https://pub.colonq.computer/~bytomancer/index.html"
}

function parseOils(text) {
  const entries = text.split('\n');
  let lines = [];
  for (const entry of entries) {
    if (!/\S/.test(entry)) continue;
    const words = entry.trim().split('/');
    let line = `/~${words[2]}/${words.slice(4).join('/')}`;
    if (words[3] == 'public_html') {
      let link = `https://pub.colonq.computer${line}`;
      let icon = unspawnableIcon();
      if (entry in attainable) {
        icon = attainableIcon();
        link = attainable[entry];
      }
      lines.push(`${icon}<a href="${link}">${line}</a><br>`);
    } else {
      line = entry;
      lines.push(`${unreachableIcon()}${line}<br>`);
    }
  }
  document.getElementById('spider-oils').innerHTML = `${lines.join('')}`;
}

function uninit() {
}

export { init, uninit }
