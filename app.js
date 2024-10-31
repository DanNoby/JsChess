const gameBoard = document.querySelector("#gameboard");
const playerDisplay = document.querySelector("#player");
const infoDisplay = document.querySelector("#info-display");
const width = 8;

let playerGo = 'black';
playerDisplay.textContent = 'black';

const startPieces = [
  rook, knight, bishop, queen, king, bishop, knight, rook,
  pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
  '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
  rook, knight, bishop, queen, king, bishop, knight, rook
]

function createBoard() {
  startPieces.forEach((startPiece, i) => {
    const square = document.createElement('div');
    square.classList.add('square');
    
    square.innerHTML = startPiece;
    square.firstChild?.setAttribute('draggable', true);

    square.setAttribute('square-id', i);
    const row = Math.floor((63 - i) / 8) + 1;
    if (row % 2 == 0) {
      square.classList.add(i % 2 == 0 ? "beige" : "brown");
    } else {
      square.classList.add(i % 2 == 0 ? "brown" : "beige");
    }
    
    if (i <= 15 && square.firstChild) {
      square.firstChild.firstChild.classList.add('black');
    }
    if (i >= 48 && square.firstChild) {
      square.firstChild.firstChild.classList.add('white');
    }

    gameBoard.append(square);
  });
}
createBoard();

const allSquares = document.querySelectorAll(".square");
allSquares.forEach(square => {
  square.addEventListener('dragstart', dragStart);
  square.addEventListener('dragover', dragOver);
  square.addEventListener('drop', dragDrop);
});

let startPositionId;
let draggedElement;

function dragStart(e) {
  startPositionId = e.target.parentNode.getAttribute('square-id');
  draggedElement = e.target;
}

function dragOver(e) {
  e.preventDefault();
}

function dragDrop(e) {
  e.stopPropagation();
  const target = e.target.classList.contains('piece') ? e.target.parentNode : e.target;
  
  const correctGo = draggedElement.firstChild.classList.contains(playerGo);
  const taken = target.hasChildNodes();
  const valid = checkIfValid(target); // Assuming isValid() is defined elsewhere 
  const opponentGo = playerGo === 'white' ? 'black' : 'white';
  const takenByOpponent = taken && target.firstChild.firstChild.classList.contains(opponentGo);

  if (correctGo) {
    if (takenByOpponent && valid) {
      target.innerHTML = '';
      target.appendChild(draggedElement);
      checkForWin();
      changePlayer();
      return;
    }
    if (taken && !takenByOpponent) {
      infoDisplay.textContent = 'You cannot go here!';
      setTimeout(() => infoDisplay.textContent = "", 2000);
      return;
    }
    if (valid) {
      target.appendChild(draggedElement);
      checkForWin();
      changePlayer();
      return;
    }
  }
  infoDisplay.textContent = 'Invalid move!';
  setTimeout(() => infoDisplay.textContent = "", 2000);
}

function changePlayer() {
  if (playerGo === "black") {
    reverseIDs();
    playerGo = "white";
    playerDisplay.textContent = 'white';
  } else {
    revertIds();
    playerGo = "black";
    playerDisplay.textContent = 'black';
  }
}

function reverseIDs() {
  const allSquares = document.querySelectorAll(".square");
  allSquares.forEach((square, i) => square.setAttribute('square-id', (width * width - 1) - i));
}

function revertIds() {
  const allSquares = document.querySelectorAll(".square");
  allSquares.forEach((square, i) => square.setAttribute('square-id', i));
}

function checkForWin() {
  const kings = Array.from(document.querySelectorAll('#king'))
  console.log(kings)
  if(!kings.some(king => king.firstChild.classList.contains('white'))) {
    infoDisplay.innerHTML = 'Black player wins';
    const allSquares = document.querySelectorAll('.square')
    allSquares.forEach(square => square.firstChild?.setAttribute('draggable',false))
  }
  if(!kings.some(king => king.firstChild.classList.contains('black'))) {
    infoDisplay.innerHTML = 'White player wins';
    const allSquares = document.querySelectorAll('.square')
    allSquares.forEach(square => square.firstChild?.setAttribute('draggable',false))
  }
}

function checkIfValid(target) {
  const targetId = Number(target.getAttribute('square-id'));
  const startId = Number(startPositionId);
  const piece = draggedElement.id;

  switch (piece) {
    case 'pawn':
      const starterRow = [8,9,10,11,12,13,14,15]
      if (
        starterRow.includes(startId) && startId + width*2 === targetId ||
        startId + width === targetId && !document.querySelector(`[square-id="${startId+width}"]`).firstChild ||
        startId + width + 1 === targetId && document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild ||
        startId + width - 1 === targetId && document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild
      ) {
        return true;
      }
      break;

    case 'knight':
      if (
          (Math.abs(Math.floor(startId / 8) - Math.floor(targetId / 8)) === 1 && Math.abs(startId % 8 - targetId % 8) === 2) ||
          (Math.abs(Math.floor(startId / 8) - Math.floor(targetId / 8)) === 2 && Math.abs(startId % 8 - targetId % 8) === 1)
      ) {
          return true;
      }
      break;

    case 'bishop':
      function bishop() {
        let colDel = Math.abs(Math.floor(startId/8) - Math.floor(targetId/8));
        let rowDel = Math.abs((startId % 8) - (targetId % 8));
        if(colDel !== rowDel) return false;

        let rowVec = Math.floor(targetId / 8) > Math.floor(startId / 8) ? 1 : -1;
        let colVec = (targetId % 8) > (startId % 8) ? 1 : -1;

        let temp = startId;
        while(temp !== targetId) {
          temp += 8 * rowVec + colVec;
          if(document.querySelector(`[square-id="${temp}"]`).firstChild && temp!==targetId) {
            return false;
          }
        }
        return true;
      };
      return bishop();

    case 'rook':
      function rook() {
        let tempId, increment;
        tempId = startId;

        if(startId % 8 == targetId % 8) {
          increment = (startId < targetId) ? 8 : -8;
        }
        else if(Math.floor(startId/8) == Math.floor(targetId/8)) {
          increment = (startId < targetId) ? 1 : -1;
        }
        else {
          return false;
        }

        while(tempId !== targetId) {
          tempId += increment;
          if(document.querySelector(`[square-id="${tempId}"]`).firstChild && tempId!==targetId) {
            return false;
          }
        }
        return true;
      }
      return rook();

    case 'queen':
      if(bishop() || rook()) {
        return true;
      }
      else return false;

    case 'king':
      if(
        startId + 1 === targetId ||
        startId - 1 === targetId ||
        startId + width === targetId ||
        startId - width === targetId ||
        startId + width + 1 === targetId ||
        startId + width - 1 === targetId ||
        startId - width + 1 === targetId ||
        startId - width - 1 === targetId 
      ) {
        return true;
      }
      break;
  }
  return false;
}


