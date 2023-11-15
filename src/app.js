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

  const stringParseToHTML = (str) => new DOMParser().parseFromString(str, 'text/xml');

  const breakHTMLIntoPosts = (html) => {
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

  const parseHTMLtoData = (html, data) => {
    if (html.querySelector('rss') === null) {
      watchedState.errors.push(i18nextInstance.t('messages.errors.rssError'));
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
      breakHTMLIntoPosts(Array.from(HTMLItem).reverse());
      watchedState.inputUrlForm.state = 'parseComplete';
    }
  };

  const updateRSS = (link) => {
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
          breakHTMLIntoPosts(filter.reverse());
          watchedState.inputUrlForm.state = 'updating';
        }
        return filter;
      })
      .catch((console.log))
      .finally(() => setTimeout(updateRSS, 5000, link));
  };

  const getHTML = (data) => axios.get(allOrigins(data))
    .then((response) => stringParseToHTML(response.data.contents))
    .then((html) => parseHTMLtoData(html, data))
    .catch((err) => {
      throw new Error(err);
    });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.inputUrlForm.state = 'feeding';
    const data = new FormData(e.target).get('url');
    validation(data)
      .then((newData) => getHTML(newData))
      .then(() => updateRSS(data))
      .catch(() => {
        watchedState.errors.push(i18nextInstance.t('messages.errors.networkError'));
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
