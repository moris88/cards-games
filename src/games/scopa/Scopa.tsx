import { ActionButton } from "../../components/ActionButton";
import { DeckPile } from "../../components/DeckPile";
import { EventOverlay } from "../../components/EventOverlay";
import { Hand } from "../../components/Hand";
import { NeapolitanCardView } from "../../components/NeapolitanCardView";
import { Opponent } from "../../components/Opponent";
import { Table } from "../../components/Table";
import type { Difficulty } from "../../core/settings";
import { CapturePile } from "../briscola/CapturePile";
import { CaptureChooser } from "./CaptureChooser";
import { RoundSummary } from "./RoundSummary";
import { type ScopaTarget, sideName } from "./scopaLogic";
import { useScopa } from "./useScopa";

interface ScopaProps {
	names: string[];
	target: ScopaTarget;
	difficulty: Difficulty;
	resume: boolean;
	onExit: () => void;
}

export function Scopa({
	names,
	target,
	difficulty,
	resume,
	onExit,
}: ScopaProps) {
	const game = useScopa(names, target, difficulty, resume);
	const { state } = game;
	const human = state.players[0];
	const pending = state.pending;
	const sideNames = state.sides.map((_, i) => sideName(state, i));
	const roundOver =
		state.phase === "fineSmazzata" || state.phase === "finePartita";

	return (
		<Table title={`Scopa · a ${state.target} punti`} onExit={onExit}>
			<EventOverlay events={state.events} />
			<div className="flex flex-wrap items-start justify-center gap-4">
				{state.players.slice(1).map((p, idx) => (
					<Opponent
						key={p.name}
						name={p.name}
						seed={idx + 1}
						active={state.phase === "gioco" && state.current === idx + 1}
						events={state.events}
						info={
							p.side === human.side
								? "compagno"
								: `${state.sides[p.side].score} punti`
						}
					>
						<Hand
							cards={p.hand}
							renderCard={(card) => (
								<NeapolitanCardView card={card} faceDown small />
							)}
						/>
					</Opponent>
				))}
			</div>

			<div className="flex flex-wrap items-center justify-center gap-6">
				<DeckPile
					deck="napoletane"
					count={state.deck.length}
					topIds={state.deck.slice(-12).map((c) => c.id)}
					small
				/>
				<div className="flex min-h-[calc(var(--card-w)*1.8)] w-full max-w-xl flex-wrap items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300/40 p-3">
					{state.table.map((card) => (
						<div
							key={card.id}
							className={
								pending?.take.some((t) => t.id === card.id)
									? "rounded-md ring-4 ring-yellow-300"
									: ""
							}
						>
							<NeapolitanCardView card={card} />
						</div>
					))}
					{pending && (
						<div className="rounded-md ring-4 ring-sky-300">
							<NeapolitanCardView card={pending.card} />
						</div>
					)}
				</div>
				<div className="flex gap-3">
					{state.sides.map((side, i) => (
						<CapturePile
							key={sideNames[i]}
							cards={side.captured}
							label={`${sideNames[i]} · ${side.captured.length}${side.scope ? ` · ${side.scope} scope` : ""}`}
						/>
					))}
				</div>
			</div>

			<div className="flex flex-col items-center gap-2">
				{roundOver && state.summary ? (
					<RoundSummary
						summary={state.summary}
						names={sideNames}
						totals={state.sides.map((s) => s.score)}
						target={state.target}
					/>
				) : (
					<p className="rounded bg-black/30 px-4 py-1">
						{game.canPlay ? "Tocca a te: gioca una carta" : state.message}
					</p>
				)}
				{game.choosing && (
					<CaptureChooser
						choices={game.choices}
						onChoose={game.chooseTake}
						onCancel={game.cancelChoice}
					/>
				)}
				{state.phase === "fineSmazzata" && (
					<ActionButton onClick={game.nextRound}>
						Prossima smazzata
					</ActionButton>
				)}
				{state.phase === "finePartita" && (
					<ActionButton onClick={game.restart}>Nuova partita</ActionButton>
				)}
			</div>

			<Hand
				cards={human.hand}
				label={`${human.name} · ${state.sides[human.side].score} punti`}
				renderCard={(card) => (
					<NeapolitanCardView
						card={card}
						selected={game.choosing?.id === card.id}
						onClick={game.canPlay ? () => game.play(card) : undefined}
					/>
				)}
			/>
		</Table>
	);
}
