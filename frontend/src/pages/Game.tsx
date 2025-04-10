import { useEffect, useState } from "react";
import Button from "../components/Button";
import Chessboard from "../components/Chessboard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";

// Constants must match backend messages
export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const RECONNECT = "reconnect";

export default function Game() {
    const socket = useSocket();
    const [chess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [started, setStarted] = useState(false);
    const [initRequested, setInitRequested] = useState(false);
    const [playerColor, setPlayerColor] = useState("");

    // When socket is open, check for stored session and send RECONNECT
    useEffect(() => {
        if (!socket) return;
        if (socket.readyState === WebSocket.OPEN) {
        const storedSessionId = localStorage.getItem("sessionId");
        if (storedSessionId) {
            socket.send(
            JSON.stringify({ type: RECONNECT, payload: { sessionId: storedSessionId } })
            );
        }
        }
    }, [socket]);

    useEffect(() => {
        if (!socket) {
        return;
        }

        const handleMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);

        switch (message.type) {
            case INIT_GAME:
            // Save the player's color and session ID.
            setPlayerColor(message.payload.color);
            localStorage.setItem("sessionId", message.payload.sessionId);
            setBoard(chess.board());
            setStarted(true);
            console.log("Game initialized as", message.payload.color);
            break;

            case MOVE: {
            const { move, color } = message.payload;
            // Only apply the move if it comes from the opponent.
            if (color === playerColor) {
                // This move was already applied locally.
                return;
            }
            try {
                chess.move(move);
            } catch (e) {
                console.error("Error applying opponent move:", e);
                return;
            }
            setBoard(chess.board());
            console.log("Opponent move applied:", move);
            break;
            }

            case GAME_OVER:
            console.log("Game over");
            break;

            default:
            console.log("Unknown message type", message.type);
        }
        };

        socket.addEventListener("message", handleMessage);
        return () => {
        socket.removeEventListener("message", handleMessage);
        };
    }, [socket, chess, playerColor]);

    if (!socket) {
        return <div>Loading WebSocket connection...</div>;
    }

    return (
        <div className="flex justify-center">
        <div className="pt-8 max-w-screen-lg w-full">
            <div className="mb-4 text-white text-xl">
            {started
                ? `You are playing as ${playerColor}`
                : "Waiting to start the game..."}
            </div>
            <div className="grid grid-cols-6 gap-4">
            <div className="col-span-4 flex justify-center">
                <Chessboard
                chess={chess}
                setBoard={setBoard}
                socket={socket}
                board={board}
                playerColor={playerColor}
                />
            </div>
            <div className="col-span-2 bg-slate-900 flex justify-center">
                <div className="pt-8">
                {!started && (
                    <>
                    {initRequested ? (
                        <Button onClick={() => {}}>Connecting...</Button>
                    ) : (
                        <Button
                        onClick={() => {
                            if (socket.readyState === WebSocket.OPEN) {
                            setInitRequested(true);
                            socket.send(JSON.stringify({ type: INIT_GAME }));
                            }
                        }}
                        >
                        Play
                        </Button>
                    )}
                    </>
                )}
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}
