// 從 Skypack 載入 React 與 ReactDOM
import React, { useState, useEffect } from 'https://cdn.skypack.dev/react';
import ReactDOM from 'https://cdn.skypack.dev/react-dom';

// 直接設定圖片檔案路徑（假設與此檔案在同一資料夾）
const backImg = 'back.png';
const whiteImg = 'white.png';
const boomImg = 'boom.png';
const flagImg = 'flag.png';
const oneImg = '1.png';
const twoImg = '2.png';
const threeImg = '3.png';
const fourImg = '4.png';
const fiveImg = '5.png';

const numberImages = {
  1: oneImg,
  2: twoImg,
  3: threeImg,
  4: fourImg,
  5: fiveImg
};

const levels = [
  { size: 5, mines: 3 },   // 第一關：5x5
  { size: 8, mines: 10 },  // 第二關：8x8
  { size: 12, mines: 20 }, // 第三關：12x12
  { size: 15, mines: 30 }  // 第四關：15x15
];

const levelNames = ["第一關", "第二關", "第三關", "第四關"];

const generateBoard = (size, mines) => {
  // 建立一個 size x size 的棋盤，每個格子初始設定
  const board = Array(size)
    .fill(null)
    .map(() => Array(size).fill({ mine: false, revealed: false, flagged: false, count: 0 }));

  let placedMines = 0;
  // 隨機放置地雷
  while (placedMines < mines) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    if (!board[x][y].mine) {
      board[x][y] = { ...board[x][y], mine: true };
      placedMines++;
    }
  }

  // 計算每個格子相鄰（包含斜角）的地雷數量
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      let count = 0;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < size && ny >= 0 && ny < size && board[nx][ny].mine) {
            count++;
          }
        }
      }
      // 如果本格為地雷，扣除自身計算
      board[x][y] = { ...board[x][y], count: board[x][y].mine ? count - 1 : count };
    }
  }

  return board;
};

// floodFill 僅展開上下左右鄰格
const floodFill = (x, y, board) => {
  const size = board.length;
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const queue = [[x, y]];
  const visited = new Set();

  while (queue.length > 0) {
    const [i, j] = queue.shift();
    const key = `${i},${j}`;
    if (visited.has(key)) continue;
    visited.add(key);
    newBoard[i][j].revealed = true;
    if (newBoard[i][j].count === 0 && !newBoard[i][j].mine) {
      const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
      ];
      for (const [di, dj] of directions) {
        const ni = i + di, nj = j + dj;
        if (ni >= 0 && ni < size && nj >= 0 && nj < size && !visited.has(`${ni},${nj}`)) {
          queue.push([ni, nj]);
        }
      }
    }
  }
  return newBoard;
};

function MinesweeperGame() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [board, setBoard] = useState([]);
  const [markingMode, setMarkingMode] = useState(false);
  const [removingMode, setRemovingMode] = useState(false);
  const [mineCount, setMineCount] = useState(0);

  useEffect(() => {
    resetBoard();
  }, [currentLevel]);

  const resetBoard = () => {
    const { size, mines } = levels[currentLevel];
    setBoard(generateBoard(size, mines));
    setMineCount(mines);
    setMarkingMode(false);
    setRemovingMode(false);
  };

  const revealCell = (x, y) => {
    if (markingMode || removingMode) return;
    let newBoard = board.map(row => row.map(cell => ({ ...cell })));
    if (!newBoard[x][y].revealed) {
      if (newBoard[x][y].count === 0 && !newBoard[x][y].mine) {
        newBoard = floodFill(x, y, newBoard);
      } else {
        newBoard[x][y].revealed = true;
      }
      if (newBoard[x][y].mine) {
        // 若點到地雷，全部地雷顯示，並顯示失敗訊息
        newBoard.forEach(row => row.forEach(cell => {
          if (cell.mine) cell.revealed = true;
        }));
        setTimeout(() => {
          alert('你被炸彈炸到了，遊戲結束');
        }, 300);
      }
    }
    setBoard(newBoard);
  };

  const toggleFlag = (x, y) => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    if (!newBoard[x][y].revealed) {
      newBoard[x][y].flagged = !newBoard[x][y].flagged;
    }
    setBoard(newBoard);
    checkWin(newBoard);
  };

  const removeFlag = (x, y) => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    if (newBoard[x][y].flagged) {
      newBoard[x][y].flagged = false;
    }
    setBoard(newBoard);
    setRemovingMode(false);
  };

  const checkWin = (newBoard) => {
    const allMinesFlagged = newBoard.every(row =>
      row.every(cell => (cell.mine ? cell.flagged : true))
    );
    if (allMinesFlagged) {
      setTimeout(() => {
        alert('恭喜你避開全部炸彈，你贏了！');
      }, 300);
    }
  };

  return (
    <div className="p-8 text-center">
      <h2 className="text-4xl font-bold mb-6">郁蓁地雷王</h2>
      <h3 className="text-3xl font-bold mb-6">
        您正在 {levelNames[currentLevel]}
      </h3>
      <p className="text-3xl font-semibold mb-8">本關炸彈數量: {mineCount}</p>
      <table className="mx-auto border border-black border-collapse">
        <tbody>
          {board.map((row, x) => (
            <tr key={x} className="border border-black">
              {row.map((cell, y) => (
                <td key={y} className="border border-black w-16 h-16 text-center text-4xl font-bold">
                  <button
                    onClick={() => {
                      if (markingMode) {
                        toggleFlag(x, y);
                      } else if (removingMode) {
                        removeFlag(x, y);
                      } else {
                        revealCell(x, y);
                      }
                    }}
                    className="w-full h-full flex items-center justify-center border border-gray-400"
                  >
                    {cell.flagged ? (
                      <img src={flagImg} alt="旗子" className="w-16 h-16" />
                    ) : cell.revealed ? (
                      cell.mine ? (
                        <img src={boomImg} alt="炸彈" className="w-16 h-16" />
                      ) : cell.count > 0 && cell.count <= 5 ? (
                        <img src={numberImages[cell.count]} alt={`數字 ${cell.count}`} className="w-16 h-16" />
                      ) : (
                        <img src={whiteImg} alt="空白" className="w-16 h-16" />
                      )
                    ) : (
                      <img src={backImg} alt="未翻開" className="w-16 h-16" />
                    )}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-10 space-x-6">
        <button
          className="px-12 py-6 bg-blue-500 text-white text-3xl rounded"
          onClick={() => setCurrentLevel(prev => Math.max(prev - 1, 0))}
        >
          上一關
        </button>
        <button
          className="px-12 py-6 bg-yellow-500 text-white text-3xl rounded"
          onClick={resetBoard}
        >
          重新開始
        </button>
        <button
          className="px-12 py-6 bg-green-500 text-white text-3xl rounded"
          onClick={() => setCurrentLevel(prev => Math.min(prev + 1, levels.length - 1))}
        >
          下一關
        </button>
        <button
          className="px-12 py-6 bg-red-500 text-white text-3xl rounded"
          onClick={() => setMarkingMode(!markingMode)}
        >
          {markingMode ? '取消' : '標記'}
        </button>
        <button
          className="px-12 py-6 bg-purple-500 text-white text-3xl rounded"
          onClick={() => setRemovingMode(!removingMode)}
        >
          移除標記
        </button>
      </div>
    </div>
  );
}

ReactDOM.render(<MinesweeperGame />, document.getElementById("root"));
