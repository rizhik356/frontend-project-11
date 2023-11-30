import * as yup from 'yup';
import { setLocale } from 'yup';

setLocale({
  mixed: {
    notOneOf: 'copyFeed',
  },
  string: {
    url: 'invalidUrl',
  },
});
let schema = yup.object().shape({
  url: yup.string()
    .required()
    .url()
    .notOneOf([]),
});

const isValid = (url, watchedState) => schema.validate({ url })
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

export default isValid;
