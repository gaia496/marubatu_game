const socket = io();
let myMark = '';
let currentRoom = ''; // 現在の部屋名
let currentSize = 3;
let board = [];
let gameActive = false;
let currentPlayer = 'O';
let winningLines = [];

const homeScreen = document.getElementById('home-screen');
const gameScreen = document.getElementById('game-screen');
const boardElement = document.getElementById('board');
const messageElement = document.getElementById('message');
const roomInput = document.getElementById('room-input');

// 役割と部屋IDを受け取る
socket.on('assign-mark', (data) => {
    myMark = data.role;
    currentRoom = data.roomID;
    const display = document.getElementById('role-display');
    display.textContent = myMark === 'viewer' ? "部屋が満員です" : `あなたは ${myMark} 担当です（部屋: ${currentRoom}）`;
});

// 開始同期
socket.on('game-start', (size) => {
    currentSize = size;
    calculateWinningLines(size);
    homeScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    resetGame();
});

function startGame(size) {
    const roomName = roomInput.value.trim();
    if (!roomName) {
        alert("合言葉を入力してください！");
        return;
    }
    socket.emit('join-room', roomName); // 部屋に参加
    socket.emit('request-game-start', { size: size, roomID: roomName }); // 部屋IDを添えて開始通知
}

function resetGame() {
    board = Array(currentSize * currentSize).fill('');
    gameActive = true;
    currentPlayer = 'O';
    boardElement.innerHTML = '';
    boardElement.style.setProperty('--col-num', currentSize);
    for (let i = 0; i < board.length; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.onclick = () => {
            if (board[i] === '' && gameActive && currentPlayer === myMark) {
                // 部屋IDをサーバーに送る
                socket.emit('player-move', { index: i, mark: myMark, roomID: currentRoom });
            }
        };
        boardElement.appendChild(cell);
    }
    updateMessage();
}

socket.on('player-move', (data) => {
    board[data.index] = data.mark;
    const cell = boardElement.children[data.index];
    cell.textContent = data.mark;
    cell.classList.add(data.mark);
    
    if (checkWin()) {
        messageElement.textContent = `${data.mark} の勝利！`;
        gameActive = false;
    } else if (!board.includes('')) {
        messageElement.textContent = "引き分け！";
        gameActive = false;
    } else {
        currentPlayer = data.mark === 'O' ? 'X' : 'O';
        updateMessage();
    }
});

function updateMessage() {
    messageElement.textContent = currentPlayer === myMark ? "あなたの番です" : "相手の番です";
}

function checkWin() {
    return winningLines.some(line => line.every(i => board[i] === currentPlayer));
}

function calculateWinningLines(size) {
    winningLines = [];
    for (let i = 0; i < size; i++) {
        let row = [], col = [];
        for (let j = 0; j < size; j++) {
            row.push(i * size + j);
            col.push(j * size + i);
        }
        winningLines.push(row, col);
    }
    let d1 = [], d2 = [];
    for (let i = 0; i < size; i++) {
        d1.push(i * size + i);
        d2.push(i * size + (size - 1 - i));
    }
    winningLines.push(d1, d2);
}

document.getElementById('btn-3x3').onclick = () => startGame(3);
document.getElementById('btn-4x4').onclick = () => startGame(4);
document.getElementById('back-button').onclick = () => location.reload();
