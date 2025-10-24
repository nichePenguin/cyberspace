var curr_page = 1;
var items_per_page = 48;
var pages_total = 1;
var items_total = items_per_page;
var filter = {
  "contains": "",
}
var items = null;
var last_search = "";
var last_tags = "";
var bugs_loading = true;
var last_bug_width = 472;

var focuesed_item = null;
var focused = false;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('only-bugs').addEventListener('change', handleTagChange);
  document.getElementById('no-spiders').addEventListener('change', handleTagChange);
  document.getElementById('exclude-cats').addEventListener('change', handleTagChange);
  document.getElementById('searchbar').addEventListener('input', handleSearchbarInput);
  handleTagChange(null);
});

function handleItemMouseLeave(event) {
  event.currentTarget.style.transform = '';
}

function handleItemHover(event) {
  const item = event.currentTarget;
  const rect = item.getBoundingClientRect()
  const dx = event.clientX - rect.left - rect.width/2;
  const dy = event.clientY - rect.top - rect.height/2;

  item.style.transform = "rotateY("+(-dx)/16+"deg)" + "rotateX("+(dy)/20+"deg)" + "scale(1.1)"
}

function handlePageChange(event) {
  if (focused | bugs_loading) {
    return
  }
  bugs_loading = true
  const page = Math.max(1, int(event.currentTarget.innerText))
  if (page == curr_page) {
    bugs_loading = false
    return;
  }
  curr_page = page;
  loadBugs();
}

function adjustPageControl() {
  if (items_total <= items_per_page) {
    pages_total = 1;
    document.getElementById('footer').style.display = 'none';
    return;
  } else {
    pages_total = Math.ceil(items_total / items_per_page);
    document.getElementById('footer').style.display = '';
  }
  const first = document.getElementById('page-first')
  const left = document.getElementById('page-more-left')
  const prev = document.getElementById('page-prev')
  const curr = document.getElementById('page-curr')
  const next = document.getElementById('page-next')
  const right = document.getElementById('page-more-right')
  const last = document.getElementById('page-last')

  left.style.display = (curr_page <= 3) ? 'none' : '';
  first.style.display = (curr_page <= 2) ? 'none' : '';
  prev.style.display = (curr_page <= 1) ? 'none' : '';

  right.style.display = (curr_page >= pages_total - 2) ? 'none' : '';
  last.style.display = (curr_page >= pages_total - 1) ? 'none' : '';
  next.style.display = (curr_page >= pages_total) ? 'none' : '';

  prev.innerText = curr_page - 1
  curr.innerText = curr_page
  next.innerText = curr_page + 1
  last.innerText = pages_total
}

function handleTagChange(event) {
  const only_bugs = document.getElementById('only-bugs').checked;
  const no_spiders = document.getElementById('no-spiders').checked;
  const exclude_cats = document.getElementById('exclude-cats').checked;
  if (only_bugs) {
    filter["tags"] = [
      "bug"
    ]
    document.getElementById('spider-wrap').style.display = 'none'
    document.getElementById('cat-wrap').style.display = 'none'
  } else {
    document.getElementById('spider-wrap').style.display = 'inline'
    document.getElementById('cat-wrap').style.display = 'inline'
    if (no_spiders) {
      filter["tags"] = [
        "bug", "not_bug"
      ]
    } else {
      filter["tags"] = [
        "bug", "not_bug", "spider"
      ]
    }
    if (!exclude_cats) {
      filter["tags"].push("mrow")
    }
  }
  const curr_tags = filter["tags"].sort().join(',');
  if (curr_tags != last_tags) {
    last_tags = curr_tags;
    curr_page = 1;
    loadBugs()
  }
}

function handleSearchbarInput(event) {
  const text = event.target.value.trim();
  if (last_search == text) {
    return;
  }
  last_search = text;
  filter["contains"] = text;
  curr_page = 1;
  loadBugs();
}

function loadBugs() {
  bugs_loading = true;
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
  items_total = json["total_count"];
  items = json["items"]
  for (var i = 0; i < items.length; i ++) {
    const entry = items[i];
    const el = document.createElement('div');
    const elems = document.getElementsByClassName('bug');
    const bug_width = elems.length > 0 ? elems[0].offsetWidth : last_bug_width;
    last_bug_width = bug_width
    el.className = 'item-wrap';
    el.setAttribute('index', i)
    el.addEventListener('mousemove', handleItemHover);
    el.addEventListener('mouseleave', handleItemMouseLeave);
    el.innerHTML = item(entry.name, entry.latin, entry.image, bug_width);
    grid.appendChild(el);
  }
  adjustPageControl()
  bugs_loading = false
}

function item(name, latin, image, width) {
  return `<div class="depth depth1"></div>
          <div class="depth depth2"></div>
          <div class="item">
          <img class="bug" src="${image}"><img>
          <div>
            <strong>${name}</strong>
            <br>
            <small>${latin}</small>
          </div>
          </div>
`;
}
