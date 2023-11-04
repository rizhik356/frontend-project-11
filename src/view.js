const render = (state, elements) => {
  const feedback = document.querySelector('.feedback');
  if (state.inputUrlForm.state === 'invalid') {
    const [err] = state.errors;
    elements.formInput.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.innerHTML = err;
  } else if (state.inputUrlForm.state === 'valid') {
    elements.formInput.classList.remove('is-invalid');
    elements.formInput.focus();
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.innerHTML = state.status;
    elements.form.reset();
  }
};

export default render;
