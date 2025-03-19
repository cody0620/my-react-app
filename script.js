// 全域變數
let currentBoard = [];
let markingMode = false;
let removeFlagMode = false;
let currentBombCount = 0; // 本關炸彈總數

// 圖片路徑（全部放在同一資料夾中）
const backImg   = "back.png";
const whiteImg  = "white.png";
const boomImg   = "boom.png";
const flagImg   = "flag.png";
const num1Img   = "1.png";
const num2Img   = "2.png";
const num3Img   = "3.png";
const num4Img   = "4.png";

// 根據數字返回對應的圖片
function getNumberImage(num) {
  if (num === 1) return num1Img;
  if (num === 2) return num2Img;
  if (num === 3) return num3Img;
  if (num === 4) return num4Img;
  return whiteImg;
}

// 生成棋盤，size 為行列數，bombCount 為炸彈數量
function generateBoard(size, bombCount) {
  const board = [];
  for (let i = 0; i < size; i++) {
    board[i] = [];
    for (let j = 0; j < size; j++) {
      board[i][j] = {
        isBomb: false,
        adjacent: 0,
        revealed: false,
        flagged: false,
        element: null  // 將存放該格對應的 img DOM 物件
      };
    }
  }
  // 隨機放置炸彈
  let bombsPlaced = 0;
  while (bombsPlaced < bombCount) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    if (!board[x][y].isBomb) {
      board[x][y].isBomb = true;
      bombsPlaced++;
    }
  }
  // 計算每格附近（八方向）的炸彈數
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (board[i][j].isBomb) continue;
      let count = 0;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const nx = i + dx;
          const ny = j + dy;
          if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
            if (board[nx][ny].isBomb) count++;
          }
        }
      }
      board[i][j].adjacent = count;
    }
  }
  return board;
}

// 更新上方炸彈數量顯示
function updateBombCountDisplay(count) {
  const bombCountDiv = document.getElementById("bomb-count");
  bombCountDiv.textContent = "炸彈數量: " + count;
}

// 檢查是否所有炸彈格皆被標記（僅檢查炸彈格）
function checkWin() {
  for (let i = 0; i < currentBoard.length; i++) {
    for (let j = 0; j < currentBoard[i].length; j++) {
      const cell = currentBoard[i][j];
      if (cell.isBomb && !cell.flagged) {
        return false;
      }
    }
  }
  return true;
}

// 揭露所有炸彈的位置
function revealAllBombs() {
  for (let i = 0; i < currentBoard.length; i++) {
    for (let j = 0; j < currentBoard[i].length; j++) {
      const cell = currentBoard[i][j];
      if (cell.isBomb && cell.element) {
        cell.element.src = boomImg;
      }
    }
  }
}

// flood fill：僅以上下左右（四個方向）展開揭露空白格
function floodFillEmpty(x, y, board) {
  const size = board.length;
  const queue = [];
  queue.push([x, y]);
  while (queue.length > 0) {
    const [i, j] = queue.shift();
    // 將該格設定為已揭露且顯示 white.png
    if (!board[i][j].revealed) {
      board[i][j].revealed = true;
      board[i][j].element.src = whiteImg;
    }
    // 僅檢查上下左右四個方向
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1]
    ];
    directions.forEach(([dx, dy]) => {
      const ni = i + dx;
      const nj = j + dy;
      if (ni >= 0 && ni < size && nj >= 0 && nj < size) {
        const neighbor = board[ni][nj];
        if (!neighbor.revealed && !neighbor.flagged && !neighbor.isBomb) {
          neighbor.revealed = true;
          if (neighbor.adjacent
