// script.js - 完全版

// ==========================================
// 1. 変数と設定
// ==========================================
let currentSize = 3;    // 現在の盤面サイズ (3 or 4)
let board = [];         // 盤面データ
let gameActive = false;
let currentPlayer = 'O';
let winningLines = [];  // そのサイズにおける勝利パターンのリスト

const HUMAN = 'O';
const AI = 'X';

// HTML要素
const homeScreen = document.getElementById('home-screen');
const gameScreen = document.getElementById('game-screen');
const boardElement = document.getElementById('board');
const messageElement = document.getElementById('message');
const gameTitle = document.getElementById('game-title');

// ==========================================
// 2. 画面切り替えとゲーム開始
// ==========================================

// ゲームを開始する関数
const startGame = (size) => {
    currentSize = size;
    gameTitle.textContent = `${size} × ${size} マッチ`;
    
    // 勝利パターンの計算 (縦・横・斜め)
    calculateWinningLines(size);

    // 画面切り替え
    homeScreen.style.display = 'none';
    gameScreen.style.display = 'block';

    // 盤面の初期化
    resetGame();
};

// ホームに戻る関数
const goHome = () => {
    gameScreen.style.display = 'none';
    homeScreen.style.display = 'block';
    gameActive = false;
};

// 盤面のリセットと生成
const resetGame = () => {
    board = Array(currentSize * currentSize).fill('');
    gameActive = true;
    currentPlayer = HUMAN;
    messageElement.textContent = "あなたのターンです";

    // HTMLの生成
    boardElement.innerHTML = '';
    // CSS変数にサイズを渡す (3列か4列か)
    boardElement.style.setProperty('--col-num', currentSize);

    for (let i = 0; i < board.length; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        boardElement.appendChild(cell);
    }
};

// ==========================================
// 3. ゲームロジック (汎用)
// ==========================================

// クリック処理
const handleCellClick = (e) => {
    const idx = parseInt(e.target.dataset.index);

    if (board[idx] !== '' || !gameActive || currentPlayer === AI) return;

    makeMove(idx, HUMAN);

    if (!checkGameOver()) {
        currentPlayer = AI;
        messageElement.textContent = "AIが考え中...";
        setTimeout(aiTurn, 600); // 少し待ってからAIが動く
    }
};

// 駒を置く処理
const makeMove = (index, player) => {
    board[index] = player;
    const cell = boardElement.children[index];
    cell.textContent = player;
    cell.classList.add(player);
};

// 勝敗チェック
const checkGameOver = () => {
    // 1. 勝利判定
    for (let line of winningLines) {
        const [a, b, c, d] = line; // 4x4ならdまで、3x3ならcまで使う
        
        // そのラインの全てのマスが現在のプレイヤーと同じかチェック
        const isWin = line.every(index => board[index] === currentPlayer);

        if (isWin) {
            messageElement.textContent = `${currentPlayer} の勝ちです！🎉`;
            gameActive = false;
            return true;
        }
    }

    // 2. 引き分け判定
    if (!board.includes('')) {
        messageElement.textContent = "引き分けです！🤝";
        gameActive = false;
        return true;
    }

    return false;
};

// ==========================================
// 4. AIロジック (賢い版)
// ==========================================
const aiTurn = () => {
    if (!gameActive) return;

    let moveIndex = -1;

    // 戦略1: AIが勝てる場所があれば取る (攻撃)
    moveIndex = findBestMove(AI);

    // 戦略2: 人間が勝ちそうなら邪魔する (防御)
    if (moveIndex === -1) {
        moveIndex = findBestMove(HUMAN);
    }

    // 戦略3: 中央を取る (重要)
    if (moveIndex === -1) {
        // 盤面の真ん中あたりのインデックスを計算
        const center = Math.floor(board.length / 2);
        // 4x4の場合は中央が4つあるので補正
        const centers = currentSize === 3 ? [4] : [5, 6, 9, 10];
        
        for (let c of centers) {
            if (board[c] === '') {
                moveIndex = c;
                break;
            }
        }
    }

    // 戦略4: ランダム
    if (moveIndex === -1) {
        const emptyIndices = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
        if (emptyIndices.length > 0) {
            moveIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }
    }

    // 実行
    if (moveIndex !== -1) {
        makeMove(moveIndex, AI);
        if (!checkGameOver()) {
            currentPlayer = HUMAN;
            messageElement.textContent = "あなたのターンです";
        }
    }
};

// 「あと1手で揃うライン」の空きマスを見つける関数
const findBestMove = (player) => {
    for (let line of winningLines) {
        // そのラインにある自分の駒の数と、空きマスの数を数える
        const playerCount = line.filter(i => board[i] === player).length;
        const emptyCount = line.filter(i => board[i] === '').length;

        // 「あと1つで完成」かつ「1つ空いている」場所を探す
        // 3x3なら2つ揃って1つ空き、4x4なら3つ揃って1つ空き
        if (playerCount === currentSize - 1 && emptyCount === 1) {
            return line.find(i => board[i] === '');
        }
    }
    return -1;
};

// ==========================================
// 5. 勝利パターンの自動生成 (初期化時に実行)
// ==========================================
const calculateWinningLines = (size) => {
    winningLines = [];
    
    // 横のライン
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) row.push(i * size + j);
        winningLines.push(row);
    }

    // 縦のライン
    for (let i = 0; i < size; i++) {
        const col = [];
        for (let j = 0; j < size; j++) col.push(j * size + i);
        winningLines.push(col);
    }

    // 斜めのライン (左上↘)
    const diag1 = [];
    for (let i = 0; i < size; i++) diag1.push(i * size + i);
    winningLines.push(diag1);

    // 斜めのライン (右上↙)
    const diag2 = [];
    for (let i = 0; i < size; i++) diag2.push(i * size + (size - 1 - i));
    winningLines.push(diag2);
};

// ==========================================
// 6. イベント設定
// ==========================================
document.getElementById('btn-3x3').addEventListener('click', () => startGame(3));
document.getElementById('btn-4x4').addEventListener('click', () => startGame(4));
document.getElementById('back-button').addEventListener('click', goHome);