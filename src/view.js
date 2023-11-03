const render = (state, elements) => {
  if (state.inputUrlForm.state === 'invalid') {
    elements.formInput.classList.add('is-invalid');
    document.querySelector('.feedback').innerHTML = 'Invalid Rss';
  } else if (state.inputUrlForm.state === 'valid') {
    elements.formInput.classList.remove('is-invalid');
    document.querySelector('.feedback').innerHTML = '';
  }
};

export default render;
