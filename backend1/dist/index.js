"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const GameManager_1 = require("./GameManager");
const server = http_1.default.createServer();
const wss = new ws_1.WebSocketServer({ server });
const gameManager = new GameManager_1.GameManager();
wss.on('connection', function connection(ws) {
    gameManager.addUser(ws);
    ws.on('close', () => gameManager.removeUser(ws));
});
server.listen(8080, () => {
    console.log('WebSocket server running on ws://localhost:8080');
});
