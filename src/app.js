import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import { setLocale } from 'yup';
import axios from 'axios';
import render from './view';
import resources from './locales/index';

const i18nextInstance = i18next.createInstance();
i18nextInstance.init({
  lng: 'ru',
  debug: true,
  resources,
});

const app = () => {
  const elements = {
    formInput: document.querySelector('#rssInput'),
    form: document.querySelector('.rss-form'),
  };

  const state = {
    inputUrlForm: {
      state: '',
      inputValue: '',
      feeds: [],
    },
    errors: [],
    status: i18nextInstance.t('messages.status'),
    active: {
      activeId: 0,
      feed: {},
      rss: [],
      localId: 0,
    },
  };

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'inputUrlForm.inputValue':
        render(watchedState, elements);
        break;
      case 'inputUrlForm.state':
        render(watchedState, elements);
        break;
      case 'inputUrlForm.feeds':
        render(watchedState, elements);
        break;
      case 'errors':
        render(watchedState, elements);
        break;
      case 'active.activeId':
        render(watchedState, elements);
        break;
      case 'active.feed':
        render(watchedState, elements);
        break;
      case 'active.rss':
        render(watchedState, elements);
        break;
      case 'active.localId':
        render(watchedState, elements);
        break;
      default:
        throw new Error(`Invalid path : ${path}`);
    }
  });

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

  const validation = (url) => {
    schema.validate({ url })
      .then(() => {
        watchedState.inputUrlForm.state = 'valid';
        watchedState.inputUrlForm.feeds.push(url);
        schema = yup.object().shape({
          url: yup.string()
            .required()
            .url()
            .notOneOf(watchedState.inputUrlForm.feeds),
        });
      })
      .catch((err) => {
        watchedState.inputUrlForm.state = 'invalid';
        watchedState.errors = [];
        watchedState.errors.push(err.errors);
      });
  };
  const stringParseToHTML = (str) => {
    const parse = new DOMParser();
    return parse.parseFromString(str, 'text/html');
  };
  const parseHTMLtoData = (html) => {
    const HTMLData = {
      feed: {},
      rss: [],
    };
    if (html.querySelector('rss') === null) {
      watchedState.errors.push(i18nextInstance.t('messages.errors.rssError'));
      watchedState.inputUrlForm.state = 'invalid';
    } else {
      watchedState.active.activeId += 1;
      HTMLData.feed.feedTitle = html.querySelector('title').textContent;
      HTMLData.feed.feedDescription = html.querySelector('description').textContent;
      HTMLData.feed.id = watchedState.active.activeId;
      const HTMLItem = html.querySelectorAll('item');
      HTMLItem.forEach((item) => {
        watchedState.active.localId += 1;
        const itemTitle = item.querySelector('title').textContent;
        const itemDescription = item.querySelector('description').textContent;
        const itemLink = item.querySelector('link').nextSibling;
        HTMLData.rss.push({
          itemTitle,
          itemDescription,
          itemLink,
          id: watchedState.active.activeId,
          localId: watchedState.active.localId,
        });
      });
      watchedState.active.feed = HTMLData.feed;
      watchedState.active.rss = HTMLData.rss;
      watchedState.inputUrlForm.state = 'parseComplete';
    }
  };

  const getHTML = (data) => {
    axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(data)}`)
      .then((response) => stringParseToHTML(response.data.contents))
      .then((html) => parseHTMLtoData(html))
      .catch((err) => {
        watchedState.inputUrlForm.state = 'invalid';
        watchedState.errors.push(i18nextInstance.t('messages.errors.networkError'));
        console.log(err);
      });
    /* .finally(() => {
        const timer = setTimeout(getHTML, 5000, data);
        return watchedState.inputUrlForm.inputValue === data ? timer : clearTimeout(timer);
      }); */
  };

  elements.form.addEventListener('submit', (e) => {
    watchedState.inputUrlForm.state = 'feeding';
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = formData.get('url');
    validation(data);
    watchedState.inputUrlForm.inputValue = data;
    getHTML(data);
  });
};
export default app;
