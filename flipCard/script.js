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
let ID = 0;
let timerID = null;

setGame();

// line 186~190：bug的根源是异步操作数组。跪求更好的方法延迟翻卡。

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
  const allCards = document.querySelectorAll(".card");
  for (const card of allCards) {
    card.addEventListener("click", () => {
      bindCardClick(card);
    });
  }
  updateTimerDisplay();
}

function handleCardFlip(card) {
  card.classList.add("card--flipped");
}

function removeCardFlip(card) {
  card.classList.remove("card--flipped");
}

function nextLevel() {
  game.level += 1;
  game.levelDisplay.innerHTML = game.level;
  setTimeout(() => {
    updateScore();
    startGame();
  }, 1000);
}

function handleGameOver() {
  // calculate the score + show the score
  alert("Your final score is: " + game.score);
  // reset level and score and clock
  game.level = 1;
  game.score = 0;
  game.timer = 60;
  game.started = false;
  game.startButton.innerHTML = "New Game";
  clearInterval(timerID);
  while (game.board.firstChild) {
    game.board.removeChild(game.board.firstChild);
  }
  game.flipped = [];
  // bring back the instruction
  const board = document.querySelector(".game-board");
  const header = document.createElement("h3");
  header.className = 'game-instruction__header';
  const container = document.createElement("div");
  container.className = 'game-instruction';
  const instruction = document.createElement("p");
  instruction.className = 'game-instruction__content';
  header.innerHTML = "Instruction";
  instruction.innerHTML = "- Click on the card to view the back face of the card.<br />Get two exact same card to score.<br />- Score are based on the time and level. <br />- You only have 60s for each level. <br />- There are three levels, '2x2', '4x4' and '6x6'. <br />- Press 'Start Game' button when you are ready."
  container.appendChild(header);
  container.appendChild(instruction);
  board.appendChild(container);
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
  if (!timerID) {
    timerID = setInterval(() => {
      game.timer--;
      game.timerDisplay.innerHTML = game.timer + " seconds";
      if (game.timer <= 0) {
        handleGameOver();
      }
    }, 1000);
  } else {
    clearInterval(timerID);
    timerID = setInterval(() => {
      game.timer--;
      game.timerDisplay.innerHTML = game.timer + " seconds";
      if (game.timer <= 0) {
        handleGameOver();
      }
    }, 1000);
  }
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
  card.removeEventListener('click', bindCardClick);
}

function bindCardClick(card) {
  const match = game.flipped.find((c) => {
    // tag is identical but ID is not
    return c.classList.contains(card.classList[1]) && 
      c.classList[3] !== card.classList[3];
  });
  // flip first card of this new pair
  if (!(game.flipped.length & 1)) {
    handleCardFlip(card);
    game.flipped.push(card);
  } 
  // flip second card of this new pair if they form a pair
  else if ((game.flipped.length & 1) && match) {
    handleCardFlip(card);
    game.flipped.push(card);
    unBindCardClick(card);
    unBindCardClick(match);
  }
  // this card cannot form a pair with previous card
  else if ((game.flipped.length & 1) && !match) {
    // flip it first
    handleCardFlip(card);
    // un-flip it later
    setTimeout(() => {
      removeCardFlip(card);
      removeCardFlip(game.flipped[game.flipped.length-1]);
        game.flipped.pop();
    }, 800);
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
  let container = [];
  for (const tag of cards) {
    const card = document.createElement("div");
    const front = document.createElement("div");
    const back = document.createElement("div");
    card.classList.add("card", tag);
    front.classList.add("card__face", "card__face--front");
    back.classList.add("card__face", "card__face--back");
    card.appendChild(front);
    card.appendChild(back);
    // bind new cards
    const temp = card.cloneNode(true);
    card.classList.add("ID", ID++);
    container.push(card);
    temp.classList.add("ID", ID++);
    container.push(temp);
  }
  // shuffle all cards
  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  container = shuffle(container);
  for (const card of container) {
    game.board.appendChild(card);
  }
  // renew clock
  game.timer = 60;
  game.timerDisplay.innerHTML = 60 + " seconds";
  // renew texts
  game.levelDisplay.innerHTML = game.level;
  game.startButton.innerHTML = "End it!"
}

function checkIfWin() {
  const num = cardNum.get(game.level) * 2;
  if (game.flipped.length === num) {
    nextLevel();
  }
}