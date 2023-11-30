const breakHTMLIntoPosts = (html, watchedState) => {
  html.forEach((item) => {
    watchedState.active.localId += 1;
    watchedState.active.rss.push({
      itemTitle: item.querySelector('title').textContent,
      itemDescription: item.querySelector('description').textContent,
      itemLink: item.querySelector('link').textContent,
      id: watchedState.active.activeId,
      localId: watchedState.active.localId,
    });
    watchedState.uiState.modal.push({
      localId: watchedState.active.localId,
      state: 'default',
    });
  });
};

export default breakHTMLIntoPosts;
