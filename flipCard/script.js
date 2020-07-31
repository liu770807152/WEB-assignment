// css class for different card image
const CARD_TECHS = [
  'html5',
  'css3',
  'js',
  'sass',
  'nodejs',
  'react',
  'linkedin',
  'heroku',
  'github',
  'aws'
];

// only list out some of the properties,
// add more when needed
const game = {
  score: 0,
  level: 1,
  timer: 60,
  started: false,
  board: null,
  timerDisplay: null,
  scoreDisplay: null,
  levelDisplay: null,
  timerInterval: null,
  startButton: null,
  flipped: []
};

const cardNum = new Map([[1, 2], [2, 8], [3, 18]]);
// let curCard = null;
let ID = 0;
let timerID = null;

setGame();

// unbind + handleFlip + handleGameOver

/*******************************************
/     game process
/******************************************/
function setGame() {
  // register any element in your game object
  game.timerDisplay = document.querySelector(".game-timer__bar");
  game.scoreDisplay = document.querySelector(".game-stats__score--value");
  game.levelDisplay = document.querySelector(".game-stats__level--value");
  game.startButton = document.querySelector(".game-stats__button");
  game.board = document.querySelector(".game-board");
  game.timerInterval = updateTimerDisplay;
  game.startButton.addEventListener("click", bindStartButton);
  
}

function startGame() {
  const cards = createCards();
  reset(cards);
  updateTimerDisplay();

}

function handleCardFlip(card) {

}

function nextLevel() {
  game.level += 1;
  game.levelDisplay.innerHTML = game.level;
  updateScore();
  startGame();
}

function handleGameOver() {
  // calculate the score

  // show the score

  // reset level and score and clock

  // start over again
  setGame();
}

/*******************************************
/     UI update
/******************************************/
function updateScore() {
  game.score += Math.pow(game.level, 2) * game.timer;
  game.scoreDisplay.innerHTML = game.score;
}

function updateTimerDisplay() {
  timerID = setInterval(() => {
    game.timer--;
    game.timerDisplay.innerHTML = game.timer + " seconds";
    if (game.timer <= 0) {
      handleGameOver();
    }
  }, 1000);
}

/*******************************************
/     bindings
/******************************************/
function bindStartButton() {
  if (!game.started) {
    game.started = true;
    startGame();
  } else {
    game.started = false;
    handleGameOver();
  }
}

function unBindCardClick(card) {

}

function bindCardClick(card) {
  const match = game.flipped.find((c) => {
    return c.classList.contains(card.classList[0]) && 
      c.classList[1] !== card.classList[1];
  });
  function findCard(c) {
    const findIt = game.flipped.find((c) => {
      c.classList.contains(card.classList[0]);
    });
    return findIt(c);
  }
  if (!findCard(card)) {
    handleCardFlip(card);
    game.flipped.push(card);
    // curCard = card;
  } else if (findCard(card) && match) {
    handleCardFlip(card);
    unBindCardClick(card);
    unBindCardClick(match);
    // curCard = null;
  } else if (findCard(card) && !match) {
    return;
  }
  setInterval(() => {
    if (checkIfWin()) {
      nextLevel();
    }
  }, 1000);
}


/*******************************************
/     additional functions
/******************************************/
function createCards() {
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const num = cardNum.get(game.level);
  const cards = shuffle(CARD_TECHS);
  let temp;
  if (game.level < 3) {
    temp = cards.slice(0, num);
  } else {
    temp = cards.concat(cards.slice(0, num-10));
  }
  const length = temp.length;
  for (let i = 0; i < length; i++) {
    temp.push(temp[i].cloneNode(true));
  }
  return temp;
}

function reset(cards) {
  // remove all previous cards
  while (game.board.firstChild) {
    game.board.removeChild(game.board.firstChild);
  }
  game.flipped = [];
  // remake game board
  const columns = game.level * 2;
  game.board.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  game.board.style.gridTemplateRows = `repeat(${columns}, 1fr)`;
  // add new cards
  for (const tag of cards) {
    const card = document.createElement("div");
    const front = document.createElement("div");
    const back = document.createElement("div");
    card.classList.add("card", tag);
    card.classList.add("ID", ID++);
    front.classList.add("card__face", "card__face--front");
    back.classList.add("card__face", "card__face--back");
    card.appendChild(front);
    card.appendChild(back);
    game.board.appendChild(card);
    // bind new cards
    card.addEventListener("click", () => {
      bindCardClick(this);
    });
  }
  // renew clock
  game.timer = 60;
  // renew texts
  game.levelDisplay.innerHTML = game.level;
  game.startButton.innerHTML = "End it!"
}

function checkIfWin() {

}