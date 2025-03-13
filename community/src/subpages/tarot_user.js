import { fetchByKey, parseCsv, tarotToPng } from '../util.js';

export { init, uninit }

var pollEnabled = true;
var userDrawPollId = undefined;
var lastHistory = undefined;

function init() {
  pollEnabled = true;
  userDrawPollId = undefined;
  fetchByKey("history", loadHistory);
}

function uninit() {
  lastHistory = undefined;
  pollEnabled = false;
  if (userDrawPollId !== undefined) {
    clearTimeout(userDrawPollId);
  }
}

function loadHistory(history_raw) {
  let history = parseCsv(history_raw).reverse();
  lastHistory = history;
  updateDraws(history);
  poll();
}

function getDelta(historyBefore, historyAfter) {
  if (historyBefore === undefined || historyBefore.length == 0) {
    return historyAfter;
  }
  let delta = [];
  for (var i = 0; i < 10; ++i) {
    if (historyAfter[i][0] != historyBefore[i - delta.length][0]) {
      delta.push(historyAfter[i])
    } else {
      break;
    }
  }
  return delta;
}

function poll() {
  if (!pollEnabled) {
    return;
  }
  console.log("[User Draw] Polling in 3s...")
  userDrawPollId = setTimeout( () => {
    fetchByKey("history", (history_raw) => { checkUpdate(parseCsv(history_raw).reverse()) })
  }, 2 * 1000);
}

function checkUpdate(newHistory) {
  let delta = getDelta(lastHistory, newHistory);
  if (delta.length > 0) {
    console.log(`[User Draw] Have new draws`)
    lastHistory = newHistory;
    updateDraws(delta);
  } else {
    console.log(`[User Draw] No updates`);
  }
  poll();
}

function prefetchImages(newElements) {
  for (var i = 0; i < newElements.length; i++) {
    let cardName = newElements[i][4];
    let image = new Image();
    image.src = cardToPath(cardName);
  }
}

function cardToPath(cardName) {
  if (cardName.includes('Reversed')) {
    return "res/tarot/" + tarotToPng[cardName.replace(' (Reversed)', '')];
  } else {
    return "res/tarot/" + tarotToPng[cardName];
  }
}

function updateDraws(newElements) {
  if (newElements.length == 0) {
    return;
  }

  prefetchImages(newElements);

  let container = document.querySelector("#history-container");
  if (container.children.length != 0) {
    for (var i = 0; i < newElements.length; i++) {
      let child = container.children[container.children.length - 1 - i];
      child.style.opacity = 0.0;
      setTimeout(() => {
        container.removeChild(child)
      }, 300)
    }
  }

  setTimeout(() => {
    console.log(`Updating to ${newElements}`);
    for (var i = 0; i < newElements.length; i++) {
      let newCard = createDrawElement(newElements[newElements.length - i - 1]);
      let image = newCard.querySelector("img");
      let tempSrc = image.src;
      let cardDiv = newCard.querySelector(".user-draw");
      image.src = "res/tarot/back.png";
      cardDiv.style.opacity = 0.0;
      container.prepend(newCard);

      setTimeout(() => {
        cardDiv.style.opacity = 1.0;
      }, 300);

      let prev_transform = image.style.transform;
      setTimeout(() => {
        image.style.transform = prev_transform + " rotate3d(0, 1, 0, 90deg)";
      }, 600);
      setTimeout(() => {
        image.src = tempSrc;
        image.style.transform = prev_transform + " rotate3d(0, 1, 0, 0deg)";
      }, 900);
    }
  }, 350);
}


function createDrawElement(historyEntry) {
  let newNode = document.querySelector("#user-draw-template").content.cloneNode(true);
//  newNode = document.importNode(newNode, true);

  
  let image = newNode.querySelector("img");
  let cardName = historyEntry[4];
  if (cardName.includes('Reversed')) {
    newNode.querySelector(".user-draw").style["background-color"] = "#FF00FF33";
    image.style = "transform: rotate(180deg)";
  }
  image.src = cardToPath(cardName);

  let affinity = historyEntry[5];
  let affinityElement = newNode.querySelector('.user-draw-affinity');
  if (affinity.includes('-')) {
    affinityElement.style.color = "#BB0000";
    affinityElement.innerText = affinity;
  } else {
    affinityElement.style.color = "#00BB00";
    affinityElement.innerText = `+${affinity}`;
  }

  newNode.querySelector(".user-draw-card-name").innerText = cardName;
  newNode.querySelector(".user-channel").innerText = `At ${historyEntry[1]}`;
  
  let username = newNode.querySelector(".user-name");
  username.innerText = historyEntry[2];
  username.style.color = `${historyEntry[3]}`;

  newNode.querySelector(".user-draw-date").innerText = `${new Date(parseInt(historyEntry[0]) * 1000).toLocaleString()} UTC`;

  return newNode;
}
