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
      feed: [],
      rss: [],
      localId: 0,
    },
  };

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'inputUrlForm.inputValue':

        break;
      case 'inputUrlForm.state':
        render(watchedState, elements);
        break;
      case 'inputUrlForm.feeds':
      //  render(watchedState, elements);
        break;
      case 'errors':
      //  render(watchedState, elements);
        break;
      case 'active.activeId':
      //  render(watchedState, elements);
        break;
      case 'active.feed':
      //  render(watchedState, elements);
        break;
      case 'active.rss':
      //  render(watchedState, elements);
        break;
      case 'active.localId':
      //  render(watchedState, elements);
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

  const validation = (url) => schema.validate({ url })
    .then(() => {
      watchedState.inputUrlForm.state = 'valid';
      watchedState.inputUrlForm.feeds.push(url);
      schema = yup.object().shape({
        url: yup.string()
          .required()
          .url()
          .notOneOf(watchedState.inputUrlForm.feeds),
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
  const stringParseToHTML = (str) => {
    const parse = new DOMParser();
    return parse.parseFromString(str, 'text/xml');
  };
  const parseHTMLtoData = (html, data) => {
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
      HTMLData.feed.link = data;

      const HTMLItem = html.querySelectorAll('item');
      HTMLItem.forEach((item) => {
        watchedState.active.localId += 1;
        const itemTitle = item.querySelector('title').textContent;
        const itemDescription = item.querySelector('description').textContent;
        const itemLink = item.querySelector('link').textContent;

        HTMLData.rss.unshift({
          itemTitle,
          itemDescription,
          itemLink,
          id: watchedState.active.activeId,
          localId: watchedState.active.localId,
        });
      });
      watchedState.active.feed.push(HTMLData.feed);
      watchedState.active.rss = [...watchedState.active.rss, ...HTMLData.rss];
      watchedState.inputUrlForm.state = 'parseComplete';
    }
  };

  const updateRSS = (link) => {
    watchedState.inputUrlForm.state = 'beginUpdating';
    axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`)
      .then((response) => stringParseToHTML(response.data.contents))
      .then((html) => {
        Promise.resolve([])
          .then(() => watchedState.active.feed.find((feed) => feed.link === link))
          .then((feed) => watchedState.active.rss.filter((post) => post.id === feed.id))
          .then((posts) => {
            const HTMLItem = Array.from(html.querySelectorAll('item'));
            const filter = HTMLItem.filter((item) => {
              const itemTitle = item.querySelector('title').textContent;
              const postsTitle = posts.map((post) => post.itemTitle);
              return !postsTitle.includes(itemTitle);
            });
            if (filter.length > 0) {
              filter.reverse().forEach((item) => {
                const itemTitle = item.querySelector('title').textContent;
                const itemDescription = item.querySelector('description').textContent;
                const itemLink = item.querySelector('link').nextSibling.textContent;
                const filterData = {
                  itemTitle,
                  itemDescription,
                  itemLink,
                  id: watchedState.active.activeId,
                  localId: watchedState.active.localId,
                };
                watchedState.active.rss.push(filterData);
              });
              watchedState.inputUrlForm.state = 'updating';
            }
            return filter;
          });
      })
      .then(() => setTimeout(updateRSS, 3000, link));
  };

  const getHTML = (data) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(data)}`)
    .then((response) => stringParseToHTML(response.data.contents))
    .then((html) => parseHTMLtoData(html, data))
    .catch((err) => {
      watchedState.errors.push(i18nextInstance.t('messages.errors.networkError'));
      watchedState.inputUrlForm.state = 'invalid';
      console.log(err);
    })
    .finally(() => setTimeout(() => {
      updateRSS(data);
    }, 3000));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.inputUrlForm.state = 'feeding';
    watchedState.inputUrlForm.state = [];
    const formData = new FormData(e.target);
    const data = formData.get('url');
    validation(data)
      .then((newData) => getHTML(newData))
      .catch((err) => err);
  });
};
export default app;

// http://lorem-rss.herokuapp.com/feed?unit=second
