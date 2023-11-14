const renderLi = (ul, state) => {
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
    ul.prepend(liPost);
  });
};

const makeStatus = (stateStatus, state, elements) => {
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
      feedback.innerHTML = 'Идет загрузка...';
      break;
    case 'success':
      elements.formInput.classList.remove('is-invalid');
      elements.formInput.focus();
      feedback.classList.remove('text-danger', 'text-light');
      feedback.classList.add('text-success');
      feedback.innerHTML = state.status;
      elements.form.reset();
      break;
    default:
      throw new Error(`Invalid status ${stateStatus}`);
  }
};
const parseFeeds = (state) => {
  const feeds = document.querySelector('.feeds');
  const divFeeds = feeds.querySelector('.card') ?? document.createElement('div');
  divFeeds.classList.add('border-0', 'card');
  divFeeds.innerHTML = `
    <div class="card-body">
    <div class="card-title text-end h4">Фиды</div>
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

const parsePosts = (state) => {
  parseFeeds(state);
  const posts = document.querySelector('.posts');
  const divPosts = posts.querySelector('.card') ?? document.createElement('div');
  divPosts.classList.add('border-0', 'card');
  divPosts.innerHTML = `
        <div class="card-body">
        <div class="card-title h4">Посты</div>
    `;
  const newUlPost = document.createElement('ul');
  newUlPost.classList.add('list-group');
  const ulPost = divPosts.querySelector('ul') ?? newUlPost;
  renderLi(ulPost, state);
  divPosts.append(ulPost);
  posts.prepend(divPosts);
};

const render = (state, elements) => (path, value) => {
  switch (value) {
    case 'invalid':
      makeStatus('invalid', state, elements);
      break;

    case 'feeding':
      makeStatus('feeding', state, elements);
      break;
    case 'parseComplete':
      parseFeeds(state);
      parsePosts(state);
      makeStatus('success', state, elements);
      break;

    case 'updating': {
      const posts = document.querySelector('.posts');
      const ul = posts.querySelector('ul');
      ul.innerHTML = '';
      renderLi(ul, state);
      break;
    }
    case 'opened': {
      const propByPath = path.split('.').slice(0, -1).reduce((acc, cur) => acc?.[cur], state);
      const openedId = propByPath.localId;
      const aById = document.querySelector(`a[data-id="${openedId}"]`);
      aById.classList.remove('fw-bold');
      aById.classList.add('fw-normal', 'text-secondary');
      const modaltitle = document.querySelector('.modal-title');
      const modalBody = document.querySelector('.modal-body');
      const ReadButton = document.querySelector('#read');
      const openRssById = state.active.rss.find((item) => item.localId === openedId);
      modaltitle.textContent = openRssById.itemTitle;
      modalBody.innerHTML = openRssById.itemDescription;
      ReadButton.setAttribute('onclick', `window.location.href = "${openRssById.itemLink}"`);
      break;
    }
    default:
      break;
  }
};

export default render;
