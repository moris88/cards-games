import { ActionButton } from "../../components/ActionButton";
import { EventOverlay } from "../../components/EventOverlay";
import { NeapolitanCardView } from "../../components/NeapolitanCardView";
import { Table } from "../../components/Table";
import { formatTime } from "../solitaire/solitaireRules";
import { KING_PILE, remainingDown } from "./clockLogic";
import { DraggableClockCard } from "./DraggableClockCard";
import { useClock } from "./useClock";

interface ClockSolitaireProps {
	resume: boolean;
	onExit: () => void;
}

const PILE_LABELS = [
	"Asso",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"Fante",
	"Cavallo",
	"Re",
];
const RADIUS = 38;

/** Posizione in percentuale dei 9 mazzetti attorno al quadrante; il Re sta al centro */
function pilePosition(index: number) {
	if (index === KING_PILE) return { left: "50%", top: "50%" };
	const angle = (index / 9) * 2 * Math.PI - Math.PI / 2;
	return {
		left: `${50 + RADIUS * Math.cos(angle)}%`,
		top: `${50 + RADIUS * Math.sin(angle)}%`,
	};
}

export function ClockSolitaire({ resume, onExit }: ClockSolitaireProps) {
	const game = useClock(resume);
	const { state } = game;
	const current = state.current;

	return (
		<Table title="L'Orologio" onExit={onExit}>
			<EventOverlay events={state.events} />
			<div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-black/30 px-4 py-2">
				<span>Coperte: {remainingDown(state)}</span>
				<span>Mosse: {state.moves}</span>
				<span>⏱ {formatTime(state.elapsed)}</span>
				<ActionButton onClick={game.restart}>Nuova partita</ActionButton>
			</div>
			<p className="text-center text-sm text-emerald-100">
				Trascina la carta girata sotto il mazzetto del suo valore. Si vince
				scoprendo tutte le carte prima del quarto Re.
			</p>

			<div className="relative mx-auto aspect-square w-full max-w-[36rem] rounded-full border-8 border-amber-900/70 bg-black/10">
				{state.piles.map((pile, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: i dieci mazzetti sono fissi
						key={i}
						data-pile={i}
						className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 rounded-lg p-1 text-xs"
						style={pilePosition(i)}
					>
						<div className="grid">
							{pile.down.slice(-1).map((card) => (
								<div key={card.id} className="col-start-1 row-start-1">
									<NeapolitanCardView card={card} faceDown small />
								</div>
							))}
							{pile.up.slice(-1).map((card) => (
								<div
									key={card.id}
									className="col-start-1 row-start-1 translate-y-3"
								>
									<NeapolitanCardView card={card} small />
								</div>
							))}
							{pile.down.length === 0 && pile.up.length === 0 && (
								<div className="h-20 w-12" />
							)}
						</div>
						<span className="mt-3 font-semibold">
							{PILE_LABELS[i]} · {pile.up.length}/4
						</span>
					</div>
				))}
			</div>

			<div className="flex flex-col items-center gap-1">
				{current ? (
					<>
						<DraggableClockCard card={current} onDrop={game.dropOn} />
						{game.error && <span className="text-red-300">{game.error}</span>}
					</>
				) : (
					<span className="text-lg font-bold">
						{state.phase === "vinto" ? "Hai vinto!" : "Partita finita"}
					</span>
				)}
			</div>
		</Table>
	);
}
