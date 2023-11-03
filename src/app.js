import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';

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

  const schema = yup.string()
    .required()
    .url()
    .notOneOf(['1', '2']);

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'inputUrlForm.inputValue':
        render(watchedState, elements);
        break;
      case 'inputUrlForm.state':
        render(watchedState, elements);
        break;
      default:
        throw new Error(`Invalid path : ${path}`);
    }
  });

  const validation = (url) => {
    schema.validate(url)
      .then(() => {
        watchedState.inputUrlForm.state = 'valid';
        // console.log('ok');
      })
      .catch(() => {
        watchedState.inputUrlForm.state = 'invalid';
        // console.log('Email has been aufizerzein');
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
