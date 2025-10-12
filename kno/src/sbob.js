var curr_page = 0;
var items_per_page = 50;
var filter = {
  "contains": "",
}
var last_search = "";
var last_tags = "";

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('only-bugs').addEventListener('change', handleTagChange);
  document.getElementById('no-spiders').addEventListener('change', handleTagChange);
  document.getElementById('include-cats').addEventListener('change', handleTagChange);
  document.getElementById('searchbar').addEventListener('input', handleSearchbarInput);
  handleTagChange(null);
});

function handleTagChange(event) {
  const only_bugs = document.getElementById('only-bugs').checked;
  const no_spiders = document.getElementById('no-spiders').checked;
  const include_cats = document.getElementById('include-cats').checked;
  if (only_bugs) {
    filter["tags"] = [
      "bug"
    ]
  } else {
    if (no_spiders) {
      filter["tags"] = [
        "bug", "not_bug"
      ]
    } else {
      filter["tags"] = [
        "bug", "not_bug", "spider"
      ]
    }
  }
  if (include_cats) {
    filter["tags"].push("mrow")
  }
  const curr_tags = filter["tags"].sort().join(',');
  if (curr_tags != last_tags) {
    last_tags = curr_tags;
    loadBugs();
  }
}

function handleSearchbarInput(event) {
  const text = event.target.value.trim();
  if (last_search == text) {
    return;
  }
  last_search = text;
  filter["contains"] = text;
  loadBugs();
}

function loadBugs() {
  const data = JSON.stringify({
    "page": curr_page,
    "items_per_page": items_per_page ,
    "filter": filter
  });
  fetch("https://pub.colonq.computer/~nichepenguin/cgi-bin/bug-fetch", {
  //fetch("../cgi-bin/bug-fetch", {
    method: "POST",
    body: data
  }).then(response => {
    const contentType = response.headers.get("content-type");
    if (contentType) {
      if (contentType == "application/json") {
        return response.json();
      } else if (contentType== "text/plain") {
        response.text().then(setError);
      } else {
        console.log("Error output is not in text/plain");
        console.log(response.text());
      }
    }
    setError("Failed to fetch bugs: See console log")
    Promise.reject('Failed to fetch bugs');
  })
  .then(load);
}

function load(json) {
  if (!json) return;
  const grid = document.querySelector('.grid');
  grid.innerHTML = '';
  for (var i = 0; i < json.length; i ++) {
    const entry = json["items"][i];
    const el = document.createElement('div');
    el.className = 'item';
    el.innerHTML = item(entry.name, entry.latin, entry.image);
    grid.appendChild(el);
  }
}

function item(name, latin, image) {
  return `
          <img class="bug" src="${image}"><img>
          <div>
            <strong>${name}</strong>
            <br>
            <small>${latin}</small>
          </div>
`;
}
