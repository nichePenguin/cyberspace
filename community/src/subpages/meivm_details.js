function randomize_coffee() {
  var codeblocks = document.getElementsByClassName("code");
  var coffee_index = Math.floor(Math.random()*4+1);
  var coffee_size = Math.floor(Math.random()*100 - 50) + 400;

  var y_pos = Math.floor(Math.random()*160 - 30) + "%";
  var x_delta = Math.floor(Math.random()*90) + 20;
  var flip = Math.random() >= 0.5 ? 1 : -1;

  for (var i = 0; i < 2; i++) {
    codeblocks[i].style["background-size"] = coffee_size + "px " + coffee_size + "px";
    var mirror = i*2 - 1;
    var x_pos = 50 + (x_delta)*mirror*flip + "%";
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
