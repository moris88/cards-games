import type { ReactNode } from "react";
import { formatTime } from "./solitaireRules";

interface SolitaireBarProps {
	elapsed: number;
	moves: number;
	score?: number;
	onUndo: () => void;
	canUndo: boolean;
	children?: ReactNode;
}

/** Barra con tempo, mosse, punteggio e comandi */
export function SolitaireBar({
	elapsed,
	moves,
	score,
	onUndo,
	canUndo,
	children,
}: SolitaireBarProps) {
	return (
		<div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-black/30 px-4 py-2">
			{score !== undefined && <span>Punti: {score}</span>}
			<span>Mosse: {moves}</span>
			<span>⏱ {formatTime(elapsed)}</span>
			<button
				type="button"
				onClick={onUndo}
				disabled={!canUndo}
				className="rounded bg-slate-700 px-3 py-1 hover:bg-slate-600 disabled:opacity-40"
			>
				↶ Annulla
			</button>
			{children}
		</div>
	);
}
