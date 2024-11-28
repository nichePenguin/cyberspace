import { typingAnim } from './anim.js';

const _PEEK_ORIGIN = [50, 35];
const _PEEK_DIST = 100;

let CLICKED_ON = null;
let CLICKED_ON_ELEMENT = null;

function who(element) {
  return element.attributes["who"].nodeValue;
}

function getPeekables(parentElement) {
  return parentElement.querySelectorAll('.button-peek');
}

function peek(element) {
  const peekables = getPeekables(element.parentElement); 
  if (peekables.length == 1) {
    peekables[0].style.left = _PEEK_ORIGIN[0] + _PEEK_DIST + "%";
    return;
  }
  const angle = (Math.PI/3.5);
  const start = -angle/2;
  for (let i = 0; i < peekables.length; i++) {
    const elementAngle = start + (angle/(peekables.length-1)*(i));
    peekables[i].style.left = _PEEK_DIST * Math.cos(elementAngle) + _PEEK_ORIGIN[0] + "%";
    peekables[i].style.top = _PEEK_DIST * Math.sin(elementAngle) + _PEEK_ORIGIN[1] + "%";
  }
}

function peekLeave(element) { 
  if (CLICKED_ON == who(element)) {
    return;
  }
  unpeek(element);
}

function unpeek(element) { 
  const peekables = getPeekables(element.parentElement); 
  for (let i = 0; i < peekables.length; i++) {
    peekables[i].style.left = _PEEK_ORIGIN[0] + "%";
    peekables[i].style.top = _PEEK_ORIGIN[1] + "%";
  }
}

function unpeekClicked() {
  unpeek(CLICKED_ON_ELEMENT);
  typeParent(CLICKED_ON_ELEMENT.parentElement, -1);
  CLICKED_ON_ELEMENT = null;
  CLICKED_ON = null;
}

function reveal(element) {
  if (CLICKED_ON_ELEMENT != null) {
    let repeat = CLICKED_ON == who(element);
    unpeekClicked();
    if (repeat) {
      return;
    }
  }
  CLICKED_ON = who(element);
  CLICKED_ON_ELEMENT = element;
  peek(CLICKED_ON_ELEMENT);
  typeParent(CLICKED_ON_ELEMENT.parentElement, 1);
}

function typeParent(parentElement, direction) {
  parentElement.querySelectorAll('.peek-text')
    .forEach((e) => typingAnim(e, direction));
}

export { reveal, peek, peekLeave, unpeekClicked } 
