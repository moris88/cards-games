import { ActionButton } from "../../components/ActionButton";
import { DeckPile } from "../../components/DeckPile";
import { EventOverlay } from "../../components/EventOverlay";
import { FrenchCardView } from "../../components/FrenchCardView";
import { Hand } from "../../components/Hand";
import { Opponent } from "../../components/Opponent";
import { Table } from "../../components/Table";
import type { Difficulty } from "../../core/settings";
import { MeldRow } from "./MeldRow";
import { pendingPoints } from "./scala40Logic";
import { useScala40 } from "./useScala40";

interface Scala40Props {
	names: string[];
	difficulty: Difficulty;
	resume: boolean;
	onExit: () => void;
}

export function Scala40({ names, difficulty, resume, onExit }: Scala40Props) {
	const game = useScala40(names, difficulty, resume);
	const { state, isHumanTurn } = game;
	const human = state.players[0];
	const drawing = isHumanTurn && state.phase === "pesca";
	const playing = isHumanTurn && state.phase === "gioco";
	const roundOver = state.phase === "fineMano" || state.phase === "finePartita";

	return (
		<Table title="Scala 40" onExit={onExit}>
			<EventOverlay events={state.events} />
			<div className="flex flex-wrap justify-center gap-4">
				{state.players.slice(1).map((p, i) => (
					<Opponent
						key={p.name}
						name={p.name}
						seed={i + 1}
						active={state.current === i + 1 && !roundOver}
						events={state.events}
						info={`${p.score} pt${p.opened ? " · aperto" : ""}${p.eliminated ? " · eliminato" : ""}`}
					>
						<Hand
							cards={p.hand}
							renderCard={(card) => (
								<FrenchCardView card={card} small faceDown={!roundOver} />
							)}
						/>
					</Opponent>
				))}
			</div>

			<div className="flex flex-wrap items-start justify-center gap-6">
				<div className="flex gap-3">
					<DeckPile
						deck="francesi"
						count={state.deck.length}
						topIds={state.deck.slice(-2).map((c) => c.id)}
						onClick={drawing ? game.drawDeck : undefined}
					/>
					<div className="flex flex-col items-center gap-1 text-xs">
						{/* Le ultime due carte scartate, sovrapposte: lo scarto vola sopra */}
						<div className="grid">
							{state.discard.slice(-2).map((card, i, top) => (
								<div key={card.id} className="col-start-1 row-start-1">
									<FrenchCardView
										card={card}
										onClick={
											drawing && i === top.length - 1
												? game.drawDiscard
												: undefined
										}
									/>
								</div>
							))}
						</div>
						Scarti
					</div>
				</div>
				<div className="flex max-w-3xl flex-1 flex-wrap gap-2">
					{state.melds.length === 0 && (
						<span className="text-emerald-200/60">
							Nessuna combinazione calata
						</span>
					)}
					{state.melds.map((m) => (
						<MeldRow
							key={m.id}
							cards={m.cards}
							onClick={
								playing && game.selected.length > 0
									? () => game.attach(m.id)
									: undefined
							}
						/>
					))}
				</div>
			</div>

			{state.pending.length > 0 && (
				<div className="flex flex-wrap items-center justify-center gap-2 rounded-xl bg-black/20 p-2">
					<span>Apertura: {pendingPoints(state)} / 40 punti</span>
					{state.pending.map((cards) => (
						<MeldRow key={cards[0].id} cards={cards} />
					))}
					<ActionButton onClick={game.confirmOpening}>
						Conferma apertura
					</ActionButton>
					<ActionButton onClick={game.cancelOpening}>Annulla</ActionButton>
				</div>
			)}

			<div className="flex flex-col items-center gap-2">
				<p className="rounded bg-black/30 px-4 py-1">
					{drawing
						? "Pesca dal mazzo o dagli scarti"
						: playing
							? "Seleziona carte per calare, attaccare (clic su una combinazione) o scartare"
							: state.message}
				</p>
				{game.error && <p className="text-red-300">{game.error}</p>}
				<div className="flex flex-wrap justify-center gap-2">
					{playing && (
						<>
							<ActionButton
								onClick={game.meld}
								disabled={game.selected.length < 3}
							>
								Cala
							</ActionButton>
							<ActionButton
								onClick={game.discard}
								disabled={game.selected.length !== 1}
							>
								Scarta
							</ActionButton>
						</>
					)}
					{state.phase === "fineMano" && (
						<ActionButton onClick={game.nextRound}>Prossima mano</ActionButton>
					)}
					{state.phase === "finePartita" && (
						<ActionButton onClick={game.restart}>Nuova partita</ActionButton>
					)}
				</div>
			</div>

			<Hand
				cards={human.hand}
				label={`${human.name} · ${human.score} pt${human.opened ? " · aperto" : ""}`}
				renderCard={(card) => (
					<FrenchCardView
						card={card}
						selected={game.selected.includes(card.id)}
						onClick={playing ? () => game.toggle(card.id) : undefined}
					/>
				)}
			/>
		</Table>
	);
}
