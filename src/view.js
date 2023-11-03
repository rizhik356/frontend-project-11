const render = (state, elements) => {
  if (state.inputUrlForm.state === 'invalid') {
    elements.formInput.classList.add('is-invalid');
  } else if (state.inputUrlForm.state === 'valid') {
    elements.formInput.classList.remove('is-invalid');
  }
};

export default render;
