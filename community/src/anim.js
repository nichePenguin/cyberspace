// Wand
function wand(anchor_container, xoffset, yoffset) {
  const wand = document.createElement("div");
  wand.className = "wand";
  wand.style.top = -32 + yoffset + "px";
  wand.style.left = 64 + xoffset + "px";

  anchor_container.querySelector(".wand-anchor").appendChild(wand);

  setTimeout(() => {
   wand.style.top = yoffset + "px";
   wand.style.left = xoffset + "px";
   wand.style.opacity = 1;
  }, 50);
  setTimeout(() => {
    wand.style.opacity = 0;
  }, 1400);
  setTimeout(() => {
    wand.remove();
  }, 2000);
  return wand;
}


// Typing animation
function typingAnim(element, direction) {
  if (direction == 1) {
    element.style['margin-left'] = "4px";
    element.style['margin-right'] = "4px";
  }
  const text = element.attributes["text"].nodeValue;
  let state = null;
  if(!('typingAnimState' in element)) {
    state = {
      direction: direction,
      current_index: direction == 1 ? 0 : text.length(),
      text: text,
    };
    element.typingAnimState = state;
  } else {
    state = element.typingAnimState;
    if (state.direction != 0) { // animation is still active
      state.direction = direction;
      return;
    }
    state.direction = direction;
  }
  typingAnimStep(element);
}

function typingAnimStep(element) {
  let state = element.typingAnimState;
  if (state.direction == 0) return;
  if ((state.direction == 1 && state.current_index == state.text.length)
    || (state.direction == -1 && state.current_index == 0)) {
    state.direction = 0;
    if (state.current_index == 0) {
      element.style["margin-left"] = "0px";
      element.style["margin-right"] = "0px";
    }
    return;
  }
  state.current_index += state.direction;
  element.innerHTML = state.text.slice(0, state.current_index);
  if(state.current_index > 0 && state.current_index < state.text.length) {
    element.innerHTML += "<b>_</b>";
  }
  setTimeout( () => typingAnimStep(element), 650/state.text.length);
}

export {wand, typingAnim}
