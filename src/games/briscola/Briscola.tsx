import { ActionButton } from "../../components/ActionButton";
import { CardFrame } from "../../components/CardFrame";
import { EventOverlay } from "../../components/EventOverlay";
import { Hand } from "../../components/Hand";
import { NeapolitanCardView } from "../../components/NeapolitanCardView";
import { Table } from "../../components/Table";
import { useBriscola } from "./useBriscola";

interface BriscolaProps {
	onExit: () => void;
}

export function Briscola({ onExit }: BriscolaProps) {
	const { state, canPlay, play, restart } = useBriscola();
	const finished = state.phase === "fine";

	return (
		<Table title="Briscola" onExit={onExit}>
			<EventOverlay events={state.events} />
			<Hand
				cards={state.hands[1]}
				label={`CPU · carte in mano ${state.hands[1].length}${finished ? ` · punti ${state.points[1]}` : ""}`}
				renderCard={(card) => <NeapolitanCardView card={card} faceDown small />}
			/>

			<div className="flex flex-wrap items-center justify-center gap-10">
				<div className="flex flex-col items-center gap-1">
					<div className="relative h-36 w-36">
						{state.deck.length > 0 && (
							<div className="absolute top-7 left-0 rotate-90">
								<NeapolitanCardView card={state.briscola} />
							</div>
						)}
						{state.deck.length > 1 && (
							<div className="absolute top-0 left-10">
								<CardFrame deck="napoletane" faceDown />
							</div>
						)}
					</div>
					<span className="text-sm">
						Mazzo: {state.deck.length} · Briscola: {state.briscola.suit}
					</span>
				</div>

				<div className="flex min-h-30 min-w-44 gap-3 rounded-xl border-2 border-dashed border-emerald-300/40 p-2">
					{state.trick.map(({ player, card }) => (
						<div key={card.id} className="flex flex-col items-center text-xs">
							<NeapolitanCardView card={card} />
							{player === 0 ? "Tu" : "CPU"}
						</div>
					))}
				</div>
			</div>

			<div className="flex flex-col items-center gap-2">
				<p className="rounded bg-black/30 px-4 py-1 text-lg">
					{canPlay ? "Tocca a te: scegli una carta" : state.message}
				</p>
				{finished && (
					<ActionButton onClick={restart}>Nuova partita</ActionButton>
				)}
			</div>

			<Hand
				cards={state.hands[0]}
				label={`Tu · punti ${state.points[0]}`}
				renderCard={(card) => (
					<NeapolitanCardView
						card={card}
						onClick={canPlay ? () => play(card.id) : undefined}
					/>
				)}
			/>
		</Table>
	);
}
