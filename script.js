// script.js - 防御・攻撃型AI搭載版

// 1. ゲームの状態を管理する変数の定義
let board = ['', '', '', '', '', '', '', '', '']; // 盤面の状態 (9マス)
let currentPlayer = 'O'; // 現在のプレイヤー ('O'が人間、'X'がAI)
let gameActive = true; // ゲームが進行中かどうか

// プレイヤー定義
const HUMAN_PLAYER = 'O';
const AI_PLAYER = 'X';

// 2. HTML要素の取得
const cells = document.querySelectorAll('.cell');
const messageElement = document.getElementById('message');
const resetButton = document.getElementById('reset-button');

// 3. 勝利条件の定義 (マスのインデックス 0~8 で考える)
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // 横
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // 縦
    [0, 4, 8], [2, 4, 6]             // 斜め
];

// 4. マスに記号を配置し、見た目を更新する関数
const handleCellPlayed = (clickedCell, clickedCellIndex) => {
    // 盤面配列を更新
    board[clickedCellIndex] = currentPlayer;
    // 画面の見た目を更新
    clickedCell.innerHTML = currentPlayer;
    clickedCell.classList.add(currentPlayer); 
};

// 5. メッセージを更新する関数
const updateMessage = (msg) => {
    messageElement.innerHTML = msg;
};

// 6. 勝敗判定を行う関数 (勝利/引き分けが確定したら true を返す)
const handleResultValidation = () => {
    let roundWon = false; 

    // 8つの勝利条件を一つずつチェック
    for (let i = 0; i < 8; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue;
        }

        if (a === b && b === c) {
            roundWon = true;
            break; 
        }
    }

    if (roundWon) {
        updateMessage(`${currentPlayer}の勝ちです！🎉`);
        gameActive = false; 
        return true; 
    }

    let roundDraw = !board.includes('');
    if (roundDraw) {
        updateMessage(`引き分けです。🙌`);
        gameActive = false;
        return true;
    }

    return false;
};


// 7. 勝利または防御のマスを見つけるロジック
// playerToCheckにはAI_PLAYER ('X') または HUMAN_PLAYER ('O') が入る
const checkAndBlockWin = (playerToCheck) => {
    // 勝利条件を一つずつチェック
    for (const condition of winningConditions) {
        let count = 0;
        let emptyIndex = -1; // ここに打てば勝利/ブロックできるマス
        
        // 勝利条件の3つのマスをチェック
        for (const index of condition) {
            if (board[index] === playerToCheck) {
                count++;
            } else if (board[index] === '') {
                emptyIndex = index;
            }
        }
        
        // 既に2つ揃っていて、かつ残りの1つが空いていれば、そのマスを返す
        if (count === 2 && emptyIndex !== -1) {
            return emptyIndex;
        }
    }
    return -1; // 見つからなかった場合
};


// 8. AI (防御/攻撃型) のターン処理
const handleAITurn = () => {
    if (!gameActive) {
        return;
    }

    // 1. 空いているマス（インデックス）を全て見つける
    const availableIndices = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            availableIndices.push(i);
        }
    }

    if (availableIndices.length === 0) {
        return; 
    }

    let aiMoveIndex = -1; // AIが打つマスのインデックス

    // ------------------------------------
    // 【優先度 1位: 勝利チェック (攻撃)】
    // ------------------------------------
    aiMoveIndex = checkAndBlockWin(AI_PLAYER); 

    // ------------------------------------
    // 【優先度 2位: 防御チェック (人間をブロック)】
    // ------------------------------------
    if (aiMoveIndex === -1) {
        aiMoveIndex = checkAndBlockWin(HUMAN_PLAYER);
    }
    
    // ------------------------------------
    // 【優先度 3位: 中央（4）が空いていれば取る】
    // ------------------------------------
    // 中央は最も有利なマスなので、ランダムの前にチェックする
    if (aiMoveIndex === -1 && board[4] === '') {
        aiMoveIndex = 4;
    }

    // ------------------------------------
    // 【優先度 4位: ランダム】
    // ------------------------------------
    if (aiMoveIndex === -1) {
        // ランダムに選ぶ
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        aiMoveIndex = availableIndices[randomIndex];
    }

    // ------------------------------------
    // 最終的な手の実行
    // ------------------------------------
    const aiCell = cells[aiMoveIndex];

    currentPlayer = AI_PLAYER; 
    handleCellPlayed(aiCell, aiMoveIndex);

    if (handleResultValidation()) {
        return; 
    }
    
    // ゲームが続く場合は、次の人間のターンに戻す
    currentPlayer = HUMAN_PLAYER;
    updateMessage(`${HUMAN_PLAYER}のターンです`); 
};

// 9. 人間プレイヤー ('O') のマスがクリックされたときの処理
const handleCellClick = (e) => {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // 無効なクリックをチェック
    if (board[clickedCellIndex] !== '' || !gameActive || currentPlayer === AI_PLAYER) {
        return;
    }

    // 人間プレイヤーとして記号を配置
    currentPlayer = HUMAN_PLAYER; 
    handleCellPlayed(clickedCell, clickedCellIndex);
    
    // 勝敗を判定
    if (handleResultValidation()) {
        return; 
    }

    // AIのターンを開始 (0.5秒の遅延を持たせる)
    updateMessage(`AI (${AI_PLAYER})が考え中です...`);
    setTimeout(handleAITurn, 500); 
};

// 10. ゲームをリセットする関数
const handleRestartGame = () => {
    // 状態を初期値に戻す
    gameActive = true;
    currentPlayer = HUMAN_PLAYER; // 必ず人間('O')からスタート
    board = ['', '', '', '', '', '', '', '', ''];
    
    // メッセージと見た目をリセット
    updateMessage('〇のターンです');
    
    cells.forEach(cell => {
        cell.innerHTML = ''; 
        cell.classList.remove(HUMAN_PLAYER, AI_PLAYER); 
    });
};

// 11. イベントリスナーの設定
// すべてのマスがクリックされたときに handleCellClick を実行
cells.forEach(cell => cell.addEventListener('click', handleCellClick));

// リセットボタンがクリックされたときに handleRestartGame を実行
resetButton.addEventListener('click', handleRestartGame);