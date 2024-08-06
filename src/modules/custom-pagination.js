'use strict';

let paginationElement = document.querySelector('div.paginate-container.d-none > div.pagination');

function setCustomPagination(Action) {
  if (!paginationElement) return;
  const pagesElement = document.querySelectorAll('a[aria-label^="Page"], em[aria-current="page"]');
  const lastPageCount = parseInt(pagesElement[pagesElement.length - 1].textContent);

  let currentPage = parseInt(paginationElement.querySelector('em.current')?.textContent || 1);
  let totalPage = lastPageCount;

  const renderPagination = () => {
    let newPagination = document.createElement('div');
    newPagination.setAttribute('role', 'navigation');
    newPagination.setAttribute('aria-label', 'Pagination');
    newPagination.classList.add('pagination');

    // Previous page link
    let prevLink = document.createElement('a');
    prevLink.classList.add('previous_page');
    prevLink.setAttribute('aria-label', 'Previous page');
    prevLink.setAttribute('rel', 'prev');
    prevLink.textContent = 'Previous';
    if (currentPage > 1) {
      prevLink.addEventListener('click', (event) => handlePageChange(event, currentPage - 1));
    } else {
      prevLink.classList.add('disabled');
      prevLink.setAttribute('aria-disabled', 'true');
    }
    newPagination.appendChild(prevLink);

    // Page links
    for (let i = 1; i <= totalPage; i++) {
      if (i === currentPage) {
        let currentPageElem = document.createElement('em');
        currentPageElem.classList.add('current');
        currentPageElem.setAttribute('aria-label', `Page ${i}`);
        currentPageElem.setAttribute('aria-current', 'page');
        currentPageElem.setAttribute('data-total-pages', totalPage);
        currentPageElem.textContent = i;
        newPagination.appendChild(currentPageElem);
      } else {
        let pageLink = document.createElement('a');
        pageLink.setAttribute('aria-label', `Page ${i}`);
        pageLink.textContent = i;
        pageLink.addEventListener('click', (event) => handlePageChange(event, i));
        newPagination.appendChild(pageLink);
      }
    }

    // Next page link
    let nextLink = document.createElement('a');
    nextLink.classList.add('next_page');
    nextLink.setAttribute('aria-label', 'Next page');
    nextLink.setAttribute('rel', 'next');
    nextLink.textContent = 'Next';
    if (currentPage < totalPage) {
      nextLink.addEventListener('click', (event) => handlePageChange(event, currentPage + 1));
    } else {
      nextLink.classList.add('disabled');
      nextLink.setAttribute('aria-disabled', 'true');
    }
    newPagination.appendChild(nextLink);

    paginationElement.parentNode.replaceChild(newPagination, paginationElement);
    paginationElement = newPagination; // Update the reference

  };

  // Helper function to handle page change
  const handlePageChange = (event, selectedPage) => {
    event.preventDefault();
    currentPage = selectedPage;
    Action(selectedPage);
    renderPagination();
  };

  renderPagination();
}

export { setCustomPagination };
