const render = (state, elements) => {
  if (state.inputUrlForm.state === 'invalid') {
    const [err] = state.errors;
    elements.formInput.classList.add('is-invalid');
    document.querySelector('.feedback').innerHTML = err;
  } else if (state.inputUrlForm.state === 'valid') {
    elements.formInput.classList.remove('is-invalid');
    document.querySelector('.feedback').innerHTML = '';
    elements.form.reset();
  }
};

export default render;
