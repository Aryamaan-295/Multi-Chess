import { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../pages/Game";

interface ChessboardProps {
    chess: any;
    socket: WebSocket;
    board: (
        | {
            square: Square;
            type: PieceSymbol;
            color: Color;
        }
        | null
    )[][];
    setBoard: (board: any) => void;
    playerColor: string;
}

export default function Chessboard({
    chess,
    socket,
    board,
    setBoard,
    playerColor,
    }: ChessboardProps) {
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);

    return (
        <div>
        {board.map((row, i) => (
            <div key={i} className="flex">
            {row.map((square, j) => {
                // Compute square name from row and column
                const file = String.fromCharCode(97 + j);
                const rank = 8 - i;
                const squareName = (file + rank) as Square;

                // Check if this square should be highlighted (legal destination)
                const isHighlight = possibleMoves.includes(squareName);

                return (
                <div
                    key={j}
                    onClick={() => {
                    // If no square selected, attempt to select this piece
                    if (!selectedSquare) {
                        // Only select if the square has a piece, it belongs to the player,
                        // and it is currently the player's turn.
                        if (
                        square &&
                        ((playerColor === "white" && square.color === "w") ||
                            (playerColor === "black" && square.color === "b")) &&
                        chess.turn() === (playerColor === "white" ? "w" : "b")
                        ) {
                        setSelectedSquare(squareName);
                        // Get legal moves for this piece
                        const moves = chess.moves({
                            square: squareName,
                            verbose: true,
                        });
                        const destinations = moves.map((m: any) => m.to);
                        setPossibleMoves(destinations);
                        }
                    } else {
                        // If a square is already selected, check if the click is on a legal destination
                        if (possibleMoves.includes(squareName)) {
                        const move = { from: selectedSquare, to: squareName };
                        try {
                            chess.move(move);
                            setBoard(chess.board());
                        } catch (e) {
                            console.error("Invalid move:", e);
                        }
                        // Send move to backend
                        socket.send(
                            JSON.stringify({
                            type: MOVE,
                            payload: { move },
                            })
                        );
                        }
                        // Clear selection and move options regardless of whether the move was legal
                        setSelectedSquare(null);
                        setPossibleMoves([]);
                    }
                    }}
                    className={`w-16 h-16 relative ${
                    (i + j) % 2 === 0 ? "bg-[#739552]" : "bg-[#EBECD0]"
                    } ${isHighlight ? "bg-green-900" : ""}`}
                >
                    <div className="flex justify-center w-full h-full items-center">
                    {square ? (
                        <img
                        className="w-16"
                        src={`/${
                            square.color === "b"
                            ? square.type
                            : `${square.type.toUpperCase()} copy`
                        }.svg`}
                        alt={square.type}
                        />
                    ) : null}
                    </div>
                    {selectedSquare === squareName && (
                    <div className="absolute inset-0 border-4 border-yellow-500 pointer-events-none"></div>
                    )}
                </div>
                );
            })}
            </div>
        ))}
        </div>
    );
}
