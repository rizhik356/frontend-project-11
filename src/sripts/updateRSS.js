import axios from 'axios';
import stringParseToHTML from './stringParseToHTML';
import breakHTMLIntoPosts from './breakHTMLIntoPosts';
import allOrigins from './allOrigins';

const updateRSS = (link, watchedState) => {
  watchedState.inputUrlForm.state = 'beginUpdating';
  axios.get(allOrigins(link))
    .then((response) => stringParseToHTML(response.data.contents))
    .then((html) => {
      const feedId = watchedState.active.rss
        .filter((post) => post.id === watchedState.active.feed
          .find((feed) => feed.link === link).id);
      const filter = Array.from(html.querySelectorAll('item'))
        .filter((item) => !feedId.map((post) => post.itemTitle)
          .includes(item.querySelector('title').textContent));
      if (filter.length > 0) {
        breakHTMLIntoPosts(filter.reverse(), watchedState);
        watchedState.inputUrlForm.state = 'updating';
      }
      return filter;
    })
    .catch(() => {
      throw new Error('Ошибка при обновлении фида');
    })
    .finally(() => setTimeout(updateRSS, 5000, link, watchedState));
};

export default updateRSS;
