(function () {
  "use strict";

  // *** Variables ***

  let gameBoardArr = [null, null, null, null, null, null, null, null, null];

  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const messages = {
    playerTurn:
      'It\'s <span class="font-bold"><span class="visibility-hidden">not</span> your</span> turn',
    computerTurn: 'It\'s <span class="font-bold">not your</span> turn',
    playerWon: '<span class="font-bold">You Won!</span>',
    computerWon: '<span class="font-bold">Computer Won!</span>',
    tie: "<span class='font-bold'>It's a Tie!</span>",
    player1Turn: 'It\'s <span class="font-bold">Player1</span> turn',
    player2Turn: 'It\'s <span class="font-bold">Player2</span> turn',
    player1Won: '<span class="font-bold">Player1 Won!</span>',
    player2Won: '<span class="font-bold">Player2 Won!</span>',
  };

  let pVsPMode = false;
  let pVsCMode = true;

  let playerWinsCount = 0;
  let computerWinsCount = 0;
  let pVsCTiesCount = 0;
  let player1WinsCount = 0;
  let player2WinsCount = 0;
  let pVsPTiesCount = 0;

  // This variable keeps track of the firstMove in the last game using which we can decide who is going to make the firstMove in the current game

  let lastGameFirstMove;

  let pVsPLastMove;

  // *** DOM Elements ***

  const messageElement = document.querySelector("#message").firstElementChild;

  const boxElementsArr = Array.from(document.querySelectorAll(".box"));

  const overlayElement = document.querySelector("#overlay");

  const playerScoreElement = document.querySelector("#player-score");

  const computerScoreElement = document.querySelector("#computer-score");

  const tieScoreElement = document.querySelector("#tie-score");

  const gameModeBtn = document.querySelector("#game-mode-btn");

  // *** Functions ***

  function updateMessage(message) {
    messageElement.innerHTML = message;
  }

  function tieEffect() {
    boxElementsArr.forEach((boxElement) => {
      boxElement.classList.add("tie-effect");
    });

    setTimeout(() => {
      boxElementsArr.forEach((boxElement) => {
        boxElement.classList.remove("tie-effect");
      });
    }, 2000);
  }

  function winEffect(winIndexesArr) {
    boxElementsArr.forEach(function (box, i) {
      if (!winIndexesArr.includes(i)) {
        box.firstElementChild.style.opacity = "0.35";
      }
    });
  }

  function resetGame() {
    gameBoardArr = [null, null, null, null, null, null, null, null, null];
    boxElementsArr.forEach(function (box) {
      box.firstElementChild.src = "";
      box.firstElementChild.style.opacity = "1";
    });
  }

  function updateScore(winner) {
    if (pVsCMode) {
      if (winner === "x") {
        playerWinsCount++;
        playerScoreElement.lastElementChild.textContent = playerWinsCount;
      } else if (winner === "o") {
        computerWinsCount++;
        computerScoreElement.lastElementChild.textContent = computerWinsCount;
      } else {
        pVsCTiesCount++;
        tieScoreElement.lastElementChild.textContent = pVsCTiesCount;
      }
    } else {
      if (winner === "x") {
        player1WinsCount++;
        playerScoreElement.lastElementChild.textContent = player1WinsCount;
      } else if (winner === "o") {
        player2WinsCount++;
        computerScoreElement.lastElementChild.textContent = player2WinsCount;
      } else {
        pVsPTiesCount++;
        tieScoreElement.lastElementChild.textContent = pVsPTiesCount;
      }
    }
  }

  function checkTie() {
    if (gameBoardArr.indexOf(null) === -1) {
      tieEffect();
      return true;
    }
    return false;
  }

  function checkWin() {
    for (let i = 0; i < winPatterns.length; i++) {
      const position1 = winPatterns[i][0];
      const position2 = winPatterns[i][1];
      const position3 = winPatterns[i][2];

      if (
        gameBoardArr[position1] !== null &&
        gameBoardArr[position1] === gameBoardArr[position2] &&
        gameBoardArr[position1] === gameBoardArr[position3]
      ) {
        winEffect([position1, position2, position3]);
        return gameBoardArr[position1];
      }
    }

    return false;
  }

  function removeClickListenerFromBoxes() {
    boxElementsArr.forEach(function (box) {
      box.removeEventListener("click", handleBoxClick);
    });
  }

  function evaluateComputerMove() {
    // Evaluating a good move for computer

    for (let i = 1; i <= 2; i++) {
      const target = i === 1 ? "o" : "x";

      for (let j = 0; j < winPatterns.length; j++) {
        const arr = winPatterns[j].map(function (index) {
          return gameBoardArr[index];
        });

        const nullIndex = arr.indexOf(null);
        arr.sort();

        if (arr[0] === null && arr[1] === arr[2] && arr[1] === target) {
          return winPatterns[j][nullIndex];
        }
      }
    }

    // If a good move is not evaluated then sending some random index which is open

    let computerMoveIndex = Math.floor(Math.random() * 9);
    while (gameBoardArr[computerMoveIndex] !== null) {
      computerMoveIndex = Math.floor(Math.random() * 9);
    }
    return computerMoveIndex;
  }

  function makeComputerMove(computerMoveIndex) {
    // this condition is written just to handle a very rare exception (a rare behaviour by the end user) otherwise there is no need to write it
    // That rare behaviour is when the computer is about to make its move and the user suddenly changes the mode of the game
    if (pVsCMode) {
      gameBoardArr[computerMoveIndex] = "o";
      boxElementsArr[computerMoveIndex].firstElementChild.src =
        "./assets/images/circle.png";
      lastGameFirstMove = lastGameFirstMove || "o";
    }
  }

  function makePlayerMove(clickedBoxIndex) {
    gameBoardArr[clickedBoxIndex] = "x";
    boxElementsArr[clickedBoxIndex].firstElementChild.src =
      "./assets/images/cross.png";
    lastGameFirstMove = lastGameFirstMove || "x";
  }

  function makePlayer1Move(clickedBoxIndex) {
    gameBoardArr[clickedBoxIndex] = "x";
    boxElementsArr[clickedBoxIndex].firstElementChild.src =
      "./assets/images/cross.png";
    pVsPLastMove = "x";

    if (checkWin() === "x") {
      overlayElement.style.display = "block";
      updateScore("x");
      updateMessage(messages.player1Won);
    } else if (checkTie() === true) {
      overlayElement.style.display = "block";
      updateScore("tie");
      updateMessage(messages.tie);
    } else {
      updateMessage(messages.player2Turn);
    }
  }

  function makePlayer2Move(clickedBoxIndex) {
    gameBoardArr[clickedBoxIndex] = "o";
    boxElementsArr[clickedBoxIndex].firstElementChild.src =
      "./assets/images/circle.png";
    pVsPLastMove = "o";

    if (checkWin() === "o") {
      overlayElement.style.display = "block";
      updateScore("o");
      updateMessage(messages.player2Won);
    } else if (checkTie() === true) {
      overlayElement.style.display = "block";
      updateScore("tie");
      updateMessage(messages.tie);
    } else {
      updateMessage(messages.player1Turn);
    }
  }

  function handlePVsPMode(clickedBoxIndex) {
    if (lastGameFirstMove === "o") {
      if (pVsPLastMove === "o") {
        makePlayer1Move(clickedBoxIndex);
      } else if (pVsPLastMove === "x") {
        makePlayer2Move(clickedBoxIndex);
      }
    } else if (lastGameFirstMove === "x") {
      if (pVsPLastMove === "x") {
        makePlayer2Move(clickedBoxIndex);
      } else if (pVsPLastMove === "o") {
        makePlayer1Move(clickedBoxIndex);
      }
    }
  }

  function handlePVsCMode(clickedBoxIndex) {
    removeClickListenerFromBoxes();
    makePlayerMove(clickedBoxIndex);

    if (checkWin() === false && checkTie() === false) {
      updateMessage(messages.computerTurn);
      setTimeout(function () {
        makeComputerMove(evaluateComputerMove());
        if (checkWin() === false && checkTie() === false) {
          updateMessage(messages.playerTurn);
          addClickListenerOnBoxes();
        } else if (checkWin() === "o") {
          updateScore("o");
          updateMessage(messages.computerWon);
          overlayElement.style.display = "block";
        } else if (checkTie() === true) {
          updateScore("tie");
          updateMessage(messages.tie);

          overlayElement.style.display = "block";
        }
      }, 0.3 * 1000);
    } else if (checkWin() === "x") {
      updateScore("x");
      updateMessage(messages.playerWon);
      overlayElement.style.display = "block";
    } else if (checkTie() === true) {
      updateScore("tie");
      updateMessage(messages.tie);
      overlayElement.style.display = "block";
    }
  }

  function handleBoxClick() {
    const clickedBoxIndex = boxElementsArr.indexOf(this);

    const isClickedBoxEmpty = gameBoardArr[clickedBoxIndex] === null;

    // no code will be executed if the clicked box was not empty
    if (isClickedBoxEmpty && pVsCMode) {
      handlePVsCMode(clickedBoxIndex);
    } else if (isClickedBoxEmpty && pVsPMode) {
      handlePVsPMode(clickedBoxIndex);
    }
  }

  function addClickListenerOnBoxes() {
    boxElementsArr.forEach(function (box) {
      box.addEventListener("click", handleBoxClick);
    });
  }

  addClickListenerOnBoxes();

  // *** event Listeners ***

  overlayElement.addEventListener("click", function () {
    resetGame();
    overlayElement.style.display = "none";

    if (pVsCMode) {
      if (lastGameFirstMove === "x") {
        updateMessage(messages.computerTurn);
        setTimeout(function () {
          lastGameFirstMove = undefined;
          makeComputerMove(evaluateComputerMove());
          updateMessage(messages.playerTurn);
          addClickListenerOnBoxes();
        }, 0.3 * 1000);
      } else if (lastGameFirstMove === "o") {
        lastGameFirstMove = undefined;
        updateMessage(messages.playerTurn);
        addClickListenerOnBoxes();
      }
    } else if (pVsPMode) {
      if (lastGameFirstMove === "o") {
        lastGameFirstMove = "x";
        pVsPLastMove = "x";
        updateMessage(messages.player2Turn);
      } else if (lastGameFirstMove === "x") {
        lastGameFirstMove = "o";
        pVsPLastMove = "o";
        updateMessage(messages.player1Turn);
      }
    }
  });

  gameModeBtn.addEventListener("click", function () {
    resetGame();
    overlayElement.style.display = "none";
    lastGameFirstMove = undefined;
    if (pVsCMode === true) {
      pVsCMode = false;
      pVsPMode = true;
      lastGameFirstMove = "o";
      pVsPLastMove = "o";
      updateMessage(messages.player1Turn);
      playerScoreElement.firstElementChild.textContent = "Player1 (x)";
      playerScoreElement.lastElementChild.textContent = player1WinsCount;
      computerScoreElement.firstElementChild.textContent = "Player2 (o)";
      computerScoreElement.lastElementChild.textContent = player2WinsCount;
      tieScoreElement.lastElementChild.textContent = pVsPTiesCount;
      gameModeBtn.firstElementChild.textContent = "1P";
      gameModeBtn.title = "switch to player vs computer mode";
      addClickListenerOnBoxes();
    } else if (pVsPMode === true) {
      pVsPMode = false;
      pVsCMode = true;
      playerScoreElement.firstElementChild.textContent = "Player (x)";
      playerScoreElement.lastElementChild.textContent = playerWinsCount;
      computerScoreElement.firstElementChild.textContent = "Computer (o)";
      computerScoreElement.lastElementChild.textContent = computerWinsCount;
      tieScoreElement.lastElementChild.textContent = pVsCTiesCount;
      gameModeBtn.firstElementChild.textContent = "2P";
      gameModeBtn.title = "switch to player vs player mode";
      removeClickListenerFromBoxes();
      updateMessage(messages.computerTurn);
      setTimeout(function () {
        makeComputerMove(evaluateComputerMove());
        addClickListenerOnBoxes();
        updateMessage(messages.playerTurn);
      }, 0.3 * 1000);
    }
  });
})();
