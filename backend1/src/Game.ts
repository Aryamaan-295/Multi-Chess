import { Chess } from "chess.js";
import { WebSocket } from "ws";
import { GAME_OVER, INIT_GAME, MOVE, RECONNECT } from "./messages";

function generateSessionId(): string {
    return Math.random().toString(36).substring(2);
}

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    public board: Chess;
    public sessionId1: string;
    public sessionId2: string;
    private startTime: Date;
    private moveCount: number = 0;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();
        this.sessionId1 = generateSessionId();
        this.sessionId2 = generateSessionId();

        this.player1.send(JSON.stringify({
        type: INIT_GAME,
        payload: {
            color: 'white',
            sessionId: this.sessionId1
        }
        }));
        this.player2.send(JSON.stringify({
        type: INIT_GAME,
        payload: {
            color: 'black',
            sessionId: this.sessionId2
        }
        }));
    }

    makeMove(socket: WebSocket, move: { from: string, to: string }) {
        // (existing move validation and handling code)
        try {
        this.board.move(move);
        } catch (e) {
        console.log(e);
        return;
        }
        
        if (this.board.isGameOver()) {
        const winner = this.board.turn() === 'w' ? 'black' : 'white';
        this.player1.send(JSON.stringify({
            type: GAME_OVER,
            payload: { winner }
        }));
        this.player2.send(JSON.stringify({
            type: GAME_OVER,
            payload: { winner }
        }));
        return;
        }

        const moveColor = this.moveCount % 2 === 0 ? 'white' : 'black';

        if (this.moveCount % 2 === 0) {
        this.player2.send(JSON.stringify({
            type: MOVE,
            payload: {
            move,
            color: moveColor
            }
        }));
        } else {
        this.player1.send(JSON.stringify({
            type: MOVE,
            payload: {
            move,
            color: moveColor
            }
        }));
        }
        this.moveCount++;
    }
}
