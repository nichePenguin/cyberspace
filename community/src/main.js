import { reveal, peek, peekLeave, unpeekClicked } from './ui.js'
import { loadContentByKey } from  './content.js'

function getAnchor() {
  const split = document.URL.split('#');
  return (split.length > 1) ? split[1] : null;
}

function loadContent(event) {
  const key = event.currentTarget.attributes["key"].nodeValue;
  if (loadContentByKey(key)) {
    unpeekClicked();
  }
}

function loadContentByAnchor(){
    const anchor = getAnchor();
    if (anchor) {
      loadContentByKey(anchor);
    }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('miku-js').remove();
  document.addEventListener('hashchange', (event) => loadContentByAnchor());
  document.querySelectorAll('[who]')
    .forEach((e) => {
      e.addEventListener('click', (event) => reveal(event.currentTarget));
      e.addEventListener('mouseenter', (event) => peek(event.currentTarget));
      e.addEventListener('mouseleave', (event) => peekLeave(event.currentTarget));
    });
  document.querySelectorAll('.button-peek')
    .forEach((e) => {
      e.addEventListener('click', loadContent);
    });
  loadContentByAnchor();
});
