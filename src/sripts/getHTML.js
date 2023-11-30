import axios from 'axios';
import allOrigins from './allOrigins';
import stringParseToHTML from './stringParseToHTML';
import parseHTMLtoData from './parseHTMLToData';

const getHTML = (data, i18nextInstance, watchedState) => axios.get(allOrigins(data))
  .then((response) => stringParseToHTML(response.data.contents))
  .then((html) => parseHTMLtoData(html, data, i18nextInstance, watchedState))
  .catch((err) => {
    throw new Error(err);
  });

export default getHTML;
