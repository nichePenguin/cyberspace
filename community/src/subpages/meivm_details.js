function randomize_coffee() {
  const codeblocks = document.getElementsByClassName("code");
  const coffee_index = Math.floor(Math.random()*4+1);
  const coffee_size = Math.floor(Math.random()*100 - 50) + 400;

  const y_pos = Math.floor(Math.random()*160 - 30) + "%";
  const x_delta = Math.floor(Math.random()*90) + 20;
  const flip = Math.random() >= 0.5 ? 1 : -1;

  for (let i = 0; i < 2; i++) {
    codeblocks[i].style["background-size"] = coffee_size + "px " + coffee_size + "px";
    const mirror = i*2 - 1;
    const x_pos = 50 + (x_delta)*mirror*flip + "%";
    codeblocks[i].style["background-position"] = x_pos + " " + y_pos;
  }
  codeblocks[0].style["background-image"] = "url(\"res/coffee_" + coffee_index + ".png\")";
  codeblocks[1].style["background-image"] = "url(\"res/coffee_" + coffee_index + "f.png\")";
}

function init() {
  randomize_coffee();
}

function uninit() {}

export {init, uninit};
