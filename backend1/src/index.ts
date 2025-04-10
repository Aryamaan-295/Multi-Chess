import http from 'http';
import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';

const server = http.createServer();
const wss = new WebSocketServer({ server });

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {
    gameManager.addUser(ws);

    ws.on('close', () => gameManager.removeUser(ws));
});

server.listen(8080, () => {
    console.log('WebSocket server running on ws://localhost:8080');
});