const renderLi = (ul, state, i18nextInstance) => {
  const newUl = ul;
  newUl.innerHTML = '';
  state.active.rss.forEach(({
    itemTitle, itemLink, localId,
  }) => {
    const uiStateById = (state.uiState.modal.find((item) => item.localId === localId)).state;
    const fontWeigth = uiStateById === 'default' ? 'fw-bold' : 'fw-normal text-secondary';

    const liPost = document.createElement('li');
    liPost.classList.add('justify-content-between', 'list-group-item', 'd-flex', 'align-items-start', 'border-0');

    const a = document.createElement('a');
    a.setAttribute('href', `${itemLink}`);
    a.setAttribute('target', '_blank');
    a.setAttribute('class', `${fontWeigth}`);
    a.setAttribute('data-id', `${localId}`);
    a.textContent = `${itemTitle}`;
    liPost.prepend(a);

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn btn-secondary');
    button.setAttribute('data-id', `${localId}`);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = `${i18nextInstance.t('modal.open')}`;
    liPost.append(button);
    newUl.prepend(liPost);
  });
};

const makeSpinner = (element, color = 'light') => {
  const span = document.createElement('span');
  span.className = `spinner-${element} text-${color} spinner-${element}-sm mx-2`;
  span.setAttribute('role', 'status');
  span.setAttribute('aria-hidden', 'aria-hidden');
  return span;
};

const renderButtonLoading = (elements, i18nextInstance) => {
  elements.addButton.disabled = true;
  elements.addButton.textContent = i18nextInstance.t('button.loading');
  elements.addButton.classList.remove('px-sm-5');
  elements.addButton.classList.add('px-sm-4');
  elements.addButton.prepend(makeSpinner('border'));
};

const renderLiFeeds = (ul, state) => {
  ul.innerHTML = '';
  state.active.feed.forEach(({ feedTitle, feedDescription, link }) => {
    const li = document.createElement('li');
    const h3 = document.createElement('h3');
    const p = document.createElement('p');
    li.classList.add('list-group-item', 'border-0');
    h3.className = 'h6 m-0';
    h3.textContent = `${feedTitle}`;

    if (state.errorsIdUpdate.includes(link)) {
      h3.classList.add('text-danger');
      h3.prepend(makeSpinner('border', 'danger'));
    }

    li.prepend(h3);
    p.classList.add('small', 'text-black-50', 'm-0');
    p.textContent = `${feedDescription}`;
    li.append(p);
    ul.prepend(li);
  });
};

const renderButtonDefault = (elements, i18nextInstance) => {
  elements.addButton.disabled = false;
  elements.addButton.innerHTML = '';
  elements.addButton.textContent = i18nextInstance.t('button.default');
  elements.addButton.classList.remove('px-sm-4');
  elements.addButton.classList.add('px-sm-5');
};

const makeStatus = (stateStatus, state, elements, i18nextInstance) => {
  const [err] = state.errors;
  elements.feedback.classList.remove('text-succes', 'text-danger', 'text-light');
  switch (stateStatus) {
    case 'invalid':
      elements.formInput.classList.add('is-invalid');
      elements.feedback.classList.add('text-danger');
      elements.feedback.textContent = i18nextInstance.t(`messages.errors.${err}`);
      break;
    case 'feeding':
      elements.formInput.classList.remove('is-invalid');
      elements.feedback.textContent = '';
      elements.feedback.prepend(makeSpinner('grow'));
      elements.feedback.prepend(makeSpinner('grow'));
      elements.feedback.prepend(makeSpinner('grow'));
      break;
    case 'success':
      elements.formInput.classList.remove('is-invalid');
      elements.formInput.focus();
      elements.feedback.classList.remove('text-danger', 'text-light');
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = i18nextInstance.t('messages.statusOk');
      elements.form.reset();
      break;
    default:
      throw new Error(`Invalid status ${stateStatus}`);
  }
};
const parseFeeds = (state, { feeds }, i18nextInstance) => {
  const divFeeds = feeds.querySelector('.card') ?? document.createElement('div');
  divFeeds.innerHTML = '';
  divFeeds.classList.add('border-0', 'card');
  const divClassCardBody = document.createElement('div');
  divClassCardBody.classList.add('card-body');
  divFeeds.prepend(divClassCardBody);
  const divClassCardTitle = document.createElement('div');
  divClassCardTitle.classList.add('card-title', 'text-end', 'h4');
  divClassCardTitle.textContent = `${i18nextInstance.t('interface.feeds')}`;
  divFeeds.append(divClassCardTitle);
  feeds.prepend(divFeeds);

  const newUl = document.createElement('ul');
  newUl.classList.add('list-group', 'text-end');
  const ul = feeds.querySelector('ul') ?? newUl;
  renderLiFeeds(ul, state);
  divFeeds.append(ul);
};

const parsePosts = (state, elements, i18nextInstance) => {
  const { posts } = elements;
  const divPosts = posts.querySelector('.card') ?? document.createElement('div');
  divPosts.innerHTML = '';
  divPosts.classList.add('border-0', 'card');
  const divClassCardBody = document.createElement('div');
  const divClassCardTitle = document.createElement('div');
  divClassCardBody.classList.add('card-body');
  divPosts.prepend(divClassCardBody);
  divClassCardTitle.classList.add('card-title', 'h4');
  divClassCardTitle.textContent = `${i18nextInstance.t('interface.posts')}`;
  divPosts.append(divClassCardTitle);

  const newUlPost = document.createElement('ul');
  newUlPost.classList.add('list-group');
  const ulPost = divPosts.querySelector('ul') ?? newUlPost;
  renderLi(ulPost, state, i18nextInstance);
  divPosts.append(ulPost);
  posts.prepend(divPosts);
};

const getIdByPath = (state, path) => {
  const propByPath = path.split('.').slice(0, -1).reduce((acc, cur) => acc?.[cur], state);
  const openedId = propByPath.localId;
  return openedId;
};

const makeOpened = (openedId) => {
  const aById = document.querySelector(`a[data-id="${openedId}"]`);
  aById.classList.remove('fw-bold');
  aById.classList.add('fw-normal', 'text-secondary');
};

const makeModal = (state, openedId, i18nextInstance, elements) => {
  const openRssById = state.active.rss.find((item) => item.localId === openedId);
  elements.modalTitle.textContent = openRssById.itemTitle;
  elements.modalBody.innerHTML = openRssById.itemDescription;
  elements.readButton.setAttribute('href', openRssById.itemLink);
  elements.readButton.textContent = i18nextInstance.t('modal.continueReading');
};

const render = (state, elements, i18nextInstance) => (path, value) => {
  switch (value) {
    case 'invalid':
      renderButtonDefault(elements, i18nextInstance);
      makeStatus('invalid', state, elements, i18nextInstance);
      break;

    case 'feeding':
      makeStatus('feeding', state, elements, i18nextInstance);
      renderButtonLoading(elements, i18nextInstance);
      break;
    case 'parseComplete':
      renderButtonDefault(elements, i18nextInstance);
      parseFeeds(state, elements, i18nextInstance);
      parsePosts(state, elements, i18nextInstance);
      makeStatus('success', state, elements, i18nextInstance);
      break;

    case 'updating': {
      renderButtonDefault(elements, i18nextInstance);
      const ul = elements.posts.querySelector('ul');
      renderLi(ul, state, i18nextInstance);
      break;
    }
    case 'opened': {
      makeOpened(getIdByPath(state, path));
      makeModal(state, getIdByPath(state, path), i18nextInstance, elements);
      break;
    }
    default:
      break;
  }
  if (path === 'errorsIdUpdate') {
    parseFeeds(state, elements, i18nextInstance);
  }
};

export default render;
