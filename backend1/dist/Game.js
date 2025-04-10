"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
function generateSessionId() {
    return Math.random().toString(36).substring(2);
}
class Game {
    constructor(player1, player2) {
        this.moveCount = 0;
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
        this.sessionId1 = generateSessionId();
        this.sessionId2 = generateSessionId();
        this.player1.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: 'white',
                sessionId: this.sessionId1
            }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: 'black',
                sessionId: this.sessionId2
            }
        }));
    }
    makeMove(socket, move) {
        // (existing move validation and handling code)
        try {
            this.board.move(move);
        }
        catch (e) {
            console.log(e);
            return;
        }
        if (this.board.isGameOver()) {
            const winner = this.board.turn() === 'w' ? 'black' : 'white';
            this.player1.send(JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: { winner }
            }));
            this.player2.send(JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: { winner }
            }));
            return;
        }
        const moveColor = this.moveCount % 2 === 0 ? 'white' : 'black';
        if (this.moveCount % 2 === 0) {
            this.player2.send(JSON.stringify({
                type: messages_1.MOVE,
                payload: {
                    move,
                    color: moveColor
                }
            }));
        }
        else {
            this.player1.send(JSON.stringify({
                type: messages_1.MOVE,
                payload: {
                    move,
                    color: moveColor
                }
            }));
        }
        this.moveCount++;
    }
}
exports.Game = Game;
