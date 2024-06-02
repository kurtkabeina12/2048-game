import { Grid } from "./grid.js";
import { Tile } from "./tile.js";

const gameBoard = document.getElementById("game-board");

const grid = new Grid(gameBoard);
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));

function setupInputOnce() {
  window.addEventListener("keydown", handleInput, { once: true });
  window.addEventListener("touchstart", handleTouchInput, { passive: false });
}

async function handleInput(event) {
  switch (event.type) {
    case "keydown":
      switch (event.key) {
        case "ArrowUp":
          if (!canMoveUp()) {
            setupInputOnce();
            return;
          }
          await moveUp();
          break;
        case "ArrowDown":
          if (!canMoveDown()) {
            setupInputOnce();
            return;
          }
          await moveDown();
          break;
        case "ArrowLeft":
          if (!canMoveLeft()) {
            setupInputOnce();
            return;
          }
          await moveLeft();
          break;
        case "ArrowRight":
          if (!canMoveRight()) {
            setupInputOnce();
            return;
          }
          await moveRight();
          break;
        default:
          setupInputOnce();
          return;
      }
      break;
    case "touchstart":
      handleTouchInput(event);
      return;
  }

  const newTile = new Tile(gameBoard);
  grid.getRandomEmptyCell().linkTile(newTile);

  if (!canMoveUp() &&!canMoveDown() &&!canMoveLeft() &&!canMoveRight()) {
    await newTile.waitForAnimationEnd();
    alert("Try again!");
    return;
  }

  setupInputOnce();
}

async function moveUp() {
  await slideTiles(grid.cellsGroupedByColumn);
}

async function moveDown() {
  await slideTiles(grid.cellsGroupedByReversedColumn);
}

async function moveLeft() {
  await slideTiles(grid.cellsGroupedByRow);
}

async function moveRight() {
  await slideTiles(grid.cellsGroupedByReversedRow);
}

async function slideTiles(groupedCells) {
  const promises = [];

  groupedCells.forEach(group => slideTilesInGroup(group, promises));

  await Promise.all(promises);
  grid.cells.forEach(cell => {
    cell.hasTileForMerge() && cell.mergeTiles();
  });
}

function slideTilesInGroup(group, promises) {
  for (let i = 1; i < group.length; i++) {
    if (group[i].isEmpty()) {
      continue;
    }

    const cellWithTile = group[i];

    let targetCell;
    let j = i - 1;
    while (j >= 0 && group[j].canAccept(cellWithTile.linkedTile)) {
      targetCell = group[j];
      j--;
    }

    if (!targetCell) {
      continue;
    }

    promises.push(cellWithTile.linkedTile.waitForTransitionEnd());

    if (targetCell.isEmpty()) {
      targetCell.linkTile(cellWithTile.linkedTile);
    } else {
      targetCell.linkTileForMerge(cellWithTile.linkedTile);
    }

    cellWithTile.unlinkTile();
  }
}

function canMoveUp() {
  return canMove(grid.cellsGroupedByColumn);
}

function canMoveDown() {
  return canMove(grid.cellsGroupedByReversedColumn);
}

function canMoveLeft() {
  return canMove(grid.cellsGroupedByRow);
}

function canMoveRight() {
  return canMove(grid.cellsGroupedByReversedRow);
}

function canMove(groupedCells) {
  return groupedCells.some(group => canMoveInGroup(group));
}

function canMoveInGroup(group) {
  return group.some((cell, index) => {
    if (index === 0) {
      return false;
    }

    if (cell.isEmpty()) {
      return false;
    }

    const targetCell = group[index - 1];
    return targetCell.canAccept(cell.linkedTile);
  });
}

function handleTouchInput(event) {
  event.preventDefault();

  const touch = event.touches[0];
  const rect = gameBoard.getBoundingClientRect();

  if (touch.clientX > rect.left && touch.clientX < rect.right &&
      touch.clientY > rect.top && touch.clientY < rect.bottom) {

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    let directionX = 0;
    if (x < rect.width / 3) {
      directionX = -1;
    } else if (x > rect.width * 2 / 3) {
      directionX = 1;
    }

    let directionY = 0;
    if (y < rect.height / 3) {
      directionY = -1;
    } else if (y > rect.height * 2 / 3) {
      directionY = 1;
    }

    if (directionX!== 0 || directionY!== 0) {
      if (directionY === -1) {
        moveUp();
      } else if (directionY === 1) {
        moveDown();
      } else if (directionX === -1) {
        moveLeft();
      } else if (directionX === 1) {
        moveRight();
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupInputOnce();
});
