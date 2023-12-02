import 'bootstrap';
import onChange from 'on-change';
import render from './view';
import updateRSS from './sripts/updateRSS';
import getHTML from './sripts/getHTML';
import isValid from './sripts/validator';
import elements from './elements/elements';

const app = (i18nextInstance) => {
  const state = {
    inputUrlForm: {
      state: '',
      feedsUrl: [],
    },
    errors: [],
    errorsIdUpdate: [],
    active: {
      activeId: 0,
      feed: [],
      rss: [],
      localId: 1,
    },
    uiState: {
      modal: [],
    },
  };

  const watchedState = onChange(state, render(state, elements, i18nextInstance));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.inputUrlForm.state = 'feeding';
    const data = new FormData(e.target).get('url').trim();
    isValid(data, watchedState)
      .then((newData) => getHTML(newData, watchedState))
      .then(() => updateRSS(data, watchedState))
      .catch(() => {
        watchedState.errors.push('networkError');
        watchedState.inputUrlForm.state = 'invalid';
      });
  });
  elements.posts.addEventListener('click', (e) => {
    if (Object.hasOwn(e.target.dataset, 'id')) {
      const findRssById = watchedState.uiState.modal
        .find((rssById) => rssById.localId === Number(e.target.dataset.id));
      findRssById.state = 'opened';
    }
  });
};
export default app;

// http://lorem-rss.herokuapp.com/feed?unit=second
