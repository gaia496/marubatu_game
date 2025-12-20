const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    // 部屋に参加する
    socket.on('join-room', (roomID) => {
        socket.join(roomID);
        
        // その部屋の人数を確認
        const clients = io.sockets.adapter.rooms.get(roomID);
        const numClients = clients ? clients.size : 0;

        // 役割を決定（部屋ごとに判定）
        let role = numClients === 1 ? 'O' : (numClients === 2 ? 'X' : 'viewer');
        socket.emit('assign-mark', { role, roomID });
        console.log(`User ${socket.id} joined room: ${roomID} as ${role}`);
    });

    // ゲーム開始の同期（その部屋だけに送る）
    socket.on('request-game-start', (data) => {
        io.to(data.roomID).emit('game-start', data.size);
    });

    // 手の同期（その部屋だけに送る）
    socket.on('player-move', (data) => {
        io.to(data.roomID).emit('player-move', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
