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
        watchedState.inputUrlForm.state = i18nextInstance.t('state.valid');
        watchedState.inputUrlForm.feeds.push(url);
        schema = yup.object().shape({
          url: yup.string()
            .required()
            .url()
            .notOneOf(watchedState.inputUrlForm.feeds),
        });
      })
      .catch((err) => {
        watchedState.inputUrlForm.state = i18nextInstance.t('state.invalid');
        watchedState.errors = [];
        watchedState.errors.push(err.errors);
      });
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = formData.get('url');
    validation(data);
    watchedState.inputUrlForm.inputValue = data;
    axios.get(data)
      .then((response) => {
        console.log(`${response} - Ola-la`);
      })
      .catch((error) => {
        // handle error
        console.log(error);
        console.log(data);
      })
      .finally(() => {
        // always executed
      });
  });
};
export default app;
