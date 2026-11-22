import { ActionButton } from "../../components/ActionButton";
import { DeckPile } from "../../components/DeckPile";
import { EventOverlay } from "../../components/EventOverlay";
import { Hand } from "../../components/Hand";
import { NeapolitanCardView } from "../../components/NeapolitanCardView";
import { Opponent } from "../../components/Opponent";
import { Table } from "../../components/Table";
import type { Difficulty } from "../../core/settings";
import { CapturePile } from "./CapturePile";
import { useBriscola } from "./useBriscola";

interface BriscolaProps {
	names: string[];
	difficulty: Difficulty;
	resume: boolean;
	onExit: () => void;
}

export function Briscola({ names, difficulty, resume, onExit }: BriscolaProps) {
	const { state, canPlay, play, restart } = useBriscola(
		names[1],
		difficulty,
		resume,
	);
	const cpu = state.cpuName;
	const finished = state.phase === "fine";

	return (
		<Table title="Briscola" onExit={onExit}>
			<EventOverlay events={state.events} />
			<div className="flex items-center justify-center gap-6">
				<Opponent
					name={cpu}
					seed={2}
					active={state.phase === "gioco" && state.turn === 1}
					events={state.events}
					info={finished ? `punti ${state.points[1]}` : undefined}
				>
					<Hand
						cards={state.hands[1]}
						renderCard={(card) => (
							<NeapolitanCardView card={card} faceDown={!finished} small />
						)}
					/>
				</Opponent>
				<CapturePile cards={state.captured[1]} label={`Prese di ${cpu}`} />
			</div>

			<div className="flex flex-wrap items-center justify-center gap-10">
				<div className="flex flex-col items-center gap-1">
					<div className="relative h-[calc(var(--card-w)*1.8)] w-[calc(var(--card-w)*1.8)]">
						{/* La briscola girata è l'ultima carta: vola in mano quando viene pescata */}
						{state.deck.length > 0 && (
							<div className="absolute top-[calc(var(--card-w)*0.35)] left-0 rotate-90">
								<NeapolitanCardView card={state.briscola} />
							</div>
						)}
						{state.deck.length > 1 && (
							<div className="absolute top-0 left-[calc(var(--card-w)*0.6)]">
								<DeckPile
									deck="napoletane"
									count={state.deck.length - 1}
									topIds={state.deck
										.slice(1)
										.slice(-2)
										.map((c) => c.id)}
									label=""
								/>
							</div>
						)}
					</div>
					<span className="text-sm">
						Mazzo: {state.deck.length} · Briscola: {state.briscola.suit}
					</span>
				</div>

				<div className="flex min-h-[calc(var(--card-w)*1.8)] min-w-[calc(var(--card-w)*2.4)] gap-2 sm:gap-3 rounded-xl border-2 border-dashed border-emerald-300/40 p-2">
					{state.trick.map(({ player, card }) => (
						<div key={card.id} className="flex flex-col items-center text-xs">
							<NeapolitanCardView card={card} />
							{player === 0 ? names[0] : cpu}
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

			<div className="flex items-end justify-center gap-6">
				<Hand
					cards={state.hands[0]}
					label={`${names[0]} · punti ${state.points[0]}`}
					renderCard={(card) => (
						<NeapolitanCardView
							card={card}
							onClick={canPlay ? () => play(card.id) : undefined}
						/>
					)}
				/>
				<CapturePile cards={state.captured[0]} label="Le tue prese" />
			</div>
		</Table>
	);
}
