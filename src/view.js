const render = (state, elements) => {
  const feedback = document.querySelector('.feedback');
  if (state.inputUrlForm.state === 'invalid') {
    const [err] = state.errors;
    elements.formInput.classList.add('is-invalid');
    feedback.classList.remove('text-success', 'text-light');
    feedback.classList.add('text-danger');
    feedback.innerHTML = err;
  } else if (state.inputUrlForm.state === 'feeding') {
    elements.formInput.classList.remove('is-invalid');
    feedback.classList.remove('text-succes', 'text-danger');
    feedback.classList.add('text-light');
    feedback.innerHTML = 'Идет загрузка...';
  } else if (state.inputUrlForm.state === 'parseComplete') {
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
    state.active.rss.forEach(({
      itemTitle, itemLink, localId,
    }) => {
      const liPost = document.createElement('li');
      liPost.classList.add('justify-content-between', 'list-group-item', 'd-flex', 'align-items-start', 'border-0');
      liPost.innerHTML = `
                        <a href="${itemLink}" class="text-decoration-none fw-normal text-dark" data-id="${localId}">${itemTitle}</a>
                        <button type="button" class="btn btn-secondary" data-id="${localId}">Просмотр</button>               
      `;
      ulPost.prepend(liPost);
    });
    divPosts.append(ulPost);
    posts.prepend(divPosts);
    elements.formInput.classList.remove('is-invalid');
    elements.formInput.focus();
    feedback.classList.remove('text-danger', 'text-light');
    feedback.classList.add('text-success');
    feedback.innerHTML = state.status;
    elements.form.reset();
  }
};

export default render;
