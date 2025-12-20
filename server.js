const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 静的ファイル（HTML, CSS, JS）を公開する設定
app.use(express.static(__dirname));

let players = {};

io.on('connection', (socket) => {
    // 役割分担
    const currentCount = Object.keys(players).length;
    let role = currentCount === 0 ? 'O' : (currentCount === 1 ? 'X' : 'viewer');
    players[socket.id] = role;

    socket.emit('assign-mark', role);
    console.log(`接続: ${socket.id} 役割: ${role}`);

    // ゲーム開始の同期
    socket.on('request-game-start', (size) => {
        io.emit('game-start', size);
    });

    // 手の同期
    socket.on('player-move', (data) => {
        io.emit('player-move', data);
    });

    // 切断
    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server: port ${PORT}`));
