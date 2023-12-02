import breakHTMLIntoPosts from './breakHTMLIntoPosts';

const parseHTMLtoData = (html, data, watchedState) => {
  if (html.querySelector('rss') === null) {
    watchedState.errors.push('rssError');
    watchedState.inputUrlForm.state = 'invalid';
    throw new Error();
  } else {
    watchedState.active.activeId += 1;
    watchedState.active.feed.push({
      feedTitle: html.querySelector('title').textContent,
      feedDescription: html.querySelector('description').textContent,
      id: watchedState.active.activeId,
      link: data,
    });

    const HTMLItem = html.querySelectorAll('item');
    breakHTMLIntoPosts(Array.from(HTMLItem).reverse(), watchedState);
    watchedState.inputUrlForm.state = 'parseComplete';
  }
};

export default parseHTMLtoData;
