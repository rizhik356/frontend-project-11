const renderLi = (ul, state) => {
  const newUl = ul;
  newUl.innerHTML = '';
  state.active.rss.forEach(({
    itemTitle, itemLink, localId,
  }) => {
    const uiStateById = (state.uiState.modal.find((item) => item.localId === localId)).state;
    const fontWeigth = uiStateById === 'default' ? 'fw-bold' : 'fw-normal text-secondary';
    const liPost = document.createElement('li');
    liPost.classList.add('justify-content-between', 'list-group-item', 'd-flex', 'align-items-start', 'border-0');
    liPost.innerHTML = `
                      <a href="${itemLink}" target="_blank" class="${fontWeigth}" data-id="${localId}">${itemTitle}</a>
                      <button type="button" class="btn btn-secondary" data-id="${localId}" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>               
    `;
    newUl.prepend(liPost);
  });
};

const makeStatus = (stateStatus, state, elements, i18nextInstance) => {
  const feedback = document.querySelector('.feedback');
  const [err] = state.errors;
  feedback.classList.remove('text-succes', 'text-danger', 'text-light');
  switch (stateStatus) {
    case 'invalid':
      elements.formInput.classList.add('is-invalid');
      feedback.classList.add('text-danger');
      feedback.innerHTML = err;
      break;
    case 'feeding':
      elements.formInput.classList.remove('is-invalid');
      feedback.classList.add('text-light');
      feedback.innerHTML = i18nextInstance.t('messages.loading');
      break;
    case 'success':
      elements.formInput.classList.remove('is-invalid');
      elements.formInput.focus();
      feedback.classList.remove('text-danger', 'text-light');
      feedback.classList.add('text-success');
      feedback.innerHTML = i18nextInstance.t('messages.statusOk');
      elements.form.reset();
      break;
    default:
      throw new Error(`Invalid status ${stateStatus}`);
  }
};
const parseFeeds = (state, elements, i18nextInstance) => {
  const { feeds } = elements;
  const divFeeds = feeds.querySelector('.card') ?? document.createElement('div');
  divFeeds.classList.add('border-0', 'card');
  divFeeds.innerHTML = `
    <div class="card-body">
    <div class="card-title text-end h4">${i18nextInstance.t('interface.feeds')}</div>
`;
  feeds.prepend(divFeeds);
  const newUl = document.createElement('ul');
  newUl.classList.add('list-group', 'text-end');
  const ul = feeds.querySelector('ul') ?? newUl;
  state.active.feed.forEach(({ feedTitle, feedDescription }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0');
    li.innerHTML = `
    <h3 class="h6 m-0">${feedTitle}</h3>
    <p class="small text-black-50 m-0">${feedDescription}</p>
    `;
    ul.prepend(li);
  });
  divFeeds.append(ul);
};

const parsePosts = (state, elements, i18nextInstance) => {
  const { posts } = elements;
  const divPosts = posts.querySelector('.card') ?? document.createElement('div');
  divPosts.classList.add('border-0', 'card');
  divPosts.innerHTML = `
        <div class="card-body">
        <div class="card-title h4">${i18nextInstance.t('interface.posts')}</div>
    `;
  const newUlPost = document.createElement('ul');
  newUlPost.classList.add('list-group');
  const ulPost = divPosts.querySelector('ul') ?? newUlPost;
  renderLi(ulPost, state);
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

const makeModal = (state, openedId, i18nextInstance) => {
  const modaltitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const ReadButton = document.querySelector('.full-aricle');
  const openRssById = state.active.rss.find((item) => item.localId === openedId);
  modaltitle.textContent = openRssById.itemTitle;
  modalBody.innerHTML = openRssById.itemDescription;
  ReadButton.setAttribute('href', openRssById.itemLink);
  ReadButton.textContent = i18nextInstance.t('modal.continueReading');
};
const render = (state, elements, i18nextInstance) => (path, value) => {
  switch (value) {
    case 'invalid':
      makeStatus('invalid', state, elements, i18nextInstance);
      break;

    case 'feeding':
      makeStatus('feeding', state, elements, i18nextInstance);
      break;
    case 'parseComplete':
      parseFeeds(state, elements, i18nextInstance);
      parsePosts(state, elements, i18nextInstance);
      makeStatus('success', state, elements, i18nextInstance);
      break;

    case 'updating': {
      const ul = elements.posts.querySelector('ul');
      renderLi(ul, state);
      break;
    }
    case 'opened': {
      makeOpened(getIdByPath(state, path));
      makeModal(state, getIdByPath(state, path), i18nextInstance);
      break;
    }
    default:
      break;
  }
};

export default render;
