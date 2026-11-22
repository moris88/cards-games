import { ActionButton } from "../../components/ActionButton";
import { cardSlotClass } from "../../components/CardFrame";
import { DeckPile } from "../../components/DeckPile";
import { EventOverlay } from "../../components/EventOverlay";
import { NeapolitanCardView } from "../../components/NeapolitanCardView";
import { Table } from "../../components/Table";
import { SolitaireBar } from "../solitaire/SolitaireBar";
import { isFree, ROWS } from "./pyramidLogic";
import { usePyramid } from "./usePyramid";

interface PyramidProps {
	resume: boolean;
	onExit: () => void;
}

export function Pyramid({ resume, onExit }: PyramidProps) {
	const game = usePyramid(resume);
	const { state } = game;
	const top = state.waste[state.waste.length - 1];
	const rows = Array.from({ length: ROWS }, (_, row) =>
		Array.from({ length: row + 1 }, (_, col) => (row * (row + 1)) / 2 + col),
	);

	return (
		<Table title="Piramide" onExit={onExit}>
			<EventOverlay events={state.events} />
			<SolitaireBar
				elapsed={state.elapsed}
				moves={state.moves}
				onUndo={game.undo}
				canUndo={state.history.length > 0 && !state.won}
			>
				<ActionButton onClick={game.restart}>Nuova partita</ActionButton>
			</SolitaireBar>
			<p className="text-center text-sm text-emerald-100">
				Elimina coppie che fanno 10 (Fante 8, Cavallo 9); il Re vale 10 e si
				elimina da solo. Seleziona una carta e poi la sua compagna.
			</p>

			<div className="flex flex-col items-center">
				{rows.map((indices) => (
					<div
						key={indices[0]}
						// Ogni fila copre metà della fila sopra
						className="flex gap-1 last:mb-0 sm:gap-2"
						style={{ marginBottom: "calc(var(--card-w) * -0.85)" }}
					>
						{indices.map((i) => {
							const card = state.pyramid[i];
							if (!card)
								return <div key={i} className={cardSlotClass("napoletane")} />;
							const free = isFree(state.pyramid, i);
							return (
								<div key={i} className={free ? "" : "brightness-75"}>
									<NeapolitanCardView
										card={card}
										selected={game.selected === card.id}
										onClick={free ? () => game.pick(card) : undefined}
									/>
								</div>
							);
						})}
					</div>
				))}
			</div>

			<div className="flex items-end justify-center gap-6">
				<DeckPile
					deck="napoletane"
					count={state.stock.length}
					topIds={state.stock.slice(-3).map((c) => c.id)}
					label={`Mazzo (${state.stock.length})`}
					onClick={game.draw}
				/>
				<div className="flex flex-col items-center gap-1 text-xs">
					<div className="grid">
						{state.waste.slice(-2).map((card) => (
							<div key={card.id} className="col-start-1 row-start-1">
								<NeapolitanCardView
									card={card}
									selected={game.selected === card.id}
									onClick={card === top ? () => game.pick(card) : undefined}
								/>
							</div>
						))}
						{!top && (
							<div
								className={`${cardSlotClass("napoletane")} rounded-md border-2 border-dashed border-white/30`}
							/>
						)}
					</div>
					Pozzo
				</div>
			</div>
		</Table>
	);
}
