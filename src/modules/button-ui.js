'use strict';

// Action is the function that will be called on click to order. (need to implement)
function addSortOrderOptions(Option, Action) {
  const sortMenuEl = document.querySelector('#sort-select-menu .SelectMenu-list');
  
  if (sortMenuEl) {
    const sortItemEl = sortMenuEl.querySelector('#sort-select-menu .SelectMenu-divider');
    const sortMenuNode = sortItemEl.parentNode;
    const sortOptionEl = document.createElement('div');
    const option = Option.replace(/ /g, "-").toLowerCase();

    sortOptionEl.setAttribute('class', `SelectMenu-item ${option}`);
    sortOptionEl.setAttribute('aria-checked', 'false');
    sortOptionEl.setAttribute('role', 'menuitemradio');
    sortOptionEl.innerHTML = `
            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check SelectMenu-icon SelectMenu-icon--check ${option}"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg>
            <span class="${option}">${Option}</span>
        `;
    sortMenuNode.insertBefore(sortOptionEl, sortItemEl);

    sortMenuEl.addEventListener('click', (event) => {
      if (event.target.classList.contains(option)) {
        Action();
      }
    });
  }
}

export { addSortOrderOptions };
