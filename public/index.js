document.addEventListener('keydown', e => {
  if (e.keyCode === 13) {
    e.preventDefault();
    search();
  }
});

const search = async () => {
  const input = document.getElementById('search-input');
  try {
    const res = await fetch(`/search?q=${input.value}`);
    if (res.status === 200) {
      const parent = document.getElementById('gallery');
      while (parent.firstElementChild) {
        parent.firstElementChild.remove();
      }
      for (const suggestion of await res.json()) {
        const div = document.createElement('div');
        div.className = 'col-3 mt-3 text-center';
        const a = document.createElement('a');
        a.className = 'text-link';
        a.href = suggestion.url;
        a.target = '_blank';
        if (suggestion.icon !== '') {
          const img = document.createElement('img');
          img.className = 'img-fluid rounded';
          img.src = suggestion.icon;
          a.appendChild(img);
        }
        const h4 = document.createElement('h4');
        h4.innerHTML = suggestion.text;
        a.appendChild(h4);
        div.appendChild(a);
        parent.appendChild(div);
      }
      input.value = '';
    } else {
      console.error(await res.text());
    }
  } catch (e) {
    console.error(e);
  }
};
