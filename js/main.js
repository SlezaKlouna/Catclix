'use sctrict';
const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const SERVER = 'https://api.themoviedb.org/3';
const API_KEY = '8bffdb1a20e73bdd27d68bab1fb8a35d'

const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
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
        return this.getData(`${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU`);
    }

    getTvShow = id => {
        return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`)
    }
}

// console.log(new DBConnect().getSearchResult('Няня'));

const renderCard = data => {
    // console.log(data.results);
    tvShowListEl.textContent = '';
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
<!--                <span class="tv-card__vote">${voteElem}</span>-->
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

        // console.log(card);
    });
}

searchForm.addEventListener('submit', ev => {
    ev.preventDefault();
    // console.log(ev)
    const value = searchFormInput.value.trim();
    searchFormInput.value = ''
    if (value){
        tvShows.append(loader);
        new DBConnect().getSearchResult(value).then(renderCard);
    }
})

// {
//     new DBConnect().getTestData().then(renderCard);
//     tvShows.append(loader);
// }

hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
});

document.addEventListener('click', ev => {
    if (!ev.target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
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
});

// Modal window

tvShowListEl.addEventListener('click', ev => {
    ev.preventDefault();
    const target = ev.target;
    const card = target.closest('.tv-card');
    if (card){
        new DBConnect().getTvShow(card.id)
            .then(({name : title,
                    poster_path: poster,
                    vote_average: vote,
                    overview,
                    homepage,
                    genres
                   }) => {
                console.log(poster)
                tvCardImg.src = IMG_URL + poster;
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

tvShowListEl.addEventListener('mouseover', changeImage)
tvShowListEl.addEventListener('mouseout', changeImage);

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