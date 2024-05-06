import React from "react";

export default function Button({ onClick, children }: { onClick: () => void, children: React.ReactNode}) {

    return (
        <button className="px-8 py-4 text-2xl bg-green-500 hover:bg-green-700 text-white font-bold rounded" onClick={onClick}>
            { children }
        </button>
    )
}