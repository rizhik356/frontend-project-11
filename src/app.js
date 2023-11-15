import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import { setLocale } from 'yup';
import axios from 'axios';
import render from './view';

const allOrigins = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;

const elements = {
  formInput: document.querySelector('#rssInput'),
  form: document.querySelector('.rss-form'),
  posts: document.querySelector('.posts'),
  feeds: document.querySelector('.feeds'),
};

const stringParseToHTML = (str) => {
  const parse = new DOMParser();
  return parse.parseFromString(str, 'text/xml');
};

const breakHTMLIntoPosts = (html, watchedState) => {
  html.forEach((item) => {
    const newWatchedState = watchedState;
    newWatchedState.active.localId += 1;
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

const parseHTMLtoData = (html, data, watchedState, i18nextInstance) => {
  const newWatchedState = watchedState;
  if (html.querySelector('rss') === null) {
    newWatchedState.errors.push(i18nextInstance.t('messages.errors.rssError'));
    newWatchedState.inputUrlForm.state = 'invalid';
    throw new Error();
  } else {
    newWatchedState.active.activeId += 1;
    watchedState.active.feed.push({
      feedTitle: html.querySelector('title').textContent,
      feedDescription: html.querySelector('description').textContent,
      id: watchedState.active.activeId,
      link: data,
    });

    const HTMLItem = html.querySelectorAll('item');
    breakHTMLIntoPosts(Array.from(HTMLItem).reverse(), watchedState);
    newWatchedState.inputUrlForm.state = 'parseComplete';
  }
};

const updateRSS = (link, watchedState) => {
  const newWatchedState = watchedState;
  newWatchedState.inputUrlForm.state = 'beginUpdating';
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
        newWatchedState.inputUrlForm.state = 'updating';
      }
      return filter;
    })
    .catch((console.log))
    .finally(() => setTimeout(updateRSS, 5000, link, watchedState));
};

const getHTML = (data, watchedState, i18nextInstance) => axios.get(allOrigins(data))
  .then((response) => stringParseToHTML(response.data.contents))
  .then((html) => parseHTMLtoData(html, data, watchedState, i18nextInstance))
  .catch((err) => {
    throw new Error(err);
  });

const app = (i18nextInstance) => {
  const state = {
    inputUrlForm: {
      state: '',
      feedsUrl: [],
    },
    errors: [],
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

  setLocale({
    mixed: {
      notOneOf: i18nextInstance.t('messages.errors.copyFeed'),
    },
    string: {
      url: i18nextInstance.t('messages.errors.invalidUrl'),
    },
  });
  let schema = yup.object().shape({
    url: yup.string()
      .required()
      .url()
      .notOneOf([]),
  });

  const validation = (url) => schema.validate({ url })
    .then(() => {
      watchedState.inputUrlForm.feedsUrl.push(url);
      schema = yup.object().shape({
        url: yup.string()
          .required()
          .url()
          .notOneOf(watchedState.inputUrlForm.feedsUrl),
      });
      watchedState.errors = [];
      return url;
    })
    .catch((err) => {
      watchedState.errors = [];
      watchedState.errors.push(err.errors);
      watchedState.inputUrlForm.state = 'invalid';
      throw new Error(err.errors);
    });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.inputUrlForm.state = 'feeding';
    const data = new FormData(e.target).get('url');
    validation(data)
      .then((newData) => getHTML(newData, watchedState, i18nextInstance))
      .then(() => updateRSS(data, watchedState))
      .catch((err) => {
        watchedState.errors.push(i18nextInstance.t('messages.errors.networkError'));
        watchedState.inputUrlForm.state = 'invalid';
        console.log(err);
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
