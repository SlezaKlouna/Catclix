'use sctrict';
const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const SERVER = 'https://api.themoviedb.org/3';
const API_KEY = '8bffdb1a20e73bdd27d68bab1fb8a35d'

const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const dropdown = document.querySelectorAll('.dropdown')
const tvShowListEl = document.querySelector('.tv-shows__list');
const modal = document.querySelector('.modal');
const voteSpan = document.querySelector('.tv-card__vote');
const tvShows = document.querySelector('.tv-shows');

const tvCardImg = document.querySelector('.tv-card__img');

const modalTitle = document.querySelector('.modal__title')
const genresList = document.querySelector('.genres-list')
const rating = document.querySelector('.rating')
const description = document.querySelector('.description')
const modalLink = document.querySelector('.modal__link')

const searchForm = document.querySelector('.search__form');
const searchFormInput = document.querySelector('.search__form-input');

const loader = document.createElement('div');
loader.className = 'loading';

const preloader = document.querySelector('.preloader');
const tvShowsHead = document.querySelector('.tv-shows__head');
const pagination = document.querySelector('.pagination');

class DBConnect {
    getData = async (url) => {
        const res = await fetch(url);
        if (res.ok){
            return res.json();
        } else {
            throw new Error(`Failed to access data ${url}`)
        }
    }
    getTestData = () => {
        return this.getData('test.json');
    }

    getTestCard = () => {
        return this.getData('card.json');
    }

    getSearchResult = query => {
        this.temp = `${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU`;
        return this.getData(this.temp);
    }

    getNextPage = page => {
        return this.getData(this.temp + '&page=' + page);
    }

    getTvShow = id => {
        return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`)
    }

    // getTopRated = () => {
    //     this.temp = `${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-RU`;
    //     this.getData(this.temp + '&page=' + page)
    // }

    getTopRated = () => this.getData(`${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-RU`)
    getPopular = () => this.getData(`${SERVER}/tv/popular?api_key=${API_KEY}&language=ru-RU`)
    getWeek = () => this.getData(`${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=ru-RU`)
    getToday = () => this.getData(`${SERVER}/tv/airing_today?api_key=${API_KEY}&language=ru-RU`)
}
const dbConnect = new DBConnect();
// console.log(new DBConnect().getSearchResult('Няня'));

const renderCard = (data, target) => {
    tvShowListEl.textContent = '';

    if (!data.total_results){
        loader.remove();
        tvShowsHead.textContent = 'К сожалению по вашему запросу ничего не найдено...';
        tvShowsHead.style.cssText = 'color: red; text-transform: uppercase;';
        return;
    }

    tvShowsHead.textContent = target ? target.textContent : 'Результат поиска...';
    tvShowsHead.style.cssText = 'color: #363636; text-transform: uppercase;';

    data.results.forEach(item => {
        const { backdrop_path : backdrop,
                name : title,
                poster_path: poster,
                vote_average: vote,
                id
        } = item

        const posterBg = poster ? IMG_URL + poster : 'img/no-poster.jpg';
        const backdropImg = backdrop ? IMG_URL + backdrop : '';
        const voteElem = vote ? ` <span class="tv-card__vote">${vote}</span>` :  '';

        const card = document.createElement('li');
        card.classList.add('tv-shows__item');
        // data-backdrop="${IMG_URL + backdrop}"
        card.idTV = id;
        card.innerHTML = `
            <a href="#" id="${id}" class="tv-card">
                ${voteElem}
                <img class="tv-card__img"
                    src="${posterBg}"
                    data-backdrop="${backdropImg}"
                    alt="${title}">
                <h4 class="tv-card__head">${title}</h4>
            </a>
        `
        loader.remove();
        tvShowListEl.append(card);
    });
    // Pagination
    pagination.textContent = '';
    if (!target && data.total_pages > 1){
        for (let i = 1; i <= data.total_pages; i++){
            pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`;
        }
    }
}

searchForm.addEventListener('submit', ev => {
    ev.preventDefault();
    const value = searchFormInput.value.trim();
    searchFormInput.value = ''
    if (value){
        tvShows.append(loader);
        dbConnect.getSearchResult(value).then(renderCard);
    }
})

const closeDropdown = () => {
    dropdown.forEach(item => {
        item.classList.remove('active');
    })
}

hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
    closeDropdown();
});

document.addEventListener('click', ev => {
    if (!ev.target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
        closeDropdown();
    }
});

leftMenu.addEventListener('click', ev => {
    const target = ev.target;
    const dropdown = target.closest('.dropdown');
    if (dropdown){
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }
    if (target.closest('#top-rated')){
        tvShows.append(loader);
        dbConnect.getTopRated().then(data => renderCard(data, target));
    }
    if (target.closest('#popular')){
        tvShows.append(loader);
        dbConnect.getPopular().then(data => renderCard(data, target));
    }
    if (target.closest('#week')){
        tvShows.append(loader);
        dbConnect.getWeek().then(data => renderCard(data, target))
    }
    if (target.closest('#today')){
        tvShows.append(loader);
        dbConnect.getToday().then(data => renderCard(data, target))
    }
    if (target.closest('#search')){
        tvShowListEl.textContent = ''
        tvShowsHead.textContent = ''
    }
});


// Modal window

tvShowListEl.addEventListener('click', ev => {
    ev.preventDefault();
    const target = ev.target;
    const card = target.closest('.tv-card');
    if (card){
        preloader.style.display = 'block';
        dbConnect.getTvShow(card.id)
            .then(({name : title,
                    poster_path: poster,
                    vote_average: vote,
                    overview,
                    homepage,
                    genres
                   }) => {
                if (poster){
                    tvCardImg.src = IMG_URL + poster;
                    // posterWrapper.style.display = '';
                    // modalContent.style.paddingLeft = '';
                } else {
                    tvCardImg.src = 'img/no-poster.jpg'
                    // posterWrapper.style.display = 'none';
                    // modalContent.style.paddingLeft = '30px';
                }
                modalTitle.textContent = title;
                genresList.textContent = '';
                genresList.innerHTML = genres.reduce((acc, item) => `${acc} <li>${item.name}</li>`, '');
                rating.textContent = vote;
                description.textContent = overview;
                modalLink.href = homepage;
            })
            .then(() => {
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
            })
            .finally(() => {
                preloader.style.display = 'none';
            })
    }
});

modal.addEventListener('click', ev => {
    const target = ev.target;
    const cross = target.closest('.cross');
    const modalClass = target.classList.contains('modal');
    if (cross || modalClass){
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
})

// \ Modal

// Change card background

const changeImage = ev => {
  const card = ev.target.closest('.tv-shows__item');
    if (card) {
        const img = card.querySelector('.tv-card__img');
        const changeImg = img.dataset.backdrop;
        if (changeImg) {
            img.dataset.backdrop = img.src;
            img.src = changeImg;
        }
    }
};

tvShowListEl.addEventListener('mouseover', changeImage);
tvShowListEl.addEventListener('mouseout', changeImage);

pagination.addEventListener('click', ev => {
    ev.preventDefault();
    const target = ev.target;
    if (target.classList.contains('pages')){
        tvShows.append(loader);
        dbConnect.getNextPage(target.textContent).then(renderCard);
    }
})

// My variable
// tvShowListEl.addEventListener('click', onClickTvShowList);
// function onClickTvShowList(e) {
//     switch (true) {
//         case e.target.classList.contains('tv-card__img'):
//             const attrSrc = getValueAttr(e.target);
//             setNewSrcImg(e.target, attrSrc);
//     }
// }
// function getValueAttr(imgEl) {
//     return imgEl.getAttribute('data-backdrop');
// }
// function setNewSrcImg(imgEl, newSrc) {
//     imgEl.setAttribute('src', newSrc);
// }
// \ My variable
// \ Change card background

// Отписки от событий
hamburger.removeEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
});

tvShows.removeEventListener('mouseover', changeImage)