import { useState } from "react";
import { ActionButton } from "../../components/ActionButton";
import type { PokerAction, PokerPlayer } from "./pokerLogic";

interface BetControlsProps {
	me: PokerPlayer;
	currentBet: number;
	minRaise: number;
	pot: number;
	onAct: (action: PokerAction) => void;
}

/** Comandi del giocatore: passa, check/vedi, punta/rilancia, all-in */
export function BetControls({
	me,
	currentBet,
	minRaise,
	pot,
	onAct,
}: BetControlsProps) {
	const toCall = Math.max(0, currentBet - me.bet);
	const maxTo = me.bet + me.chips;
	const minTo = Math.min(maxTo, currentBet + minRaise);
	const [raiseTo, setRaiseTo] = useState(minTo);
	const value = Math.min(Math.max(raiseTo, minTo), maxTo);
	const canRaise = maxTo > currentBet;

	return (
		<div className="flex flex-wrap items-center justify-center gap-2 rounded-xl bg-black/30 p-3">
			<ActionButton onClick={() => onAct({ type: "fold" })}>Passa</ActionButton>
			{toCall === 0 ? (
				<ActionButton onClick={() => onAct({ type: "check" })}>
					Check
				</ActionButton>
			) : (
				<ActionButton onClick={() => onAct({ type: "call" })}>
					Vedi {Math.min(toCall, me.chips)}
				</ActionButton>
			)}
			{canRaise && (
				<>
					<input
						type="range"
						min={minTo}
						max={maxTo}
						step={5}
						value={value}
						onChange={(e) => setRaiseTo(Number(e.target.value))}
						aria-label="Importo del rilancio"
					/>
					<button
						type="button"
						onClick={() => setRaiseTo(currentBet + Math.round(pot / 2 / 5) * 5)}
						className="rounded bg-slate-700 px-2 py-1 text-xs"
					>
						½ piatto
					</button>
					<button
						type="button"
						onClick={() => setRaiseTo(currentBet + pot)}
						className="rounded bg-slate-700 px-2 py-1 text-xs"
					>
						piatto
					</button>
					<ActionButton onClick={() => onAct({ type: "raise", to: value })}>
						{currentBet === 0 ? "Punta" : "Rilancia a"} {value}
					</ActionButton>
					<ActionButton onClick={() => onAct({ type: "raise", to: maxTo })}>
						All-in
					</ActionButton>
				</>
			)}
		</div>
	);
}
