import { Color, PieceSymbol, Square } from "chess.js"
import { useState } from "react";
import { MOVE } from "../pages/Game";

export default function Chessboard({ chess, socket, board, setBoard }: {
        chess: any;
        socket: WebSocket;
        setBoard: any;
        board: ({
            square: Square;
            type: PieceSymbol;
            color: Color;
        } | null)[][]; 
    }) {
    
    const [from, setFrom] = useState<Square | null>(null);

    return (
        <div className="">
            {board.map((row,i) => {
                return (
                    <div key={i} className="flex">
                        {row.map((square, j) => {
                            const squareName = String.fromCharCode(97 + (j % 8)) + "" + (8 - i) as Square;
                            return (
                                <div onClick={() => {
                                    if (!from) {
                                        setFrom(squareName);
                                    } else {
                                        socket.send(JSON.stringify({
                                            type: MOVE,
                                            payload: {
                                                move: {
                                                    from: from,
                                                    to: squareName,
                                                }
                                            }
                                        }));

                                        setFrom(null);
                                        chess.move({ from, to:squareName });
                                        setBoard(chess.board());
                                        console.log({ from, to:squareName });
                                    }
                                }} key={j} className={`w-16 h-16 ${ (i+j)%2 == 0 ? 'bg-green-500' : 'bg-white'}`}>
                                    <div className="flex justify-center w-full h-full items-center">
                                        {square ? <img className="w-16" src={`/${square?.color === "b" ? square?.type : `${square?.type?.toUpperCase()} copy`}.svg`} alt={square?.type} /> : null}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}