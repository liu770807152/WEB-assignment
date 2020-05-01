// all card tags
const CARD_TAGS = [
    'html5',
    'css3',
    'sass',
    'js',
    'nodejs',
    'linkedin',
    'heroku',
    'aws',
    'github',
    'react'
];

let clock = 60;  // timer
let timerId = null;  // we need the id of upper clock to use clearTimeOut()
let alreadyStart = false; // boolean to show game is started or not
let flipped = []; // store all flipped cards
let id = 0; // unique id of a card

const gameStatus = {
    score: 0,
    level: 1,
    board: null,
    timeShow: null,
    scoreShow: null,
    levelShow: null,
    startButton: null,
    totalCards: 0,
    flippedCards: 0,
};

// initial entry of game
function run() {
    gameStatus.board = document.querySelector('.game-board');
    gameStatus.timeShow = document.querySelector('.game-timer__bar');
    gameStatus.scoreShow = document.querySelector('.game-stats__score--value');
    gameStatus.levelShow = document.querySelector('.game-stats__level--value');
    gameStatus.startButton = document.querySelector('.game-stats__button');
    //binding
    gameStatus.startButton.addEventListener('click', () => {
        if (!alreadyStart) {
            alreadyStart = true;
            start();
        } else {
            alreadyStart = false;
            end();
        }
    });
}

// start the current level of game
function start() {
    // clear the board
    const { board } = gameStatus;
    while(board.firstChild) {
        board.removeChild(board.firstChild);
    }
    // create cards
    const columns = gameStatus.level * 2;
    gameStatus.totalCards = columns * columns;
    const cards = [];
    gameStatus.board.style.gridTemplateColumns = `repeat(${columns},1fr)`;
    gameStatus.board.style.gridTemplateRows = `repeat(${columns}, 1fr)`;
    for(let i = 0; i < gameStatus.totalCards / 2; i++){
        let tag = CARD_TAGS[i % CARD_TAGS.length];
        const card = fetchCard(tag);
        cards.push(card);
        cards.push(card.cloneNode(true));
    }
    while(cards.length) {
        let randomIndex = Math.floor(Math.random()*cards.length);
        let card = cards.splice(randomIndex, 1)[0];
        gameStatus.board.appendChild(card);
    }
    if (gameStatus.level === 1) {
        updateTimer();
    }
    bindCard();
    // set all variables
    clock = gameStatus.level * 60;
    gameStatus.startButton.innerHTML = 'End game!';
    gameStatus.levelShow.innerHTML = gameStatus.level;
    gameStatus.scoreShow.innerHTML = gameStatus.score;

}

//end the game
function end() {
    gameStatus.startButton.innerHTML = 'Start Game!';
    clearTimeout(timerId);
    alert('Game\'s over! Your score is: ' + gameStatus.score);
    gameStatus.flippedCards = 0;
    gameStatus.level = 1;
    gameStatus.score = 0;
    gameStatus.levelShow.innerHTML = gameStatus.level;
    gameStatus.scoreShow.innerHTML = gameStatus.score;
    clock = gameStatus.level * 60;
    gameStatus.timeShow.innerHTML = clock + ' seconds';
    gameStatus.timeShow.style.width = clock / (60 * gameStatus.level) * 100 + '%';
}

// give all cards ability to flip
function bindCard() {
    let cards = document.querySelectorAll('.card');
    for(let i = 0; i < cards.length; i++) {
        cards[i].addEventListener('click', flipCard);
    }
}

// disable ability to flip for a card
function unBindCard(card) {
    card.removeEventListener('click', flipCard);
}

function updateTimer() {
    if (clock === 0) {
        end();
    } else {
        clock -= 1;
        gameStatus.timeShow.innerHTML = clock + ' seconds';
        gameStatus.timeShow.style.width = clock / (60 * gameStatus.level) * 100 + '%';
        timerId = setTimeout(updateTimer, 1000);
    }
}

function levelUp() {
    gameStatus.level += 1;
    gameStatus.levelShow.innerHTML = gameStatus.level;
    start();
}

// assign the card with a unique tag and two states
function fetchCard(tag) {
    let card = document.createElement('div');
    let cardFront = document.createElement('div');
    let cardRear = document.createElement('div');
    cardFront.classList.add('card__face','card__face--front');
    cardRear.classList.add('card__face','card__face--back');
    card.classList.add('card', tag);
    card.appendChild(cardFront);
    card.appendChild(cardRear);
    card.dataset.tag = tag;
    card.classList.add(id);
    id++;
    return card;
}

function flipCard() {
    let duplicate = false;
    // check if there's a duplicate card in array 'flipped' with its id
    flipped.forEach((card) => {
        if (card.classList[2] === this.classList[2]) {
            duplicate = true;
        }})
    // nothing or a some pairs of cards in array
    if (flipped.length % 2 === 0) {
        flipped.push(this);
        this.classList.add("card--flipped");
    // if find a pair
    } else if (duplicate) {
        gameStatus.flippedCards += 2;
        flipped.push(this);
        this.classList.add("card--flipped");
        // can't flip back the flipped cards
        flipped.forEach((card) => {
            unBindCard(card);
        });
        // if all cards are flipped, head to next level or win
        if (gameStatus.flippedCards === gameStatus.totalCards) {
            if (gameStatus.level < 2) {
                alert('Congrats! Let\'s move on to next level!');
                levelUp();
            } else {
                alert('Congrats! You win!');
                end();
            }
            calScore();
            flipped = [];
            gameStatus.flippedCards = 0;
        }
    // if doesn't find a pair
    } else if (!duplicate) {
        this.classList.add("card--flipped");
        //按得太快的话，会有些bug，原因不明，求赐教
        setTimeout(() => {
            this.classList.remove("card--flipped");
            flipped[flipped.length-1].classList.remove("card--flipped");
            flipped.pop();
        }, 300);
    }
}

function calScore() {
    // 越快越多分
    gameStatus.score += gameStatus.level * clock;
    gameStatus.scoreShow.innerHTML = gameStatus.score;
}

run();