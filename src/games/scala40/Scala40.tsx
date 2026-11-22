import { ActionButton } from "../../components/ActionButton";
import { CardFrame } from "../../components/CardFrame";
import { EventOverlay } from "../../components/EventOverlay";
import { FrenchCardView } from "../../components/FrenchCardView";
import { Hand } from "../../components/Hand";
import { Table } from "../../components/Table";
import { MeldRow } from "./MeldRow";
import { pendingPoints } from "./scala40Logic";
import { useScala40 } from "./useScala40";

interface Scala40Props {
	cpuCount: number;
	onExit: () => void;
}

export function Scala40({ cpuCount, onExit }: Scala40Props) {
	const game = useScala40(cpuCount);
	const { state, isHumanTurn } = game;
	const human = state.players[0];
	const drawing = isHumanTurn && state.phase === "pesca";
	const playing = isHumanTurn && state.phase === "gioco";
	const topDiscard = state.discard[state.discard.length - 1];
	const roundOver = state.phase === "fineMano" || state.phase === "finePartita";

	return (
		<Table title="Scala 40" onExit={onExit}>
			<EventOverlay events={state.events} />
			<div className="flex flex-wrap justify-center gap-6">
				{state.players.slice(1).map((p, i) => (
					<Hand
						key={p.name}
						cards={p.hand}
						label={`${p.name} · ${p.score} pt${p.opened ? " · aperto" : ""}${p.eliminated ? " · eliminato" : ""}${state.current === i + 1 && !roundOver ? " ◀" : ""}`}
						renderCard={(card) => (
							<FrenchCardView card={card} small faceDown={!roundOver} />
						)}
					/>
				))}
			</div>

			<div className="flex flex-wrap items-start justify-center gap-6">
				<div className="flex gap-3">
					<button
						type="button"
						disabled={!drawing}
						onClick={game.drawDeck}
						className="flex flex-col items-center text-xs disabled:opacity-80"
					>
						<CardFrame deck="francesi" faceDown />
						Mazzo ({state.deck.length})
					</button>
					<div className="flex flex-col items-center text-xs">
						{topDiscard && (
							<FrenchCardView
								card={topDiscard}
								onClick={drawing ? game.drawDiscard : undefined}
							/>
						)}
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
				label={`Tu · ${human.score} pt${human.opened ? " · aperto" : ""}`}
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
