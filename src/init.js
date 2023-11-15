import i18next from 'i18next';
import resources from './locales/index';
import app from './app';

export default () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  });

  app(i18nextInstance);
};
