import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import render from './view';

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

  let schema = yup.string()
    .required()
    .url('Ссылка должна быть валидным URL')
    .notOneOf([]);

  const validation = (url) => {
    schema.validate(url)
      .then(() => {
        watchedState.inputUrlForm.state = 'valid';
        watchedState.inputUrlForm.feeds.push(url);
        schema = yup.string()
          .required()
          .url('Ссылка должна быть валидным URL')
          .notOneOf(watchedState.inputUrlForm.feeds, 'RSS уже существует');
      })
      .catch((err) => {
        watchedState.inputUrlForm.state = 'invalid';
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
  });
};
export default app;
